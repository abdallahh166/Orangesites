using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using OrangeSiteInspector.Domain.Entities;

namespace OrangeSiteInspector.Infrastructure.Data
{
    public class ApplicationDbContext : IdentityDbContext<User>
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
        {
        }

        // Domain entities DbSets
        public DbSet<Site> Sites { get; set; }
        public DbSet<Visit> Visits { get; set; }
        public DbSet<VisitComponent> VisitComponents { get; set; }
        public DbSet<OramaGroup> OramaGroups { get; set; }
        public DbSet<OramaItem> OramaItems { get; set; }
        public DbSet<RefreshToken> RefreshTokens { get; set; }

        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);

            // Apply all configurations from current assembly
            builder.ApplyConfigurationsFromAssembly(typeof(ApplicationDbContext).Assembly);
        }
    }
} 