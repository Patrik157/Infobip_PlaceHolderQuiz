using QuizBackend.Dto.UserDto;

namespace QuizBackend.Dto.FriendDto;

public class FriendLeaderboardDto
{
    public FriendDto Friend { get; set; } = null!;
    public UserQuizScoreDto Leaderboard { get; set; } = null!;
}