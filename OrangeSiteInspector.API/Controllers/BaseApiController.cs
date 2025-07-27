using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using OrangeSiteInspector.Application.DTOs;

namespace OrangeSiteInspector.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public abstract class BaseApiController : ControllerBase
    {
        protected ActionResult<ApiResponseDto<T>> HandleResponse<T>(ApiResponseDto<T> response)
        {
            if (!response.Success)
            {
                return BadRequest(response);
            }

            return Ok(response);
        }

        protected ActionResult<ApiResponseDto> HandleResponse(ApiResponseDto response)
        {
            if (!response.Success)
            {
                return BadRequest(response);
            }

            return Ok(response);
        }

        protected string GetCurrentUserId()
        {
            return User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value ?? string.Empty;
        }

        protected string GetCurrentUserEmail()
        {
            return User.FindFirst(System.Security.Claims.ClaimTypes.Email)?.Value ?? string.Empty;
        }

        protected bool IsAdmin()
        {
            return User.IsInRole("Admin");
        }

        protected bool IsEngineer()
        {
            return User.IsInRole("Engineer");
        }

        protected bool IsAdminOrEngineer()
        {
            return IsAdmin() || IsEngineer();
        }

        protected bool CanChangeVisitStatus()
        {
            // Only admins can change visit status
            return IsAdmin();
        }

        protected ActionResult<ApiResponseDto> UnauthorizedAccess()
        {
            return Unauthorized(ApiResponseDto.ErrorResult("Unauthorized access. Insufficient permissions."));
        }

        protected ActionResult<ApiResponseDto<T>> UnauthorizedAccess<T>()
        {
            return Unauthorized(ApiResponseDto<T>.ErrorResult("Unauthorized access. Insufficient permissions."));
        }
    }
} 