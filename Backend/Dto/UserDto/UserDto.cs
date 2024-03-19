using QuizBackend.Models;

namespace QuizBackend.Dto.UserDto;

public class UserDto
{
    public string? Username { get; set; }
    
    public string Email { get; set; } = null!;

    public Role? Role { get; set; } = null!;
    
    public string Password { get; set; } = null!;
}