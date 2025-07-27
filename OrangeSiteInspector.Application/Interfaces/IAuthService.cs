using OrangeSiteInspector.Application.DTOs;

namespace OrangeSiteInspector.Application.Interfaces
{
    /// <summary>
    /// Service for handling authentication operations (login, registration, token management)
    /// </summary>
    public interface IAuthService
    {
        /// <summary>
        /// Registers a new user and returns authentication tokens
        /// </summary>
        /// <param name="createUserDto">User registration data</param>
        /// <returns>Authentication response with tokens and user info</returns>
        Task<ApiResponseDto<LoginResponseDto>> RegisterAsync(CreateUserDto createUserDto);

        /// <summary>
        /// Authenticates a user with email and password
        /// </summary>
        /// <param name="loginDto">Login credentials</param>
        /// <returns>Authentication response with tokens and user info</returns>
        Task<ApiResponseDto<LoginResponseDto>> LoginAsync(LoginDto loginDto);

        /// <summary>
        /// Refreshes access token using refresh token
        /// </summary>
        /// <param name="refreshTokenDto">Refresh token data</param>
        /// <returns>New access and refresh tokens</returns>
        Task<ApiResponseDto<RefreshTokenResponseDto>> RefreshTokenAsync(RefreshTokenDto refreshTokenDto);

        /// <summary>
        /// Changes user password
        /// </summary>
        /// <param name="userId">User ID</param>
        /// <param name="changePasswordDto">Password change data</param>
        /// <returns>Success response</returns>
        Task<ApiResponseDto> ChangePasswordAsync(string userId, ChangePasswordDto changePasswordDto);

        /// <summary>
        /// Confirms user email address
        /// </summary>
        /// <param name="userId">User ID</param>
        /// <param name="token">Confirmation token</param>
        /// <returns>Success response</returns>
        Task<ApiResponseDto> ConfirmEmailAsync(string userId, string token);

        /// <summary>
        /// Initiates password reset process
        /// </summary>
        /// <param name="email">User email</param>
        /// <returns>Success response</returns>
        Task<ApiResponseDto> ForgotPasswordAsync(string email);

        /// <summary>
        /// Resets password with token
        /// </summary>
        /// <param name="email">User email</param>
        /// <param name="token">Reset token</param>
        /// <param name="newPassword">New password</param>
        /// <returns>Success response</returns>
        Task<ApiResponseDto> ResetPasswordAsync(string email, string token, string newPassword);

        /// <summary>
        /// Logs out a user by invalidating their refresh token
        /// </summary>
        /// <param name="refreshToken">Refresh token to invalidate</param>
        /// <returns>Success response</returns>
        Task<ApiResponseDto> LogoutAsync(string refreshToken);

        /// <summary>
        /// Invalidates a refresh token
        /// </summary>
        Task<bool> InvalidateRefreshTokenAsync(string refreshToken);

        /// <summary>
        /// Invalidates all refresh tokens for a user
        /// </summary>
        Task<bool> InvalidateAllTokensForUserAsync(string userId);

        /// <summary>
        /// Validates a refresh token and returns new tokens
        /// </summary>
        Task<(string AccessToken, string RefreshToken)?> ValidateRefreshTokenAsync(string refreshToken);
    }
} 