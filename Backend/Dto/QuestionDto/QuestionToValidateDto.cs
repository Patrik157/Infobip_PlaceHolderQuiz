using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;
using QuizBackend.Models;

namespace QuizBackend.Dto.QuestionDto;

public class QuestionToValidateDto
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
    public Models.Enum.AnswerTypeEnum QuestionType { get; set; } = Models.Enum.AnswerTypeEnum.TrueFalse;

    [JsonIgnore]
    public ICollection<Quiz>? Quizzes { get; set; } = new List<Quiz>();
    
    [Required]
    public Answer Answer { get; set; } = new Answer();
}