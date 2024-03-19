namespace QuizBackend.Dto.UserDto;

public class UserGlobalRankingPaginationDto
{
    public List<UserGlobalRankingDto> RankingList { get; set; }

    public int Pages { get; set; }
    
    public int CurrentPage { get; set; }
    
    public UserGlobalRankingPaginationDto(List<UserGlobalRankingDto> rankingList, int pages, int currentPage)
    {
        RankingList = rankingList;
        Pages = pages;
        CurrentPage = currentPage;
    }
}