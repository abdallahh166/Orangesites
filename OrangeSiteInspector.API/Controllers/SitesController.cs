using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using OrangeSiteInspector.Application.DTOs;
using OrangeSiteInspector.Application.Interfaces;

namespace OrangeSiteInspector.API.Controllers
{
    /// <summary>
    /// Site management endpoints
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    [Produces("application/json")]
    public class SitesController : BaseApiController
    {
        private readonly ISiteService _siteService;
        private readonly IVisitService _visitService;

        /// <summary>
        /// Constructor for SitesController.
        /// </summary>
        public SitesController(ISiteService siteService, IVisitService visitService)
        {
            _siteService = siteService;
            _visitService = visitService;
        }

        /// <summary>
        /// Get all sites with pagination (filtered by role)
        /// </summary>
        /// <param name="page">Page number</param>
        /// <param name="pageSize">Page size</param>
        /// <returns>Paginated list of sites</returns>
        [HttpGet]
        [ProducesResponseType(typeof(ApiResponseDto<PagedResultDto<SiteDto>>), 200)]
        [ProducesResponseType(401)]
        [ProducesResponseType(403)]
        public async Task<ActionResult<ApiResponseDto<PagedResultDto<SiteDto>>>> GetAll(
            [FromQuery] int page = 1, 
            [FromQuery] int pageSize = 10)
        {
            // Admin can see all sites, Engineer can only see sites they have visited
            if (IsAdmin())
            {
                var response = await _siteService.GetAllAsync(page, pageSize);
                return HandleResponse(response);
            }
            else
            {
                // Engineer sees only sites they have visited
                var userId = GetCurrentUserId();
                var userVisits = await _visitService.GetByUserIdAsync(userId);
                
                if (!userVisits.Success || userVisits.Data == null)
                {
                    return HandleResponse(ApiResponseDto<PagedResultDto<SiteDto>>.SuccessResult(new PagedResultDto<SiteDto>
                    {
                        Items = new List<SiteDto>(),
                        TotalCount = 0,
                        Page = page,
                        PageSize = pageSize
                    }));
                }

                // Get unique site IDs from user's visits
                var siteIds = userVisits.Data.Select(v => v.SiteId).Distinct().ToList();
                
                // Get sites by IDs
                var sites = new List<SiteDto>();
                foreach (var siteId in siteIds)
                {
                    var siteResponse = await _siteService.GetByIdAsync(siteId);
                    if (siteResponse.Success && siteResponse.Data != null)
                    {
                        sites.Add(siteResponse.Data);
                    }
                }

                // Apply pagination
                var pagedSites = sites.Skip((page - 1) * pageSize).Take(pageSize).ToList();
                var pagedResult = new PagedResultDto<SiteDto>
                {
                    Items = pagedSites,
                    TotalCount = sites.Count,
                    Page = page,
                    PageSize = pageSize
                };

                return HandleResponse(ApiResponseDto<PagedResultDto<SiteDto>>.SuccessResult(pagedResult));
            }
        }

        /// <summary>
        /// Search sites with filters (role-based access)
        /// </summary>
        /// <param name="searchDto">Search criteria</param>
        /// <returns>Filtered and paginated list of sites</returns>
        [HttpPost("search")]
        [ProducesResponseType(typeof(ApiResponseDto<PagedResultDto<SiteDto>>), 200)]
        [ProducesResponseType(401)]
        [ProducesResponseType(403)]
        public async Task<ActionResult<ApiResponseDto<PagedResultDto<SiteDto>>>> Search([FromBody] SiteSearchDto searchDto)
        {
            // Admin can search all sites, Engineer can only search sites they have visited
            if (!IsAdmin())
            {
                var userId = GetCurrentUserId();
                var userVisits = await _visitService.GetByUserIdAsync(userId);
                
                if (!userVisits.Success || userVisits.Data == null)
                {
                    return HandleResponse(ApiResponseDto<PagedResultDto<SiteDto>>.SuccessResult(new PagedResultDto<SiteDto>
                    {
                        Items = new List<SiteDto>(),
                        TotalCount = 0,
                        Page = searchDto.Page,
                        PageSize = searchDto.PageSize
                    }));
                }

                // Get unique site IDs from user's visits
                var siteIds = userVisits.Data.Select(v => v.SiteId).Distinct().ToList();
                
                // Add site ID filter to search
                if (searchDto.SiteIds == null)
                    searchDto.SiteIds = new List<int>();
                
                searchDto.SiteIds.AddRange(siteIds);
            }

            var response = await _siteService.SearchAsync(searchDto);
            return HandleResponse(response);
        }

