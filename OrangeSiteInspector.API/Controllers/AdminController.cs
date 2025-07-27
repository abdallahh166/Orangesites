using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using OrangeSiteInspector.Application.DTOs;
using OrangeSiteInspector.Application.Interfaces;
using OrangeSiteInspector.Domain.Enums;

namespace OrangeSiteInspector.API.Controllers
{
    /// <summary>
    /// Administrative endpoints for managing the system
    /// </summary>
    [Authorize(Roles = "Admin")]
    public class AdminController : BaseApiController
    {
        private readonly IVisitService _visitService;
        private readonly ISiteService _siteService;
        private readonly IUserService _userService;
        private readonly IOramaService _oramaService;
        private readonly IDashboardService _dashboardService;

        public AdminController(
            IVisitService visitService,
            ISiteService siteService,
            IUserService userService,
            IOramaService oramaService,
            IDashboardService dashboardService)
        {
            _visitService = visitService;
            _siteService = siteService;
            _userService = userService;
            _oramaService = oramaService;
            _dashboardService = dashboardService;
        }

        /// <summary>
        /// Get all pending visits for review
        /// </summary>
        /// <returns>List of pending visits</returns>
        [HttpGet("visits/pending")]
        [ProducesResponseType(typeof(ApiResponseDto<List<VisitDto>>), 200)]
        public async Task<ActionResult<ApiResponseDto<List<VisitDto>>>> GetPendingVisits()
        {
            var response = await _visitService.GetByStatusAsync(VisitStatus.Pending);
            return HandleResponse(response);
        }

        /// <summary>
        /// Accept a visit
        /// </summary>
        /// <param name="visitId">Visit ID</param>
        /// <returns>Updated visit information</returns>
        [HttpPut("visits/{visitId}/accept")]
        [ProducesResponseType(typeof(ApiResponseDto<VisitDto>), 200)]
        [ProducesResponseType(typeof(ApiResponseDto<VisitDto>), 400)]
        [ProducesResponseType(typeof(ApiResponseDto<VisitDto>), 404)]
        public async Task<ActionResult<ApiResponseDto<VisitDto>>> AcceptVisit(int visitId)
        {
            var updateStatusDto = new UpdateVisitStatusDto { Status = VisitStatus.Accepted };
            var response = await _visitService.UpdateStatusAsync(visitId, updateStatusDto);
            return HandleResponse(response);
        }

        /// <summary>
        /// Reject a visit
        /// </summary>
        /// <param name="visitId">Visit ID</param>
        /// <returns>Updated visit information</returns>
        [HttpPut("visits/{visitId}/reject")]
        [ProducesResponseType(typeof(ApiResponseDto<VisitDto>), 200)]
        [ProducesResponseType(typeof(ApiResponseDto<VisitDto>), 400)]
        [ProducesResponseType(typeof(ApiResponseDto<VisitDto>), 404)]
        public async Task<ActionResult<ApiResponseDto<VisitDto>>> RejectVisit(int visitId)
        {
            var updateStatusDto = new UpdateVisitStatusDto { Status = VisitStatus.Rejected };
            var response = await _visitService.UpdateStatusAsync(visitId, updateStatusDto);
            return HandleResponse(response);
        }

        /// <summary>
        /// Get dashboard statistics (legacy endpoint - use /api/dashboard/stats instead)
        /// </summary>
        /// <returns>Dashboard statistics</returns>
        [HttpGet("dashboard/stats")]
        [ProducesResponseType(typeof(ApiResponseDto<DashboardStatsDto>), 200)]
        public async Task<ActionResult<ApiResponseDto<DashboardStatsDto>>> GetDashboardStats()
        {
            var response = await _dashboardService.GetDashboardStatsAsync();
            return HandleResponse(response);
        }

        /// <summary>
        /// Get recent visits for admin review
        /// </summary>
        /// <param name="count">Number of recent visits to retrieve</param>
        /// <returns>List of recent visits</returns>
        [HttpGet("visits/recent")]
        [ProducesResponseType(typeof(ApiResponseDto<List<VisitDto>>), 200)]
        public async Task<ActionResult<ApiResponseDto<List<VisitDto>>>> GetRecentVisits([FromQuery] int count = 10)
        {
            var response = await _dashboardService.GetLatestVisitsAsync(count);
            return HandleResponse(response);
        }

        /// <summary>
        /// Get visits by date range for admin review
        /// </summary>
        /// <param name="startDate">Start date</param>
        /// <param name="endDate">End date</param>
        /// <returns>List of visits in date range</returns>
        [HttpGet("visits/by-date-range")]
        [ProducesResponseType(typeof(ApiResponseDto<List<VisitDto>>), 200)]
        public async Task<ActionResult<ApiResponseDto<List<VisitDto>>>> GetVisitsByDateRange(
            [FromQuery] DateTime startDate, 
            [FromQuery] DateTime endDate)
        {
            var response = await _visitService.GetByDateRangeAsync(startDate, endDate);
            return HandleResponse(response);
        }

        /// <summary>
        /// Get all Orama groups for management
        /// </summary>
        /// <returns>List of Orama groups</returns>
        [HttpGet("orama/groups")]
        [ProducesResponseType(typeof(ApiResponseDto<List<OramaGroupDto>>), 200)]
        public async Task<ActionResult<ApiResponseDto<List<OramaGroupDto>>>> GetAllOramaGroups()
        {
            var response = await _oramaService.GetAllGroupsAsync();
            return HandleResponse(response);
        }

        /// <summary>
        /// Get all Orama items for management
        /// </summary>
        /// <returns>List of Orama items</returns>
        [HttpGet("orama/items")]
        [ProducesResponseType(typeof(ApiResponseDto<List<OramaItemDto>>), 200)]
        public async Task<ActionResult<ApiResponseDto<List<OramaItemDto>>>> GetAllOramaItems()
        {
            var response = await _oramaService.GetAllItemsAsync();
            return HandleResponse(response);
        }

        /// <summary>
        /// Create new Orama group
        /// </summary>
        /// <param name="name">Group name</param>
        /// <returns>Created group information</returns>
        [HttpPost("orama/groups")]
        [ProducesResponseType(typeof(ApiResponseDto<OramaGroupDto>), 201)]
        [ProducesResponseType(typeof(ApiResponseDto<OramaGroupDto>), 400)]
        public async Task<ActionResult<ApiResponseDto<OramaGroupDto>>> CreateOramaGroup([FromBody] string name)
        {
            var response = await _oramaService.CreateGroupAsync(name);
            return CreatedAtAction(nameof(GetAllOramaGroups), null, response);
        }

        /// <summary>
        /// Create new Orama item
        /// </summary>
        /// <param name="request">Item creation request</param>
        /// <returns>Created item information</returns>
        [HttpPost("orama/items")]
        [ProducesResponseType(typeof(ApiResponseDto<OramaItemDto>), 201)]
        [ProducesResponseType(typeof(ApiResponseDto<OramaItemDto>), 400)]
        public async Task<ActionResult<ApiResponseDto<OramaItemDto>>> CreateOramaItem([FromBody] CreateOramaItemRequest request)
        {
            var response = await _oramaService.CreateItemAsync(request.Name, request.GroupId);
            return CreatedAtAction(nameof(GetAllOramaItems), null, response);
        }
    }
} 