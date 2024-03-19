using QuizBackend.Dto.QuizDto;

namespace QuizBackend.Dto.UserDto;

public class UserLeaderBoardDto
{
    public QuizBasicDto Quiz { get; set; } = new QuizBasicDto();
    public List<UserBasicWScoreDto> Users { get; set; } = new List<UserBasicWScoreDto>();
}