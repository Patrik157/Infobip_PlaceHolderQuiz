using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using AutoMapper;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using QuizBackend.Data;
using QuizBackend.Dto.UserDto;
using QuizBackend.Models;
using RestSharp;

namespace QuizBackend.Services;

public class AuthService
{
    private readonly AppDbContext _context;
    private readonly IMapper _mapper;
    private const int HoursDuration = 3;

    public AuthService(AppDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }
    
    private void PasswordHashing(string password, out byte[] passwordHash, out byte[] passwordSalt)
    {
        using var hmac = new HMACSHA512();
        passwordSalt = hmac.Key;
        passwordHash = hmac.ComputeHash(System.Text.Encoding.UTF8.GetBytes(password));
    }

    private bool VerifyPassword(string password, byte[] passwordHash, byte[] passwordSalt)
    {
        using var hmac = new HMACSHA512(passwordSalt);
        var generatedHash = hmac.ComputeHash(System.Text.Encoding.UTF8.GetBytes(password));
        return generatedHash.SequenceEqual(passwordHash);
    }

    public async Task<(string, RefreshToken)> Login(UserDto userDto)
    {
        var user = await _context.Users
                       .FirstOrDefaultAsync(u => u.Email == userDto.Email) 
                   ?? throw new Exception("Invalid user");
        user = _context.Users
            .Include(u => u.Role)
            .SingleOrDefault(u => u.Id == user.Id);
        if (!VerifyPassword(userDto.Password, user!.PasswordHash, user.PasswordSalt))
        {
            throw new Exception("Wrong password!");
        }
        if (user.IsSuspended)
        {
            throw new Exception("User is suspended!");
        }
        var refreshToken = GenerateRefreshToken(user.Id);
        user.RefreshTokens.Add(refreshToken);
        await _context.RefreshTokens.AddAsync(refreshToken);
        await _context.SaveChangesAsync();
        if(!user.IsVerified)
        {
            await SendVerificationEmail(user);
            throw new Exception("verify");
        }

        return (GenerateJwtToken(user), refreshToken);
    }
    
    private string GenerateJwtToken(User user)
    {
        var issuer = Environment.GetEnvironmentVariable("JwtIssuer");
        var claims = new List<Claim>
        {
            new Claim(ClaimTypes.Email, user.Email),
            new Claim(ClaimTypes.Name, user.Username),
            new Claim(ClaimTypes.Role, user.Role.RoleName!)
        };
        
        var key = new SymmetricSecurityKey(System.Text.Encoding.UTF8.GetBytes(Environment
            .GetEnvironmentVariable("JwtKey") ?? throw new Exception("JWT env variable not found")));//_config["Jwt:Key"
        var cred = new SigningCredentials(key, SecurityAlgorithms.HmacSha256Signature);
        var token = new JwtSecurityToken(
            claims: claims,
            expires: DateTime.Now.AddHours(HoursDuration),
            signingCredentials:cred,
            issuer: issuer
            );
        var jwt = new JwtSecurityTokenHandler().WriteToken(token);
        return jwt;
    }

    private RefreshToken GenerateRefreshToken(int userId)
    {
        var refreshToken = new RefreshToken()
        {
            Token = Convert.ToBase64String(RandomNumberGenerator.GetBytes(64)),
            UserId = userId
        };
        return refreshToken;
    }
    
    public async Task<int> Register(UserDto userDto)
    {
        if (userDto.Username?.Length < 3 || string.IsNullOrEmpty(userDto.Username))
        {
            throw new Exception("Username is too short!");
        }

        if (userDto.Password.Length < 8)
        {
            throw new Exception("Password is too short!");
        }
        
        if(userDto.Email.Contains('@') == false)
        {
            throw  new Exception("Invalid email!");
        }

        if (await _context.Users.AnyAsync(x => x.Email.ToLower() == userDto.Email.ToLower()))
        {
            throw new Exception("Email already in use!");
        }

        if (await _context.Users.AnyAsync(x => x.Username.ToLower() == userDto.Username.ToLower()))
        {
            throw new Exception("Username taken!");
        }

        PasswordHashing(userDto.Password, out byte[] passwordHash, out byte[] passwordSalt);
        var userRole = await _context.Roles.FirstOrDefaultAsync(r => r.Id == 1);     //role with id 1 is user, 2 is admin
        if (userRole == null)    //safety check so if Roles table is dropped the program adds them
        {
            userRole = new Role()
            {
                Id = 1,
                RoleName = "User"
            };
            var adminRole = new Role()
            {
                Id = 2,
                RoleName = "Admin"
            };
            await _context.Roles.AddAsync(userRole);
            await _context.Roles.AddAsync(adminRole);
            await _context.SaveChangesAsync();
        }
        var newUser = new User
        {
            PasswordSalt = passwordSalt,
            PasswordHash = passwordHash,
        };
        _mapper.Map(userDto, newUser);
        newUser.Role = userRole;
        await SendVerificationEmail(newUser);
        await _context.Users.AddAsync(newUser);
        return await _context.SaveChangesAsync();
    }
    
