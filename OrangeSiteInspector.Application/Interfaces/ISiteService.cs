using OrangeSiteInspector.Application.DTOs;

namespace OrangeSiteInspector.Application.Interfaces
{
    public interface ISiteService
    {
        Task<ApiResponseDto<SiteDto>> GetByIdAsync(int id);
        Task<ApiResponseDto<SiteDetailDto>> GetDetailByIdAsync(int id);
        Task<ApiResponseDto<PagedResultDto<SiteDto>>> GetAllAsync(int page = 1, int pageSize = 10);
        Task<ApiResponseDto<PagedResultDto<SiteDto>>> SearchAsync(SiteSearchDto searchDto);
        Task<ApiResponseDto<SiteDto>> CreateAsync(CreateSiteDto createSiteDto);
        Task<ApiResponseDto<SiteDto>> UpdateAsync(int id, UpdateSiteDto updateSiteDto);
        Task<ApiResponseDto> DeleteAsync(int id);
        Task<ApiResponseDto<bool>> CodeExistsAsync(string code);
        Task<ApiResponseDto<List<SiteDto>>> GetByLocationAsync(string location);
        
        // New enhanced methods
        Task<ApiResponseDto<SiteDto>> UpdateStatusAsync(int id, UpdateSiteStatusDto updateStatusDto);
        Task<ApiResponseDto<SiteStatisticsDto>> GetSiteStatisticsAsync();
        Task<ApiResponseDto<List<SiteDto>>> GetByStatusAsync(Domain.Entities.SiteStatus status);
        Task<ApiResponseDto<bool>> IsSiteAccessibleAsync(int siteId, string userId);
        Task<ApiResponseDto<List<SiteDto>>> GetSitesNeedingMaintenanceAsync();
        Task<ApiResponseDto<SiteDto>> BulkUpdateStatusAsync(List<int> siteIds, UpdateSiteStatusDto updateStatusDto);
    }
} 