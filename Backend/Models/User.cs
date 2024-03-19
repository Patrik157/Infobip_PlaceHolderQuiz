using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace QuizBackend.Models;

public class User
{

    [Key]
    public int Id { get; set; }
    [StringLength(32)]
    public string Username { get; set; } = null!;
    
    [Required]
    [StringLength(64)]
    public string Email { get; set; } = null!;

    [Required]
    public byte[] PasswordHash { get; set; } = null!;

    public byte[] PasswordSalt { get; set; } = null!;

    public ICollection<UserFriend>? Friends { get; set; } = new List<UserFriend>();

    public ICollection<UserFriendRequest>? FriendRequests { get; set; } = new List<UserFriendRequest>();
    
    public bool IsVerified { get; set; } = false;   //temp set to true before adding Infobip Confirmation 

    public bool IsSuspended { get; set; } = false;
    
    [StringLength(32)]
    public string? PhoneNum { get; set; }
    
    [JsonIgnore]
    public ICollection<Quiz> Quizzes { get; set; } = new List<Quiz>();

    public Role Role { get; set; } = null!;

    public ICollection<RefreshToken> RefreshTokens { get; set; } = new List<RefreshToken>();

    [JsonIgnore]
    public ICollection<QuizScore> Leaderboard { get; set; } = new List<QuizScore>();

    public bool PhoneVerified { get; set; } = false;
    public int TotalRanking { get; set; }

    [StringLength(6)] 
    public string VerifyCode { get; set; } = string.Empty;

    public DateTime VerifyExpires { get; set; } 
}
