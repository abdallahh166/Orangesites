using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using OrangeSiteInspector.Application.DTOs;
using OrangeSiteInspector.Application.Interfaces;
using OrangeSiteInspector.Domain.Enums;
using System.Security.Claims;

namespace OrangeSiteInspector.API.Controllers
{
    /// <summary>
    /// Dashboard analytics and statistics endpoints
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    [Produces("application/json")]
    public class DashboardController : BaseApiController
    {
        private readonly IDashboardService _dashboardService;

        public DashboardController(IDashboardService dashboardService)
        {
            _dashboardService = dashboardService;
        }

        /// <summary>
        /// Get dashboard overview (Admin only)
        /// </summary>
        [HttpGet("overview")]
        [Authorize(Roles = "Admin")]
        [ProducesResponseType(401)]
        [ProducesResponseType(403)]
        public async Task<ActionResult<ApiResponseDto<DashboardOverviewDto>>> GetDashboardOverview()
        {
            var result = await _dashboardService.GetDashboardOverviewAsync();
            return Ok(result);
        }

        /// <summary>
        /// Get engineer dashboard data (filtered for current user)
        /// </summary>
        [HttpGet("engineer")]
        [Authorize(Roles = "Engineer")]
        [ProducesResponseType(401)]
        [ProducesResponseType(403)]
        public async Task<ActionResult<ApiResponseDto<EngineerDashboardDto>>> GetEngineerDashboard()
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return BadRequest(ApiResponseDto<EngineerDashboardDto>.ErrorResult("User ID not found"));
            }

