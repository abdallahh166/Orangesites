using OrangeSiteInspector.Domain.Entities;

namespace OrangeSiteInspector.Infrastructure.Repositories
{
    /// <summary>
    /// Repository interface for refresh token operations
    /// </summary>
    public interface IRefreshTokenRepository : IGenericRepository<RefreshToken>
    {
        /// <summary>
        /// Get refresh token by hash
        /// </summary>
        Task<RefreshToken?> GetByTokenHashAsync(string tokenHash);

        /// <summary>
        /// Get all active refresh tokens for a user
        /// </summary>
        Task<IEnumerable<RefreshToken>> GetActiveTokensByUserIdAsync(string userId);

        /// <summary>
        /// Revoke all refresh tokens for a user
        /// </summary>
        Task RevokeAllTokensForUserAsync(string userId, string revokedBy);

        /// <summary>
        /// Revoke a specific refresh token
        /// </summary>
        Task RevokeTokenAsync(string tokenHash, string revokedBy);

        /// <summary>
        /// Clean up expired refresh tokens
        /// </summary>
        Task CleanupExpiredTokensAsync();

        /// <summary>
        /// Get refresh token with user information
        /// </summary>
        Task<RefreshToken?> GetByTokenHashWithUserAsync(string tokenHash);
    }
} 