using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace OrangeSiteInspector.Domain.Entities
{
    public class VisitComponent
    {
        public int Id { get; set; }
        
        [Required]
        public int VisitId { get; set; }
        
        [Required]
        public int OramaItemId { get; set; }
        
        [MaxLength(500)]
        public string? BeforeImagePath { get; set; }
        
        [MaxLength(500)]
        public string? AfterImagePath { get; set; }
        
        [MaxLength(1000)]
        public string? Comment { get; set; }
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }
        
        // Navigation properties
        [ForeignKey(nameof(VisitId))]
        public virtual Visit Visit { get; set; } = null!;
        
        [ForeignKey(nameof(OramaItemId))]
        public virtual OramaItem OramaItem { get; set; } = null!;
    }
} 