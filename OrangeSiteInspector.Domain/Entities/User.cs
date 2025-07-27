using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Identity;
using OrangeSiteInspector.Domain.Enums;

namespace OrangeSiteInspector.Domain.Entities
{
    public class User : IdentityUser
    {
        [Required]
        [MaxLength(100)]
        public string FullName { get; set; } = string.Empty;
        
        [Required]
        public UserRole Role { get; set; }
        
        [MaxLength(20)]
        public string? ThemePreference { get; set; } // "light", "dark", "system"
        
        // User Status Management
        public bool IsActive { get; set; } = true;
        public bool IsLocked { get; set; } = false;
        public DateTime? LockoutEnd { get; set; }
        
        // Login Tracking
        public DateTime? LastLoginAt { get; set; }
        public string? LastLoginIp { get; set; }
        public int LoginAttempts { get; set; } = 0;
        
        // Profile Information
        [MaxLength(500)]
        public string? ProfilePictureUrl { get; set; }
        
        [MaxLength(20)]
        public string? PhoneNumber { get; set; }
        
        [MaxLength(200)]
        public string? Department { get; set; }
        
        [MaxLength(100)]
        public string? Position { get; set; }
        
        // Preferences
        [MaxLength(10)]
        public string? LanguagePreference { get; set; } = "en"; // "en", "ar"
        
        [MaxLength(50)]
        public string? TimeZone { get; set; } = "UTC";
        
        // Audit Fields
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }
        public string? CreatedBy { get; set; }
        public string? UpdatedBy { get; set; }
        
        // Navigation properties
        public virtual ICollection<Visit> Visits { get; set; } = new List<Visit>();
    }
} 