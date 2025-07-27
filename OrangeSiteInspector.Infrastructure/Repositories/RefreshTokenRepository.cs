using Microsoft.EntityFrameworkCore;
using OrangeSiteInspector.Domain.Entities;
using OrangeSiteInspector.Infrastructure.Data;

namespace OrangeSiteInspector.Infrastructure.Repositories
{
    /// <summary>
    /// Repository implementation for refresh token operations
    /// </summary>
    public class RefreshTokenRepository : GenericRepository<RefreshToken>, IRefreshTokenRepository
    {
        public RefreshTokenRepository(ApplicationDbContext context) : base(context)
        {
        }

        public async Task<RefreshToken?> GetByTokenHashAsync(string tokenHash)
        {
            return await _dbSet
                .FirstOrDefaultAsync(rt => rt.TokenHash == tokenHash && !rt.IsRevoked && rt.ExpiresAt > DateTime.UtcNow);
        }

        public async Task<IEnumerable<RefreshToken>> GetActiveTokensByUserIdAsync(string userId)
        {
            return await _dbSet
                .Where(rt => rt.UserId == userId && !rt.IsRevoked && rt.ExpiresAt > DateTime.UtcNow)
                .ToListAsync();
        }

        public async Task RevokeAllTokensForUserAsync(string userId, string revokedBy)
        {
            var tokens = await _dbSet
                .Where(rt => rt.UserId == userId && !rt.IsRevoked)
                .ToListAsync();

            foreach (var token in tokens)
            {
                token.IsRevoked = true;
                token.RevokedAt = DateTime.UtcNow;
                token.RevokedBy = revokedBy;
            }

            await _context.SaveChangesAsync();
        }

        public async Task RevokeTokenAsync(string tokenHash, string revokedBy)
        {
            var token = await _dbSet.FirstOrDefaultAsync(rt => rt.TokenHash == tokenHash);
            if (token != null)
            {
                token.IsRevoked = true;
                token.RevokedAt = DateTime.UtcNow;
                token.RevokedBy = revokedBy;
                await _context.SaveChangesAsync();
            }
        }

        public async Task CleanupExpiredTokensAsync()
        {
            var expiredTokens = await _dbSet
                .Where(rt => rt.ExpiresAt < DateTime.UtcNow)
                .ToListAsync();

            _dbSet.RemoveRange(expiredTokens);
            await _context.SaveChangesAsync();
        }

        public async Task<RefreshToken?> GetByTokenHashWithUserAsync(string tokenHash)
        {
            return await _dbSet
                .Include(rt => rt.User)
                .FirstOrDefaultAsync(rt => rt.TokenHash == tokenHash && !rt.IsRevoked && rt.ExpiresAt > DateTime.UtcNow);
        }
    }
} 