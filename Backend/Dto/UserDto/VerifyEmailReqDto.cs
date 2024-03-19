using System.ComponentModel.DataAnnotations;

namespace QuizBackend.Dto.UserDto;

public class VerifyEmailReqDto
{
    [Required] 
    public string ConfirmationCode { get; set; } = null!;
}