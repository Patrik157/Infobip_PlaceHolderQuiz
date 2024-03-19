namespace QuizBackend.Dto.UserDto;

public class UserQuizScoreListDto
{
    public List<UserQuizScoreDto> UserQuizScores { get; set; }
    
    public int Pages { get; set; }
    
    public int CurrentPage { get; set; }

    public UserQuizScoreListDto(List<UserQuizScoreDto> userQuizScores, int pages, int currentPage)
    {
        UserQuizScores = userQuizScores;
        Pages = pages;
        CurrentPage = currentPage; 
    }
}