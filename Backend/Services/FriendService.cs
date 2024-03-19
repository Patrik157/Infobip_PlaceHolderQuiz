using AutoMapper;
using Microsoft.EntityFrameworkCore;
using QuizBackend.Data;
using QuizBackend.Dto.FriendDto;
using QuizBackend.Dto.QuizDto;
using QuizBackend.Dto.UserDto;
using QuizBackend.Models;
using RestSharp;

namespace QuizBackend.Services;

public class FriendService
{
    private readonly AppDbContext _context;
    private readonly IMapper _mapper;
    
    public FriendService(AppDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }
    
    private async Task<bool> IsFriend(int user, int friendId)
    {
        return await _context.UserFriends
            .AnyAsync(f => 
                f.UserId == user && f.FriendId == friendId);
    }
    
    public async Task<List<FriendDto>> GetFriendRequests(string username)
    {
        var friendsDto = new List<FriendDto>();
        var user = await _context.Users
            .Include(u => u.FriendRequests)
            .SingleOrDefaultAsync(u => u.Username == username) ?? throw new Exception("Invalid user");
        var userFriendRequests = user.FriendRequests;
        if (userFriendRequests == null)
        {
            return friendsDto;
        }

        friendsDto.AddRange(userFriendRequests
            .Select(friend =>
                new FriendDto(friend.SenderId, _context.Users.First(u => u.Id == friend.SenderId).Username)));
        return friendsDto;
    }

    public async Task<ICollection<FriendDto>?> GetFriends(string username) 
    {
        var friendsDto = new List<FriendDto>();
        var user = await _context.Users
            .Include(u => u.Friends)
            .SingleOrDefaultAsync(u => u.Username == username) ?? throw new Exception("Invalid user");
        var userFriends = user.Friends;
        if (userFriends == null)
        {
            return friendsDto;
        }

        foreach (var friend in userFriends)
        {
            var f = await _context.Users.FindAsync(friend.FriendId);
            if (f != null)
                friendsDto.Add(new FriendDto(friend.FriendId, f.Username));
        }
        return friendsDto;
    }

    public async Task<int> SendFriendRequest(int senderId, int receiverId) 
    {
        var receiver = await _context.Users
            .FirstOrDefaultAsync(u => u.Id == receiverId) ?? throw new Exception("No user to send to!");
        
        var sender = await _context.Users
            .Include(user => user.FriendRequests)
            .FirstOrDefaultAsync(u => u.Id == senderId) ?? throw new Exception("Invalid user");
        
        if (await IsFriend(senderId, receiverId))
        {
            throw new Exception("Already friends");
        }
        
        if (sender.FriendRequests!.Any(fr =>  fr.SenderId == receiverId))
        {
            await AcceptFriendRequest(receiverId,senderId);
        }
        
        var request = new UserFriendRequest
        {
            SenderId = senderId,
            ReceiverId = receiver.Id,
        };

        receiver.FriendRequests!.Add(request);
        var options = new RestClientOptions("https://j39g1v.api.infobip.com")
        {
            MaxTimeout = -1,
        };
        
        var client = new RestClient(options);
        var r = new RestRequest("/email/3/send", Method.Post);
        var infobipApi = Environment.GetEnvironmentVariable("InfobipAPI");
        r.AddHeader("Authorization", $"App {infobipApi}"); 
        r.AddHeader("Accept", "application/json");
        r.AlwaysMultipartFormData = true;
        r.AddParameter("from", "Quiz <patrik.misura44@gmail.com>");
        r.AddParameter("subject", "New friend request");
        r.AddParameter("to", "{\"to\":\"patrik.misura44@gmail.com\",\"placeholders\":{\"firstName\":\"Patrik\"}}");
        r.AddParameter("text", $"Hi {receiver.Username} you have received a friend request from {sender.Username}");
        var response = await client.ExecuteAsync(r) ?? throw new Exception("Email not sent");
        return await _context.SaveChangesAsync();
    }
    
    public async Task<int> AcceptFriendRequest(int userId, int requestId)
    {
        var request = await _context.UserFriendRequest
                          .FirstOrDefaultAsync(r => r.ReceiverId == userId && r.SenderId == requestId) ??
                      throw new Exception("Invalid request!");
        var friendship = new UserFriend
        {
            UserId = request.SenderId,  
            FriendId = request.ReceiverId
        };
        
        var reverseFriendShip = new UserFriend()
        {
            UserId = request.ReceiverId,
            FriendId = request.SenderId
        };
        
        await _context.UserFriends.AddAsync(friendship);
        await _context.UserFriends.AddAsync(reverseFriendShip);
        _context.UserFriendRequest.Remove(request);
        await _context.SaveChangesAsync();
        return 0;
    }
    
    public async Task<int> RejectFriendRequest(int userId, int requestId)
    {
        var request = await _context.UserFriendRequest
            .FirstOrDefaultAsync(r => r.ReceiverId == userId && r.SenderId == requestId) 
                      ?? throw  new Exception("No request");
        
        _context.UserFriendRequest.Remove(request);
        await _context.SaveChangesAsync();
        return 0;

    }

