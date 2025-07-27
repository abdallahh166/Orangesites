using System.ComponentModel.DataAnnotations;

namespace OrangeSiteInspector.Domain.Entities
{
    /// <summary>
    /// Entity for storing refresh tokens in the database for proper invalidation
    /// </summary>
    public class RefreshToken
    {
        [Key]
        public string Id { get; set; } = Guid.NewGuid().ToString();

        [Required]
        public string UserId { get; set; } = string.Empty;

        [Required]
        public string TokenHash { get; set; } = string.Empty;

        [Required]
        public DateTime ExpiresAt { get; set; }

        public bool IsRevoked { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime? RevokedAt { get; set; }

        public string? RevokedBy { get; set; }

        public string? IpAddress { get; set; }

        public string? UserAgent { get; set; }

        // Navigation property
        public virtual User User { get; set; } = null!;
    }
} 