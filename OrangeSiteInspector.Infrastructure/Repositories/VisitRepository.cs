using Microsoft.EntityFrameworkCore;
using OrangeSiteInspector.Domain.Entities;
using OrangeSiteInspector.Domain.Enums;
using OrangeSiteInspector.Infrastructure.Data;

namespace OrangeSiteInspector.Infrastructure.Repositories
{
    public class VisitRepository : GenericRepository<Visit>, IVisitRepository
    {
        public VisitRepository(ApplicationDbContext context) : base(context)
        {
        }

        public async Task<IEnumerable<Visit>> GetBySiteIdAsync(int siteId)
        {
            return await _dbSet
                .Include(v => v.Site)
                .Include(v => v.User)
                .Include(v => v.Components)
                .Where(v => v.SiteId == siteId)
                .OrderByDescending(v => v.CreatedAt)
                .ToListAsync();
        }

        public async Task<IEnumerable<Visit>> GetByUserIdAsync(string userId)
        {
            return await _dbSet
                .Include(v => v.Site)
                .Include(v => v.Components)
                .Where(v => v.UserId == userId)
                .OrderByDescending(v => v.CreatedAt)
                .ToListAsync();
        }

        public async Task<IEnumerable<Visit>> GetByStatusAsync(VisitStatus status)
        {
            return await _dbSet
                .Include(v => v.Site)
                .Include(v => v.User)
                .Where(v => v.Status == status)
                .OrderByDescending(v => v.CreatedAt)
                .ToListAsync();
        }

        public async Task<IEnumerable<Visit>> GetByDateRangeAsync(DateTime startDate, DateTime endDate)
        {
            return await _dbSet
                .Include(v => v.Site)
                .Include(v => v.User)
                .Where(v => v.CreatedAt >= startDate && v.CreatedAt <= endDate)
                .OrderByDescending(v => v.CreatedAt)
                .ToListAsync();
        }

        public async Task<IEnumerable<Visit>> GetBySiteAndDateRangeAsync(int siteId, DateTime startDate, DateTime endDate)
        {
            return await _dbSet
                .Include(v => v.Site)
                .Include(v => v.User)
                .Include(v => v.Components)
                .Where(v => v.SiteId == siteId && v.CreatedAt >= startDate && v.CreatedAt <= endDate)
                .OrderByDescending(v => v.CreatedAt)
                .ToListAsync();
        }
    }
} 