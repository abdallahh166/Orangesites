using AutoMapper;
using OrangeSiteInspector.Application.DTOs;
using OrangeSiteInspector.Application.Interfaces;
using OrangeSiteInspector.Domain.Entities;
using OrangeSiteInspector.Domain.Enums;
using OrangeSiteInspector.Infrastructure.Repositories;

namespace OrangeSiteInspector.Application.Services
{
    public class DashboardService : IDashboardService
    {
        private readonly IVisitRepository _visitRepository;
        private readonly ISiteRepository _siteRepository;
        private readonly IUserRepository _userRepository;
        private readonly IMapper _mapper;

        public DashboardService(
            IVisitRepository visitRepository,
            ISiteRepository siteRepository,
            IUserRepository userRepository,
            IMapper mapper)
        {
            _visitRepository = visitRepository;
            _siteRepository = siteRepository;
            _userRepository = userRepository;
            _mapper = mapper;
        }

        public async Task<ApiResponseDto<DashboardOverviewDto>> GetDashboardOverviewAsync()
        {
            var stats = await GetDashboardStatsAsync();
            var charts = await GetDashboardChartsAsync();
            var latestVisits = await GetLatestVisitsAsync();
            var recentSites = await GetRecentSitesAsync();

            var overview = new DashboardOverviewDto
            {
                Stats = stats.Data ?? new DashboardStatsDto(),
                Charts = charts.Data ?? new DashboardChartDataDto(),
                LatestVisits = latestVisits.Data ?? new List<VisitDto>(),
                RecentSites = recentSites.Data ?? new List<SiteDto>()
            };

            return ApiResponseDto<DashboardOverviewDto>.SuccessResult(overview);
        }

        public async Task<ApiResponseDto<EngineerDashboardDto>> GetEngineerDashboardAsync(string userId)
        {
            var allVisits = await _visitRepository.GetByUserIdAsync(userId);
            var visits = allVisits.ToList();

            var now = DateTime.UtcNow;
            var startOfMonth = new DateTime(now.Year, now.Month, 1);
            var startOfWeek = now.AddDays(-(int)now.DayOfWeek);
            var startOfDay = now.Date;

            var dashboard = new EngineerDashboardDto
            {
                TotalMyVisits = visits.Count,
                MyVisitsThisMonth = visits.Count(v => v.CreatedAt >= startOfMonth),
                MyPendingVisits = visits.Count(v => v.Status == VisitStatus.Pending),
                MyAcceptedVisits = visits.Count(v => v.Status == VisitStatus.Accepted),
                MyRejectedVisits = visits.Count(v => v.Status == VisitStatus.Rejected),
                TotalSitesVisited = visits.Select(v => v.SiteId).Distinct().Count(),
                VisitsToday = visits.Count(v => v.CreatedAt >= startOfDay),
                VisitsThisWeek = visits.Count(v => v.CreatedAt >= startOfWeek),
                AverageVisitsPerDay = CalculateAverageVisitsPerDay(visits),
                MyLatestVisits = _mapper.Map<List<VisitDto>>(visits.OrderByDescending(v => v.CreatedAt).Take(10)),
                MyRecentSites = await GetRecentSitesForUser(userId, 10),
                MyVisitsByStatus = GetVisitsByStatusForUser(visits),
                MyVisitsByMonth = GetVisitsByMonthForUser(visits, 12)
            };

            return ApiResponseDto<EngineerDashboardDto>.SuccessResult(dashboard);
        }

        public async Task<ApiResponseDto<AdminDashboardDto>> GetAdminDashboardAsync()
        {
            var globalStats = await GetDashboardStatsAsync();
            var globalCharts = await GetDashboardChartsAsync();
            var latestVisits = await GetLatestVisitsAsync();
            var recentSites = await GetRecentSitesAsync();
            var recentUsers = await GetRecentUsersAsync();
            var visitsByEngineer = await GetVisitsByEngineerAsync();
            var sitesByVisits = await GetSitesByVisitsAsync();

            var dashboard = new AdminDashboardDto
            {
                GlobalStats = globalStats.Data ?? new DashboardStatsDto(),
                GlobalCharts = globalCharts.Data ?? new DashboardChartDataDto(),
                LatestVisits = latestVisits.Data ?? new List<VisitDto>(),
                RecentSites = recentSites.Data ?? new List<SiteDto>(),
                RecentUsers = recentUsers.Data ?? new List<UserDto>(),
                VisitsByEngineer = visitsByEngineer.Data ?? new List<ChartDataPointDto>(),
                SitesByVisits = sitesByVisits.Data ?? new List<ChartDataPointDto>()
            };

            return ApiResponseDto<AdminDashboardDto>.SuccessResult(dashboard);
        }

