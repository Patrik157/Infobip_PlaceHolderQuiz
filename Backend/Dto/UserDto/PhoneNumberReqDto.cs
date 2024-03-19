using System.ComponentModel.DataAnnotations;

namespace QuizBackend.Dto.UserDto;

public class PhoneNumberReqDto
{
    [Required]
    public string PhoneNumber { get; set; } = null!;
}