using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace QuizBackend.Models;

public class Answer
{
    [Key]
    public int Id { get; set; }

    [StringLength(64)]
    public string? Text { get; set; }
    
    [JsonIgnore]
    public ICollection<Question>? Question { get; set; }
    [JsonIgnore]
    public ICollection<Question>? Correct { get; set; }
}