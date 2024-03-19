using System.ComponentModel.DataAnnotations;

namespace QuizBackend.Models;


public class QuizScore
{
    [Key]
    public int Id { get; set; }
    [Required]
    public int UserId { get; set; }
    
    public User User { get; set; } = null!;
    
    [Required]
    public int Score { get; set; }
    [Required]
    
    public int QuizId { get; set; }
    public Quiz Quiz { get; set; } = null!;
    
}