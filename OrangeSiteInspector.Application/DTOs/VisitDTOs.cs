using OrangeSiteInspector.Domain.Enums;

namespace OrangeSiteInspector.Application.DTOs
{
    public class VisitDto
    {
        public int Id { get; set; }
        public int SiteId { get; set; }
        public string SiteName { get; set; } = string.Empty;
        public string SiteCode { get; set; } = string.Empty;
        public string UserId { get; set; } = string.Empty;
        public string UserName { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public VisitStatus Status { get; set; }
        public VisitPriority Priority { get; set; }
        public VisitType Type { get; set; }
        public DateTime? ScheduledDate { get; set; }
        public DateTime? StartedAt { get; set; }
        public DateTime? CompletedAt { get; set; }
        public string? Notes { get; set; }
        public string? RejectionReason { get; set; }
        public int? EstimatedDurationMinutes { get; set; }
        public int? ActualDurationMinutes { get; set; }
        public int ComponentCount { get; set; }
    }

    public class CreateVisitDto
    {
        public int SiteId { get; set; }
        public string UserId { get; set; } = string.Empty;
        public VisitStatus Status { get; set; } = VisitStatus.Pending;
        public VisitPriority Priority { get; set; } = VisitPriority.Normal;
        public VisitType Type { get; set; } = VisitType.Routine;
        public DateTime? ScheduledDate { get; set; }
        public string? Notes { get; set; }
        public int? EstimatedDurationMinutes { get; set; }
    }

    public class UpdateVisitDto
    {
        public VisitPriority? Priority { get; set; }
        public VisitType? Type { get; set; }
        public DateTime? ScheduledDate { get; set; }
        public string? Notes { get; set; }
        public int? EstimatedDurationMinutes { get; set; }
    }

    public class UpdateVisitStatusDto
    {
        public VisitStatus Status { get; set; }
        public string? RejectionReason { get; set; }
        public string? Notes { get; set; }
    }

    public class StartVisitDto
    {
        public DateTime StartedAt { get; set; } = DateTime.UtcNow;
        public string? Notes { get; set; }
    }

    public class CompleteVisitDto
    {
        public DateTime CompletedAt { get; set; } = DateTime.UtcNow;
        public int? ActualDurationMinutes { get; set; }
        public string? Notes { get; set; }
    }

    public class VisitDetailDto : VisitDto
    {
        public SiteDto Site { get; set; } = null!;
        public UserDto User { get; set; } = null!;
        public List<VisitComponentDto> Components { get; set; } = new List<VisitComponentDto>();
        public VisitStatisticsDto Statistics { get; set; } = new();
    }

    public class VisitSummaryDto
    {
        public int Id { get; set; }
        public string SiteName { get; set; } = string.Empty;
        public string UserId { get; set; } = string.Empty;
        public string UserName { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public VisitStatus Status { get; set; }
        public VisitPriority Priority { get; set; }
        public VisitType Type { get; set; }
        public DateTime? ScheduledDate { get; set; }
        public int ComponentCount { get; set; }
    }

    public class VisitSearchDto
    {
        public int? SiteId { get; set; }
        public string? UserId { get; set; }
        public VisitStatus? Status { get; set; }
        public VisitPriority? Priority { get; set; }
        public VisitType? Type { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public DateTime? ScheduledStartDate { get; set; }
        public DateTime? ScheduledEndDate { get; set; }
        public bool? IsOverdue { get; set; }
        public int Page { get; set; } = 1;
        public int PageSize { get; set; } = 10;
    }

    public class VisitStatisticsDto
    {
        public int TotalComponents { get; set; }
        public int ComponentsWithImages { get; set; }
        public int ComponentsWithBeforeImages { get; set; }
        public int ComponentsWithAfterImages { get; set; }
        public int ComponentsWithComments { get; set; }
        public double CompletionPercentage { get; set; }
        public TimeSpan? Duration { get; set; }
        public bool IsOverdue { get; set; }
    }

    public class VisitScheduleDto
    {
        public int VisitId { get; set; }
        public string SiteName { get; set; } = string.Empty;
        public string EngineerName { get; set; } = string.Empty;
        public DateTime ScheduledDate { get; set; }
        public VisitPriority Priority { get; set; }
        public VisitType Type { get; set; }
        public VisitStatus Status { get; set; }
        public int? EstimatedDurationMinutes { get; set; }
    }

    public class BulkUpdateVisitStatusDto
    {
        public List<int> VisitIds { get; set; } = new();
        public UpdateVisitStatusDto UpdateStatusDto { get; set; } = new();
    }
} 