        /// <summary>
        /// Get site by ID (with access control)
        /// </summary>
        /// <param name="id">Site ID</param>
        /// <returns>Site information</returns>
        [HttpGet("{id}")]
        [ProducesResponseType(typeof(ApiResponseDto<SiteDto>), 200)]
        [ProducesResponseType(typeof(ApiResponseDto<SiteDto>), 404)]
        [ProducesResponseType(401)]
        [ProducesResponseType(403)]
        public async Task<ActionResult<ApiResponseDto<SiteDto>>> GetById(int id)
        {
            var response = await _siteService.GetByIdAsync(id);
            
            if (!response.Success || response.Data == null)
            {
                return HandleResponse(response);
            }

            // Check if user can access this site
            if (!IsAdmin())
            {
                var userId = GetCurrentUserId();
                var userVisits = await _visitService.GetByUserIdAsync(userId);
                
                if (!userVisits.Success || userVisits.Data == null)
                {
                    return UnauthorizedAccess<SiteDto>();
                }

                var hasVisited = userVisits.Data.Any(v => v.SiteId == id);
                if (!hasVisited)
                {
                    return UnauthorizedAccess<SiteDto>();
                }
            }

            return HandleResponse(response);
        }

        /// <summary>
        /// Get site details with recent visits (with access control)
        /// </summary>
        /// <param name="id">Site ID</param>
        /// <returns>Site details with recent visits</returns>
        [HttpGet("{id}/details")]
        [ProducesResponseType(typeof(ApiResponseDto<SiteDetailDto>), 200)]
        [ProducesResponseType(typeof(ApiResponseDto<SiteDetailDto>), 404)]
        [ProducesResponseType(401)]
        [ProducesResponseType(403)]
        public async Task<ActionResult<ApiResponseDto<SiteDetailDto>>> GetDetails(int id)
        {
            var response = await _siteService.GetDetailByIdAsync(id);
            
            if (!response.Success || response.Data == null)
            {
                return HandleResponse(response);
            }

            // Check if user can access this site
            if (!IsAdmin())
            {
                var userId = GetCurrentUserId();
                var userVisits = await _visitService.GetByUserIdAsync(userId);
                
                if (!userVisits.Success || userVisits.Data == null)
                {
                    return UnauthorizedAccess<SiteDetailDto>();
                }

                var hasVisited = userVisits.Data.Any(v => v.SiteId == id);
                if (!hasVisited)
                {
                    return UnauthorizedAccess<SiteDetailDto>();
                }

                // Filter visits to show only user's own visits
                if (response.Data.RecentVisits != null)
                {
                    response.Data.RecentVisits = response.Data.RecentVisits
                        .Where(v => v.UserId == userId)
                        .ToList();
                }
            }

            return HandleResponse(response);
        }

        /// <summary>
        /// Create a new site (Admin only)
        /// </summary>
        /// <param name="createSiteDto">Site creation data</param>
        /// <returns>Created site information</returns>
        [HttpPost]
        [Authorize(Roles = "Admin")]
        [ProducesResponseType(typeof(ApiResponseDto<SiteDto>), 201)]
        [ProducesResponseType(typeof(ApiResponseDto<SiteDto>), 400)]
        public async Task<ActionResult<ApiResponseDto<SiteDto>>> Create([FromBody] CreateSiteDto createSiteDto)
        {
            var response = await _siteService.CreateAsync(createSiteDto);
            return CreatedAtAction(nameof(GetById), new { id = response.Data?.Id }, response);
        }

