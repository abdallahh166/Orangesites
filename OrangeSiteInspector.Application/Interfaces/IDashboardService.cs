using OrangeSiteInspector.Application.DTOs;

namespace OrangeSiteInspector.Application.Interfaces
{
    public interface IDashboardService
    {
        Task<ApiResponseDto<DashboardOverviewDto>> GetDashboardOverviewAsync();
        Task<ApiResponseDto<EngineerDashboardDto>> GetEngineerDashboardAsync(string userId);
        Task<ApiResponseDto<AdminDashboardDto>> GetAdminDashboardAsync();
        Task<ApiResponseDto<DashboardStatsDto>> GetDashboardStatsAsync(DashboardFilterDto? filter = null);
        Task<ApiResponseDto<DashboardChartDataDto>> GetDashboardChartsAsync(DashboardFilterDto? filter = null);
        Task<ApiResponseDto<List<VisitDto>>> GetLatestVisitsAsync(int count = 10, string? userId = null);
        Task<ApiResponseDto<List<SiteDto>>> GetRecentSitesAsync(int count = 10, string? userId = null);
        Task<ApiResponseDto<List<ChartDataPointDto>>> GetVisitsByStatusAsync(string? userId = null);
        Task<ApiResponseDto<List<ChartDataPointDto>>> GetVisitsByMonthAsync(int months = 12, string? userId = null);
        Task<ApiResponseDto<List<ChartDataPointDto>>> GetVisitsByDayAsync(int days = 30, string? userId = null);
        Task<ApiResponseDto<List<ChartDataPointDto>>> GetTopSitesAsync(int count = 10, string? userId = null);
        Task<ApiResponseDto<List<ChartDataPointDto>>> GetVisitsByEngineerAsync();
        Task<ApiResponseDto<List<ChartDataPointDto>>> GetSitesByVisitsAsync(int count = 10);
    }
} 