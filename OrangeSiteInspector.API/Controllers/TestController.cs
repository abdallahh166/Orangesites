using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using OrangeSiteInspector.Application.DTOs;

namespace OrangeSiteInspector.API.Controllers
{
    /// <summary>
    /// Test endpoints for verifying authorization policies
    /// </summary>
    [Authorize]
    public class TestController : BaseApiController
    {
        /// <summary>
        /// Test admin-only access
        /// </summary>
        /// <returns>Success message for admin</returns>
        [HttpGet("admin-only")]
        [Authorize(Roles = "Admin")]
        public ActionResult<ApiResponseDto<string>> AdminOnly()
        {
            return HandleResponse(ApiResponseDto<string>.SuccessResult("Admin access granted"));
        }

        /// <summary>
        /// Test engineer-only access
        /// </summary>
        /// <returns>Success message for engineer</returns>
        [HttpGet("engineer-only")]
        [Authorize(Roles = "Engineer")]
        public ActionResult<ApiResponseDto<string>> EngineerOnly()
        {
            return HandleResponse(ApiResponseDto<string>.SuccessResult("Engineer access granted"));
        }

        /// <summary>
        /// Test admin or engineer access
        /// </summary>
        /// <returns>Success message for admin or engineer</returns>
        [HttpGet("admin-or-engineer")]
        [Authorize(Roles = "Admin,Engineer")]
        public ActionResult<ApiResponseDto<string>> AdminOrEngineer()
        {
            return HandleResponse(ApiResponseDto<string>.SuccessResult("Admin or Engineer access granted"));
        }

        /// <summary>
        /// Test current user info
        /// </summary>
        /// <returns>Current user information</returns>
        [HttpGet("user-info")]
        public ActionResult<ApiResponseDto<UserInfoDto>> GetUserInfo()
        {
            var userInfo = new UserInfoDto
            {
                UserId = GetCurrentUserId(),
                Email = GetCurrentUserEmail(),
                IsAdmin = IsAdmin(),
                IsEngineer = IsEngineer(),
                Roles = new List<string>()
            };

            if (IsAdmin()) userInfo.Roles.Add("Admin");
            if (IsEngineer()) userInfo.Roles.Add("Engineer");

            return HandleResponse(ApiResponseDto<UserInfoDto>.SuccessResult(userInfo));
        }

        /// <summary>
        /// Test visit ownership check
        /// </summary>
        /// <param name="visitId">Visit ID to check</param>
        /// <returns>Ownership check result</returns>
        [HttpGet("visit-ownership/{visitId}")]
        public ActionResult<ApiResponseDto<OwnershipCheckDto>> CheckVisitOwnership(int visitId)
        {
            var ownershipCheck = new OwnershipCheckDto
            {
                VisitId = visitId,
                UserId = GetCurrentUserId(),
                IsAdmin = IsAdmin(),
                CanAccess = IsAdmin() || CanChangeVisitStatus()
            };

            return HandleResponse(ApiResponseDto<OwnershipCheckDto>.SuccessResult(ownershipCheck));
        }
    }

    public class UserInfoDto
    {
        public string UserId { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public bool IsAdmin { get; set; }
        public bool IsEngineer { get; set; }
        public List<string> Roles { get; set; } = new();
    }

    public class OwnershipCheckDto
    {
        public int VisitId { get; set; }
        public string UserId { get; set; } = string.Empty;
        public bool IsAdmin { get; set; }
        public bool CanAccess { get; set; }
    }
} 