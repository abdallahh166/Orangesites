using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using OrangeSiteInspector.Domain.Entities;

namespace OrangeSiteInspector.Infrastructure.Configs
{
    public class VisitConfiguration : IEntityTypeConfiguration<Visit>
    {
        public void Configure(EntityTypeBuilder<Visit> builder)
        {
            builder.HasKey(v => v.Id);
            
            builder.Property(v => v.SiteId)
                .IsRequired();
            
            builder.Property(v => v.UserId)
                .IsRequired()
                .HasMaxLength(450);
            
            builder.Property(v => v.CreatedAt)
                .IsRequired()
                .HasDefaultValueSql("GETUTCDATE()");
            
            builder.Property(v => v.UpdatedAt)
                .IsRequired(false);
            
            builder.Property(v => v.Status)
                .IsRequired()
                .HasConversion<int>()
                .HasDefaultValue(Domain.Enums.VisitStatus.Pending);
            
            builder.Property(v => v.Priority)
                .IsRequired()
                .HasConversion<int>()
                .HasDefaultValue(Domain.Enums.VisitPriority.Normal);
            
            builder.Property(v => v.Type)
                .IsRequired()
                .HasConversion<int>()
                .HasDefaultValue(Domain.Enums.VisitType.Routine);
            
            builder.Property(v => v.ScheduledDate)
                .IsRequired(false);
            
            builder.Property(v => v.StartedAt)
                .IsRequired(false);
            
            builder.Property(v => v.CompletedAt)
                .IsRequired(false);
            
            builder.Property(v => v.Notes)
                .HasMaxLength(2000)
                .IsRequired(false);
            
            builder.Property(v => v.RejectionReason)
                .HasMaxLength(500)
                .IsRequired(false);
            
            builder.Property(v => v.EstimatedDurationMinutes)
                .IsRequired(false);
            
            builder.Property(v => v.ActualDurationMinutes)
                .IsRequired(false);
            
            // Relationships
            builder.HasOne(v => v.Site)
                .WithMany(s => s.Visits)
                .HasForeignKey(v => v.SiteId)
                .OnDelete(DeleteBehavior.Restrict);
            
            builder.HasOne(v => v.User)
                .WithMany()
                .HasForeignKey(v => v.UserId)
                .OnDelete(DeleteBehavior.Restrict);
            
            builder.HasMany(v => v.Components)
                .WithOne(c => c.Visit)
                .HasForeignKey(c => c.VisitId)
                .OnDelete(DeleteBehavior.Cascade);
            
            // Indexes
            builder.HasIndex(v => v.SiteId);
            builder.HasIndex(v => v.UserId);
            builder.HasIndex(v => v.Status);
            builder.HasIndex(v => v.Priority);
            builder.HasIndex(v => v.Type);
            builder.HasIndex(v => v.ScheduledDate);
            builder.HasIndex(v => v.CreatedAt);
            builder.HasIndex(v => new { v.UserId, v.Status });
            builder.HasIndex(v => new { v.SiteId, v.Status });
            builder.HasIndex(v => new { v.ScheduledDate, v.Status });
        }
    }
} 