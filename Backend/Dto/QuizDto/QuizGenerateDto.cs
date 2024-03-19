namespace QuizBackend.Dto.QuizDto;

public class QuizGenerateDto
{
    public string? Name { get; set; } = string.Empty;
    
    public List<int?>? ExcludedId { get; set; }
    
    public int Length { get; set; }
}