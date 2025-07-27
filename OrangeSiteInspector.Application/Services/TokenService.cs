using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Microsoft.IdentityModel.Tokens;
using OrangeSiteInspector.Application.Interfaces;
using OrangeSiteInspector.Domain.Entities;
using OrangeSiteInspector.Infrastructure.Repositories;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;

namespace OrangeSiteInspector.Application.Services
{
    /// <summary>
    /// Service for handling JWT token generation, validation, and refresh token operations
    /// </summary>
    public class TokenService : ITokenService
    {
        private readonly UserManager<User> _userManager;
        private readonly IRefreshTokenRepository _refreshTokenRepository;
        private readonly IConfiguration _configuration;
        private readonly ILogger<TokenService> _logger;
        private readonly SymmetricSecurityKey _signingKey;
        private readonly string _issuer;
        private readonly string _audience;
        private readonly int _accessTokenExpirationMinutes;
        private readonly int _refreshTokenExpirationDays;

        public TokenService(
            UserManager<User> userManager,
            IRefreshTokenRepository refreshTokenRepository,
            IConfiguration configuration,
            ILogger<TokenService> logger)
        {
            _userManager = userManager;
            _refreshTokenRepository = refreshTokenRepository;
            _configuration = configuration;
            _logger = logger;

            var jwtSettings = configuration.GetSection("JwtSettings");
            var secretKey = jwtSettings["SecretKey"] ?? throw new InvalidOperationException("JWT SecretKey is not configured");
            _signingKey = new SymmetricSecurityKey(Encoding.ASCII.GetBytes(secretKey));
            _issuer = jwtSettings["Issuer"] ?? "OrangeSiteInspector";
            _audience = jwtSettings["Audience"] ?? "OrangeSiteInspector";
            _accessTokenExpirationMinutes = int.TryParse(jwtSettings["ExpirationInMinutes"], out var accessExp) ? accessExp : 60;
            _refreshTokenExpirationDays = int.TryParse(jwtSettings["RefreshTokenExpirationDays"], out var refreshExp) ? refreshExp : 7;
        }

        /// <summary>
        /// Generates access and refresh tokens for a user
        /// </summary>
        public async Task<(string AccessToken, string RefreshToken)> GenerateTokensAsync(User user)
        {
            try
            {
                var accessToken = await GenerateAccessTokenAsync(user);
                var refreshToken = await GenerateRefreshTokenAsync(user);

                _logger.LogInformation("Generated tokens for user {UserId}", user.Id);
                return (accessToken, refreshToken);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to generate tokens for user {UserId}", user.Id);
                throw;
            }
        }

        /// <summary>
        /// Validates a refresh token and generates new tokens
        /// </summary>
        public async Task<(string AccessToken, string RefreshToken)?> ValidateRefreshTokenAsync(string refreshToken)
        {
            try
            {
                // Hash the provided refresh token
                var tokenHash = HashToken(refreshToken);

                // Find the refresh token in the database
                var storedToken = await _refreshTokenRepository.GetByTokenHashWithUserAsync(tokenHash);
                if (storedToken == null)
                {
                    _logger.LogWarning("Refresh token not found in database");
                    return null;
                }

                // Check if token is revoked or expired
                if (storedToken.IsRevoked || storedToken.ExpiresAt < DateTime.UtcNow)
                {
                    _logger.LogWarning("Refresh token is revoked or expired for user {UserId}", storedToken.UserId);
                    return null;
                }

                // Check if user is still active
                if (!storedToken.User.IsActive)
                {
                    _logger.LogWarning("User is inactive for refresh token: {UserId}", storedToken.UserId);
                    return null;
                }

                // Revoke the old refresh token
                await _refreshTokenRepository.RevokeTokenAsync(tokenHash, "refresh");

                // Generate new tokens
                var newTokens = await GenerateTokensAsync(storedToken.User);
                _logger.LogInformation("Successfully refreshed tokens for user {UserId}", storedToken.UserId);
                return newTokens;
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Token refresh validation failed");
                return null;
            }
        }

        /// <summary>
        /// Invalidates a refresh token (e.g., on logout or password change)
        /// </summary>
        public async Task<bool> InvalidateRefreshTokenAsync(string refreshToken)
        {
            try
            {
                var tokenHash = HashToken(refreshToken);
                await _refreshTokenRepository.RevokeTokenAsync(tokenHash, "logout");
                _logger.LogInformation("Refresh token invalidated");
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to invalidate refresh token");
                return false;
            }
        }

        /// <summary>
        /// Invalidates all refresh tokens for a user (e.g., on password change)
        /// </summary>
        public async Task<bool> InvalidateAllTokensForUserAsync(string userId)
        {
            try
            {
                await _refreshTokenRepository.RevokeAllTokensForUserAsync(userId, "password_change");
                _logger.LogInformation("All refresh tokens invalidated for user {UserId}", userId);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to invalidate all tokens for user {UserId}", userId);
                return false;
            }
        }

        /// <summary>
        /// Gets the expiration time for access tokens
        /// </summary>
        public DateTime GetAccessTokenExpiration()
        {
            return DateTime.UtcNow.AddMinutes(_accessTokenExpirationMinutes);
        }

        /// <summary>
        /// Gets the expiration time for refresh tokens
        /// </summary>
        public DateTime GetRefreshTokenExpiration()
        {
            return DateTime.UtcNow.AddDays(_refreshTokenExpirationDays);
        }

        /// <summary>
        /// Generates an access token for a user
        /// </summary>
        private async Task<string> GenerateAccessTokenAsync(User user)
        {
            var roles = await _userManager.GetRolesAsync(user);
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id),
                new Claim(ClaimTypes.Name, user.UserName ?? user.Email ?? string.Empty),
                new Claim(ClaimTypes.Email, user.Email ?? string.Empty),
                new Claim("FullName", user.FullName ?? string.Empty),
                new Claim("Role", user.Role.ToString()),
                new Claim("token_type", "access")
            };

            foreach (var role in roles)
            {
                claims.Add(new Claim(ClaimTypes.Role, role));
            }

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(claims),
                Expires = GetAccessTokenExpiration(),
                Issuer = _issuer,
                Audience = _audience,
                SigningCredentials = new SigningCredentials(_signingKey, SecurityAlgorithms.HmacSha256Signature)
            };

            var tokenHandler = new JwtSecurityTokenHandler();
            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);
        }

        /// <summary>
        /// Generates a refresh token for a user and stores it in the database
        /// </summary>
        private async Task<string> GenerateRefreshTokenAsync(User user)
        {
            // Generate a cryptographically secure random token
            var refreshToken = Convert.ToBase64String(RandomNumberGenerator.GetBytes(64));

            // Hash the token before storing
            var tokenHash = HashToken(refreshToken);

            // Create refresh token entity
            var refreshTokenEntity = new RefreshToken
            {
                UserId = user.Id,
                TokenHash = tokenHash,
                ExpiresAt = GetRefreshTokenExpiration(),
                CreatedAt = DateTime.UtcNow
            };

            // Store in database
            await _refreshTokenRepository.AddAsync(refreshTokenEntity);

            return refreshToken;
        }

        /// <summary>
        /// Hashes a token using SHA256 for secure storage
        /// </summary>
        private string HashToken(string token)
        {
            using var sha256 = SHA256.Create();
            var hashBytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(token));
            return Convert.ToBase64String(hashBytes);
        }
    }
} 