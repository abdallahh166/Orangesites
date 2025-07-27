using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using OrangeSiteInspector.Application.DTOs;
using OrangeSiteInspector.Application.Interfaces;
using OrangeSiteInspector.Domain.Enums;

namespace OrangeSiteInspector.API.Controllers
{
    /// <summary>
    /// Visit management endpoints
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    [Produces("application/json")]
    public class VisitsController : BaseApiController
    {
        private readonly IVisitService _visitService;

        public VisitsController(IVisitService visitService)
        {
            _visitService = visitService;
        }

        /// <summary>
        /// Get all visits with pagination (filtered by role)
        /// </summary>
        /// <param name="page">Page number</param>
        /// <param name="pageSize">Page size</param>
        /// <returns>Paginated list of visits</returns>
        [HttpGet]
        [ProducesResponseType(typeof(ApiResponseDto<PagedResultDto<VisitDto>>), 200)]
        [ProducesResponseType(401)]
        [ProducesResponseType(403)]
        public async Task<ActionResult<ApiResponseDto<PagedResultDto<VisitDto>>>> GetAll(
            [FromQuery] int page = 1, 
            [FromQuery] int pageSize = 10)
        {
            // Admin can see all visits, Engineer can only see their own
            if (IsAdmin())
            {
                var response = await _visitService.GetAllAsync(page, pageSize);
                return HandleResponse(response);
            }
            else
            {
                // Engineer sees only their own visits
                var userId = GetCurrentUserId();
                var response = await _visitService.GetByUserIdAsync(userId);
                
                // Convert to paged result for consistency
                var visits = response.Data ?? new List<VisitDto>();
                var pagedResult = new PagedResultDto<VisitDto>
                {
                    Items = visits.Skip((page - 1) * pageSize).Take(pageSize).ToList(),
                    TotalCount = visits.Count,
                    Page = page,
                    PageSize = pageSize
                };
                
                return HandleResponse(ApiResponseDto<PagedResultDto<VisitDto>>.SuccessResult(pagedResult));
            }
        }

        /// <summary>
        /// Search visits with filters (role-based access)
        /// </summary>
        /// <param name="searchDto">Search criteria</param>
        /// <returns>Filtered and paginated list of visits</returns>
        [HttpPost("search")]
        [ProducesResponseType(typeof(ApiResponseDto<PagedResultDto<VisitDto>>), 200)]
        [ProducesResponseType(401)]
        [ProducesResponseType(403)]
        public async Task<ActionResult<ApiResponseDto<PagedResultDto<VisitDto>>>> Search([FromBody] VisitSearchDto searchDto)
        {
            // Admin can search all visits, Engineer can only search their own
            if (!IsAdmin())
            {
                searchDto.UserId = GetCurrentUserId();
            }

            var response = await _visitService.SearchAsync(searchDto);
            return HandleResponse(response);
        }

        /// <summary>
        /// Get visit by ID (with ownership check)
        /// </summary>
        /// <param name="id">Visit ID</param>
        /// <returns>Visit information</returns>
        [HttpGet("{id}")]
        [ProducesResponseType(typeof(ApiResponseDto<VisitDto>), 200)]
        [ProducesResponseType(typeof(ApiResponseDto<VisitDto>), 404)]
        [ProducesResponseType(401)]
        [ProducesResponseType(403)]
        public async Task<ActionResult<ApiResponseDto<VisitDto>>> GetById(int id)
        {
            var response = await _visitService.GetByIdAsync(id);
            
            if (!response.Success || response.Data == null)
            {
                return HandleResponse(response);
            }

            // Check if user can access this visit
            if (!IsAdmin() && response.Data.UserId != GetCurrentUserId())
            {
                return UnauthorizedAccess<VisitDto>();
            }

            return HandleResponse(response);
        }

        /// <summary>
        /// Get visit details with components (with ownership check)
        /// </summary>
        /// <param name="id">Visit ID</param>
        /// <returns>Visit details with components</returns>
        [HttpGet("{id}/details")]
        [ProducesResponseType(typeof(ApiResponseDto<VisitDetailDto>), 200)]
        [ProducesResponseType(typeof(ApiResponseDto<VisitDetailDto>), 404)]
        [ProducesResponseType(401)]
        [ProducesResponseType(403)]
        public async Task<ActionResult<ApiResponseDto<VisitDetailDto>>> GetDetails(int id)
        {
            var response = await _visitService.GetDetailByIdAsync(id);
            
            if (!response.Success || response.Data == null)
            {
                return HandleResponse(response);
            }

            // Check if user can access this visit
            if (!IsAdmin() && response.Data.UserId != GetCurrentUserId())
            {
                return UnauthorizedAccess<VisitDetailDto>();
            }

            return HandleResponse(response);
        }

