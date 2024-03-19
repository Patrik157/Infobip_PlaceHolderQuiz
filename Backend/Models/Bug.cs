using System.ComponentModel.DataAnnotations;

namespace QuizBackend.Models;

public class Bug
{
    [Key]
    public int Id { get; set; }

    [StringLength(256)]
    public string? Description { get; set; }
    
    public int UserId { get; set; }

    public bool IsFixed { get; set; } = false;

    public DateTime  CreatedAt { get; set; } = DateTime.Now.ToUniversalTime();
    
    public DateTime? FixedAt { get; set; }
}