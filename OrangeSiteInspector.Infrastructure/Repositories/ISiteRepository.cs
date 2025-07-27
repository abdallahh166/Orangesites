using OrangeSiteInspector.Domain.Entities;

namespace OrangeSiteInspector.Infrastructure.Repositories
{
    public interface ISiteRepository : IGenericRepository<Site>
    {
        Task<Site?> GetByCodeAsync(string code);
        Task<IEnumerable<Site>> GetByLocationAsync(string location);
        Task<bool> CodeExistsAsync(string code);
    }
} 