        /// <summary>
        /// Create a new visit (Engineer only)
        /// </summary>
        /// <param name="createVisitDto">Visit creation data</param>
        /// <returns>Created visit information</returns>
        [HttpPost]
        [Authorize(Roles = "Engineer")]
        [ProducesResponseType(typeof(ApiResponseDto<VisitDto>), 201)]
        [ProducesResponseType(typeof(ApiResponseDto<VisitDto>), 400)]
        [ProducesResponseType(401)]
        [ProducesResponseType(403)]
        public async Task<ActionResult<ApiResponseDto<VisitDto>>> Create([FromBody] CreateVisitDto createVisitDto)
        {
            // Ensure the visit is created for the current user
            createVisitDto.UserId = GetCurrentUserId();
            
            // Ensure status is set to Pending (only admins can change status)
            createVisitDto.Status = VisitStatus.Pending;
            
            var response = await _visitService.CreateAsync(createVisitDto);
            return CreatedAtAction(nameof(GetById), new { id = response.Data?.Id }, response);
        }

        /// <summary>
        /// Update visit status (Admin only)
        /// </summary>
        /// <param name="id">Visit ID</param>
        /// <param name="updateStatusDto">Status update data</param>
        /// <returns>Updated visit information</returns>
        [HttpPut("{id}/status")]
        [Authorize(Roles = "Admin")]
        [ProducesResponseType(typeof(ApiResponseDto<VisitDto>), 200)]
        [ProducesResponseType(typeof(ApiResponseDto<VisitDto>), 400)]
        [ProducesResponseType(typeof(ApiResponseDto<VisitDto>), 404)]
        [ProducesResponseType(401)]
        [ProducesResponseType(403)]
        public async Task<ActionResult<ApiResponseDto<VisitDto>>> UpdateStatus(int id, [FromBody] UpdateVisitStatusDto updateStatusDto)
        {
            var response = await _visitService.UpdateStatusAsync(id, updateStatusDto);
            return HandleResponse(response);
        }

        /// <summary>
        /// Delete visit (Admin only, or Engineer can delete their own)
        /// </summary>
        /// <param name="id">Visit ID</param>
        /// <returns>Success message</returns>
        [HttpDelete("{id}")]
        [ProducesResponseType(typeof(ApiResponseDto), 200)]
        [ProducesResponseType(typeof(ApiResponseDto), 404)]
        [ProducesResponseType(401)]
        [ProducesResponseType(403)]
        public async Task<ActionResult<ApiResponseDto>> Delete(int id)
        {
            // Check if user can delete this visit
            if (!IsAdmin())
            {
                var visitResponse = await _visitService.GetByIdAsync(id);
                if (!visitResponse.Success || visitResponse.Data == null)
                {
                    return HandleResponse(ApiResponseDto.ErrorResult(visitResponse.Message, visitResponse.Errors));
                }

                if (visitResponse.Data.UserId != GetCurrentUserId())
                {
                    return UnauthorizedAccess();
                }
            }

            var response = await _visitService.DeleteAsync(id);
            return HandleResponse(response);
        }

        /// <summary>
        /// Get visits by site ID (with access control)
        /// </summary>
        /// <param name="siteId">Site ID</param>
        /// <returns>List of visits for the site</returns>
        [HttpGet("by-site/{siteId}")]
        [ProducesResponseType(typeof(ApiResponseDto<List<VisitDto>>), 200)]
        [ProducesResponseType(401)]
        [ProducesResponseType(403)]
        public async Task<ActionResult<ApiResponseDto<List<VisitDto>>>> GetBySite(int siteId)
        {
            var response = await _visitService.GetBySiteIdAsync(siteId);
            
            if (!response.Success)
            {
                return HandleResponse(response);
            }

            // Filter visits based on user role
            if (!IsAdmin())
            {
                var userId = GetCurrentUserId();
                var filteredVisits = response.Data?.Where(v => v.UserId == userId).ToList() ?? new List<VisitDto>();
                return HandleResponse(ApiResponseDto<List<VisitDto>>.SuccessResult(filteredVisits));
            }

            return HandleResponse(response);
        }

