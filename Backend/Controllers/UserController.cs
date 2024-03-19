using System.Text.Json;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using QuizBackend.Dto.GeneralDto;
using QuizBackend.Dto.UserDto;
using QuizBackend.Services;

namespace QuizBackend.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class UserController : ControllerBase
{
    private readonly UserService _userService;

    public UserController( UserService userService)
    {
        _userService = userService;
    }
    
    [HttpGet]
    public async Task<ActionResult<UserHomepageDto>> GetUser()
    {
        var username = User.Identity?.Name;
        try
        {
            var user = await _userService.GetUserByUsernameDto(username!);
            return Ok(JsonSerializer.SerializeToDocument(user));
        }
        catch (Exception e)
        {
            return NotFound(e.Message);
        }
    }
    
    [HttpGet("role")]
    public async Task<ActionResult> GetRole()
    {
        var username = User.Identity?.Name;
        try
        {
            var role = await _userService.GetRole(username!);
            return Ok(role);
        }
        catch (Exception e)
        {
            return BadRequest(e.Message);
        }
    }

    [HttpDelete("deleteUser")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult> DeleteUser(UserDto userDto)
    {
        try
        {
            var response = await _userService.DeleteUser(userDto);
            return Ok(response);
        }
        catch (Exception e)
        {
            return BadRequest(e.Message);
        }
    }

    [HttpPost("reportBug")]
    public async Task<ActionResult> ReportBug(BugDto bugDescription)
    {
        var username = User.Identity?.Name;
        try
        {
            var userId = await _userService.GetUserId(username!);
            var res = await _userService.ReportBug(bugDescription, userId);
            return Ok("Successfully reported bug" + res); 
        }
        catch (Exception e)
        {
            return BadRequest(e.Message);
        }
    }
    
    [HttpGet("globalRanking/{page:int}")]
    public async Task<ActionResult<List<UserGlobalRankingDto>>> GetGlobalRanking(int page)
    {
        try
        {
            var result = await _userService.GetGlobalRanking(page);
            return Ok(result);
        }
        catch (Exception e)
        {
            return BadRequest(e.Message);
        }
    }
    
    [HttpPost("addPhoneNumber")]
    public async Task<ActionResult> AddPhoneNumber(PhoneNumberReqDto phoneNumberReqDto)//sa infobip api
    {
        var username = User.Identity?.Name;
        try
        {
            var res = await _userService.AddPhoneNumber(phoneNumberReqDto.PhoneNumber, username!);
            return Ok("Check your messages for the verification code" + res);
        }
        catch (Exception e)
        {
            return BadRequest(e.Message);
        }
    }
}