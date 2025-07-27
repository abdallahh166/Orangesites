using Microsoft.EntityFrameworkCore;
using OrangeSiteInspector.Domain.Entities;
using OrangeSiteInspector.Infrastructure.Data;

namespace OrangeSiteInspector.Infrastructure.Repositories
{
    public class SiteRepository : GenericRepository<Site>, ISiteRepository
    {
        public SiteRepository(ApplicationDbContext context) : base(context)
        {
        }

        public async Task<Site?> GetByCodeAsync(string code)
        {
            return await _dbSet.FirstOrDefaultAsync(s => s.Code == code);
        }

        public async Task<IEnumerable<Site>> GetByLocationAsync(string location)
        {
            return await _dbSet.Where(s => s.Location.Contains(location)).ToListAsync();
        }

        public async Task<bool> CodeExistsAsync(string code)
        {
            return await _dbSet.AnyAsync(s => s.Code == code);
        }
    }
} 