        public async Task<ApiResponseDto<DashboardStatsDto>> GetDashboardStatsAsync(DashboardFilterDto? filter = null)
        {
            var allVisits = await _visitRepository.GetAllAsync();
            var visits = ApplyFilter(allVisits, filter).ToList();

            var now = DateTime.UtcNow;
            var startOfMonth = new DateTime(now.Year, now.Month, 1);
            var startOfWeek = now.AddDays(-(int)now.DayOfWeek);
            var startOfDay = now.Date;

            var stats = new DashboardStatsDto
            {
                TotalVisits = visits.Count,
                TotalVisitsThisMonth = visits.Count(v => v.CreatedAt >= startOfMonth),
                PendingVisits = visits.Count(v => v.Status == VisitStatus.Pending),
                AcceptedVisits = visits.Count(v => v.Status == VisitStatus.Accepted),
                RejectedVisits = visits.Count(v => v.Status == VisitStatus.Rejected),
                TotalSites = await GetTotalSitesAsync(filter),
                TotalUsers = await GetTotalUsersAsync(filter),
                AverageVisitsPerDay = CalculateAverageVisitsPerDay(visits),
                VisitsToday = visits.Count(v => v.CreatedAt >= startOfDay),
                VisitsThisWeek = visits.Count(v => v.CreatedAt >= startOfWeek)
            };

            return ApiResponseDto<DashboardStatsDto>.SuccessResult(stats);
        }

        public async Task<ApiResponseDto<DashboardChartDataDto>> GetDashboardChartsAsync(DashboardFilterDto? filter = null)
        {
            var allVisits = await _visitRepository.GetAllAsync();
            var visits = ApplyFilter(allVisits, filter).ToList();

            var topSitesResponse = await GetTopSitesAsync(10, filter?.UserId);
            var topSites = topSitesResponse.Success ? topSitesResponse.Data ?? new List<ChartDataPointDto>() : new List<ChartDataPointDto>();

            var charts = new DashboardChartDataDto
            {
                VisitsByStatus = GetVisitsByStatus(visits),
                VisitsByMonth = GetVisitsByMonth(visits, 12),
                VisitsByDay = GetVisitsByDay(visits, 30),
                TopSites = topSites
            };

            return ApiResponseDto<DashboardChartDataDto>.SuccessResult(charts);
        }

        public async Task<ApiResponseDto<List<VisitDto>>> GetLatestVisitsAsync(int count = 10, string? userId = null)
        {
            var visits = userId != null 
                ? await _visitRepository.GetByUserIdAsync(userId)
                : await _visitRepository.GetAllAsync();

            var latestVisits = visits
                .OrderByDescending(v => v.CreatedAt)
                .Take(count)
                .ToList();

            var visitDtos = _mapper.Map<List<VisitDto>>(latestVisits);
            return ApiResponseDto<List<VisitDto>>.SuccessResult(visitDtos);
        }

        public async Task<ApiResponseDto<List<SiteDto>>> GetRecentSitesAsync(int count = 10, string? userId = null)
        {
            if (userId != null)
            {
                return ApiResponseDto<List<SiteDto>>.SuccessResult(await GetRecentSitesForUser(userId, count));
            }

            var sites = await _siteRepository.GetAllAsync();
            var recentSites = sites
                .OrderByDescending(s => s.CreatedAt)
                .Take(count)
                .ToList();

            var siteDtos = _mapper.Map<List<SiteDto>>(recentSites);
            return ApiResponseDto<List<SiteDto>>.SuccessResult(siteDtos);
        }

        public async Task<ApiResponseDto<List<ChartDataPointDto>>> GetVisitsByStatusAsync(string? userId = null)
        {
            var visits = userId != null 
                ? await _visitRepository.GetByUserIdAsync(userId)
                : await _visitRepository.GetAllAsync();

            var chartData = GetVisitsByStatus(visits.ToList());
            return ApiResponseDto<List<ChartDataPointDto>>.SuccessResult(chartData);
        }

