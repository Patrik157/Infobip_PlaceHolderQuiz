using System.ComponentModel.DataAnnotations;

namespace QuizBackend.Models;

public class Category
{
    [Key] 
    public int Id { get; set; }
    
    [StringLength(50)]
    public string? Name { get; set; }
}