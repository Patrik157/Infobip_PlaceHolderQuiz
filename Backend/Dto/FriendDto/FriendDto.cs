namespace QuizBackend.Dto.FriendDto;

public class FriendDto
{
    public int Id { get; set; }
    
    public string Username { get; set; }

    public FriendDto(int id, string username)
    {
        Id = id;
        Username = username;
    }
}