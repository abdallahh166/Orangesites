using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using OrangeSiteInspector.Application.DTOs;
using OrangeSiteInspector.Application.Interfaces;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.Extensions.Logging;
using System.Security.Claims;

namespace OrangeSiteInspector.API.Controllers
{
    /// <summary>
    /// Authentication endpoints for user registration and login
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]
    [Produces("application/json")]
    [EnableRateLimiting("AuthPolicy")]
    public class AuthController : BaseApiController
    {
        private readonly IAuthService _authService;
        private readonly ILogger<AuthController> _logger;

        public AuthController(IAuthService authService, ILogger<AuthController> logger)
        {
            _authService = authService;
            _logger = logger;
        }

        /// <summary>
        /// Register a new user
        /// </summary>
        /// <param name="createUserDto">User registration data</param>
        /// <returns>Created user information</returns>
        [HttpPost("register")]
        [ProducesResponseType(typeof(ApiResponseDto<LoginResponseDto>), 200)]
        [ProducesResponseType(typeof(ApiResponseDto<LoginResponseDto>), 400)]
        [ProducesResponseType(401)]
        [ProducesResponseType(403)]
        public async Task<ActionResult<ApiResponseDto<LoginResponseDto>>> Register([FromBody] CreateUserDto createUserDto)
        {
            if (!ModelState.IsValid)
            {
                _logger.LogWarning("Invalid registration model state: {@ModelState}", ModelState);
                return BadRequest(ApiResponseDto<LoginResponseDto>.ErrorResult("Invalid registration data", ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage).ToList()));
            }
            _logger.LogInformation("Registration attempt - UserName: {UserName}, Email: {Email}, Role: {Role}", 
                createUserDto.UserName, createUserDto.Email, createUserDto.Role);
            var response = await _authService.RegisterAsync(createUserDto);
            if (!response.Success)
            {
                _logger.LogWarning("Registration failed for {Email}: {Message}", createUserDto.Email, response.Message);
                return BadRequest(response);
            }
            return Ok(response);
        }

        /// <summary>
        /// Login with email and password
        /// </summary>
        /// <param name="loginDto">Login credentials</param>
        /// <returns>JWT token and user information</returns>
        [HttpPost("login")]
        [ProducesResponseType(typeof(ApiResponseDto<LoginResponseDto>), 200)]
        [ProducesResponseType(typeof(ApiResponseDto<LoginResponseDto>), 400)]
        [ProducesResponseType(401)]
        [ProducesResponseType(403)]
        public async Task<ActionResult<ApiResponseDto<LoginResponseDto>>> Login([FromBody] LoginDto loginDto)
        {
            if (!ModelState.IsValid)
            {
                _logger.LogWarning("Invalid login model state: {@ModelState}", ModelState);
                return BadRequest(ApiResponseDto<LoginResponseDto>.ErrorResult("Invalid login data", ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage).ToList()));
            }
            _logger.LogInformation("Login attempt for Email: {Email}", loginDto.Email);
            var response = await _authService.LoginAsync(loginDto);
            if (!response.Success)
            {
                _logger.LogWarning("Login failed for {Email}: {Message}", loginDto.Email, response.Message);
                return BadRequest(response);
            }
            return Ok(response);
        }

        /// <summary>
        /// Change user password
        /// </summary>
        /// <param name="changePasswordDto">Password change data</param>
        /// <returns>Success message</returns>
        [HttpPost("change-password")]
        [Authorize]
        [ProducesResponseType(typeof(ApiResponseDto), 200)]
        [ProducesResponseType(typeof(ApiResponseDto), 400)]
        [ProducesResponseType(401)]
        [ProducesResponseType(403)]
        public async Task<ActionResult<ApiResponseDto>> ChangePassword([FromBody] ChangePasswordDto changePasswordDto)
        {
            if (!ModelState.IsValid)
            {
                _logger.LogWarning("Invalid change password model state: {@ModelState}", ModelState);
                return BadRequest(ApiResponseDto.ErrorResult("Invalid change password data", ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage).ToList()));
            }
            var userId = GetCurrentUserId();
            _logger.LogInformation("Change password attempt for UserId: {UserId}", userId);
            var response = await _authService.ChangePasswordAsync(userId, changePasswordDto);
            if (!response.Success)
            {
                _logger.LogWarning("Change password failed for UserId: {UserId}: {Message}", userId, response.Message);
                return BadRequest(response);
            }
            return Ok(response);
        }

        /// <summary>
        /// Refreshes access token using refresh token
        /// </summary>
        [HttpPost("refresh")]
        [ProducesResponseType(typeof(ApiResponseDto<AuthResponseDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponseDto), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(ApiResponseDto), StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> RefreshToken([FromBody] RefreshTokenDto refreshTokenDto)
        {
            try
            {
                if (string.IsNullOrEmpty(refreshTokenDto.RefreshToken))
                {
                    _logger.LogWarning("Refresh token request failed: Empty refresh token");
                    return BadRequest(ApiResponseDto.ErrorResult("Refresh token is required"));
                }

                // Get client information for security tracking
                var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "Unknown";
                var userAgent = HttpContext.Request.Headers["User-Agent"].ToString();

                _logger.LogInformation("Refresh token request from IP: {IpAddress}, User-Agent: {UserAgent}", ipAddress, userAgent);

                var result = await _authService.ValidateRefreshTokenAsync(refreshTokenDto.RefreshToken);
                if (result == null)
                {
                    _logger.LogWarning("Refresh token validation failed from IP: {IpAddress}", ipAddress);
                    return Unauthorized(ApiResponseDto.ErrorResult("Invalid or expired refresh token"));
                }

                var response = new AuthResponseDto
                {
                    Token = result.Value.AccessToken,
                    RefreshToken = result.Value.RefreshToken,
                    ExpiresAt = DateTime.UtcNow.AddHours(1) // or use the actual expiration if available
                };

                _logger.LogInformation("Token refreshed successfully from IP: {IpAddress}", ipAddress);
                return Ok(ApiResponseDto.SuccessResult(response, "Token refreshed successfully"));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error during token refresh");
                return StatusCode(500, ApiResponseDto.ErrorResult("An unexpected error occurred during token refresh"));
            }
        }

        /// <summary>
        /// Request password reset
        /// </summary>
        /// <param name="email">User email</param>
        /// <returns>Success message</returns>
        [HttpPost("forgot-password")]
        [ProducesResponseType(typeof(ApiResponseDto), 200)]
        [ProducesResponseType(typeof(ApiResponseDto), 400)]
        [ProducesResponseType(401)]
        [ProducesResponseType(403)]
        public async Task<ActionResult<ApiResponseDto>> ForgotPassword([FromBody] string email)
        {
            if (string.IsNullOrWhiteSpace(email))
            {
                _logger.LogWarning("Forgot password called with empty email");
                return BadRequest(ApiResponseDto.ErrorResult("Email is required"));
            }
            _logger.LogInformation("Forgot password attempt for Email: {Email}", email);
            var response = await _authService.ForgotPasswordAsync(email);
            if (!response.Success)
            {
                _logger.LogWarning("Forgot password failed for Email: {Email}: {Message}", email, response.Message);
                return BadRequest(response);
            }
            return Ok(response);
        }

        /// <summary>
        /// Reset password with token
        /// </summary>
        /// <param name="request">Reset password request containing email, token, and new password</param>
        /// <returns>Success message</returns>
        [HttpPost("reset-password")]
        [ProducesResponseType(typeof(ApiResponseDto), 200)]
        [ProducesResponseType(typeof(ApiResponseDto), 400)]
        [ProducesResponseType(401)]
        [ProducesResponseType(403)]
        public async Task<ActionResult<ApiResponseDto>> ResetPassword([FromBody] ResetPasswordDto request)
        {
            if (!ModelState.IsValid)
            {
                _logger.LogWarning("Invalid reset password model state: {@ModelState}", ModelState);
                return BadRequest(ApiResponseDto.ErrorResult("Invalid reset password data", ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage).ToList()));
            }
            _logger.LogInformation("Reset password attempt for Email: {Email}", request.Email);
            var response = await _authService.ResetPasswordAsync(request.Email, request.Token, request.NewPassword);
            if (!response.Success)
            {
                _logger.LogWarning("Reset password failed for Email: {Email}: {Message}", request.Email, response.Message);
                return BadRequest(response);
            }
            return Ok(response);
        }

        /// <summary>
        /// Confirm email address
        /// </summary>
        /// <param name="request">Confirm email request containing user ID and token</param>
        /// <returns>Success message</returns>
        [HttpPost("confirm-email")]
        [ProducesResponseType(typeof(ApiResponseDto), 200)]
        [ProducesResponseType(typeof(ApiResponseDto), 400)]
        [ProducesResponseType(401)]
        [ProducesResponseType(403)]
        public async Task<ActionResult<ApiResponseDto>> ConfirmEmail([FromBody] ConfirmEmailRequest request)
        {
            if (!ModelState.IsValid)
            {
                _logger.LogWarning("Invalid confirm email model state: {@ModelState}", ModelState);
                return BadRequest(ApiResponseDto.ErrorResult("Invalid confirm email data", ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage).ToList()));
            }
            _logger.LogInformation("Confirm email attempt for UserId: {UserId}", request.UserId);
            var response = await _authService.ConfirmEmailAsync(request.UserId, request.Token);
            if (!response.Success)
            {
                _logger.LogWarning("Confirm email failed for UserId: {UserId}: {Message}", request.UserId, response.Message);
                return BadRequest(response);
            }
            return Ok(response);
        }

        /// <summary>
        /// Logs out the current user
        /// </summary>
        [HttpPost("logout")]
        [Authorize]
        [ProducesResponseType(typeof(ApiResponseDto), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponseDto), StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> Logout([FromBody] LogoutDto logoutDto)
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId))
                {
                    _logger.LogWarning("Logout failed: User ID not found in token");
                    return BadRequest(ApiResponseDto.ErrorResult("Invalid user token"));
                }

                // Get client information for security tracking
                var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "Unknown";
                var userAgent = HttpContext.Request.Headers["User-Agent"].ToString();

                _logger.LogInformation("Logout request from UserId: {UserId}, IP: {IpAddress}, User-Agent: {UserAgent}", 
                    userId, ipAddress, userAgent);

                // Invalidate the refresh token if provided
                if (!string.IsNullOrEmpty(logoutDto.RefreshToken))
                {
                    await _authService.InvalidateRefreshTokenAsync(logoutDto.RefreshToken);
                }

                _logger.LogInformation("User logged out successfully. UserId: {UserId}, IP: {IpAddress}", userId, ipAddress);
                return Ok(ApiResponseDto.SuccessResult("Logged out successfully"));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error during logout");
                return StatusCode(500, ApiResponseDto.ErrorResult("An unexpected error occurred during logout"));
            }
        }
    }

    /// <summary>
    /// Request body for confirming a user's email address.
    /// </summary>
    public class ConfirmEmailRequest
    {
        /// <summary>User ID to confirm.</summary>
        public string UserId { get; set; } = string.Empty;
        /// <summary>Confirmation token sent to the user's email.</summary>
        public string Token { get; set; } = string.Empty;
    }

    /// <summary>
    /// Request body for logging out a user (invalidating refresh token).
    /// </summary>
    public class LogoutRequest
    {
        /// <summary>The refresh token to invalidate.</summary>
        public string RefreshToken { get; set; } = string.Empty;
    }
} 