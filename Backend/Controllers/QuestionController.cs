using System.Text.Json;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using QuizBackend.Dto.GeneralDto;
using QuizBackend.Dto.QuestionDto;
using QuizBackend.Models;
using QuizBackend.Services;

namespace QuizBackend.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class QuestionController : ControllerBase
{
    private readonly QuestionService _questionService;

    public QuestionController(QuestionService questionService)
    {
        _questionService = questionService;
    }
    
    [HttpPost("addQuestion")]
    public async Task<IActionResult> AddQuestion(Question question)
    {
        return Ok("Question:" + await _questionService.AddQuestion(question) + "added!");
    }
    //add listAll validated public questions for quiz generator -- probably only in services and not controller -myb done
    
    [HttpGet("listNonValidated")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<List<Question>>> ListNonValidated()
    {
        return Ok(JsonSerializer.SerializeToElement(await _questionService.ListNonValidated()));
    }
    
    [HttpPost("validateQuestions")]
    [Authorize(Roles = "Admin")]
    public ActionResult<List<QuestionToValidateDto>> ValidateQuestions(List<QuestionIdDto> questions)
    {
        try
        {
            var errorList = _questionService.ValidateQuestions(questions);
            return !errorList.Result.Any() ? Ok("Questions validated!") 
                : Ok("Questions:" + errorList.Result + "dont exist or are already validated");
        }
        catch (Exception e)
        {
            return BadRequest(e.Message); 
        }
    }
    
    [AllowAnonymous]
    [HttpGet("landing")]
    public ActionResult<QuestionLandingDto> GetLandingQuestions()
    {
        return Ok(_questionService.GetLandingQuestions());
    }
    
    [HttpPost("addCategory")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> AddCategory(CategoryDto category)
    {
        try
        {
            return Ok("Category: " + await _questionService.AddCategory(category) + " added!");
        }
        catch (Exception e)
        {
            return BadRequest(e.Message); 
        }
    }
    
    [HttpGet("categories")]
    public async Task<IActionResult> GetCategories()
    {
        return Ok(JsonSerializer.SerializeToElement(await _questionService.GetCategories()));
    }
}