        /// <summary>
        /// Get current user's visits
        /// </summary>
        /// <returns>List of current user's visits</returns>
        [HttpGet("my-visits")]
        [ProducesResponseType(typeof(ApiResponseDto<List<VisitDto>>), 200)]
        [ProducesResponseType(401)]
        [ProducesResponseType(403)]
        public async Task<ActionResult<ApiResponseDto<List<VisitDto>>>> GetMyVisits()
        {
            var userId = GetCurrentUserId();
            var response = await _visitService.GetByUserIdAsync(userId);
            return HandleResponse(response);
        }

        /// <summary>
        /// Get visits by status (Admin only)
        /// </summary>
        /// <param name="status">Visit status</param>
        /// <returns>List of visits with specified status</returns>
        [HttpGet("by-status/{status}")]
        [Authorize(Roles = "Admin")]
        [ProducesResponseType(typeof(ApiResponseDto<List<VisitDto>>), 200)]
        [ProducesResponseType(401)]
        [ProducesResponseType(403)]
        public async Task<ActionResult<ApiResponseDto<List<VisitDto>>>> GetByStatus(string status)
        {
            if (!Enum.TryParse<VisitStatus>(status, true, out var visitStatus))
            {
                return BadRequest(ApiResponseDto<List<VisitDto>>.ErrorResult("Invalid status"));
            }

            var response = await _visitService.GetByStatusAsync(visitStatus);
            return HandleResponse(response);
        }

        /// <summary>
        /// Get visits by date range (Admin only)
        /// </summary>
        /// <param name="startDate">Start date</param>
        /// <param name="endDate">End date</param>
        /// <returns>List of visits in date range</returns>
        [HttpGet("by-date-range")]
        [Authorize(Roles = "Admin")]
        [ProducesResponseType(typeof(ApiResponseDto<List<VisitDto>>), 200)]
        [ProducesResponseType(401)]
        [ProducesResponseType(403)]
        public async Task<ActionResult<ApiResponseDto<List<VisitDto>>>> GetByDateRange(
            [FromQuery] DateTime startDate, 
            [FromQuery] DateTime endDate)
        {
            var response = await _visitService.GetByDateRangeAsync(startDate, endDate);
            return HandleResponse(response);
        }

        // New enhanced endpoints
        /// <summary>
        /// Update visit details (ownership check)
        /// </summary>
        /// <param name="id">Visit ID</param>
        /// <param name="updateVisitDto">Visit update data</param>
        /// <returns>Updated visit information</returns>
        [HttpPut("{id}")]
        [ProducesResponseType(typeof(ApiResponseDto<VisitDto>), 200)]
        [ProducesResponseType(typeof(ApiResponseDto<VisitDto>), 400)]
        [ProducesResponseType(typeof(ApiResponseDto<VisitDto>), 404)]
        [ProducesResponseType(401)]
        [ProducesResponseType(403)]
        public async Task<ActionResult<ApiResponseDto<VisitDto>>> Update(int id, [FromBody] UpdateVisitDto updateVisitDto)
        {
            // Check if user can update this visit
            if (!IsAdmin())
            {
                var visitResponse = await _visitService.GetByIdAsync(id);
                if (!visitResponse.Success || visitResponse.Data == null)
                {
                    return HandleResponse(ApiResponseDto<VisitDto>.ErrorResult(visitResponse.Message, visitResponse.Errors));
                }

                if (visitResponse.Data.UserId != GetCurrentUserId())
                {
                    return UnauthorizedAccess<VisitDto>();
                }
            }

            var response = await _visitService.UpdateAsync(id, updateVisitDto);
            return HandleResponse(response);
        }

