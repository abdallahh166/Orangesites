using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using OrangeSiteInspector.Domain.Entities;
using System.Collections.Generic;

namespace OrangeSiteInspector.Infrastructure.Configs
{
    public class OramaItemConfiguration : IEntityTypeConfiguration<OramaItem>
    {
        public void Configure(EntityTypeBuilder<OramaItem> builder)
        {
            builder.HasKey(oi => oi.Id);
            
            builder.Property(oi => oi.Name)
                .IsRequired()
                .HasMaxLength(100);
            
            builder.Property(oi => oi.Description)
                .HasMaxLength(500);
            
            builder.Property(oi => oi.Status)
                .IsRequired()
                .HasConversion<string>()
                .HasDefaultValue(Domain.Enums.OramaStatus.Active);
            
            builder.Property(oi => oi.Priority)
                .IsRequired()
                .HasConversion<string>()
                .HasDefaultValue(Domain.Enums.OramaPriority.Normal);
            
            builder.Property(oi => oi.Metadata)
                .HasColumnType("nvarchar(max)")
                .HasConversion(
                    v => System.Text.Json.JsonSerializer.Serialize(v, (System.Text.Json.JsonSerializerOptions?)null),
                    v => System.Text.Json.JsonSerializer.Deserialize<Dictionary<string, object>>(v, (System.Text.Json.JsonSerializerOptions?)null) ?? new Dictionary<string, object>()
                );
            
            builder.Property(oi => oi.OramaGroupId)
                .IsRequired();
            
            // Audit fields
            builder.Property(oi => oi.CreatedAt)
                .IsRequired()
                .HasDefaultValueSql("GETUTCDATE()");
            
            builder.Property(oi => oi.UpdatedAt)
                .IsRequired()
                .HasDefaultValueSql("GETUTCDATE()");
            
            builder.Property(oi => oi.CreatedBy)
                .HasMaxLength(100);
            
            builder.Property(oi => oi.UpdatedBy)
                .HasMaxLength(100);
            
            // Indexes
            builder.HasIndex(oi => new { oi.OramaGroupId, oi.Name })
                .IsUnique();
            
            builder.HasIndex(oi => oi.Status);
            
            builder.HasIndex(oi => oi.Priority);
            
            builder.HasIndex(oi => oi.CreatedAt);
            
            builder.HasIndex(oi => new { oi.OramaGroupId, oi.Status });
            
            builder.HasIndex(oi => new { oi.Status, oi.Priority });
            
            // Relationships
            builder.HasOne(oi => oi.OramaGroup)
                .WithMany(og => og.Items)
                .HasForeignKey(oi => oi.OramaGroupId)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
} 