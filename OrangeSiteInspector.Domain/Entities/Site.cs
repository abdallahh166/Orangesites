using System.ComponentModel.DataAnnotations;

namespace OrangeSiteInspector.Domain.Entities
{
    public enum SiteStatus
    {
        Active = 1,
        Inactive = 2,
        Maintenance = 3,
        Decommissioned = 4
    }

    public class Site
    {
        public int Id { get; set; }
        
        [Required]
        [MaxLength(100)]
        public string Name { get; set; } = string.Empty;
        
        [Required]
        [MaxLength(50)]
        public string Code { get; set; } = string.Empty;
        
        [Required]
        [MaxLength(200)]
        public string Location { get; set; } = string.Empty;
        
        [Required]
        [MaxLength(500)]
        public string Address { get; set; } = string.Empty;
        
        public SiteStatus Status { get; set; } = SiteStatus.Active;
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        public DateTime? UpdatedAt { get; set; }
        
        // Navigation properties
        public virtual ICollection<Visit> Visits { get; set; } = new List<Visit>();
    }
} 