using OrangeSiteInspector.Domain.Entities;
using OrangeSiteInspector.Domain.Enums;

namespace OrangeSiteInspector.Infrastructure.Repositories
{
    public interface IVisitRepository : IGenericRepository<Visit>
    {
        Task<IEnumerable<Visit>> GetBySiteIdAsync(int siteId);
        Task<IEnumerable<Visit>> GetByUserIdAsync(string userId);
        Task<IEnumerable<Visit>> GetByStatusAsync(VisitStatus status);
        Task<IEnumerable<Visit>> GetByDateRangeAsync(DateTime startDate, DateTime endDate);
        Task<IEnumerable<Visit>> GetBySiteAndDateRangeAsync(int siteId, DateTime startDate, DateTime endDate);
    }
} 