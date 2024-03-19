using System.ComponentModel.DataAnnotations;

namespace QuizBackend.Dto.FriendDto;

public class FriendRequestDto
{
    [Required]
    public int Receiver { get; set; }
}