using System.ComponentModel.DataAnnotations;

namespace QuizBackend.Dto.UserDto;

public class VerifyPhoneNumberReqDto
{
    [Required]
    public string ConfirmationCode { get; set; }
}