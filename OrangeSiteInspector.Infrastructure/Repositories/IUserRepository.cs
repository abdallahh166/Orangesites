using OrangeSiteInspector.Domain.Entities;
using OrangeSiteInspector.Domain.Enums;

namespace OrangeSiteInspector.Infrastructure.Repositories
{
    public interface IUserRepository : IGenericRepository<User>
    {
        Task<User?> GetByEmailAsync(string email);
        Task<User?> GetByUserNameAsync(string userName);
        Task<IEnumerable<User>> GetByRoleAsync(UserRole role);
        Task<bool> EmailExistsAsync(string email);
        Task<bool> UserNameExistsAsync(string userName);
    }
} 