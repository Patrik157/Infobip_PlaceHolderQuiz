using QuizBackend.Dto.QuizDto;

namespace QuizBackend.Dto.FriendDto;

public class OwnedQuizzesDto
{
    public List<QuizBasicDto> OwnedQuizzes { get; set; }
    
    public int Pages { get; set; }
    
    public int CurrentPage { get; set; }
    
    public OwnedQuizzesDto(List<QuizBasicDto> ownedQuizzes, int pages, int currentPage)
    {
        OwnedQuizzes = ownedQuizzes;
        Pages = pages;
        CurrentPage = currentPage;
    }
}