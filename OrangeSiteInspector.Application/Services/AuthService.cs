using AutoMapper;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Logging;
using OrangeSiteInspector.Application.DTOs;
using OrangeSiteInspector.Application.Interfaces;
using OrangeSiteInspector.Domain.Entities;
using OrangeSiteInspector.Infrastructure.Repositories;

namespace OrangeSiteInspector.Application.Services
{
    /// <summary>
    /// Service for handling authentication operations (login, registration, token management)
    /// </summary>
    public class AuthService : IAuthService
    {
        private readonly IUserRepository _userRepository;
        private readonly UserManager<User> _userManager;
        private readonly SignInManager<User> _signInManager;
        private readonly ITokenService _tokenService;
        private readonly IMapper _mapper;
        private readonly ILogger<AuthService> _logger;

        public AuthService(
            IUserRepository userRepository,
            UserManager<User> userManager,
            SignInManager<User> signInManager,
            ITokenService tokenService,
            IMapper mapper,
            ILogger<AuthService> logger)
        {
            _userRepository = userRepository;
            _userManager = userManager;
            _signInManager = signInManager;
            _tokenService = tokenService;
            _mapper = mapper;
            _logger = logger;
        }

        /// <summary>
        /// Registers a new user and returns authentication tokens
        /// </summary>
        public async Task<ApiResponseDto<LoginResponseDto>> RegisterAsync(CreateUserDto createUserDto)
        {
            try
            {
                // Validate email uniqueness
                if (await _userRepository.EmailExistsAsync(createUserDto.Email))
                {
                    _logger.LogWarning("Registration failed: Email already exists. Email: {Email}", createUserDto.Email);
                    return ApiResponseDto<LoginResponseDto>.ErrorResult("Email already exists");
                }

                // Validate username uniqueness
                if (await _userRepository.UserNameExistsAsync(createUserDto.UserName))
                {
                    _logger.LogWarning("Registration failed: Username already exists. Username: {UserName}", createUserDto.UserName);
                    return ApiResponseDto<LoginResponseDto>.ErrorResult("Username already exists");
                }

                // Create user
                var user = _mapper.Map<User>(createUserDto);
                user.EmailConfirmed = true; // For demo purposes, in production you'd send confirmation email

                var result = await _userManager.CreateAsync(user, createUserDto.Password);
                if (!result.Succeeded)
                {
                    var errors = result.Errors.Select(e => e.Description).ToList();
                    _logger.LogWarning("Registration failed for Email: {Email}, Username: {UserName}. Errors: {Errors}", 
                        createUserDto.Email, createUserDto.UserName, string.Join(" | ", errors));
                    return ApiResponseDto<LoginResponseDto>.ErrorResult("Registration failed", errors);
                }

                // Assign role
                var roleName = createUserDto.Role.ToString();
                await _userManager.AddToRoleAsync(user, roleName);

                // Generate tokens
                var (accessToken, refreshToken) = await _tokenService.GenerateTokensAsync(user);
                var userDto = _mapper.Map<UserDto>(user);

                var loginResponse = new LoginResponseDto
                {
                    Token = accessToken,
                    RefreshToken = refreshToken,
                    User = userDto,
                    ExpiresAt = _tokenService.GetAccessTokenExpiration(),
                    RefreshTokenExpiresAt = _tokenService.GetRefreshTokenExpiration()
                };

                _logger.LogInformation("User registered successfully: {Email}", createUserDto.Email);
                return ApiResponseDto<LoginResponseDto>.SuccessResult(loginResponse, "User registered successfully");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error during registration for Email: {Email}", createUserDto.Email);
                return ApiResponseDto<LoginResponseDto>.ErrorResult("An unexpected error occurred during registration");
            }
        }

