using System.ComponentModel.DataAnnotations;
using OrangeSiteInspector.Domain.Enums;

namespace OrangeSiteInspector.Domain.Entities
{
    public class OramaGroup
    {
        public int Id { get; set; }
        
        [Required]
        [MaxLength(100)]
        public string Name { get; set; } = string.Empty;
        
        [MaxLength(500)]
        public string? Description { get; set; }
        
        // Enhanced Status and Priority
        public OramaStatus Status { get; set; } = OramaStatus.Active;
        public OramaPriority Priority { get; set; } = OramaPriority.Normal;
        
        // Metadata
        public Dictionary<string, object> Metadata { get; set; } = new();
        
        // Audit Fields
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }
        public string? CreatedBy { get; set; }
        public string? UpdatedBy { get; set; }
        
        // Navigation properties
        public virtual ICollection<OramaItem> Items { get; set; } = new List<OramaItem>();
    }
} 