using QuizBackend.Models;

namespace QuizBackend.Dto.QuizDto;

public class AddQuizDto
{
    public Quiz Quiz { get; set; } = new Quiz();

    public bool AddToValidate { get; set; } = false;
}