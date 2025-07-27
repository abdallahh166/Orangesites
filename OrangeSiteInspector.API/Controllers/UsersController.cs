using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using OrangeSiteInspector.Application.DTOs;
using OrangeSiteInspector.Application.Interfaces;

namespace OrangeSiteInspector.API.Controllers
{
    /// <summary>
    /// User management endpoints
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    [Produces("application/json")]
    public class UsersController : BaseApiController
    {
        private readonly IUserService _userService;

        public UsersController(IUserService userService)
        {
            _userService = userService;
        }

        /// <summary>
        /// Get current user profile
        /// </summary>
        /// <returns>Current user information</returns>
        [HttpGet("profile")]
        [ProducesResponseType(typeof(ApiResponseDto<UserProfileDto>), 200)]
        [ProducesResponseType(typeof(ApiResponseDto<UserProfileDto>), 404)]
        [ProducesResponseType(401)]
        [ProducesResponseType(403)]
        public async Task<ActionResult<ApiResponseDto<UserProfileDto>>> GetProfile()
        {
            var userId = GetCurrentUserId();
            var response = await _userService.GetProfileAsync(userId);
            return HandleResponse(response);
        }

        /// <summary>
        /// Update current user profile (Engineer can only edit own profile)
        /// </summary>
        /// <param name="updateProfileDto">Updated profile information</param>
        /// <returns>Updated profile information</returns>
        [HttpPut("profile")]
        [ProducesResponseType(typeof(ApiResponseDto<UserProfileDto>), 200)]
        [ProducesResponseType(typeof(ApiResponseDto<UserProfileDto>), 400)]
        [ProducesResponseType(typeof(ApiResponseDto<UserProfileDto>), 404)]
        [ProducesResponseType(401)]
        [ProducesResponseType(403)]
        public async Task<ActionResult<ApiResponseDto<UserProfileDto>>> UpdateProfile([FromBody] UpdateProfileDto updateProfileDto)
        {
            var userId = GetCurrentUserId();
            var response = await _userService.UpdateProfileAsync(userId, updateProfileDto);
            return HandleResponse(response);
        }

        /// <summary>
        /// Update theme preference
        /// </summary>
        /// <param name="themeDto">Theme preference</param>
        /// <returns>Success message</returns>
        [HttpPut("theme")]
        [ProducesResponseType(typeof(ApiResponseDto<bool>), 200)]
        [ProducesResponseType(typeof(ApiResponseDto<bool>), 400)]
        [ProducesResponseType(401)]
        [ProducesResponseType(403)]
        public async Task<ActionResult<ApiResponseDto<bool>>> UpdateTheme([FromBody] UpdateThemeDto themeDto)
        {
            var userId = GetCurrentUserId();
            var response = await _userService.UpdateThemeAsync(userId, themeDto);
            return HandleResponse(response);
        }

        /// <summary>
        /// Check if email exists
        /// </summary>
        /// <param name="email">Email to check</param>
        /// <returns>True if email exists</returns>
        [HttpGet("check-email")]
        [ProducesResponseType(typeof(ApiResponseDto<bool>), 200)]
        [ProducesResponseType(401)]
        [ProducesResponseType(403)]
        public async Task<ActionResult<ApiResponseDto<bool>>> CheckEmailExists([FromQuery] string email)
        {
            var response = await _userService.CheckEmailExistsAsync(email);
            return HandleResponse(response);
        }

        /// <summary>
        /// Check if username exists
        /// </summary>
        /// <param name="userName">Username to check</param>
        /// <returns>True if username exists</returns>
        [HttpGet("check-username")]
        [ProducesResponseType(typeof(ApiResponseDto<bool>), 200)]
        [ProducesResponseType(401)]
        [ProducesResponseType(403)]
        public async Task<ActionResult<ApiResponseDto<bool>>> CheckUserNameExists([FromQuery] string userName)
        {
            var response = await _userService.CheckUserNameExistsAsync(userName);
            return HandleResponse(response);
        }