        /// <summary>
        /// Update site information (Admin only)
        /// </summary>
        /// <param name="id">Site ID</param>
        /// <param name="updateSiteDto">Updated site information</param>
        /// <returns>Updated site information</returns>
        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        [ProducesResponseType(typeof(ApiResponseDto<SiteDto>), 200)]
        [ProducesResponseType(typeof(ApiResponseDto<SiteDto>), 400)]
        [ProducesResponseType(typeof(ApiResponseDto<SiteDto>), 404)]
        public async Task<ActionResult<ApiResponseDto<SiteDto>>> Update(int id, [FromBody] UpdateSiteDto updateSiteDto)
        {
            var response = await _siteService.UpdateAsync(id, updateSiteDto);
            return HandleResponse(response);
        }

        /// <summary>
        /// Delete site (Admin only)
        /// </summary>
        /// <param name="id">Site ID</param>
        /// <returns>Success message</returns>
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        [ProducesResponseType(typeof(ApiResponseDto), 200)]
        [ProducesResponseType(typeof(ApiResponseDto), 404)]
        public async Task<ActionResult<ApiResponseDto>> Delete(int id)
        {
            var response = await _siteService.DeleteAsync(id);
            return HandleResponse(response);
        }

        /// <summary>
        /// Check if site code exists (Admin only)
        /// </summary>
        /// <param name="code">Site code</param>
        /// <returns>Boolean indicating if code exists</returns>
        [HttpGet("code-exists/{code}")]
        [Authorize(Roles = "Admin")]
        [ProducesResponseType(typeof(ApiResponseDto<bool>), 200)]
        public async Task<ActionResult<ApiResponseDto<bool>>> CodeExists(string code)
        {
            var response = await _siteService.CodeExistsAsync(code);
            return HandleResponse(response);
        }

        /// <summary>
        /// Get sites by location (with access control)
        /// </summary>
        /// <param name="location">Location to search</param>
        /// <returns>List of sites in the specified location</returns>
        [HttpGet("by-location/{location}")]
        [ProducesResponseType(typeof(ApiResponseDto<List<SiteDto>>), 200)]
        public async Task<ActionResult<ApiResponseDto<List<SiteDto>>>> GetByLocation(string location)
        {
            var response = await _siteService.GetByLocationAsync(location);
            
            if (!response.Success)
            {
                return HandleResponse(response);
            }

            // Filter sites based on user role
            if (!IsAdmin())
            {
                var userId = GetCurrentUserId();
                var userVisits = await _visitService.GetByUserIdAsync(userId);
                
                if (!userVisits.Success || userVisits.Data == null)
                {
                    return HandleResponse(ApiResponseDto<List<SiteDto>>.SuccessResult(new List<SiteDto>()));
                }

                var visitedSiteIds = userVisits.Data.Select(v => v.SiteId).Distinct().ToList();
                var filteredSites = response.Data?.Where(s => visitedSiteIds.Contains(s.Id)).ToList() ?? new List<SiteDto>();
                
                return HandleResponse(ApiResponseDto<List<SiteDto>>.SuccessResult(filteredSites));
            }

            return HandleResponse(response);
        }

        /// <summary>
        /// Update site status (Admin only)
        /// </summary>
        /// <param name="id">Site ID</param>
        /// <param name="updateStatusDto">Status update data</param>
        /// <returns>Updated site information</returns>
        [HttpPut("{id}/status")]
        [Authorize(Roles = "Admin")]
        [ProducesResponseType(typeof(ApiResponseDto<SiteDto>), 200)]
        [ProducesResponseType(typeof(ApiResponseDto<SiteDto>), 400)]
        [ProducesResponseType(typeof(ApiResponseDto<SiteDto>), 404)]
        public async Task<ActionResult<ApiResponseDto<SiteDto>>> UpdateStatus(int id, [FromBody] UpdateSiteStatusDto updateStatusDto)
        {
            var response = await _siteService.UpdateStatusAsync(id, updateStatusDto);
            return HandleResponse(response);
        }

