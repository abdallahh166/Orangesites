using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using OrangeSiteInspector.Domain.Enums;

namespace OrangeSiteInspector.Domain.Entities
{
    public class Visit
    {
        public int Id { get; set; }
        
        [Required]
        public int SiteId { get; set; }
        
        [Required]
        public string UserId { get; set; } = string.Empty;
        
        [Required]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        public DateTime? UpdatedAt { get; set; }
        
        [Required]
        public VisitStatus Status { get; set; } = VisitStatus.Pending;
        
        [Required]
        public VisitPriority Priority { get; set; } = VisitPriority.Normal;
        
        [Required]
        public VisitType Type { get; set; } = VisitType.Routine;
        
        public DateTime? ScheduledDate { get; set; }
        
        public DateTime? StartedAt { get; set; }
        
        public DateTime? CompletedAt { get; set; }
        
        [MaxLength(2000)]
        public string? Notes { get; set; }
        
        [MaxLength(500)]
        public string? RejectionReason { get; set; }
        
        public int? EstimatedDurationMinutes { get; set; }
        
        public int? ActualDurationMinutes { get; set; }
        
        // Navigation properties
        [ForeignKey(nameof(SiteId))]
        public virtual Site Site { get; set; } = null!;
        
        [ForeignKey(nameof(UserId))]
        public virtual User User { get; set; } = null!;
        
        public virtual ICollection<VisitComponent> Components { get; set; } = new List<VisitComponent>();
    }
} 