        /// <summary>
        /// Authenticates a user with email and password
        /// </summary>
        public async Task<ApiResponseDto<LoginResponseDto>> LoginAsync(LoginDto loginDto)
        {
            try
            {
                var user = await _userManager.FindByEmailAsync(loginDto.Email);
                if (user == null)
                {
                    _logger.LogWarning("Login failed: User not found for Email: {Email}", loginDto.Email);
                    return ApiResponseDto<LoginResponseDto>.ErrorResult("Invalid email or password");
                }

                if (!user.IsActive)
                {
                    _logger.LogWarning("Login failed: Inactive user for Email: {Email}", loginDto.Email);
                    return ApiResponseDto<LoginResponseDto>.ErrorResult("Account is deactivated");
                }

                var result = await _signInManager.CheckPasswordSignInAsync(user, loginDto.Password, false);
                if (!result.Succeeded)
                {
                    _logger.LogWarning("Login failed: Invalid password for Email: {Email}", loginDto.Email);
                    return ApiResponseDto<LoginResponseDto>.ErrorResult("Invalid email or password");
                }

                // Generate tokens
                var (accessToken, refreshToken) = await _tokenService.GenerateTokensAsync(user);
                var userDto = _mapper.Map<UserDto>(user);

                var loginResponse = new LoginResponseDto
                {
                    Token = accessToken,
                    RefreshToken = refreshToken,
                    User = userDto,
                    ExpiresAt = _tokenService.GetAccessTokenExpiration(),
                    RefreshTokenExpiresAt = _tokenService.GetRefreshTokenExpiration()
                };

                _logger.LogInformation("User logged in successfully: {Email}", loginDto.Email);
                return ApiResponseDto<LoginResponseDto>.SuccessResult(loginResponse, "Login successful");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error during login for Email: {Email}", loginDto.Email);
                return ApiResponseDto<LoginResponseDto>.ErrorResult("An unexpected error occurred during login");
            }
        }

        /// <summary>
        /// Refreshes access token using refresh token
        /// </summary>
        public async Task<ApiResponseDto<RefreshTokenResponseDto>> RefreshTokenAsync(RefreshTokenDto refreshTokenDto)
        {
            try
            {
                var newTokens = await _tokenService.ValidateRefreshTokenAsync(refreshTokenDto.RefreshToken);
                if (newTokens == null)
                {
                    _logger.LogWarning("Token refresh failed: Invalid refresh token");
                    return ApiResponseDto<RefreshTokenResponseDto>.ErrorResult("Invalid refresh token");
                }

                var (accessToken, refreshToken) = newTokens.Value;

                var refreshResponse = new RefreshTokenResponseDto
                {
                    Token = accessToken,
                    RefreshToken = refreshToken,
                    ExpiresAt = _tokenService.GetAccessTokenExpiration(),
                    RefreshTokenExpiresAt = _tokenService.GetRefreshTokenExpiration()
                };

                _logger.LogInformation("Token refreshed successfully");
                return ApiResponseDto<RefreshTokenResponseDto>.SuccessResult(refreshResponse, "Token refreshed successfully");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error during token refresh");
                return ApiResponseDto<RefreshTokenResponseDto>.ErrorResult("An unexpected error occurred during token refresh");
            }
        }

        /// <summary>
        /// Changes user password
        /// </summary>
        public async Task<ApiResponseDto> ChangePasswordAsync(string userId, ChangePasswordDto changePasswordDto)
        {
            try
            {
                var user = await _userRepository.GetByIdAsync(userId);
                if (user == null)
                {
                    _logger.LogWarning("Change password failed: User not found for UserId: {UserId}", userId);
                    return ApiResponseDto.ErrorResult("User not found");
                }

                var result = await _userManager.ChangePasswordAsync(user, changePasswordDto.CurrentPassword, changePasswordDto.NewPassword);
                if (!result.Succeeded)
                {
                    var errors = result.Errors.Select(e => e.Description).ToList();
                    _logger.LogWarning("Change password failed for UserId: {UserId}. Errors: {Errors}", userId, string.Join(" | ", errors));
                    return ApiResponseDto.ErrorResult("Failed to change password", errors);
                }

                // Invalidate all refresh tokens for security
                await _tokenService.InvalidateAllTokensForUserAsync(userId);

                _logger.LogInformation("Password changed successfully for UserId: {UserId}", userId);
                return ApiResponseDto.SuccessResult("Password changed successfully");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error during password change for UserId: {UserId}", userId);
                return ApiResponseDto.ErrorResult("An unexpected error occurred during password change");
            }
        }

        /// <summary>
        /// Confirms user email address
        /// </summary>
        public async Task<ApiResponseDto> ConfirmEmailAsync(string userId, string token)
        {
            try
            {
                var user = await _userRepository.GetByIdAsync(userId);
                if (user == null)
                {
                    _logger.LogWarning("Email confirmation failed: User not found for UserId: {UserId}", userId);
                    return ApiResponseDto.ErrorResult("User not found");
                }

                var result = await _userManager.ConfirmEmailAsync(user, token);
                if (!result.Succeeded)
                {
                    var errors = result.Errors.Select(e => e.Description).ToList();
                    _logger.LogWarning("Email confirmation failed for UserId: {UserId}. Errors: {Errors}", userId, string.Join(" | ", errors));
                    return ApiResponseDto.ErrorResult("Failed to confirm email", errors);
                }

                _logger.LogInformation("Email confirmed successfully for UserId: {UserId}", userId);
                return ApiResponseDto.SuccessResult("Email confirmed successfully");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error during email confirmation for UserId: {UserId}", userId);
                return ApiResponseDto.ErrorResult("An unexpected error occurred during email confirmation");
            }
        }

