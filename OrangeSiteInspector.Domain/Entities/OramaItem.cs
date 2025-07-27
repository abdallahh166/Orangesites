using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using OrangeSiteInspector.Domain.Enums;

namespace OrangeSiteInspector.Domain.Entities
{
    public class OramaItem
    {
        public int Id { get; set; }
        
        [Required]
        [MaxLength(100)]
        public string Name { get; set; } = string.Empty;
        
        [MaxLength(500)]
        public string? Description { get; set; }
        
        [Required]
        public int OramaGroupId { get; set; }
        
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
        [ForeignKey(nameof(OramaGroupId))]
        public virtual OramaGroup OramaGroup { get; set; } = null!;
        public virtual ICollection<VisitComponent> VisitComponents { get; set; } = new List<VisitComponent>();
    }
} 