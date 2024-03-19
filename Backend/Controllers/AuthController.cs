using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using QuizBackend.Dto.UserDto;
using QuizBackend.Models;
using QuizBackend.Services;

namespace QuizBackend.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly AuthService _authService;

    public AuthController(AuthService authService)
    {
        _authService = authService;
    }

    [AllowAnonymous]
    [HttpPost("register")]
    public async Task<ActionResult> Register(UserDto newUserPrivate)
    {
        try
        {
            var res = await _authService.Register(newUserPrivate);
            return Ok("Successfully registered new user" + res);
        }
        catch (Exception e)
        {
            return BadRequest(e.Message);
        }
    }

    [AllowAnonymous]
    [HttpPost("login")]
    public async Task<ActionResult<string>> Login(UserDto user){
        try
        {
            var (token, refreshToken) = await _authService.Login(user);
            if (refreshToken.Token != string.Empty)
            {
                SetRefreshToken(refreshToken);
            }
            Response.Cookies.Append("X-Access-Token", token,
                new CookieOptions
                {
                    Expires = DateTimeOffset.Now.AddHours(3),
                    HttpOnly = true,
                    Secure = true,
                    IsEssential = true,
                    SameSite = SameSiteMode.None
                });
            return Ok("Successful login!");
        }
        catch(Exception e)
        {
            return BadRequest(e.Message);
        }
    }
    
    private void SetRefreshToken(RefreshToken newRefreshToken)
    {
        Response.Cookies.Append("X-Refresh-Token", newRefreshToken.Token, new CookieOptions()
        {
            HttpOnly = true,
            IsEssential = true,
            SameSite = SameSiteMode.None,
            Secure = true,
            Expires = newRefreshToken.Expires
        });
    }
    
    [AllowAnonymous]
    [HttpPost("refreshToken")]
    public async Task<ActionResult<string>> RefreshToken()
    {
        var refreshToken = Request.Cookies["X-Refresh-Token"];
        if (string.IsNullOrEmpty(refreshToken))
        {
            return Unauthorized("No refresh token!");
        }
        try
        {
            var (token, newRefreshToken) = await _authService.RefreshToken(refreshToken);
            Response.Cookies.Append("X-Access-Token", token,
                new CookieOptions
                {
                    Expires = DateTimeOffset.Now.AddHours(3),
                    HttpOnly = true,
                    Secure = true,
                    IsEssential = true,
                    SameSite = SameSiteMode.None
                });
            SetRefreshToken(newRefreshToken);
            return Ok("Successful login using refreshToken");
        }
        catch (Exception e)
        {
            return Unauthorized(e.Message);  
        }
    }

    [HttpDelete("revokeRefreshToken")]
    public async Task<IActionResult> RevokeRefreshToken(string username)
    {
        try
        {
            var res = await _authService.RevokeRefreshToken(username);
            return Ok("Revoked token" + res);
        }
        catch (Exception e)
        {
            return BadRequest(e.Message);
        }
    }
    
    [HttpPost("logout")]
    public async Task<ActionResult> Logout()
    {
        var refreshToken = Request.Cookies["X-Refresh-Token"];
        Response.Cookies.Delete("X-Refresh-Token");
        Response.Cookies.Delete("X-Access-Token");
        if (string.IsNullOrEmpty(refreshToken))
        {
            return Unauthorized("No refresh token!");
        }
        try
        {
            await _authService.Logout(refreshToken);
            return Ok("Successfully logged out!");
        }
        catch (Exception e)
        {
            return BadRequest(e.Message);
        }
    }

    [HttpPost("verifyEmail")]
    [AllowAnonymous]
    public async Task<ActionResult> VerifyEmail(VerifyEmailReqDto verifyEmailReqDto)
    {
        try
        {
            var res = await _authService.VerifyEmail(verifyEmailReqDto.ConfirmationCode);
            if (res != -1)
            {
                return Ok("Verified email successfully"); 
            }
            return BadRequest("Unexpected error");
        }
        catch (Exception e)
        {
            return BadRequest(e.Message);
        }
    }
}