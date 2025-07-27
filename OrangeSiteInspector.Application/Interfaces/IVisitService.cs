using OrangeSiteInspector.Application.DTOs;
using OrangeSiteInspector.Domain.Enums;

namespace OrangeSiteInspector.Application.Interfaces
{
    public interface IVisitService
    {
        Task<ApiResponseDto<VisitDto>> GetByIdAsync(int id);
        Task<ApiResponseDto<VisitDetailDto>> GetDetailByIdAsync(int id);
        Task<ApiResponseDto<PagedResultDto<VisitDto>>> GetAllAsync(int page = 1, int pageSize = 10);
        Task<ApiResponseDto<PagedResultDto<VisitDto>>> SearchAsync(VisitSearchDto searchDto);
        Task<ApiResponseDto<List<VisitDto>>> GetBySiteIdAsync(int siteId);
        Task<ApiResponseDto<List<VisitDto>>> GetByUserIdAsync(string userId);
        Task<ApiResponseDto<List<VisitDto>>> GetByStatusAsync(VisitStatus status);
        Task<ApiResponseDto<List<VisitDto>>> GetByDateRangeAsync(DateTime startDate, DateTime endDate);
        Task<ApiResponseDto<VisitDto>> CreateAsync(CreateVisitDto createVisitDto);
        Task<ApiResponseDto<VisitDto>> UpdateAsync(int id, UpdateVisitDto updateVisitDto);
        Task<ApiResponseDto<VisitDto>> UpdateStatusAsync(int id, UpdateVisitStatusDto updateStatusDto);
        Task<ApiResponseDto> DeleteAsync(int id);
        Task<ApiResponseDto<VisitComponentDto>> AddComponentAsync(CreateVisitComponentDto createComponentDto);
        Task<ApiResponseDto<VisitComponentDto>> UpdateComponentAsync(int componentId, UpdateVisitComponentDto updateComponentDto);
        Task<ApiResponseDto<VisitComponentDto>> GetComponentByIdAsync(int componentId);
        Task<ApiResponseDto> RemoveComponentAsync(int componentId);
        Task<ApiResponseDto<List<VisitComponentDto>>> GetVisitComponentsAsync(int visitId);
        Task<ApiResponseDto> AddBulkComponentsAsync(BulkCreateVisitComponentsDto bulkCreateDto);
        
        // New enhanced methods
        Task<ApiResponseDto<VisitDto>> StartVisitAsync(int id, StartVisitDto startVisitDto);
        Task<ApiResponseDto<VisitDto>> CompleteVisitAsync(int id, CompleteVisitDto completeVisitDto);
        Task<ApiResponseDto<List<VisitDto>>> GetOverdueVisitsAsync();
        Task<ApiResponseDto<List<VisitScheduleDto>>> GetScheduledVisitsAsync(DateTime? startDate = null, DateTime? endDate = null);
        Task<ApiResponseDto<List<VisitDto>>> GetByPriorityAsync(VisitPriority priority);
        Task<ApiResponseDto<List<VisitDto>>> GetByTypeAsync(VisitType type);
        Task<ApiResponseDto<VisitStatisticsDto>> GetVisitStatisticsAsync(int visitId);
        Task<ApiResponseDto> BulkUpdateStatusAsync(BulkUpdateVisitStatusDto bulkUpdateDto);
        Task<ApiResponseDto<bool>> CanStartVisitAsync(int visitId, string userId);
        Task<ApiResponseDto<bool>> CanCompleteVisitAsync(int visitId, string userId);
        Task<ApiResponseDto<List<VisitDto>>> GetEngineerScheduleAsync(string userId, DateTime? date = null);
        Task<ApiResponseDto<VisitDto>> RescheduleVisitAsync(int id, DateTime newScheduledDate);
        Task<ApiResponseDto<List<VisitDto>>> GetVisitsNeedingAttentionAsync();
    }
} 