        public async Task<ApiResponseDto<List<ChartDataPointDto>>> GetVisitsByMonthAsync(int months = 12, string? userId = null)
        {
            var visits = userId != null 
                ? await _visitRepository.GetByUserIdAsync(userId)
                : await _visitRepository.GetAllAsync();

            var chartData = GetVisitsByMonth(visits.ToList(), months);
            return ApiResponseDto<List<ChartDataPointDto>>.SuccessResult(chartData);
        }

        public async Task<ApiResponseDto<List<ChartDataPointDto>>> GetVisitsByDayAsync(int days = 30, string? userId = null)
        {
            var visits = userId != null 
                ? await _visitRepository.GetByUserIdAsync(userId)
                : await _visitRepository.GetAllAsync();

            var chartData = GetVisitsByDay(visits.ToList(), days);
            return ApiResponseDto<List<ChartDataPointDto>>.SuccessResult(chartData);
        }

        public async Task<ApiResponseDto<List<ChartDataPointDto>>> GetTopSitesAsync(int count = 10, string? userId = null)
        {
            var allVisits = await _visitRepository.GetAllAsync();
            var visits = userId != null 
                ? allVisits.Where(v => v.UserId == userId).ToList()
                : allVisits.ToList();

            var siteVisits = visits
                .GroupBy(v => v.SiteId)
                .Select(g => new { SiteId = g.Key, VisitCount = g.Count() })
                .OrderByDescending(x => x.VisitCount)
                .Take(count)
                .ToList();

            var chartData = new List<ChartDataPointDto>();
            foreach (var siteVisit in siteVisits)
            {
                var site = await _siteRepository.GetByIdAsync(siteVisit.SiteId);
                chartData.Add(new ChartDataPointDto
                {
                    Label = site?.Name ?? $"Site {siteVisit.SiteId}",
                    Value = siteVisit.VisitCount,
                    Color = GetRandomColor()
                });
            }

            return ApiResponseDto<List<ChartDataPointDto>>.SuccessResult(chartData);
        }

        public async Task<ApiResponseDto<List<ChartDataPointDto>>> GetVisitsByEngineerAsync()
        {
            var allVisits = await _visitRepository.GetAllAsync();
            var allUsers = await _userRepository.GetAllAsync();

            var engineerVisits = allVisits
                .GroupBy(v => v.UserId)
                .Select(g => new { UserId = g.Key, VisitCount = g.Count() })
                .OrderByDescending(x => x.VisitCount)
                .ToList();

            var chartData = new List<ChartDataPointDto>();
            foreach (var engineerVisit in engineerVisits)
            {
                var user = allUsers.FirstOrDefault(u => u.Id == engineerVisit.UserId);
                chartData.Add(new ChartDataPointDto
                {
                    Label = user?.UserName ?? $"User {engineerVisit.UserId}",
                    Value = engineerVisit.VisitCount,
                    Color = GetRandomColor()
                });
            }

            return ApiResponseDto<List<ChartDataPointDto>>.SuccessResult(chartData);
        }

        public async Task<ApiResponseDto<List<ChartDataPointDto>>> GetSitesByVisitsAsync(int count = 10)
        {
            return await GetTopSitesAsync(count);
        }

        #region Private Helper Methods

        private IEnumerable<Visit> ApplyFilter(IEnumerable<Visit> visits, DashboardFilterDto? filter)
        {
            if (filter == null) return visits;

            var filtered = visits;

            if (filter.StartDate.HasValue)
                filtered = filtered.Where(v => v.CreatedAt >= filter.StartDate.Value);

            if (filter.EndDate.HasValue)
                filtered = filtered.Where(v => v.CreatedAt <= filter.EndDate.Value);

            if (!string.IsNullOrEmpty(filter.UserId))
                filtered = filtered.Where(v => v.UserId == filter.UserId);

            if (filter.SiteId.HasValue)
                filtered = filtered.Where(v => v.SiteId == filter.SiteId.Value);

            if (filter.Status.HasValue)
                filtered = filtered.Where(v => v.Status == filter.Status.Value);

            return filtered;
        }

        private double CalculateAverageVisitsPerDay(List<Visit> visits)
        {
            if (!visits.Any()) return 0;

            var firstVisit = visits.Min(v => v.CreatedAt);
            var lastVisit = visits.Max(v => v.CreatedAt);
            var days = (lastVisit - firstVisit).Days + 1;

            return days > 0 ? (double)visits.Count / days : visits.Count;
        }

