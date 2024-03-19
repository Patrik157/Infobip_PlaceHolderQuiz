using QuizBackend.Models;

namespace QuizBackend.Dto.QuestionDto;

public class QuestionFetchDto
{
    
    public string Name { get; set; }
    public ICollection<Question> Questions { get; set; }
    
    public bool WillScore { get; set; }

    public QuestionFetchDto(ICollection<Question> questions, bool willScore, string name)
    {
        Questions = questions;
        WillScore = willScore;
        Name = name;
    }
}