        /// <summary>
        /// Start a visit (Engineer only, ownership check)
        /// </summary>
        /// <param name="id">Visit ID</param>
        /// <param name="startVisitDto">Start visit data</param>
        /// <returns>Updated visit information</returns>
        [HttpPut("{id}/start")]
        [Authorize(Roles = "Engineer")]
        [ProducesResponseType(typeof(ApiResponseDto<VisitDto>), 200)]
        [ProducesResponseType(typeof(ApiResponseDto<VisitDto>), 400)]
        [ProducesResponseType(typeof(ApiResponseDto<VisitDto>), 404)]
        [ProducesResponseType(401)]
        [ProducesResponseType(403)]
        public async Task<ActionResult<ApiResponseDto<VisitDto>>> StartVisit(int id, [FromBody] StartVisitDto startVisitDto)
        {
            // Check if user can start this visit
            var canStart = await _visitService.CanStartVisitAsync(id, GetCurrentUserId());
            if (!canStart.Success || !canStart.Data)
            {
                return UnauthorizedAccess<VisitDto>();
            }

            var response = await _visitService.StartVisitAsync(id, startVisitDto);
            return HandleResponse(response);
        }

        /// <summary>
        /// Complete a visit (Engineer only, ownership check)
        /// </summary>
        /// <param name="id">Visit ID</param>
        /// <param name="completeVisitDto">Complete visit data</param>
        /// <returns>Updated visit information</returns>
        [HttpPut("{id}/complete")]
        [Authorize(Roles = "Engineer")]
        [ProducesResponseType(typeof(ApiResponseDto<VisitDto>), 200)]
        [ProducesResponseType(typeof(ApiResponseDto<VisitDto>), 400)]
        [ProducesResponseType(typeof(ApiResponseDto<VisitDto>), 404)]
        [ProducesResponseType(401)]
        [ProducesResponseType(403)]
        public async Task<ActionResult<ApiResponseDto<VisitDto>>> CompleteVisit(int id, [FromBody] CompleteVisitDto completeVisitDto)
        {
            // Check if user can complete this visit
            var canComplete = await _visitService.CanCompleteVisitAsync(id, GetCurrentUserId());
            if (!canComplete.Success || !canComplete.Data)
            {
                return UnauthorizedAccess<VisitDto>();
            }

            var response = await _visitService.CompleteVisitAsync(id, completeVisitDto);
            return HandleResponse(response);
        }

        /// <summary>
        /// Get overdue visits (Admin only)
        /// </summary>
        /// <returns>List of overdue visits</returns>
        [HttpGet("overdue")]
        [Authorize(Roles = "Admin")]
        [ProducesResponseType(typeof(ApiResponseDto<List<VisitDto>>), 200)]
        [ProducesResponseType(401)]
        [ProducesResponseType(403)]
        public async Task<ActionResult<ApiResponseDto<List<VisitDto>>>> GetOverdueVisits()
        {
            var response = await _visitService.GetOverdueVisitsAsync();
            return HandleResponse(response);
        }

        /// <summary>
        /// Get scheduled visits (Admin only)
        /// </summary>
        /// <param name="startDate">Start date filter</param>
        /// <param name="endDate">End date filter</param>
        /// <returns>List of scheduled visits</returns>
        [HttpGet("scheduled")]
        [Authorize(Roles = "Admin")]
        [ProducesResponseType(typeof(ApiResponseDto<List<VisitScheduleDto>>), 200)]
        [ProducesResponseType(401)]
        [ProducesResponseType(403)]
        public async Task<ActionResult<ApiResponseDto<List<VisitScheduleDto>>>> GetScheduledVisits(
            [FromQuery] DateTime? startDate = null,
            [FromQuery] DateTime? endDate = null)
        {
            var response = await _visitService.GetScheduledVisitsAsync(startDate, endDate);
            return HandleResponse(response);
        }

        /// <summary>
        /// Get visits by priority (Admin only)
        /// </summary>
        /// <param name="priority">Visit priority</param>
        /// <returns>List of visits with specified priority</returns>
        [HttpGet("by-priority/{priority}")]
        [Authorize(Roles = "Admin")]
        [ProducesResponseType(typeof(ApiResponseDto<List<VisitDto>>), 200)]
        [ProducesResponseType(401)]
        [ProducesResponseType(403)]
        public async Task<ActionResult<ApiResponseDto<List<VisitDto>>>> GetByPriority(string priority)
        {
            if (!Enum.TryParse<VisitPriority>(priority, true, out var visitPriority))
            {
                return BadRequest(ApiResponseDto<List<VisitDto>>.ErrorResult("Invalid priority"));
            }

            var response = await _visitService.GetByPriorityAsync(visitPriority);
            return HandleResponse(response);
        }

