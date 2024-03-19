using QuizBackend.Models;

namespace QuizBackend.Dto.QuestionDto;

public class QuestionBasicDto
{
    public int Id { get; set; }
    
    public string Text { get; set; } = null!;
    
    public int Points { get; set; }
    
    public List<Answer> Answer { get; set; } = new List<Answer>();
}