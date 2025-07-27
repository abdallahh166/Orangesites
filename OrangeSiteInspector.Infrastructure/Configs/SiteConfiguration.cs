using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using OrangeSiteInspector.Domain.Entities;

namespace OrangeSiteInspector.Infrastructure.Configs
{
    public class SiteConfiguration : IEntityTypeConfiguration<Site>
    {
        public void Configure(EntityTypeBuilder<Site> builder)
        {
            builder.HasKey(s => s.Id);
            
            builder.Property(s => s.Name)
                .IsRequired()
                .HasMaxLength(100);
            
            builder.Property(s => s.Code)
                .IsRequired()
                .HasMaxLength(50);
            
            builder.Property(s => s.Location)
                .IsRequired()
                .HasMaxLength(200);
            
            builder.Property(s => s.Address)
                .IsRequired()
                .HasMaxLength(500);

            builder.Property(s => s.Status)
                .IsRequired()
                .HasConversion<int>()
                .HasDefaultValue(SiteStatus.Active);

            builder.Property(s => s.CreatedAt)
                .IsRequired()
                .HasDefaultValueSql("GETUTCDATE()");

            builder.Property(s => s.UpdatedAt)
                .IsRequired(false);
            
            // Indexes
            builder.HasIndex(s => s.Code)
                .IsUnique();
            
            builder.HasIndex(s => s.Status);
            
            builder.HasIndex(s => s.Location);
            
            // Relationships
            builder.HasMany(s => s.Visits)
                .WithOne(v => v.Site)
                .HasForeignKey(v => v.SiteId)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
} 