        /// <summary>
        /// Get user by ID (Admin only)
        /// </summary>
        /// <param name="id">User ID</param>
        /// <returns>User information</returns>
        [HttpGet("{id}")]
        [Authorize(Roles = "Admin")]
        [ProducesResponseType(typeof(ApiResponseDto<UserDto>), 200)]
        [ProducesResponseType(typeof(ApiResponseDto<UserDto>), 404)]
        [ProducesResponseType(401)]
        [ProducesResponseType(403)]
        public async Task<ActionResult<ApiResponseDto<UserDto>>> GetById(string id)
        {
            var response = await _userService.GetByIdAsync(id);
            return HandleResponse(response);
        }

        /// <summary>
        /// Get all users with pagination (Admin only)
        /// </summary>
        /// <param name="page">Page number</param>
        /// <param name="pageSize">Page size</param>
        /// <returns>Paginated list of users</returns>
        [HttpGet]
        [Authorize(Roles = "Admin")]
        [ProducesResponseType(typeof(ApiResponseDto<PagedResultDto<UserDto>>), 200)]
        [ProducesResponseType(401)]
        [ProducesResponseType(403)]
        public async Task<ActionResult<ApiResponseDto<PagedResultDto<UserDto>>>> GetAll(
            [FromQuery] int page = 1, 
            [FromQuery] int pageSize = 10)
        {
            var response = await _userService.GetAllAsync(page, pageSize);
            return HandleResponse(response);
        }

        /// <summary>
        /// Get users by role (Admin only)
        /// </summary>
        /// <param name="role">User role</param>
        /// <returns>List of users with specified role</returns>
        [HttpGet("by-role/{role}")]
        [Authorize(Roles = "Admin")]
        [ProducesResponseType(typeof(ApiResponseDto<List<UserDto>>), 200)]
        [ProducesResponseType(401)]
        [ProducesResponseType(403)]
        public async Task<ActionResult<ApiResponseDto<List<UserDto>>>> GetByRole(string role)
        {
            if (!Enum.TryParse<OrangeSiteInspector.Domain.Enums.UserRole>(role, true, out var userRole))
            {
                return BadRequest(ApiResponseDto<List<UserDto>>.ErrorResult("Invalid role"));
            }

            var response = await _userService.GetByRoleAsync(userRole);
            return HandleResponse(response);
        }

        /// <summary>
        /// Update user (Admin only)
        /// </summary>
        /// <param name="id">User ID</param>
        /// <param name="updateUserDto">Updated user information</param>
        /// <returns>Updated user information</returns>
        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        [ProducesResponseType(typeof(ApiResponseDto<UserDto>), 200)]
        [ProducesResponseType(typeof(ApiResponseDto<UserDto>), 400)]
        [ProducesResponseType(typeof(ApiResponseDto<UserDto>), 404)]
        [ProducesResponseType(401)]
        [ProducesResponseType(403)]
        public async Task<ActionResult<ApiResponseDto<UserDto>>> UpdateUser(string id, [FromBody] UpdateUserDto updateUserDto)
        {
            var response = await _userService.UpdateAsync(id, updateUserDto);
            return HandleResponse(response);
        }

        /// <summary>
        /// Delete user (Admin only)
        /// </summary>
        /// <param name="id">User ID</param>
        /// <returns>Success message</returns>
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        [ProducesResponseType(typeof(ApiResponseDto), 200)]
        [ProducesResponseType(typeof(ApiResponseDto), 404)]
        [ProducesResponseType(401)]
        [ProducesResponseType(403)]
        public async Task<ActionResult<ApiResponseDto>> Delete(string id)
        {
            var response = await _userService.DeleteAsync(id);
            return HandleResponse(response);
        }

        // Enhanced User Management Endpoints

