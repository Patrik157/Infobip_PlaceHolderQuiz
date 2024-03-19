namespace QuizBackend.Dto.FriendDto;

public class SearchPaginationDto
{
    public List<FriendDto> Users { get; set; }

    public int Pages { get; set; }

    public int CurrentPage { get; set; }

    public SearchPaginationDto(List<FriendDto> users, int pages, int currentPage)
    {
        Users = users;
        Pages = pages;
        CurrentPage = currentPage; 
    }
}