            var result = await _dashboardService.GetEngineerDashboardAsync(userId);
            return Ok(result);
        }

        /// <summary>
        /// Get admin dashboard data (global view)
        /// </summary>
        [HttpGet("admin")]
        [Authorize(Roles = "Admin")]
        [ProducesResponseType(401)]
        [ProducesResponseType(403)]
        public async Task<ActionResult<ApiResponseDto<AdminDashboardDto>>> GetAdminDashboard()
        {
            var result = await _dashboardService.GetAdminDashboardAsync();
            return Ok(result);
        }

        /// <summary>
        /// Get dashboard statistics with optional filtering
        /// </summary>
        [HttpGet("stats")]
        [ProducesResponseType(401)]
        [ProducesResponseType(403)]
        public async Task<ActionResult<ApiResponseDto<DashboardStatsDto>>> GetDashboardStats(
            [FromQuery] DateTime? startDate,
            [FromQuery] DateTime? endDate,
            [FromQuery] string? userId,
            [FromQuery] int? siteId,
            [FromQuery] VisitStatus? status)
        {
            // Engineers can only see their own stats
            if (User.IsInRole("Engineer"))
            {
                var currentUserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(currentUserId))
                {
                    return BadRequest(ApiResponseDto<DashboardStatsDto>.ErrorResult("User ID not found"));
                }
                userId = currentUserId; // Force filter to current user
            }

            var filter = new DashboardFilterDto
            {
                StartDate = startDate,
                EndDate = endDate,
                UserId = userId,
                SiteId = siteId,
                Status = status
            };

            var result = await _dashboardService.GetDashboardStatsAsync(filter);
            return Ok(result);
        }

        /// <summary>
        /// Get dashboard charts with optional filtering
        /// </summary>
        [HttpGet("charts")]
        [ProducesResponseType(401)]
        [ProducesResponseType(403)]
        public async Task<ActionResult<ApiResponseDto<DashboardChartDataDto>>> GetDashboardCharts(
            [FromQuery] DateTime? startDate,
            [FromQuery] DateTime? endDate,
            [FromQuery] string? userId,
            [FromQuery] int? siteId,
            [FromQuery] VisitStatus? status)
        {
            // Engineers can only see their own charts
            if (User.IsInRole("Engineer"))
            {
                var currentUserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(currentUserId))
                {
                    return BadRequest(ApiResponseDto<DashboardChartDataDto>.ErrorResult("User ID not found"));
                }
                userId = currentUserId; // Force filter to current user
            }

            var filter = new DashboardFilterDto
            {
                StartDate = startDate,
                EndDate = endDate,
                UserId = userId,
                SiteId = siteId,
                Status = status
            };

            var result = await _dashboardService.GetDashboardChartsAsync(filter);
            return Ok(result);
        }

        /// <summary>
        /// Get latest visits with optional filtering
        /// </summary>
        [HttpGet("latest-visits")]
        [ProducesResponseType(401)]
        [ProducesResponseType(403)]
        public async Task<ActionResult<ApiResponseDto<List<VisitDto>>>> GetLatestVisits(
            [FromQuery] int count = 10,
            [FromQuery] string? userId = null)
        {
            // Engineers can only see their own visits
            if (User.IsInRole("Engineer"))
            {
                var currentUserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(currentUserId))
                {
                    return BadRequest(ApiResponseDto<List<VisitDto>>.ErrorResult("User ID not found"));
                }
                userId = currentUserId; // Force filter to current user
            }

            var result = await _dashboardService.GetLatestVisitsAsync(count, userId);
            return Ok(result);
        }

        /// <summary>
        /// Get recent sites with optional filtering
        /// </summary>
        [HttpGet("recent-sites")]
        [ProducesResponseType(401)]
        [ProducesResponseType(403)]
        public async Task<ActionResult<ApiResponseDto<List<SiteDto>>>> GetRecentSites(
            [FromQuery] int count = 10,
            [FromQuery] string? userId = null)
        {
            // Engineers can only see sites they've visited
            if (User.IsInRole("Engineer"))
            {
                var currentUserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(currentUserId))
                {
                    return BadRequest(ApiResponseDto<List<SiteDto>>.ErrorResult("User ID not found"));
                }
                userId = currentUserId; // Force filter to current user
            }

            var result = await _dashboardService.GetRecentSitesAsync(count, userId);
            return Ok(result);
        }

        /// <summary>
        /// Get visits by status chart data
        /// </summary>
        [HttpGet("visits-by-status")]
        [ProducesResponseType(401)]
        [ProducesResponseType(403)]
        public async Task<ActionResult<ApiResponseDto<List<ChartDataPointDto>>>> GetVisitsByStatus(
            [FromQuery] string? userId = null)
        {
            // Engineers can only see their own data
            if (User.IsInRole("Engineer"))
            {
                var currentUserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(currentUserId))
                {
                    return BadRequest(ApiResponseDto<List<ChartDataPointDto>>.ErrorResult("User ID not found"));
                }
                userId = currentUserId; // Force filter to current user
            }

            var result = await _dashboardService.GetVisitsByStatusAsync(userId);
            return Ok(result);
        }

        /// <summary>
        /// Get visits by month chart data
        /// </summary>
        [HttpGet("visits-by-month")]
        [ProducesResponseType(401)]
        [ProducesResponseType(403)]
        public async Task<ActionResult<ApiResponseDto<List<ChartDataPointDto>>>> GetVisitsByMonth(
            [FromQuery] int months = 12,
            [FromQuery] string? userId = null)
        {
            // Engineers can only see their own data
            if (User.IsInRole("Engineer"))
            {
                var currentUserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(currentUserId))
                {
                    return BadRequest(ApiResponseDto<List<ChartDataPointDto>>.ErrorResult("User ID not found"));
                }
                userId = currentUserId; // Force filter to current user
            }

            var result = await _dashboardService.GetVisitsByMonthAsync(months, userId);
            return Ok(result);
        }

        /// <summary>
        /// Get visits by day chart data
        /// </summary>
        [HttpGet("visits-by-day")]
        [ProducesResponseType(401)]
        [ProducesResponseType(403)]
        public async Task<ActionResult<ApiResponseDto<List<ChartDataPointDto>>>> GetVisitsByDay(
            [FromQuery] int days = 30,
            [FromQuery] string? userId = null)
        {
            // Engineers can only see their own data
            if (User.IsInRole("Engineer"))
            {
                var currentUserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(currentUserId))
                {
                    return BadRequest(ApiResponseDto<List<ChartDataPointDto>>.ErrorResult("User ID not found"));
                }
                userId = currentUserId; // Force filter to current user
            }

            var result = await _dashboardService.GetVisitsByDayAsync(days, userId);
            return Ok(result);
        }

        /// <summary>
        /// Get top sites by visit count
        /// </summary>
        [HttpGet("top-sites")]
        [ProducesResponseType(401)]
        [ProducesResponseType(403)]
        public async Task<ActionResult<ApiResponseDto<List<ChartDataPointDto>>>> GetTopSites(
            [FromQuery] int count = 10,
            [FromQuery] string? userId = null)
        {
            // Engineers can only see their own data
            if (User.IsInRole("Engineer"))
            {
                var currentUserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(currentUserId))
                {
                    return BadRequest(ApiResponseDto<List<ChartDataPointDto>>.ErrorResult("User ID not found"));
                }
                userId = currentUserId; // Force filter to current user
            }

            var result = await _dashboardService.GetTopSitesAsync(count, userId);
            return Ok(result);
        }

        /// <summary>
        /// Get visits by engineer (Admin only)
        /// </summary>
        [HttpGet("visits-by-engineer")]
        [Authorize(Roles = "Admin")]
        [ProducesResponseType(401)]
        [ProducesResponseType(403)]
        public async Task<ActionResult<ApiResponseDto<List<ChartDataPointDto>>>> GetVisitsByEngineer()
        {
            var result = await _dashboardService.GetVisitsByEngineerAsync();
            return Ok(result);
        }

        /// <summary>
        /// Get sites by visit count (Admin only)
        /// </summary>
        [HttpGet("sites-by-visits")]
        [Authorize(Roles = "Admin")]
        [ProducesResponseType(401)]
        [ProducesResponseType(403)]
        public async Task<ActionResult<ApiResponseDto<List<ChartDataPointDto>>>> GetSitesByVisits(
            [FromQuery] int count = 10)
        {
            var result = await _dashboardService.GetSitesByVisitsAsync(count);
            return Ok(result);
        }

        /// <summary>
        /// Get role-specific dashboard data
        /// </summary>
        [HttpGet("my-dashboard")]
        [ProducesResponseType(401)]
        [ProducesResponseType(403)]
        public async Task<IActionResult> GetMyDashboard()
        {
            if (User.IsInRole("Admin"))
            {
                var result = await _dashboardService.GetAdminDashboardAsync();
                return Ok(result);
            }
            else if (User.IsInRole("Engineer"))
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId))
                {
                    return BadRequest(ApiResponseDto<EngineerDashboardDto>.ErrorResult("User ID not found"));
                }

                var result = await _dashboardService.GetEngineerDashboardAsync(userId);
                return Ok(result);
            }

            return Forbid();
        }
    }
} 