namespace QuizBackend.Dto.QuizDto;

public class QuizBasicPaginationDto
{
    public List<QuizBasicDto> Quizzes { get; set; }
    
    public int Pages { get; set; }
    
    public int CurrentPage { get; set; }
    
    public QuizBasicPaginationDto(List<QuizBasicDto> quizzes, int pages, int currentPage)
    {
        Quizzes = quizzes;
        Pages = pages;
        CurrentPage = currentPage;
    }
}