    public async Task<(string, RefreshToken)> RefreshToken(string refreshToken)
    {
        var foundToken = await _context.RefreshTokens
            .FirstOrDefaultAsync(x => x.Token == refreshToken) 
                         ?? throw new Exception("Invalid refresh token");
        if (DateTime.Now.ToUniversalTime() > foundToken.Expires.ToUniversalTime())
        {
            throw new Exception("Refresh token expired!");
        }
        var user = await _context.Users
            .Include(u => u.Role)
            .SingleOrDefaultAsync(u => u.Id == foundToken.UserId) 
                   ?? throw new Exception("Invalid user");
        if (user.IsSuspended)
        {
            throw new Exception("User is suspended");
        }
        var jwtToken = GenerateJwtToken(user);
        var newRefreshToken = GenerateRefreshToken(foundToken.UserId);
        await _context.RefreshTokens.AddAsync(newRefreshToken);
        _context.RefreshTokens.Remove(foundToken);
        await _context.SaveChangesAsync();
        return (jwtToken, newRefreshToken);
    }

    public async Task<int> Logout(string refreshToken)
    {
        var foundToken = await _context.RefreshTokens.FirstOrDefaultAsync(x => x.Token == refreshToken) 
                         ?? throw new Exception("Refresh Token not valid");
        _context.RefreshTokens.Remove(foundToken);
        return await _context.SaveChangesAsync();
    }
    
    public async Task<int> RevokeRefreshToken(string username)
    {
        var user = await _context.Users
            .Include(x=> x.RefreshTokens)
            .FirstOrDefaultAsync(u => u.Username == username) 
                   ?? throw new Exception("Invalid user");
        user.RefreshTokens.Clear();
        await _context.SaveChangesAsync();
        return 1;
    }
    private async Task<int> SendVerificationEmail(User user)
    {
        var options = new RestClientOptions("https://j39g1v.api.infobip.com")
        {
            MaxTimeout = -1,
        };
        const string chars = "0123456789";
        var stringChars = new char[6];
        var random = new Random();

        for (var i = 0; i < stringChars.Length; i++)
        {
            stringChars[i] = chars[random.Next(chars.Length)];
        }

        var finalString = new string(stringChars);
        user.VerifyCode = finalString;
        user.VerifyExpires = DateTime.Now.AddMinutes(5).ToUniversalTime();
        await _context.SaveChangesAsync();
        var client = new RestClient(options);
        var request = new RestRequest("/email/3/send", Method.Post);
        var infobipApi = Environment.GetEnvironmentVariable("InfobipAPI");
        request.AddHeader("Authorization", $"App {infobipApi}");
        request.AddHeader("Accept", "application/json");
        request.AlwaysMultipartFormData = true;
        request.AddParameter("from", "Quiz <patrik.misura44@gmail.com>");
        request.AddParameter("subject", "Email confirmation code");
        request.AddParameter("to", "{\"to\":\"patrik.misura44@gmail.com\",\"placeholders\":{\"firstName\":\"Patrik\"}}");
        request.AddParameter("text", $"Hi {user.Username},\n your verification code is {finalString}");
        var response = await client.ExecuteAsync(request) ?? throw new Exception("Email not sent");
        return 0;
    }

    public async Task<int> VerifyEmail(string confirmationCode)
    {
        var time = new DateTime().ToUniversalTime();
        if(string.IsNullOrEmpty(confirmationCode))
        {
            throw new Exception("Invalid code");
        }
        var user = await _context.Users
            .FirstOrDefaultAsync(u => !u.IsVerified && u.VerifyCode == confirmationCode && u.VerifyExpires  > time ) 
                   ?? throw new Exception("Invalid user");
        
        if (confirmationCode == user.VerifyCode && time < user.VerifyExpires)
        {
            user.IsVerified = true;
            user.VerifyCode = "";
            return await _context.SaveChangesAsync();
        }
        if(confirmationCode != user.VerifyCode && string.IsNullOrEmpty(user.VerifyCode))
        {
            throw new Exception("Wrong code or expired");
        }
        return -1;
    }
}