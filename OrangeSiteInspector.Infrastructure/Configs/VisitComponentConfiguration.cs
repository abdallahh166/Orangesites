using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using OrangeSiteInspector.Domain.Entities;

namespace OrangeSiteInspector.Infrastructure.Configs
{
    public class VisitComponentConfiguration : IEntityTypeConfiguration<VisitComponent>
    {
        public void Configure(EntityTypeBuilder<VisitComponent> builder)
        {
            builder.HasKey(vc => vc.Id);
            
            builder.Property(vc => vc.VisitId)
                .IsRequired();
            
            builder.Property(vc => vc.OramaItemId)
                .IsRequired();
            
            builder.Property(vc => vc.BeforeImagePath)
                .HasMaxLength(500);
            
            builder.Property(vc => vc.AfterImagePath)
                .HasMaxLength(500);
            
            builder.Property(vc => vc.Comment)
                .HasMaxLength(1000);
            
            // Relationships
            builder.HasOne(vc => vc.OramaItem)
                .WithMany(oi => oi.VisitComponents)
                .HasForeignKey(vc => vc.OramaItemId)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
} 