    public async Task<SearchPaginationDto> Search(string username, int page)
    {
        const float pageResults = 10f;  //number of quizzes per page
        var pageCount = Math.Ceiling(_context.Users
            .Count(u => u.Username == username) / pageResults);
        var users = await _context.Users
            .Where(u => u.Username.Contains(username) || string.IsNullOrEmpty(username))  
            //this translates to %username% which means i cant use indexing and so the performance is at risk but due to better search results i will continue to use this
            .Skip((page) * (int)pageResults)
            .Take((int)pageResults)
            .ToListAsync();
        List<FriendDto> usersDto;
        if (!string.IsNullOrEmpty(username))
        {
            var sortedUsers = users.OrderBy(u => LevenshteinDistance(u.Username, username));
            usersDto = _mapper.Map<List<FriendDto>>(sortedUsers);
        }
        else
        {
            usersDto = _mapper.Map<List<FriendDto>>(users);
        }
        var quizzesResponseDto = new SearchPaginationDto(usersDto, (int)pageCount, page);
        return quizzesResponseDto;
    }
    
    private static int LevenshteinDistance(string s, string t)  //edit distance algorithm to find strings that match the most
    {
        var n = s.Length;
        var m = t.Length;
        var d = new int[n + 1, m + 1];
        
        if (n == 0)
        {
            return m;
        }

        if (m == 0)
        {
            return n;
        }
        
        for (var i = 0; i <= n; d[i, 0] = i++)
        {
        }

        for (var j = 0; j <= m; d[0, j] = j++)
        {
        }
        
        for (var i = 1; i <= n; i++)
        {
            for (var j = 1; j <= m; j++)
            {
                var cost = (t[j - 1] == s[i - 1]) ? 0 : 1;
                d[i, j] = Math.Min(
                    Math.Min(d[i - 1, j] + 1, d[i, j - 1] + 1),
                    d[i - 1, j - 1] + cost);
            }
        }
        return d[n, m];
    }

    public async Task<ShowProfileResponseDto> ShowProfile(string username, string? yourUsername)
    {
        bool isYou = false, isFriend = false, sentFriendRequest = false, receivedFriendRequest = false;
        var viewer = await _context.Users
                         .Include(user => user.FriendRequests!)
                         .FirstOrDefaultAsync(u => u.Username.ToLower() == yourUsername!.ToLower())
            ?? throw new Exception("Invalid user");
        
        var user = await _context.Users
            .Include(u => u.Friends)
            .Include(u => u.FriendRequests)
            .FirstOrDefaultAsync(u => u.Username.ToLower() == username.ToLower()) 
                   ?? throw new Exception("Invalid user");
        
        if(yourUsername!.ToLower() == username.ToLower())
        {
            isYou = true;
        }
        if(user.Friends!.Any(fr => fr.FriendId == viewer.Id))
        {
            isFriend = true;
        }
        else if(user.FriendRequests!.Any(fr => fr.SenderId == viewer.Id))
        {
            sentFriendRequest = true;
        }
        else if(viewer.FriendRequests!.Any(fr => fr.SenderId == user.Id))
        {
            receivedFriendRequest = true;
        }
        var friends = await GetFriends(user.Username);
        var profile = new ShowProfileResponseDto
        {
            IsFriend = isFriend,
            IsYou = isYou,
            SentFriendRequest = sentFriendRequest,
            ReceivedFriendRequest = receivedFriendRequest,
            User = _mapper.Map<FriendDto>(user),
            Friends = friends!
        };
        return profile;
    }

    public async Task<UserQuizScoreListDto> GetHistory(int userId, int page)
    {
        const float pageResults = 10f;  //number of quizzes per page
        var user = await _context.Users
            .Include(u => u.Quizzes)
            .ThenInclude(q => q.MainCategory)
            .Include(u => u.Quizzes)
            .ThenInclude(q => q.Leaderboard)
            .FirstOrDefaultAsync(u => u.Id == userId)
                   ?? throw new Exception("Invalid user");
        
        var userQuizzes = user.Quizzes;
        if(userQuizzes == null)
        {
            throw new Exception("No History");
        }
        var userQuizScoreList = new List<UserQuizScoreDto>();
        foreach (var quizScore in userQuizzes)
        {
            var score = quizScore.Leaderboard?.Select(l => l.Score).FirstOrDefault();
            if (score == null) continue;
            var userQuizScore = new UserQuizScoreDto
            {
                Quiz = _mapper.Map<QuizBasicDto>(quizScore),
                Score = score
            };
            userQuizScoreList.Add(userQuizScore);
        }
        
        var pageCount = Math.Ceiling(userQuizScoreList.Count / pageResults);
        
        var quizzes = userQuizScoreList
            .Skip((page) * (int)pageResults)
            .Take((int)pageResults)
            .ToList();
        
        var result = new UserQuizScoreListDto(quizzes, (int)pageCount, page);
        return result;
    }

    public async Task<OwnedQuizzesDto> GetOwned(int userId, int page)
    {
        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.Id == userId) ?? throw new Exception("Invalid user");
        
        const float pageResults = 10f;  //number of quizzes per page
        var quizzes = await _context.Quizzes.Where(q => q.Owner == user.Username)
            .Include(q => q.MainCategory)
            .ToListAsync();
        
        var pageCount = Math.Ceiling(quizzes.Count / pageResults);
        
        quizzes = quizzes
            .Skip((page) * (int)pageResults)
            .Take((int)pageResults)
            .ToList();
        
        var quizzesDto = _mapper.Map<List<QuizBasicDto>>(quizzes);
        var result = new OwnedQuizzesDto(quizzesDto, (int)pageCount, page);
        return result;
    }
}