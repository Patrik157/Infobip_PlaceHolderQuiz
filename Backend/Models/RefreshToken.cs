using System.ComponentModel.DataAnnotations;

namespace QuizBackend.Models;

public class RefreshToken
{
    [Key]
    public int Id { get; set; }
    [StringLength(256)]
    public string Token { get; set; } = string.Empty;
    
    public DateTime Created { get; set;} = DateTime.Now.ToUniversalTime();
    
    public DateTime Expires { get; set;} = DateTime.Now.AddDays(30).ToUniversalTime();

    public User User { get; set; } = null!;
    
    public int UserId { get; set; }
}