        /// <summary>
        /// Get visits by type (Admin only)
        /// </summary>
        /// <param name="type">Visit type</param>
        /// <returns>List of visits with specified type</returns>
        [HttpGet("by-type/{type}")]
        [Authorize(Roles = "Admin")]
        [ProducesResponseType(typeof(ApiResponseDto<List<VisitDto>>), 200)]
        [ProducesResponseType(401)]
        [ProducesResponseType(403)]
        public async Task<ActionResult<ApiResponseDto<List<VisitDto>>>> GetByType(string type)
        {
            if (!Enum.TryParse<VisitType>(type, true, out var visitType))
            {
                return BadRequest(ApiResponseDto<List<VisitDto>>.ErrorResult("Invalid type"));
            }

            var response = await _visitService.GetByTypeAsync(visitType);
            return HandleResponse(response);
        }

        /// <summary>
        /// Get visit statistics (ownership check)
        /// </summary>
        /// <param name="id">Visit ID</param>
        /// <returns>Visit statistics</returns>
        [HttpGet("{id}/statistics")]
        [ProducesResponseType(typeof(ApiResponseDto<VisitStatisticsDto>), 200)]
        [ProducesResponseType(401)]
        [ProducesResponseType(403)]
        public async Task<ActionResult<ApiResponseDto<VisitStatisticsDto>>> GetStatistics(int id)
        {
            // Check if user can access this visit
            if (!IsAdmin())
            {
                var visitResponse = await _visitService.GetByIdAsync(id);
                if (!visitResponse.Success || visitResponse.Data == null)
                {
                    return HandleResponse(ApiResponseDto<VisitStatisticsDto>.ErrorResult(visitResponse.Message, visitResponse.Errors));
                }

                if (visitResponse.Data.UserId != GetCurrentUserId())
                {
                    return UnauthorizedAccess<VisitStatisticsDto>();
                }
            }

            var response = await _visitService.GetVisitStatisticsAsync(id);
            return HandleResponse(response);
        }

        /// <summary>
        /// Bulk update visit status (Admin only)
        /// </summary>
        /// <param name="bulkUpdateDto">Bulk update data</param>
        /// <returns>Success message</returns>
        [HttpPut("bulk-status")]
        [Authorize(Roles = "Admin")]
        [ProducesResponseType(typeof(ApiResponseDto), 200)]
        [ProducesResponseType(typeof(ApiResponseDto), 400)]
        [ProducesResponseType(401)]
        [ProducesResponseType(403)]
        public async Task<ActionResult<ApiResponseDto>> BulkUpdateStatus([FromBody] BulkUpdateVisitStatusDto bulkUpdateDto)
        {
            var response = await _visitService.BulkUpdateStatusAsync(bulkUpdateDto);
            return HandleResponse(response);
        }

        /// <summary>
        /// Get engineer schedule (Engineer only)
        /// </summary>
        /// <param name="date">Date filter (optional)</param>
        /// <returns>Engineer's scheduled visits</returns>
        [HttpGet("my-schedule")]
        [Authorize(Roles = "Engineer")]
        [ProducesResponseType(typeof(ApiResponseDto<List<VisitDto>>), 200)]
        [ProducesResponseType(401)]
        [ProducesResponseType(403)]
        public async Task<ActionResult<ApiResponseDto<List<VisitDto>>>> GetMySchedule([FromQuery] DateTime? date = null)
        {
            var userId = GetCurrentUserId();
            var response = await _visitService.GetEngineerScheduleAsync(userId, date);
            return HandleResponse(response);
        }

        /// <summary>
        /// Reschedule visit (Admin only)
        /// </summary>
        /// <param name="id">Visit ID</param>
        /// <param name="newScheduledDate">New scheduled date</param>
        /// <returns>Updated visit information</returns>
        [HttpPut("{id}/reschedule")]
        [Authorize(Roles = "Admin")]
        [ProducesResponseType(typeof(ApiResponseDto<VisitDto>), 200)]
        [ProducesResponseType(typeof(ApiResponseDto<VisitDto>), 400)]
        [ProducesResponseType(typeof(ApiResponseDto<VisitDto>), 404)]
        [ProducesResponseType(401)]
        [ProducesResponseType(403)]
        public async Task<ActionResult<ApiResponseDto<VisitDto>>> RescheduleVisit(int id, [FromBody] DateTime newScheduledDate)
        {
            var response = await _visitService.RescheduleVisitAsync(id, newScheduledDate);
            return HandleResponse(response);
        }

