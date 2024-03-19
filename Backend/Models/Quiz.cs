using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace QuizBackend.Models;

public class Quiz
{
    [Key]
    public int Id { get; set; }

    [StringLength(20)]
    public string Name { get; set; } = null!;

    [StringLength(200)]
    public string? Description { get; set; }

    public Category? MainCategory { get; set; }

    public ICollection<Question> Questions { get; set; } = new List<Question>();
    
    public ICollection<User> Users { get; set; } = new List<User>();        

    [JsonIgnore]
    public ICollection<QuizScore>? Leaderboard { get; set; }
    
    [StringLength(32)]
    public string? Password { get; set; } 
    
    public int Length { get; set; }

    public bool? IsPrivate { get; set; } = false;

    [StringLength(32)]
    public string? Owner { get; set; }
}