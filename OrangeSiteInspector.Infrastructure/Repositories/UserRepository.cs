using Microsoft.EntityFrameworkCore;
using OrangeSiteInspector.Domain.Entities;
using OrangeSiteInspector.Domain.Enums;
using OrangeSiteInspector.Infrastructure.Data;

namespace OrangeSiteInspector.Infrastructure.Repositories
{
    public class UserRepository : GenericRepository<User>, IUserRepository
    {
        public UserRepository(ApplicationDbContext context) : base(context)
        {
        }

        public async Task<User?> GetByEmailAsync(string email)
        {
            return await _dbSet.FirstOrDefaultAsync(u => u.Email == email);
        }

        public async Task<User?> GetByUserNameAsync(string userName)
        {
            return await _dbSet.FirstOrDefaultAsync(u => u.UserName == userName);
        }

        public async Task<IEnumerable<User>> GetByRoleAsync(UserRole role)
        {
            return await _dbSet.Where(u => u.Role == role).ToListAsync();
        }

        public async Task<bool> EmailExistsAsync(string email)
        {
            return await _dbSet.AnyAsync(u => u.Email == email);
        }

        public async Task<bool> UserNameExistsAsync(string userName)
        {
            return await _dbSet.AnyAsync(u => u.UserName == userName);
        }
    }
} 