        /// <summary>
        /// Get visits needing attention (Admin only)
        /// </summary>
        /// <returns>List of visits needing attention</returns>
        [HttpGet("needing-attention")]
        [Authorize(Roles = "Admin")]
        [ProducesResponseType(typeof(ApiResponseDto<List<VisitDto>>), 200)]
        [ProducesResponseType(401)]
        [ProducesResponseType(403)]
        public async Task<ActionResult<ApiResponseDto<List<VisitDto>>>> GetVisitsNeedingAttention()
        {
            var response = await _visitService.GetVisitsNeedingAttentionAsync();
            return HandleResponse(response);
        }

        /// <summary>
        /// Check if visit can be started (Engineer only)
        /// </summary>
        /// <param name="id">Visit ID</param>
        /// <returns>Boolean indicating if visit can be started</returns>
        [HttpGet("{id}/can-start")]
        [Authorize(Roles = "Engineer")]
        [ProducesResponseType(typeof(ApiResponseDto<bool>), 200)]
        [ProducesResponseType(401)]
        [ProducesResponseType(403)]
        public async Task<ActionResult<ApiResponseDto<bool>>> CanStartVisit(int id)
        {
            var userId = GetCurrentUserId();
            var response = await _visitService.CanStartVisitAsync(id, userId);
            return HandleResponse(response);
        }

        /// <summary>
        /// Check if visit can be completed (Engineer only)
        /// </summary>
        /// <param name="id">Visit ID</param>
        /// <returns>Boolean indicating if visit can be completed</returns>
        [HttpGet("{id}/can-complete")]
        [Authorize(Roles = "Engineer")]
        [ProducesResponseType(typeof(ApiResponseDto<bool>), 200)]
        [ProducesResponseType(401)]
        [ProducesResponseType(403)]
        public async Task<ActionResult<ApiResponseDto<bool>>> CanCompleteVisit(int id)
        {
            var userId = GetCurrentUserId();
            var response = await _visitService.CanCompleteVisitAsync(id, userId);
            return HandleResponse(response);
        }

        // Visit Components

        /// <summary>
        /// Get visit components (with ownership check)
        /// </summary>
        /// <param name="visitId">Visit ID</param>
        /// <returns>List of visit components</returns>
        [HttpGet("{visitId}/components")]
        [ProducesResponseType(typeof(ApiResponseDto<List<VisitComponentDto>>), 200)]
        [ProducesResponseType(401)]
        [ProducesResponseType(403)]
        public async Task<ActionResult<ApiResponseDto<List<VisitComponentDto>>>> GetComponents(int visitId)
        {
            // Check if user can access this visit
            var visitResponse = await _visitService.GetByIdAsync(visitId);
            if (!visitResponse.Success || visitResponse.Data == null)
            {
                return HandleResponse(ApiResponseDto<List<VisitComponentDto>>.ErrorResult(visitResponse.Message, visitResponse.Errors));
            }

            if (!IsAdmin() && visitResponse.Data.UserId != GetCurrentUserId())
            {
                return UnauthorizedAccess<List<VisitComponentDto>>();
            }

            var response = await _visitService.GetVisitComponentsAsync(visitId);
            return HandleResponse(response);
        }

        /// <summary>
        /// Add component to visit (with ownership check)
        /// </summary>
        /// <param name="createComponentDto">Component creation data</param>
        /// <returns>Created component information</returns>
        [HttpPost("components")]
        [ProducesResponseType(typeof(ApiResponseDto<VisitComponentDto>), 201)]
        [ProducesResponseType(typeof(ApiResponseDto<VisitComponentDto>), 400)]
        [ProducesResponseType(401)]
        [ProducesResponseType(403)]
        public async Task<ActionResult<ApiResponseDto<VisitComponentDto>>> AddComponent([FromBody] CreateVisitComponentDto createComponentDto)
        {
            // Check if user can manage this visit
            var visitResponse = await _visitService.GetByIdAsync(createComponentDto.VisitId);
            if (!visitResponse.Success || visitResponse.Data == null)
            {
                return HandleResponse(ApiResponseDto<VisitComponentDto>.ErrorResult(visitResponse.Message, visitResponse.Errors));
            }

            if (!IsAdmin() && visitResponse.Data.UserId != GetCurrentUserId())
            {
                return UnauthorizedAccess<VisitComponentDto>();
            }

            var response = await _visitService.AddComponentAsync(createComponentDto);
            return CreatedAtAction(nameof(GetComponents), new { visitId = createComponentDto.VisitId }, response);
        }

