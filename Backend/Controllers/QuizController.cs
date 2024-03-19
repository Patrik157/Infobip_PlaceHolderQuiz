using System.Text.Json;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using QuizBackend.Dto.QuestionDto;
using QuizBackend.Dto.QuizDto;
using QuizBackend.Models;
using QuizBackend.Services;

namespace QuizBackend.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class QuizController : ControllerBase
{
    private readonly QuizService _quizService;

    public QuizController(QuizService quizService)
    {
        _quizService = quizService;
    }

    [HttpGet("page/{page:int}")]
    public async Task<ActionResult<QuizBasicPaginationDto>> Get(int page)
    {
        try
        {
            var quizzes = await _quizService.GetAll(page);
            return Ok(JsonSerializer.SerializeToElement(quizzes));
        }
        catch (Exception e)
        {
            return BadRequest(e.Message);
        }
    }

    [HttpPost("fetch")]
    public async Task<ActionResult<QuestionFetchDto>> FetchQuiz(QuizBasicWPasswordDto quiz)
    {
        var username = User.Identity?.Name;
        try
        {
            var fetchedQuiz = await _quizService.FetchQuiz(quiz, username!);
            return Ok(JsonSerializer.SerializeToElement(fetchedQuiz));
        }
        catch (Exception e)
        {
            return BadRequest(e.Message);
        }
    }

    [HttpPost("add")]
    public async Task<IActionResult> AddQuiz(AddQuizDto quiz)
    {
        var username = User.Identity?.Name;
        try
        {
            await _quizService.AddQuiz(quiz.Quiz, username!, quiz.AddToValidate);
            return Ok("Created quiz");
        }
        catch (Exception e)
        {
            return BadRequest(e.Message);
        }
    }
    
    [HttpPost("check")]
    public async Task<ActionResult<QuizCheckDto>> CheckPoints(Quiz quiz)
    {
        var username = User.Identity?.Name;
        try
        {
            var result = await _quizService.CheckPoints(quiz, username!);
            return Ok(JsonSerializer.SerializeToElement(result));
        }
        catch (Exception e)
        {
            return BadRequest(e.Message);
        }
    }

    [HttpPost("quickjoin")]
    public async Task<ActionResult<QuizFullDto>> QuickJoin(QuizFilterDto filter)
    {
        var username = User.Identity?.Name;
        try
        {
            var quiz = await _quizService.QuickJoin(filter, username!);
            return Ok(JsonSerializer.SerializeToElement(quiz));
        }
        catch (Exception e)
        {
            return BadRequest(e.Message);
        }
    }
    
    [HttpPost("generateQuiz")]
    public async Task<ActionResult<Quiz>> GenerateQuiz(QuizGenerateDto filter)
    {
        var username = User.Identity?.Name;
        try
        {
            var quiz = await _quizService.GenerateQuiz(filter, username!);
            return Ok(JsonSerializer.SerializeToElement(quiz));
        }
        catch (Exception e)
        {
            return BadRequest(e.Message);
        }
    }

    [HttpPost("search/{page:int}")]
    public async Task<ActionResult<QuizBasicDto>> FilterQuiz(QuizFilterDto filter, int page)
    {
        var username = User.Identity?.Name;
        try
        {
            var filteredQuizzes = await _quizService.GetFilterQuizzesPagination(filter, page, username!);
            return Ok(JsonSerializer.SerializeToElement(filteredQuizzes));
        }
        catch (Exception e)
        {
            return BadRequest(e.Message);
        }
    }

    [HttpGet("leaderboard/{id:int}/{page:int}")]
    public async Task<ActionResult<IndividualLeaderboardDto>> GetLeaderboard(int id, int page)
    {
        var username = User.Identity?.Name;
        try
        {
            var result = await _quizService.GetLeaderboard(id, page, username!);
            return Ok(result);
        }
        catch (Exception e)
        {
            return BadRequest(e.Message);
        }
    }
}