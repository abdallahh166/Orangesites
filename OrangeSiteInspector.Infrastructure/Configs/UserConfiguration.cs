using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using OrangeSiteInspector.Domain.Entities;

namespace OrangeSiteInspector.Infrastructure.Configs
{
    public class UserConfiguration : IEntityTypeConfiguration<User>
    {
        public void Configure(EntityTypeBuilder<User> builder)
        {
            builder.HasKey(u => u.Id);
            
            builder.Property(u => u.FullName)
                .IsRequired()
                .HasMaxLength(100);
            
            builder.Property(u => u.Email)
                .IsRequired()
                .HasMaxLength(256);
            
            builder.Property(u => u.UserName)
                .IsRequired()
                .HasMaxLength(256);
            
            builder.Property(u => u.Role)
                .IsRequired();
            
            // Enhanced User Properties
            builder.Property(u => u.IsActive)
                .IsRequired()
                .HasDefaultValue(true);
            
            builder.Property(u => u.IsLocked)
                .IsRequired()
                .HasDefaultValue(false);
            
            builder.Property(u => u.LockoutEnd)
                .IsRequired(false);
            
            builder.Property(u => u.LastLoginAt)
                .IsRequired(false);
            
            builder.Property(u => u.LastLoginIp)
                .HasMaxLength(45); // IPv6 max length
            
            builder.Property(u => u.LoginAttempts)
                .IsRequired()
                .HasDefaultValue(0);
            
            builder.Property(u => u.ProfilePictureUrl)
                .HasMaxLength(500);
            
            builder.Property(u => u.PhoneNumber)
                .HasMaxLength(20);
            
            builder.Property(u => u.Department)
                .HasMaxLength(200);
            
            builder.Property(u => u.Position)
                .HasMaxLength(100);
            
            builder.Property(u => u.LanguagePreference)
                .HasMaxLength(10)
                .HasDefaultValue("en");
            
            builder.Property(u => u.TimeZone)
                .HasMaxLength(50)
                .HasDefaultValue("UTC");
            
            builder.Property(u => u.ThemePreference)
                .HasMaxLength(20);
            
            builder.Property(u => u.CreatedAt)
                .IsRequired()
                .HasDefaultValueSql("GETUTCDATE()");
            
            builder.Property(u => u.UpdatedAt)
                .IsRequired(false);
            
            builder.Property(u => u.CreatedBy)
                .HasMaxLength(450); // User ID max length
            
            builder.Property(u => u.UpdatedBy)
                .HasMaxLength(450); // User ID max length
            
            // Indexes for better performance
            builder.HasIndex(u => u.Email)
                .IsUnique();
            
            builder.HasIndex(u => u.UserName)
                .IsUnique();
            
            builder.HasIndex(u => u.Role);
            
            builder.HasIndex(u => u.IsActive);
            
            builder.HasIndex(u => u.IsLocked);
            
            builder.HasIndex(u => u.Department);
            
            builder.HasIndex(u => u.CreatedAt);
            
            builder.HasIndex(u => u.LastLoginAt);
            
            // Composite indexes for common queries
            builder.HasIndex(u => new { u.Role, u.IsActive });
            
            builder.HasIndex(u => new { u.Department, u.IsActive });
            
            builder.HasIndex(u => new { u.CreatedAt, u.Role });
        }
    }
} 