        /// <summary>
        /// Get site statistics (Admin only)
        /// </summary>
        /// <returns>Site statistics and analytics</returns>
        [HttpGet("statistics")]
        [ProducesResponseType(typeof(ApiResponseDto<SiteStatisticsDto>), 200)]
        public async Task<ActionResult<ApiResponseDto<SiteStatisticsDto>>> GetStatistics()
        {
            var response = await _siteService.GetSiteStatisticsAsync();
            return HandleResponse(response);
        }

        /// <summary>
        /// Get sites by status (Admin only)
        /// </summary>
        /// <param name="status">Site status to filter by</param>
        /// <returns>List of sites with the specified status</returns>
        [HttpGet("by-status/{status}")]
        [Authorize(Roles = "Admin")]
        [ProducesResponseType(typeof(ApiResponseDto<List<SiteDto>>), 200)]
        public async Task<ActionResult<ApiResponseDto<List<SiteDto>>>> GetByStatus(Domain.Entities.SiteStatus status)
        {
            var response = await _siteService.GetByStatusAsync(status);
            return HandleResponse(response);
        }

        /// <summary>
        /// Check if site is accessible for current user
        /// </summary>
        /// <param name="id">Site ID</param>
        /// <returns>Boolean indicating if site is accessible</returns>
        [HttpGet("{id}/accessible")]
        [ProducesResponseType(typeof(ApiResponseDto<bool>), 200)]
        public async Task<ActionResult<ApiResponseDto<bool>>> IsAccessible(int id)
        {
            var userId = GetCurrentUserId();
            var response = await _siteService.IsSiteAccessibleAsync(id, userId);
            return HandleResponse(response);
        }

        /// <summary>
        /// Get sites needing maintenance (Admin only)
        /// </summary>
        /// <returns>List of sites in maintenance status</returns>
        [HttpGet("maintenance")]
        [Authorize(Roles = "Admin")]
        [ProducesResponseType(typeof(ApiResponseDto<List<SiteDto>>), 200)]
        public async Task<ActionResult<ApiResponseDto<List<SiteDto>>>> GetSitesNeedingMaintenance()
        {
            var response = await _siteService.GetSitesNeedingMaintenanceAsync();
            return HandleResponse(response);
        }

        /// <summary>
        /// Bulk update site status (Admin only)
        /// </summary>
        /// <param name="bulkUpdateDto">Bulk update data</param>
        /// <returns>Success message</returns>
        [HttpPut("bulk-status")]
        [Authorize(Roles = "Admin")]
        [ProducesResponseType(typeof(ApiResponseDto<SiteDto>), 200)]
        [ProducesResponseType(typeof(ApiResponseDto<SiteDto>), 400)]
        public async Task<ActionResult<ApiResponseDto<SiteDto>>> BulkUpdateStatus([FromBody] BulkUpdateSiteStatusDto bulkUpdateDto)
        {
            var response = await _siteService.BulkUpdateStatusAsync(bulkUpdateDto.SiteIds, bulkUpdateDto.UpdateStatusDto);
            return HandleResponse(response);
        }

        /// <summary>
        /// Get sites with pagination and advanced filtering (Admin only)
        /// </summary>
        /// <param name="page">Page number</param>
        /// <param name="pageSize">Page size</param>
        /// <param name="status">Filter by status</param>
        /// <param name="location">Filter by location</param>
        /// <returns>Paginated list of sites with filters</returns>
        [HttpGet("admin")]
        [Authorize(Roles = "Admin")]
        [ProducesResponseType(typeof(ApiResponseDto<PagedResultDto<SiteDto>>), 200)]
        public async Task<ActionResult<ApiResponseDto<PagedResultDto<SiteDto>>>> GetAdminSites(
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10,
            [FromQuery] Domain.Entities.SiteStatus? status = null,
            [FromQuery] string? location = null)
        {
            var searchDto = new SiteSearchDto
            {
                Page = page,
                PageSize = pageSize,
                Status = status,
                Location = location
            };

            var response = await _siteService.SearchAsync(searchDto);
            return HandleResponse(response);
        }
    }

    public class BulkUpdateSiteStatusDto
    {
        public List<int> SiteIds { get; set; } = new();
        public UpdateSiteStatusDto UpdateStatusDto { get; set; } = new();
    }
} 