        /// <summary>
        /// Get user status (Admin only)
        /// </summary>
        /// <param name="id">User ID</param>
        /// <returns>User status information</returns>
        [HttpGet("{id}/status")]
        [Authorize(Roles = "Admin")]
        [ProducesResponseType(typeof(ApiResponseDto<UserStatusDto>), 200)]
        [ProducesResponseType(typeof(ApiResponseDto<UserStatusDto>), 404)]
        [ProducesResponseType(401)]
        [ProducesResponseType(403)]
        public async Task<ActionResult<ApiResponseDto<UserStatusDto>>> GetUserStatus(string id)
        {
            var response = await _userService.GetUserStatusAsync(id);
            return HandleResponse(response);
        }

        /// <summary>
        /// Update user status (Admin only)
        /// </summary>
        /// <param name="id">User ID</param>
        /// <param name="statusDto">Status update data</param>
        /// <returns>Updated user status</returns>
        [HttpPut("{id}/status")]
        [Authorize(Roles = "Admin")]
        [ProducesResponseType(typeof(ApiResponseDto<UserStatusDto>), 200)]
        [ProducesResponseType(typeof(ApiResponseDto<UserStatusDto>), 400)]
        [ProducesResponseType(typeof(ApiResponseDto<UserStatusDto>), 404)]
        [ProducesResponseType(401)]
        [ProducesResponseType(403)]
        public async Task<ActionResult<ApiResponseDto<UserStatusDto>>> UpdateUserStatus(string id, [FromBody] UpdateUserStatusDto statusDto)
        {
            var response = await _userService.UpdateUserStatusAsync(id, statusDto);
            return HandleResponse(response);
        }

        /// <summary>
        /// Search users with filters (Admin only)
        /// </summary>
        /// <param name="searchDto">Search criteria</param>
        /// <returns>Filtered and paginated list of users</returns>
        [HttpPost("search")]
        [Authorize(Roles = "Admin")]
        [ProducesResponseType(typeof(ApiResponseDto<PagedResultDto<UserDto>>), 200)]
        [ProducesResponseType(401)]
        [ProducesResponseType(403)]
        public async Task<ActionResult<ApiResponseDto<PagedResultDto<UserDto>>>> SearchUsers([FromBody] UserSearchDto searchDto)
        {
            var response = await _userService.SearchUsersAsync(searchDto);
            return HandleResponse(response);
        }

        /// <summary>
        /// Get user statistics (Admin only)
        /// </summary>
        /// <returns>User statistics and analytics</returns>
        [HttpGet("statistics")]
        [Authorize(Roles = "Admin")]
        [ProducesResponseType(typeof(ApiResponseDto<UserStatisticsDto>), 200)]
        [ProducesResponseType(401)]
        [ProducesResponseType(403)]
        public async Task<ActionResult<ApiResponseDto<UserStatisticsDto>>> GetUserStatistics()
        {
            var response = await _userService.GetUserStatisticsAsync();
            return HandleResponse(response);
        }

        /// <summary>
        /// Get user activity (Admin only)
        /// </summary>
        /// <param name="page">Page number</param>
        /// <param name="pageSize">Page size</param>
        /// <returns>User activity information</returns>
        [HttpGet("activity")]
        [Authorize(Roles = "Admin")]
        [ProducesResponseType(typeof(ApiResponseDto<List<UserActivityDto>>), 200)]
        [ProducesResponseType(401)]
        [ProducesResponseType(403)]
        public async Task<ActionResult<ApiResponseDto<List<UserActivityDto>>>> GetUserActivity(
            [FromQuery] int page = 1, 
            [FromQuery] int pageSize = 10)
        {
            var response = await _userService.GetUserActivityAsync(page, pageSize);
            return HandleResponse(response);
        }