        /// <summary>
        /// Initiates password reset process
        /// </summary>
        public async Task<ApiResponseDto> ForgotPasswordAsync(string email)
        {
            try
            {
                var user = await _userManager.FindByEmailAsync(email);
                if (user == null)
                {
                    // Don't reveal if user exists or not for security
                    _logger.LogInformation("Password reset requested for Email: {Email} (user not found)", email);
                    return ApiResponseDto.SuccessResult("If the email exists, password reset instructions have been sent");
                }

                var token = await _userManager.GeneratePasswordResetTokenAsync(user);
                // In production, send email with reset link
                _logger.LogInformation("Password reset token generated for Email: {Email}", email);
                return ApiResponseDto.SuccessResult("If the email exists, password reset instructions have been sent");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error during forgot password for Email: {Email}", email);
                return ApiResponseDto.ErrorResult("An unexpected error occurred during password reset");
            }
        }

        /// <summary>
        /// Resets password with token
        /// </summary>
        public async Task<ApiResponseDto> ResetPasswordAsync(string email, string token, string newPassword)
        {
            try
            {
                var user = await _userManager.FindByEmailAsync(email);
                if (user == null)
                {
                    _logger.LogWarning("Password reset failed: User not found for Email: {Email}", email);
                    return ApiResponseDto.ErrorResult("Invalid reset token");
                }

                var result = await _userManager.ResetPasswordAsync(user, token, newPassword);
                if (!result.Succeeded)
                {
                    var errors = result.Errors.Select(e => e.Description).ToList();
                    _logger.LogWarning("Password reset failed for Email: {Email}. Errors: {Errors}", email, string.Join(" | ", errors));
                    return ApiResponseDto.ErrorResult("Failed to reset password", errors);
                }

                _logger.LogInformation("Password reset successfully for Email: {Email}", email);
                return ApiResponseDto.SuccessResult("Password reset successfully");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error during password reset for Email: {Email}", email);
                return ApiResponseDto.ErrorResult("An unexpected error occurred during password reset");
            }
        }

        /// <summary>
        /// Logs out the user by invalidating the refresh token
        /// </summary>
        public async Task<ApiResponseDto> LogoutAsync(string refreshToken)
        {
            try
            {
                if (string.IsNullOrEmpty(refreshToken))
                {
                    _logger.LogWarning("Logout failed: Empty refresh token");
                    return ApiResponseDto.ErrorResult("Refresh token is required");
                }

                var success = await _tokenService.InvalidateRefreshTokenAsync(refreshToken);
                if (!success)
                {
                    _logger.LogWarning("Logout failed: Could not invalidate refresh token");
                    return ApiResponseDto.ErrorResult("Failed to invalidate refresh token");
                }

                _logger.LogInformation("User logged out successfully");
                return ApiResponseDto.SuccessResult("Logged out successfully");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error during logout");
                return ApiResponseDto.ErrorResult("An unexpected error occurred during logout");
            }
        }

        /// <summary>
        /// Invalidates a refresh token
        /// </summary>
        public async Task<bool> InvalidateRefreshTokenAsync(string refreshToken)
        {
            return await _tokenService.InvalidateRefreshTokenAsync(refreshToken);
        }

        /// <summary>
        /// Invalidates all refresh tokens for a user
        /// </summary>
        public async Task<bool> InvalidateAllTokensForUserAsync(string userId)
        {
            return await _tokenService.InvalidateAllTokensForUserAsync(userId);
        }

        /// <summary>
        /// Validates a refresh token and returns new tokens
        /// </summary>
        public async Task<(string AccessToken, string RefreshToken)?> ValidateRefreshTokenAsync(string refreshToken)
        {
            return await _tokenService.ValidateRefreshTokenAsync(refreshToken);
        }

        /// <summary>
        /// Gets the access token expiration time
        /// </summary>
        public DateTime GetAccessTokenExpiration()
        {
            return _tokenService.GetAccessTokenExpiration();
        }
    }
} 