        private List<ChartDataPointDto> GetVisitsByStatus(List<Visit> visits)
        {
            var statusGroups = visits.GroupBy(v => v.Status).ToList();
            var chartData = new List<ChartDataPointDto>();

            foreach (var status in Enum.GetValues<VisitStatus>())
            {
                var count = statusGroups.FirstOrDefault(g => g.Key == status)?.Count() ?? 0;
                chartData.Add(new ChartDataPointDto
                {
                    Label = status.ToString(),
                    Value = count,
                    Color = GetStatusColor(status)
                });
            }

            return chartData;
        }

        private List<ChartDataPointDto> GetVisitsByMonth(List<Visit> visits, int months)
        {
            var chartData = new List<ChartDataPointDto>();
            var now = DateTime.UtcNow;

            for (int i = months - 1; i >= 0; i--)
            {
                var monthStart = new DateTime(now.Year, now.Month, 1).AddMonths(-i);
                var monthEnd = monthStart.AddMonths(1).AddDays(-1);
                var monthVisits = visits.Count(v => v.CreatedAt >= monthStart && v.CreatedAt <= monthEnd);

                chartData.Add(new ChartDataPointDto
                {
                    Label = monthStart.ToString("MMM yyyy"),
                    Value = monthVisits,
                    Color = GetRandomColor()
                });
            }

            return chartData;
        }

        private List<ChartDataPointDto> GetVisitsByDay(List<Visit> visits, int days)
        {
            var chartData = new List<ChartDataPointDto>();
            var now = DateTime.UtcNow;

            for (int i = days - 1; i >= 0; i--)
            {
                var day = now.AddDays(-i).Date;
                var dayVisits = visits.Count(v => v.CreatedAt.Date == day);

                chartData.Add(new ChartDataPointDto
                {
                    Label = day.ToString("MMM dd"),
                    Value = dayVisits,
                    Color = GetRandomColor()
                });
            }

            return chartData;
        }

        private List<ChartDataPointDto> GetVisitsByStatusForUser(List<Visit> visits)
        {
            return GetVisitsByStatus(visits);
        }

        private List<ChartDataPointDto> GetVisitsByMonthForUser(List<Visit> visits, int months)
        {
            return GetVisitsByMonth(visits, months);
        }

        private async Task<List<SiteDto>> GetRecentSitesForUser(string userId, int count)
        {
            var userVisits = await _visitRepository.GetByUserIdAsync(userId);
            var siteIds = userVisits.Select(v => v.SiteId).Distinct().ToList();

            var sites = new List<SiteDto>();
            foreach (var siteId in siteIds.Take(count))
            {
                var site = await _siteRepository.GetByIdAsync(siteId);
                if (site != null)
                {
                    sites.Add(_mapper.Map<SiteDto>(site));
                }
            }

            return sites;
        }

        private async Task<ApiResponseDto<List<UserDto>>> GetRecentUsersAsync()
        {
            var users = await _userRepository.GetAllAsync();
            var recentUsers = users
                .OrderByDescending(u => u.CreatedAt)
                .Take(10)
                .ToList();

            var userDtos = _mapper.Map<List<UserDto>>(recentUsers);
            return ApiResponseDto<List<UserDto>>.SuccessResult(userDtos);
        }

        private async Task<int> GetTotalSitesAsync(DashboardFilterDto? filter)
        {
            var sites = await _siteRepository.GetAllAsync();
            return sites.Count();
        }

        private async Task<int> GetTotalUsersAsync(DashboardFilterDto? filter)
        {
            var users = await _userRepository.GetAllAsync();
            return users.Count();
        }

        private string GetStatusColor(VisitStatus status)
        {
            return status switch
            {
                VisitStatus.Pending => "#FFA500", // Orange
                VisitStatus.Accepted => "#28A745", // Green
                VisitStatus.Rejected => "#DC3545", // Red
                _ => "#6C757D" // Gray
            };
        }

        private string GetRandomColor()
        {
            var colors = new[]
            {
                "#007BFF", "#28A745", "#FFC107", "#DC3545", "#6F42C1",
                "#17A2B8", "#FD7E14", "#20C997", "#E83E8C", "#6C757D"
            };
            return colors[new Random().Next(colors.Length)];
        }

        #endregion
    }
} 