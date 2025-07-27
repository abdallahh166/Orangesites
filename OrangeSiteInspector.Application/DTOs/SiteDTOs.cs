using OrangeSiteInspector.Domain.Entities;

namespace OrangeSiteInspector.Application.DTOs
{
    public class SiteDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Code { get; set; } = string.Empty;
        public string Location { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;
        public SiteStatus Status { get; set; }
        public int VisitCount { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }

    public class CreateSiteDto
    {
        public string Name { get; set; } = string.Empty;
        public string Code { get; set; } = string.Empty;
        public string Location { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;
        public SiteStatus Status { get; set; } = SiteStatus.Active;
    }

    public class UpdateSiteDto
    {
        public string Name { get; set; } = string.Empty;
        public string Location { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;
        public SiteStatus? Status { get; set; }
    }

    public class UpdateSiteStatusDto
    {
        public SiteStatus Status { get; set; }
        public string? Reason { get; set; }
    }

    public class BulkUpdateSiteStatusDto
    {
        public List<int> SiteIds { get; set; } = new();
        public SiteStatus Status { get; set; }
        public string? Reason { get; set; }
    }

    public class SiteDetailDto : SiteDto
    {
        public List<VisitSummaryDto> RecentVisits { get; set; } = new List<VisitSummaryDto>();
        public int TotalVisits { get; set; }
        public int PendingVisits { get; set; }
        public int CompletedVisits { get; set; }
    }

    public class SiteSearchDto
    {
        public string? Name { get; set; }
        public string? Code { get; set; }
        public string? Location { get; set; }
        public SiteStatus? Status { get; set; }
        public List<int>? SiteIds { get; set; }
        public int Page { get; set; } = 1;
        public int PageSize { get; set; } = 10;
    }

    public class SiteStatisticsDto
    {
        public int TotalSites { get; set; }
        public int ActiveSites { get; set; }
        public int InactiveSites { get; set; }
        public int MaintenanceSites { get; set; }
        public int DecommissionedSites { get; set; }
        public List<ChartDataPointDto> SitesByStatus { get; set; } = new();
        public List<ChartDataPointDto> SitesByLocation { get; set; } = new();
    }
} 