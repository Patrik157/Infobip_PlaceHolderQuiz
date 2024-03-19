using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace QuizBackend.Models;

public class UserFriend
{
    [Key]
    public int Id { get; set; }
    public int UserId { get; set; }
    
    [JsonIgnore]
    public User User { get; set; } = null!;

    public int FriendId { get; set; }
    
    [JsonIgnore]
    public User Friend { get; set; } = null!;
    
}