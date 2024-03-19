namespace QuizBackend.Dto.QuizDto;

public class QuizFilterDto
{
    public string Name { get; set; } = string.Empty;
    public List<int?>? ExcludedId { get; set; }
    
    public int? MainCategoryId { get; set; }
    
    public int LengthMin { get; set; }

    public int LengthMax { get; set; }
    
    public bool? IsPrivate { get; set; }
    
    public bool ShowPlayed { get; set; }
}