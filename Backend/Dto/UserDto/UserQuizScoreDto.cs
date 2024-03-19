using QuizBackend.Dto.QuizDto;

namespace QuizBackend.Dto.UserDto;

public class UserQuizScoreDto
{
    public QuizBasicDto Quiz { get; set; } = null!;

    public int? Score { get; set; } = null;
}