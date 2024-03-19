using System.ComponentModel.DataAnnotations;

namespace QuizBackend.Models;

public class UserFriendRequest
{
    [Key]
    public int Id { get; set; }
    
    public int SenderId { get; set; }
    
    public User Sender { get; set; } = null!;
    
    public int ReceiverId { get; set; }
    
    public User Receiver { get; set; } = null!;
}