        /// <summary>
        /// Perform bulk user operations (Admin only)
        /// </summary>
        /// <param name="bulkOperationDto">Bulk operation data</param>
        /// <returns>Success message</returns>
        [HttpPost("bulk-operation")]
        [Authorize(Roles = "Admin")]
        [ProducesResponseType(typeof(ApiResponseDto), 200)]
        [ProducesResponseType(typeof(ApiResponseDto), 400)]
        [ProducesResponseType(401)]
        [ProducesResponseType(403)]
        public async Task<ActionResult<ApiResponseDto>> BulkUserOperation([FromBody] BulkUserOperationDto bulkOperationDto)
        {
            var response = await _userService.BulkUserOperationAsync(bulkOperationDto);
            return HandleResponse(response);
        }

        /// <summary>
        /// Lock user (Admin only)
        /// </summary>
        /// <param name="id">User ID</param>
        /// <param name="lockoutEnd">Lockout end time (optional)</param>
        /// <returns>Success message</returns>
        [HttpPost("{id}/lock")]
        [Authorize(Roles = "Admin")]
        [ProducesResponseType(typeof(ApiResponseDto), 200)]
        [ProducesResponseType(typeof(ApiResponseDto), 404)]
        [ProducesResponseType(401)]
        [ProducesResponseType(403)]
        public async Task<ActionResult<ApiResponseDto>> LockUser(string id, [FromQuery] DateTime? lockoutEnd = null)
        {
            var response = await _userService.LockUserAsync(id, lockoutEnd);
            return HandleResponse(response);
        }

        /// <summary>
        /// Unlock user (Admin only)
        /// </summary>
        /// <param name="id">User ID</param>
        /// <returns>Success message</returns>
        [HttpPost("{id}/unlock")]
        [Authorize(Roles = "Admin")]
        [ProducesResponseType(typeof(ApiResponseDto), 200)]
        [ProducesResponseType(typeof(ApiResponseDto), 404)]
        [ProducesResponseType(401)]
        [ProducesResponseType(403)]
        public async Task<ActionResult<ApiResponseDto>> UnlockUser(string id)
        {
            var response = await _userService.UnlockUserAsync(id);
            return HandleResponse(response);
        }

        /// <summary>
        /// Activate user (Admin only)
        /// </summary>
        /// <param name="id">User ID</param>
        /// <returns>Success message</returns>
        [HttpPost("{id}/activate")]
        [Authorize(Roles = "Admin")]
        [ProducesResponseType(typeof(ApiResponseDto), 200)]
        [ProducesResponseType(typeof(ApiResponseDto), 404)]
        [ProducesResponseType(401)]
        [ProducesResponseType(403)]
        public async Task<ActionResult<ApiResponseDto>> ActivateUser(string id)
        {
            var response = await _userService.ActivateUserAsync(id);
            return HandleResponse(response);
        }

        /// <summary>
        /// Deactivate user (Admin only)
        /// </summary>
        /// <param name="id">User ID</param>
        /// <returns>Success message</returns>
        [HttpPost("{id}/deactivate")]
        [Authorize(Roles = "Admin")]
        [ProducesResponseType(typeof(ApiResponseDto), 200)]
        [ProducesResponseType(typeof(ApiResponseDto), 404)]
        [ProducesResponseType(401)]
        [ProducesResponseType(403)]
        public async Task<ActionResult<ApiResponseDto>> DeactivateUser(string id)
        {
            var response = await _userService.DeactivateUserAsync(id);
            return HandleResponse(response);
        }

        /// <summary>
        /// Reset user login attempts (Admin only)
        /// </summary>
        /// <param name="id">User ID</param>
        /// <returns>Success message</returns>
        [HttpPost("{id}/reset-login-attempts")]
        [Authorize(Roles = "Admin")]
        [ProducesResponseType(typeof(ApiResponseDto), 200)]
        [ProducesResponseType(typeof(ApiResponseDto), 404)]
        [ProducesResponseType(401)]
        [ProducesResponseType(403)]
        public async Task<ActionResult<ApiResponseDto>> ResetLoginAttempts(string id)
        {
            var response = await _userService.ResetLoginAttemptsAsync(id);
            return HandleResponse(response);
        }
    }
} 