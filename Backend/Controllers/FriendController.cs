using System.Text.Json;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using QuizBackend.Dto.FriendDto;
using QuizBackend.Dto.UserDto;
using Exception = System.Exception;

namespace QuizBackend.Controllers;
using Services;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class FriendController : ControllerBase
{
    private readonly UserService _userService;
    private readonly FriendService _friendService;

    public FriendController(UserService userService, FriendService friendService)
    {
        _userService = userService;
        _friendService = friendService;
    }
    
    [HttpGet("friendRequests")]
    public async Task<IActionResult> GetFriendRequests()
    {
        var username = User.Identity?.Name;
        var result = await _friendService.GetFriendRequests(username!);
        return Ok(JsonSerializer.SerializeToElement(result));
    }
    
    [HttpGet("friends")]
    public async Task<IActionResult> GetFriends()
    {
        var username = User.Identity?.Name;
        var result = await _friendService.GetFriends(username!);
        return Ok(JsonSerializer.SerializeToElement(result));
    }
    
    [HttpGet("search/{username}/{page:int}")]
    public async Task<ActionResult<SearchPaginationDto>> SearchForFriends(string username, int page)
    {
        try
        {
            var result = await _friendService.Search(username, page);
            return Ok(JsonSerializer.SerializeToElement(result));
        }
        catch (Exception e)
        {
            return BadRequest(e.Message);
        }
    }
    
    [HttpGet("profile/{username}")]
    public async Task<ActionResult<ShowProfileResponseDto>> ShowProfile(string username)
    {
        var yourUsername = User.Identity?.Name;
        try
        {
            var result = await _friendService.ShowProfile(username, yourUsername);
            return Ok(JsonSerializer.SerializeToElement(result));
        }
        catch (Exception e)
        {
            return BadRequest(e.Message);
        }
    }
    
    [HttpPost("sendFriendRequest")]
    public async Task<IActionResult> SendFriendRequest(FriendRequestDto friendReq)
    {
        var username = User.Identity?.Name;
        try
        {
            var userId = await _userService.GetUserId(username!);
            var result = await _friendService.SendFriendRequest(userId, friendReq.Receiver);
            return Ok("Friend request sent successfully!" + result);
        }
        catch (Exception e)
        {
            return BadRequest(e.Message);
        }
        
    }
    
    [HttpPost("acceptFriendRequest")]
    public async Task<IActionResult> AcceptFriendRequest(FriendRequestDto friendReq)
    {  
         var username = User.Identity?.Name;
         try
         {
             var userId = await _userService.GetUserId(username!);
             var result = await _friendService.AcceptFriendRequest(userId, friendReq.Receiver); 
             return Ok("Friend request accepted successfully!" + result);
         }
         catch (Exception e)
         {
             return BadRequest(e.Message);
         }
    }
    
    [HttpPost("rejectFriendRequest")]
    public async Task<IActionResult> RejectFriendRequest(FriendRequestDto friendReq)
    {
        var username = User.Identity?.Name;
        try
        {
            var userId = await _userService.GetUserId(username!);
            var result = await _friendService.RejectFriendRequest(userId, friendReq.Receiver); 
            return Ok("Friend request Rejected successfully!" + result);
        }
        catch (Exception e)
        {
            return BadRequest(e.Message);
        }
    }

    [HttpGet("history/{userId:int}/{page:int}")]
    public async  Task<ActionResult<UserQuizScoreListDto>> GetHistory(int userId, int page)
    {
        try
        {
            var result = await _friendService.GetHistory(userId, page);
            return Ok(JsonSerializer.SerializeToElement(result));
        }
        catch (Exception e)
        {
            return BadRequest(e.Message);
        }
    }
    
    [HttpGet("owned/{userId:int}/{page:int}")]
    public async Task<ActionResult<OwnedQuizzesDto>> GetOwned(int userId, int page)
    {
        try
        {
            var result = await _friendService.GetOwned(userId, page);
            return Ok(JsonSerializer.SerializeToElement(result));
        }
        catch (Exception e)
        {
            return BadRequest(e.Message);
        }
    }
}