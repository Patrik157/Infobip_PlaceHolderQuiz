namespace QuizBackend.Dto.FriendDto;

public class ShowProfileResponseDto
{
    public bool IsYou { get; set; } 
    
    public bool IsFriend { get; set; } 
    
    public bool SentFriendRequest { get; set; } 

    public bool ReceivedFriendRequest { get; set; }

    public FriendDto User { get; set; } = null!;

    public ICollection<FriendDto> Friends { get; set; } = null!;
}