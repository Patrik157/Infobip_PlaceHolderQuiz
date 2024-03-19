using QuizBackend.Models;

namespace QuizBackend.Dto.UserDto;

public class UserHomepageDto
{
    public string? Username { get; set; }
    
    public string Email { get; set; } = null!;

    public Role? Role { get; set; }
    
    public bool HasFriendRequests { get; set; }
}