using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using OrangeSiteInspector.Domain.Entities;

namespace OrangeSiteInspector.Infrastructure.Configs
{
    public class RefreshTokenConfiguration : IEntityTypeConfiguration<RefreshToken>
    {
        public void Configure(EntityTypeBuilder<RefreshToken> builder)
        {
            builder.HasKey(rt => rt.Id);

            builder.Property(rt => rt.Id)
                .HasMaxLength(450)
                .IsRequired();

            builder.Property(rt => rt.UserId)
                .HasMaxLength(450)
                .IsRequired();

            builder.Property(rt => rt.TokenHash)
                .HasMaxLength(1000)
                .IsRequired();

            builder.Property(rt => rt.ExpiresAt)
                .IsRequired();

            builder.Property(rt => rt.IsRevoked)
                .IsRequired()
                .HasDefaultValue(false);

            builder.Property(rt => rt.CreatedAt)
                .IsRequired();

            builder.Property(rt => rt.RevokedAt);

            builder.Property(rt => rt.RevokedBy)
                .HasMaxLength(450);

            builder.Property(rt => rt.IpAddress)
                .HasMaxLength(45); // IPv6 max length

            builder.Property(rt => rt.UserAgent)
                .HasMaxLength(500);

            // Indexes for performance
            builder.HasIndex(rt => rt.UserId);
            builder.HasIndex(rt => rt.TokenHash);
            builder.HasIndex(rt => rt.ExpiresAt);
            builder.HasIndex(rt => rt.IsRevoked);

            // Foreign key relationship
            builder.HasOne(rt => rt.User)
                .WithMany()
                .HasForeignKey(rt => rt.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
} 