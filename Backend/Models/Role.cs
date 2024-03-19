using System.ComponentModel.DataAnnotations;

namespace QuizBackend.Models;

public class Role
{
    [Key]
    public int Id { get; set; }

    [StringLength(16)]
    public string? RoleName { get; set; } 
}