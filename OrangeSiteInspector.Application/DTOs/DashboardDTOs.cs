namespace OrangeSiteInspector.Application.DTOs
{
    public class DashboardStatsDto
    {
        public int TotalVisits { get; set; }
        public int TotalVisitsThisMonth { get; set; }
        public int PendingVisits { get; set; }
        public int AcceptedVisits { get; set; }
        public int RejectedVisits { get; set; }
        public int TotalSites { get; set; }
        public int TotalUsers { get; set; }
        public double AverageVisitsPerDay { get; set; }
        public int VisitsToday { get; set; }
        public int VisitsThisWeek { get; set; }
    }

    public class DashboardChartDataDto
    {
        public List<ChartDataPointDto> VisitsByStatus { get; set; } = new();
        public List<ChartDataPointDto> VisitsByMonth { get; set; } = new();
        public List<ChartDataPointDto> VisitsByDay { get; set; } = new();
        public List<ChartDataPointDto> TopSites { get; set; } = new();
    }

    public class ChartDataPointDto
    {
        public string Label { get; set; } = string.Empty;
        public int Value { get; set; }
        public string Color { get; set; } = string.Empty;
    }

    public class DashboardOverviewDto
    {
        public DashboardStatsDto Stats { get; set; } = new();
        public DashboardChartDataDto Charts { get; set; } = new();
        public List<VisitDto> LatestVisits { get; set; } = new();
        public List<SiteDto> RecentSites { get; set; } = new();
    }

    public class EngineerDashboardDto
    {
        public int TotalMyVisits { get; set; }
        public int MyVisitsThisMonth { get; set; }
        public int MyPendingVisits { get; set; }
        public int MyAcceptedVisits { get; set; }
        public int MyRejectedVisits { get; set; }
        public int TotalSitesVisited { get; set; }
        public double AverageVisitsPerDay { get; set; }
        public int VisitsToday { get; set; }
        public int VisitsThisWeek { get; set; }
        public List<VisitDto> MyLatestVisits { get; set; } = new();
        public List<SiteDto> MyRecentSites { get; set; } = new();
        public List<ChartDataPointDto> MyVisitsByStatus { get; set; } = new();
        public List<ChartDataPointDto> MyVisitsByMonth { get; set; } = new();
    }

    public class AdminDashboardDto
    {
        public DashboardStatsDto GlobalStats { get; set; } = new();
        public DashboardChartDataDto GlobalCharts { get; set; } = new();
        public List<VisitDto> LatestVisits { get; set; } = new();
        public List<SiteDto> RecentSites { get; set; } = new();
        public List<UserDto> RecentUsers { get; set; } = new();
        public List<ChartDataPointDto> VisitsByEngineer { get; set; } = new();
        public List<ChartDataPointDto> SitesByVisits { get; set; } = new();
    }

    public class DashboardFilterDto
    {
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public string? UserId { get; set; }
        public int? SiteId { get; set; }
        public OrangeSiteInspector.Domain.Enums.VisitStatus? Status { get; set; }
    }
} 