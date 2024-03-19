using AutoMapper;
using Microsoft.EntityFrameworkCore;
using QuizBackend.Data;
using QuizBackend.Dto.GeneralDto;
using QuizBackend.Dto.UserDto;
using QuizBackend.Models;


namespace QuizBackend.Services;

public class UserService
{
    private readonly AppDbContext _context;
    private readonly IMapper _mapper;

    public UserService(AppDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }
    
    public async Task<int> GetUserId(string username)
    {
        var user = await _context.Users
            .FirstOrDefaultAsync(u => username.ToLower() == u.Username.ToLower()) 
                   ?? throw new Exception("Invalid user");
        return user.Id;
    }
    public async Task<UserHomepageDto> GetUserByUsernameDto(string username)
    {
        var user = await _context.Users
                       .Include(u => u.Role)
                       .Include(user => user.FriendRequests)
                       .FirstOrDefaultAsync(u => u.Username == username) 
                   ?? throw new Exception("Invalid user");
        var userDto = new UserHomepageDto();
        _mapper.Map(user, userDto);
        if (user.FriendRequests != null && user.FriendRequests.Count != 0)
        {
            userDto.HasFriendRequests = true;
            return userDto;
        }
        userDto.HasFriendRequests = false;
        return userDto;
    }

    public async Task<Role> GetRole(string username)
    {
        var user = await _context.Users
            .Include(u => u.Role)
            .SingleOrDefaultAsync(u => u.Username == username) 
                   ?? throw new Exception("Invalid user");
        return user.Role;
    }

    public async Task<User> DeleteUser(UserDto userDto)
    {
        var user = await _context.Users
                       .FirstOrDefaultAsync(u => u.Email == userDto.Email) 
                   ?? throw new Exception("Invalid user");
        _context.Users.Remove(user);
        await _context.SaveChangesAsync();
        return user;
    }
    
    public async Task<int> ReportBug(BugDto bugDescription, int userId)
    {
        var bug = new Bug()
        {
            Description = bugDescription.BugDescription,
            UserId = userId
        };
        await _context.Bugs.AddAsync(bug);
        return await _context.SaveChangesAsync();
    }
    
    public async Task<UserGlobalRankingPaginationDto> GetGlobalRanking(int page)
    {
        const float pageResults = 50f;
        var users = await _context.Users
            .OrderByDescending(u => u.TotalRanking)
            .Skip((page) * (int)pageResults)
            .Take((int)pageResults)
            .ToListAsync();
        
        var pageCount = Math.Ceiling(users.Count / pageResults);
        var rankingList = _mapper.Map<List<UserGlobalRankingDto>>(users);

        var result = new UserGlobalRankingPaginationDto(rankingList ,(int) pageCount, page);
        return result;
    }
    
    //send verify email
    //verify email
    public async Task<int> AddPhoneNumber(string phoneNumber, string username)
    {
        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.Username == username) 
                   ?? throw new Exception("Invalid user");
        user.PhoneNum = phoneNumber;
        return await _context.SaveChangesAsync();
    }
}