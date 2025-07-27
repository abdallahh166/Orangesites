using OrangeSiteInspector.Domain.Entities;

namespace OrangeSiteInspector.Application.Interfaces
{
    /// <summary>
    /// Service for handling JWT token generation, validation, and refresh token operations
    /// </summary>
    public interface ITokenService
    {
        /// <summary>
        /// Generates access and refresh tokens for a user
        /// </summary>
        /// <param name="user">The user for whom to generate tokens</param>
        /// <returns>Tuple containing access token and refresh token</returns>
        Task<(string AccessToken, string RefreshToken)> GenerateTokensAsync(User user);

        /// <summary>
        /// Validates a refresh token and generates new tokens
        /// </summary>
        /// <param name="refreshToken">The refresh token to validate</param>
        /// <returns>New access and refresh tokens if validation succeeds</returns>
        Task<(string AccessToken, string RefreshToken)?> ValidateRefreshTokenAsync(string refreshToken);

        /// <summary>
        /// Invalidates a refresh token (e.g., on logout or password change)
        /// </summary>
        /// <param name="refreshToken">The refresh token to invalidate</param>
        /// <returns>True if token was successfully invalidated</returns>
        Task<bool> InvalidateRefreshTokenAsync(string refreshToken);

        /// <summary>
        /// Invalidates all refresh tokens for a user (e.g., on password change)
        /// </summary>
        /// <param name="userId">The user ID whose tokens to invalidate</param>
        /// <returns>True if tokens were successfully invalidated</returns>
        Task<bool> InvalidateAllTokensForUserAsync(string userId);

        /// <summary>
        /// Gets the expiration time for access tokens
        /// </summary>
        /// <returns>Access token expiration time</returns>
        DateTime GetAccessTokenExpiration();

        /// <summary>
        /// Gets the expiration time for refresh tokens
        /// </summary>
        /// <returns>Refresh token expiration time</returns>
        DateTime GetRefreshTokenExpiration();
    }
} 