        /// <summary>
        /// Update visit component (with ownership check)
        /// </summary>
        /// <param name="componentId">Component ID</param>
        /// <param name="updateComponentDto">Component update data</param>
        /// <returns>Updated component information</returns>
        [HttpPut("components/{componentId}")]
        [ProducesResponseType(typeof(ApiResponseDto<VisitComponentDto>), 200)]
        [ProducesResponseType(typeof(ApiResponseDto<VisitComponentDto>), 400)]
        [ProducesResponseType(typeof(ApiResponseDto<VisitComponentDto>), 404)]
        [ProducesResponseType(401)]
        [ProducesResponseType(403)]
        public async Task<ActionResult<ApiResponseDto<VisitComponentDto>>> UpdateComponent(int componentId, [FromBody] UpdateVisitComponentDto updateComponentDto)
        {
            // Get the component to check ownership
            var componentResponse = await _visitService.GetComponentByIdAsync(componentId);
            if (!componentResponse.Success || componentResponse.Data == null)
            {
                return HandleResponse(componentResponse);
            }

            // Check visit ownership by getting the visit
            var visitResponse = await _visitService.GetByIdAsync(componentResponse.Data.VisitId);
            if (!visitResponse.Success || visitResponse.Data == null)
            {
                return HandleResponse(ApiResponseDto<VisitComponentDto>.ErrorResult(visitResponse.Message, visitResponse.Errors));
            }

            if (!IsAdmin() && visitResponse.Data.UserId != GetCurrentUserId())
            {
                return UnauthorizedAccess<VisitComponentDto>();
            }

            var response = await _visitService.UpdateComponentAsync(componentId, updateComponentDto);
            return HandleResponse(response);
        }

        /// <summary>
        /// Remove component from visit (with ownership check)
        /// </summary>
        /// <param name="componentId">Component ID</param>
        /// <returns>Success message</returns>
        [HttpDelete("components/{componentId}")]
        [ProducesResponseType(typeof(ApiResponseDto), 200)]
        [ProducesResponseType(typeof(ApiResponseDto), 404)]
        [ProducesResponseType(401)]
        [ProducesResponseType(403)]
        public async Task<ActionResult<ApiResponseDto>> RemoveComponent(int componentId)
        {
            // This would require additional logic to get the visit ID from component ID
            // For now, we'll implement a simpler approach
            if (!IsAdmin())
            {
                return UnauthorizedAccess();
            }

            var response = await _visitService.RemoveComponentAsync(componentId);
            return HandleResponse(response);
        }

        /// <summary>
        /// Add multiple components to visit (with ownership check)
        /// </summary>
        /// <param name="bulkCreateDto">Bulk component creation data</param>
        /// <returns>Success message</returns>
        [HttpPost("components/bulk")]
        [ProducesResponseType(typeof(ApiResponseDto), 200)]
        [ProducesResponseType(typeof(ApiResponseDto), 400)]
        [ProducesResponseType(401)]
        [ProducesResponseType(403)]
        public async Task<ActionResult<ApiResponseDto>> AddBulkComponents([FromBody] BulkCreateVisitComponentsDto bulkCreateDto)
        {
            // Check if user can manage this visit
            var visitResponse = await _visitService.GetByIdAsync(bulkCreateDto.VisitId);
            if (!visitResponse.Success || visitResponse.Data == null)
            {
                return HandleResponse(ApiResponseDto.ErrorResult(visitResponse.Message, visitResponse.Errors));
            }

            if (!IsAdmin() && visitResponse.Data.UserId != GetCurrentUserId())
            {
                return UnauthorizedAccess();
            }

            var response = await _visitService.AddBulkComponentsAsync(bulkCreateDto);
            return HandleResponse(response);
        }
    }
} 