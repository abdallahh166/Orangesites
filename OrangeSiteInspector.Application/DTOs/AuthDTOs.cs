/// <summary>
/// DTO for logout request
/// </summary>
public class LogoutDto
{
    /// <summary>
    /// The refresh token to invalidate
    /// </summary>
    public string? RefreshToken { get; set; }
}

/// <summary>
/// DTO for authentication responses (access/refresh tokens, user info, expiration)
/// </summary>
public class AuthResponseDto
{
    public string Token { get; set; } = string.Empty;
    public string RefreshToken { get; set; } = string.Empty;
    public DateTime ExpiresAt { get; set; }
    public DateTime RefreshTokenExpiresAt { get; set; }
    public OrangeSiteInspector.Application.DTOs.UserDto? User { get; set; }
} 