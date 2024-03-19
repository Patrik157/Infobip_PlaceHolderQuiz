﻿using QuizBackend.Models;

namespace QuizBackend.Dto.QuizDto;

public class QuizBasicWPasswordDto
{
    public int Id { get; set; }
    
    public string Name { get; set; } = string.Empty;
    
    public string Description { get; set; } = string.Empty;

    public Category? MainCategory { get; set; } = null!;
    
    public int Length { get; set; }
    
    public bool IsPrivate { get; set; }
    
    public string? Password { get; set; } = null!;
}