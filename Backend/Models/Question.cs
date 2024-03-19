using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace QuizBackend.Models;

public class Question
{
    [Key]
    public int Id { get; set; }

    [Required]
    [StringLength(256)]
    public string Text { get; set; } = null!;

    [Required]
    public int Points { get; set; }
    
    [Required]
    public Category Category { get; set; } = null!;
    
    [Required]
    public Enum.AnswerTypeEnum QuestionType { get; set; } = Enum.AnswerTypeEnum.TrueFalse;

    [JsonIgnore]
    public ICollection<Quiz>? Quizzes { get; set; } = new List<Quiz>();
    
    public ICollection<Answer> Choices { get; set; } = new List<Answer>();
    
    
    public ICollection<Answer> Answer { get; set; } = new List<Answer>();

    public bool IsPrivate {get; set;} 

    public bool IsValidated { get; set; } 
}
