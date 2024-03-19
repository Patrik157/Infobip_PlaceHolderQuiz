using QuizBackend.Dto.QuestionDto;

namespace QuizBackend.Dto.QuizDto;

public class QuizCheckDto
{
    public int Points { get; set; }

    public List<QuestionBasicDto>? CorrectAnswers { get; set; } = new List<QuestionBasicDto>();
}