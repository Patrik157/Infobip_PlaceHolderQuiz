using QuizBackend.Dto.UserDto;

namespace QuizBackend.Dto.QuizDto;

public class IndividualLeaderboardDto
{
    public List<UserBasicWScoreDto> Rankings { get; set; } = new List<UserBasicWScoreDto>();

    public string QuizName { get; set; } = null!;

    public int Pages { get; set; }
    
    public int CurrentPage { get; set; }
}