using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using OrangeSiteInspector.Domain.Entities;
using System.Collections.Generic;

namespace OrangeSiteInspector.Infrastructure.Configs
{
    public class OramaGroupConfiguration : IEntityTypeConfiguration<OramaGroup>
    {
        public void Configure(EntityTypeBuilder<OramaGroup> builder)
        {
            builder.HasKey(og => og.Id);
            
            builder.Property(og => og.Name)
                .IsRequired()
                .HasMaxLength(100);
            
            builder.Property(og => og.Description)
                .HasMaxLength(500);
            
            builder.Property(og => og.Status)
                .IsRequired()
                .HasConversion<string>()
                .HasDefaultValue(Domain.Enums.OramaStatus.Active);
            
            builder.Property(og => og.Priority)
                .IsRequired()
                .HasConversion<string>()
                .HasDefaultValue(Domain.Enums.OramaPriority.Normal);
            
            builder.Property(og => og.Metadata)
                .HasColumnType("nvarchar(max)")
                .HasConversion(
                    v => System.Text.Json.JsonSerializer.Serialize(v, (System.Text.Json.JsonSerializerOptions?)null),
                    v => System.Text.Json.JsonSerializer.Deserialize<Dictionary<string, object>>(v, (System.Text.Json.JsonSerializerOptions?)null) ?? new Dictionary<string, object>()
                );
            
            // Audit fields
            builder.Property(og => og.CreatedAt)
                .IsRequired()
                .HasDefaultValueSql("GETUTCDATE()");
            
            builder.Property(og => og.UpdatedAt)
                .IsRequired()
                .HasDefaultValueSql("GETUTCDATE()");
            
            builder.Property(og => og.CreatedBy)
                .HasMaxLength(100);
            
            builder.Property(og => og.UpdatedBy)
                .HasMaxLength(100);
            
            // Indexes
            builder.HasIndex(og => og.Name)
                .IsUnique();
            
            builder.HasIndex(og => og.Status);
            
            builder.HasIndex(og => og.Priority);
            
            builder.HasIndex(og => og.CreatedAt);
            
            builder.HasIndex(og => new { og.Status, og.Priority });
            
            // Relationships
            builder.HasMany(og => og.Items)
                .WithOne(oi => oi.OramaGroup)
                .HasForeignKey(oi => oi.OramaGroupId)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
} 