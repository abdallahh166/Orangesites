using AutoMapper;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using OrangeSiteInspector.Application.DTOs;
using OrangeSiteInspector.Application.Interfaces;
using OrangeSiteInspector.Domain.Entities;
using OrangeSiteInspector.Domain.Enums;
using OrangeSiteInspector.Infrastructure.Repositories;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.Extensions.Logging;

namespace OrangeSiteInspector.Application.Services
{
    public class UserService : IUserService
    {
        private readonly IUserRepository _userRepository;
        private readonly UserManager<User> _userManager;
        private readonly SignInManager<User> _signInManager;
        private readonly IMapper _mapper;
        private readonly IConfiguration _configuration;
        private readonly ILogger<UserService> _logger;

        public UserService(
            IUserRepository userRepository,
            UserManager<User> userManager,
            SignInManager<User> signInManager,
            IMapper mapper,
            IConfiguration configuration,
            ILogger<UserService> logger)
        {
            _userRepository = userRepository;
            _userManager = userManager;
            _signInManager = signInManager;
            _mapper = mapper;
            _configuration = configuration;
            _logger = logger;
        }

        public async Task<ApiResponseDto<UserDto>> GetByIdAsync(string id)
        {
            var user = await _userRepository.GetByIdAsync(id);
            if (user == null)
                return ApiResponseDto<UserDto>.ErrorResult("User not found");

            var userDto = _mapper.Map<UserDto>(user);
            return ApiResponseDto<UserDto>.SuccessResult(userDto);
        }

        public async Task<ApiResponseDto<UserDto>> GetByEmailAsync(string email)
        {
            var user = await _userRepository.GetByEmailAsync(email);
            if (user == null)
                return ApiResponseDto<UserDto>.ErrorResult("User not found");

            var userDto = _mapper.Map<UserDto>(user);
            return ApiResponseDto<UserDto>.SuccessResult(userDto);
        }

        public async Task<ApiResponseDto<PagedResultDto<UserDto>>> GetAllAsync(int page = 1, int pageSize = 10)
        {
            var users = await _userRepository.GetAllAsync();
            var userDtos = _mapper.Map<List<UserDto>>(users);

            var pagedResult = new PagedResultDto<UserDto>
            {
                Items = userDtos.Skip((page - 1) * pageSize).Take(pageSize).ToList(),
                TotalCount = userDtos.Count,
                Page = page,
                PageSize = pageSize
            };

            return ApiResponseDto<PagedResultDto<UserDto>>.SuccessResult(pagedResult);
        }

        public async Task<ApiResponseDto<List<UserDto>>> GetByRoleAsync(UserRole role)
        {
            var users = await _userRepository.GetByRoleAsync(role);
            var userDtos = _mapper.Map<List<UserDto>>(users);
            return ApiResponseDto<List<UserDto>>.SuccessResult(userDtos);
        }

        public async Task<ApiResponseDto<LoginResponseDto>> CreateAsync(CreateUserDto createUserDto)
        {
            if (await _userRepository.EmailExistsAsync(createUserDto.Email))
            {
                _logger.LogWarning("Registration failed: Email already exists. Email: {Email}", createUserDto.Email);
                return ApiResponseDto<LoginResponseDto>.ErrorResult("Failed to create user", new List<string> { "Email already exists" });
            }

            if (await _userRepository.UserNameExistsAsync(createUserDto.UserName))
            {
                _logger.LogWarning("Registration failed: Username already exists. Username: {UserName}", createUserDto.UserName);
                return ApiResponseDto<LoginResponseDto>.ErrorResult("Failed to create user", new List<string> { "Username already exists" });
            }

            var user = _mapper.Map<User>(createUserDto);
            user.EmailConfirmed = true;

            var result = await _userManager.CreateAsync(user, createUserDto.Password);
            if (!result.Succeeded)
            {
                var errors = result.Errors.Select(e => e.Description).ToList();
                _logger.LogWarning("Registration failed for Email: {Email}, Username: {UserName}. Errors: {Errors}", createUserDto.Email, createUserDto.UserName, string.Join(" | ", errors));
                return ApiResponseDto<LoginResponseDto>.ErrorResult("Failed to create user", errors);
            }

            var roleName = createUserDto.Role.ToString();
            await _userManager.AddToRoleAsync(user, roleName);

            // Generate token and return login response
            var (accessToken, refreshToken) = await GenerateTokensAsync(user);
            var userDto = _mapper.Map<UserDto>(user);

            var loginResponse = new LoginResponseDto
            {
                Token = accessToken,
                RefreshToken = refreshToken,
                User = userDto,
                ExpiresAt = DateTime.UtcNow.AddHours(1)
            };

            return ApiResponseDto<LoginResponseDto>.SuccessResult(loginResponse, "User created successfully");
        }

        public async Task<ApiResponseDto<UserDto>> UpdateAsync(string id, UpdateUserDto updateUserDto)
        {
            var user = await _userRepository.GetByIdAsync(id);
            if (user == null)
                return ApiResponseDto<UserDto>.ErrorResult("User not found");

            if (!string.IsNullOrEmpty(updateUserDto.Email) && updateUserDto.Email != user.Email && await _userRepository.EmailExistsAsync(updateUserDto.Email))
                return ApiResponseDto<UserDto>.ErrorResult("Email already exists");

            _mapper.Map(updateUserDto, user);
            await _userRepository.UpdateAsync(user);

            var userDto = _mapper.Map<UserDto>(user);
            return ApiResponseDto<UserDto>.SuccessResult(userDto, "User updated successfully");
        }

        public async Task<ApiResponseDto> DeleteAsync(string id)
        {
            var user = await _userRepository.GetByIdAsync(id);
            if (user == null)
                return ApiResponseDto.ErrorResult("User not found");

            await _userRepository.DeleteAsync(user);
            return ApiResponseDto.SuccessResult("User deleted successfully");
        }

        public async Task<ApiResponseDto<LoginResponseDto>> LoginAsync(LoginDto loginDto)
        {
            var user = await _userManager.FindByEmailAsync(loginDto.Email);
            if (user == null)
                return ApiResponseDto<LoginResponseDto>.ErrorResult("Invalid email or password");

            var result = await _signInManager.CheckPasswordSignInAsync(user, loginDto.Password, false);
            if (!result.Succeeded)
                return ApiResponseDto<LoginResponseDto>.ErrorResult("Invalid email or password");

            var (accessToken, refreshToken) = await GenerateTokensAsync(user);
            var userDto = _mapper.Map<UserDto>(user);

            var loginResponse = new LoginResponseDto
            {
                Token = accessToken,
                RefreshToken = refreshToken,
                User = userDto,
                ExpiresAt = DateTime.UtcNow.AddHours(1),
                RefreshTokenExpiresAt = DateTime.UtcNow.AddDays(7)
            };

            return ApiResponseDto<LoginResponseDto>.SuccessResult(loginResponse, "Login successful");
        }

        public async Task<ApiResponseDto<RefreshTokenResponseDto>> RefreshTokenAsync(RefreshTokenDto refreshTokenDto)
        {
            try
            {
                var jwtSettings = _configuration.GetSection("JwtSettings");
                var key = Encoding.ASCII.GetBytes(jwtSettings["SecretKey"] ?? "YourSuperSecretKeyHere12345678901234567890");

                var tokenHandler = new JwtSecurityTokenHandler();
                var tokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = new SymmetricSecurityKey(key),
                    ValidateIssuer = true,
                    ValidateAudience = true,
                    ValidIssuer = jwtSettings["Issuer"],
                    ValidAudience = jwtSettings["Audience"],
                    ClockSkew = TimeSpan.Zero
                };

                var principal = tokenHandler.ValidateToken(refreshTokenDto.RefreshToken, tokenValidationParameters, out var validatedToken);

                // Check if it's a refresh token
                var tokenType = principal.FindFirst("token_type")?.Value;
                if (tokenType != "refresh")
                {
                    return ApiResponseDto<RefreshTokenResponseDto>.ErrorResult("Invalid token type");
                }

                var userId = principal.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId))
                {
                    return ApiResponseDto<RefreshTokenResponseDto>.ErrorResult("Invalid token");
                }

                var user = await _userRepository.GetByIdAsync(userId);
                if (user == null || !user.IsActive)
                {
                    return ApiResponseDto<RefreshTokenResponseDto>.ErrorResult("User not found or inactive");
                }

                var (accessToken, refreshToken) = await GenerateTokensAsync(user);

                var refreshResponse = new RefreshTokenResponseDto
                {
                    Token = accessToken,
                    RefreshToken = refreshToken,
                    ExpiresAt = DateTime.UtcNow.AddHours(1),
                    RefreshTokenExpiresAt = DateTime.UtcNow.AddDays(7)
                };

                return ApiResponseDto<RefreshTokenResponseDto>.SuccessResult(refreshResponse, "Token refreshed successfully");
            }
            catch (Exception ex)
            {
                _logger.LogWarning("Token refresh failed: {Error}", ex.Message);
                return ApiResponseDto<RefreshTokenResponseDto>.ErrorResult("Invalid refresh token");
            }
        }

        public async Task<ApiResponseDto> ChangePasswordAsync(string userId, ChangePasswordDto changePasswordDto)
        {
            var user = await _userRepository.GetByIdAsync(userId);
            if (user == null)
                return ApiResponseDto.ErrorResult("User not found");

            var result = await _userManager.ChangePasswordAsync(user, changePasswordDto.CurrentPassword, changePasswordDto.NewPassword);
            if (!result.Succeeded)
            {
                var errors = result.Errors.Select(e => e.Description).ToList();
                return ApiResponseDto.ErrorResult("Failed to change password", errors);
            }

            return ApiResponseDto.SuccessResult("Password changed successfully");
        }

        public async Task<ApiResponseDto> ConfirmEmailAsync(string userId, string token)
        {
            var user = await _userRepository.GetByIdAsync(userId);
            if (user == null)
                return ApiResponseDto.ErrorResult("User not found");

            var result = await _userManager.ConfirmEmailAsync(user, token);
            if (!result.Succeeded)
            {
                var errors = result.Errors.Select(e => e.Description).ToList();
                return ApiResponseDto.ErrorResult("Failed to confirm email", errors);
            }

            return ApiResponseDto.SuccessResult("Email confirmed successfully");
        }

        public async Task<ApiResponseDto> ForgotPasswordAsync(string email)
        {
            var user = await _userManager.FindByEmailAsync(email);
            if (user == null)
                return ApiResponseDto.ErrorResult("User not found");

            var token = await _userManager.GeneratePasswordResetTokenAsync(user);
            return ApiResponseDto.SuccessResult("Password reset instructions sent to your email");
        }

        public async Task<ApiResponseDto> ResetPasswordAsync(string email, string token, string newPassword)
        {
            var user = await _userManager.FindByEmailAsync(email);
            if (user == null)
                return ApiResponseDto.ErrorResult("User not found");

            var result = await _userManager.ResetPasswordAsync(user, token, newPassword);
            if (!result.Succeeded)
            {
                var errors = result.Errors.Select(e => e.Description).ToList();
                return ApiResponseDto.ErrorResult("Failed to reset password", errors);
            }

            return ApiResponseDto.SuccessResult("Password reset successfully");
        }

        public async Task<ApiResponseDto<UserProfileDto>> GetProfileAsync(string userId)
        {
            var user = await _userRepository.GetByIdAsync(userId);
            if (user == null)
                return ApiResponseDto<UserProfileDto>.ErrorResult("User not found");

            var profileDto = _mapper.Map<UserProfileDto>(user);
            return ApiResponseDto<UserProfileDto>.SuccessResult(profileDto);
        }

        public async Task<ApiResponseDto<UserProfileDto>> UpdateProfileAsync(string userId, UpdateProfileDto updateDto)
        {
            var user = await _userRepository.GetByIdAsync(userId);
            if (user == null)
                return ApiResponseDto<UserProfileDto>.ErrorResult("User not found");

            // Check if email is being changed and if it already exists
            if (!string.IsNullOrEmpty(updateDto.Email) && updateDto.Email != user.Email)
            {
                if (await _userRepository.EmailExistsAsync(updateDto.Email))
                    return ApiResponseDto<UserProfileDto>.ErrorResult("Email already exists");
            }

            // Update basic information
            if (!string.IsNullOrEmpty(updateDto.FullName))
                user.FullName = updateDto.FullName;

            if (!string.IsNullOrEmpty(updateDto.Email))
                user.Email = updateDto.Email;

            if (!string.IsNullOrEmpty(updateDto.ThemePreference))
                user.ThemePreference = updateDto.ThemePreference;

            // Update password if provided
            if (!string.IsNullOrEmpty(updateDto.CurrentPassword) && !string.IsNullOrEmpty(updateDto.NewPassword))
            {
                var passwordResult = await _userManager.ChangePasswordAsync(user, updateDto.CurrentPassword, updateDto.NewPassword);
                if (!passwordResult.Succeeded)
                {
                    var errors = passwordResult.Errors.Select(e => e.Description).ToList();
                    return ApiResponseDto<UserProfileDto>.ErrorResult("Failed to change password", errors);
                }
            }

            user.UpdatedAt = DateTime.UtcNow;
            await _userRepository.UpdateAsync(user);

            var profileDto = _mapper.Map<UserProfileDto>(user);
            return ApiResponseDto<UserProfileDto>.SuccessResult(profileDto, "Profile updated successfully");
        }

        public async Task<ApiResponseDto<bool>> UpdateThemeAsync(string userId, UpdateThemeDto themeDto)
        {
            var user = await _userRepository.GetByIdAsync(userId);
            if (user == null)
                return ApiResponseDto<bool>.ErrorResult("User not found");

            // Validate theme preference
            var validThemes = new[] { "light", "dark", "system" };
            if (!validThemes.Contains(themeDto.ThemePreference.ToLower()))
                return ApiResponseDto<bool>.ErrorResult("Invalid theme preference");

            user.ThemePreference = themeDto.ThemePreference.ToLower();
            user.UpdatedAt = DateTime.UtcNow;
            await _userRepository.UpdateAsync(user);

            return ApiResponseDto<bool>.SuccessResult(true, "Theme preference updated successfully");
        }

        public async Task<ApiResponseDto<bool>> CheckEmailExistsAsync(string email)
        {
            var exists = await _userRepository.EmailExistsAsync(email);
            return ApiResponseDto<bool>.SuccessResult(exists);
        }

        public async Task<ApiResponseDto<bool>> CheckUserNameExistsAsync(string userName)
        {
            var exists = await _userRepository.UserNameExistsAsync(userName);
            return ApiResponseDto<bool>.SuccessResult(exists);
        }

        private async Task<string> GenerateJwtTokenAsync(User user)
        {
            var jwtSettings = _configuration.GetSection("JwtSettings");
            var key = Encoding.ASCII.GetBytes(jwtSettings["SecretKey"] ?? "YourSuperSecretKeyHere12345678901234567890");

            var roles = await _userManager.GetRolesAsync(user);
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id),
                new Claim(ClaimTypes.Name, user.UserName ?? user.Email ?? string.Empty),
                new Claim(ClaimTypes.Email, user.Email ?? string.Empty),
                new Claim("FullName", user.FullName),
                new Claim("Role", user.Role.ToString())
            };

            foreach (var role in roles)
            {
                claims.Add(new Claim(ClaimTypes.Role, role));
            }

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(claims),
                Expires = DateTime.UtcNow.AddHours(1),
                Issuer = jwtSettings["Issuer"],
                Audience = jwtSettings["Audience"],
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };

            var tokenHandler = new JwtSecurityTokenHandler();
            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);
        }

        private async Task<string> GenerateRefreshTokenAsync(User user)
        {
            var jwtSettings = _configuration.GetSection("JwtSettings");
            var key = Encoding.ASCII.GetBytes(jwtSettings["SecretKey"] ?? "YourSuperSecretKeyHere12345678901234567890");

            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id),
                new Claim("token_type", "refresh")
            };

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(claims),
                Expires = DateTime.UtcNow.AddDays(7), // Refresh tokens last 7 days
                Issuer = jwtSettings["Issuer"],
                Audience = jwtSettings["Audience"],
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };

            var tokenHandler = new JwtSecurityTokenHandler();
            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);
        }

        private async Task<(string AccessToken, string RefreshToken)> GenerateTokensAsync(User user)
        {
            var accessToken = await GenerateJwtTokenAsync(user);
            var refreshToken = await GenerateRefreshTokenAsync(user);
            return (accessToken, refreshToken);
        }

        // Enhanced User Management Methods
        public async Task<ApiResponseDto<UserStatusDto>> GetUserStatusAsync(string userId)
        {
            var user = await _userRepository.GetByIdAsync(userId);
            if (user == null)
                return ApiResponseDto<UserStatusDto>.ErrorResult("User not found");

            var statusDto = new UserStatusDto
            {
                Id = user.Id,
                IsActive = user.IsActive,
                IsLocked = user.IsLocked,
                LockoutEnd = user.LockoutEnd,
                LoginAttempts = user.LoginAttempts,
                LastLoginAt = user.LastLoginAt,
                LastLoginIp = user.LastLoginIp
            };

            return ApiResponseDto<UserStatusDto>.SuccessResult(statusDto);
        }

        public async Task<ApiResponseDto<UserStatusDto>> UpdateUserStatusAsync(string userId, UpdateUserStatusDto statusDto)
        {
            var user = await _userRepository.GetByIdAsync(userId);
            if (user == null)
                return ApiResponseDto<UserStatusDto>.ErrorResult("User not found");

            if (statusDto.IsActive.HasValue)
                user.IsActive = statusDto.IsActive.Value;

            if (statusDto.IsLocked.HasValue)
                user.IsLocked = statusDto.IsLocked.Value;

            if (statusDto.LockoutEnd.HasValue)
                user.LockoutEnd = statusDto.LockoutEnd.Value;

            user.UpdatedAt = DateTime.UtcNow;
            await _userRepository.UpdateAsync(user);

            var updatedStatusDto = new UserStatusDto
            {
                Id = user.Id,
                IsActive = user.IsActive,
                IsLocked = user.IsLocked,
                LockoutEnd = user.LockoutEnd,
                LoginAttempts = user.LoginAttempts,
                LastLoginAt = user.LastLoginAt,
                LastLoginIp = user.LastLoginIp
            };

            return ApiResponseDto<UserStatusDto>.SuccessResult(updatedStatusDto, "User status updated successfully");
        }

        public async Task<ApiResponseDto<PagedResultDto<UserDto>>> SearchUsersAsync(UserSearchDto searchDto)
        {
            var users = await _userRepository.GetAllAsync();
            var filteredUsers = users.AsQueryable();

            // Apply filters
            if (!string.IsNullOrEmpty(searchDto.SearchTerm))
            {
                var searchTerm = searchDto.SearchTerm.ToLower();
                filteredUsers = filteredUsers.Where(u => 
                    u.FullName.ToLower().Contains(searchTerm) ||
                    u.Email.ToLower().Contains(searchTerm) ||
                    u.UserName.ToLower().Contains(searchTerm) ||
                    (u.Department != null && u.Department.ToLower().Contains(searchTerm))
                );
            }

            if (searchDto.Role.HasValue)
                filteredUsers = filteredUsers.Where(u => u.Role == searchDto.Role.Value);

            if (searchDto.IsActive.HasValue)
                filteredUsers = filteredUsers.Where(u => u.IsActive == searchDto.IsActive.Value);

            if (!string.IsNullOrEmpty(searchDto.Department))
                filteredUsers = filteredUsers.Where(u => u.Department == searchDto.Department);

            if (searchDto.CreatedFrom.HasValue)
                filteredUsers = filteredUsers.Where(u => u.CreatedAt >= searchDto.CreatedFrom.Value);

            if (searchDto.CreatedTo.HasValue)
                filteredUsers = filteredUsers.Where(u => u.CreatedAt <= searchDto.CreatedTo.Value);

            var totalCount = filteredUsers.Count();
            var pagedUsers = filteredUsers
                .Skip((searchDto.Page - 1) * searchDto.PageSize)
                .Take(searchDto.PageSize)
                .ToList();

            var userDtos = _mapper.Map<List<UserDto>>(pagedUsers);

            var pagedResult = new PagedResultDto<UserDto>
            {
                Items = userDtos,
                TotalCount = totalCount,
                Page = searchDto.Page,
                PageSize = searchDto.PageSize
            };

            return ApiResponseDto<PagedResultDto<UserDto>>.SuccessResult(pagedResult);
        }

        public async Task<ApiResponseDto<UserStatisticsDto>> GetUserStatisticsAsync()
        {
            var users = await _userRepository.GetAllAsync();
            var usersList = users.ToList();
            var now = DateTime.UtcNow;
            var startOfMonth = new DateTime(now.Year, now.Month, 1);
            var startOfDay = now.Date;

            var statistics = new UserStatisticsDto
            {
                TotalUsers = usersList.Count,
                ActiveUsers = usersList.Count(u => u.IsActive),
                LockedUsers = usersList.Count(u => u.IsLocked),
                NewUsersThisMonth = usersList.Count(u => u.CreatedAt >= startOfMonth),
                UsersLoggedInToday = usersList.Count(u => u.LastLoginAt >= startOfDay),
                UsersByDepartment = usersList.GroupBy(u => u.Department ?? "Unknown")
                    .ToDictionary(g => g.Key, g => g.Count()),
                UsersByRole = usersList.GroupBy(u => u.Role.ToString())
                    .ToDictionary(g => g.Key, g => g.Count())
            };

            return ApiResponseDto<UserStatisticsDto>.SuccessResult(statistics);
        }

        public async Task<ApiResponseDto> BulkUserOperationAsync(BulkUserOperationDto bulkOperationDto)
        {
            var users = new List<User>();
            foreach (var userId in bulkOperationDto.UserIds)
            {
                var user = await _userRepository.GetByIdAsync(userId);
                if (user != null)
                    users.Add(user);
            }

            if (!users.Any())
                return ApiResponseDto.ErrorResult("No valid users found");

            var operation = bulkOperationDto.Operation.ToLower();
            var updatedCount = 0;

            foreach (var user in users)
            {
                switch (operation)
                {
                    case "activate":
                        user.IsActive = true;
                        user.IsLocked = false;
                        user.LockoutEnd = null;
                        break;
                    case "deactivate":
                        user.IsActive = false;
                        break;
                    case "lock":
                        user.IsLocked = true;
                        user.LockoutEnd = DateTime.UtcNow.AddHours(24);
                        break;
                    case "unlock":
                        user.IsLocked = false;
                        user.LockoutEnd = null;
                        user.LoginAttempts = 0;
                        break;
                    case "delete":
                        await _userRepository.DeleteAsync(user);
                        updatedCount++;
                        continue;
                }

                user.UpdatedAt = DateTime.UtcNow;
                await _userRepository.UpdateAsync(user);
                updatedCount++;
            }

            return ApiResponseDto.SuccessResult($"Successfully processed {updatedCount} users");
        }

        public async Task<ApiResponseDto<List<UserActivityDto>>> GetUserActivityAsync(int page = 1, int pageSize = 10)
        {
            var users = await _userRepository.GetAllAsync();
            var activityUsers = users
                .OrderByDescending(u => u.LastLoginAt ?? u.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToList();

            var activityDtos = activityUsers.Select(u => new UserActivityDto
            {
                UserId = u.Id,
                UserName = u.UserName ?? string.Empty,
                FullName = u.FullName,
                LastLoginAt = u.LastLoginAt,
                LastLoginIp = u.LastLoginIp,
                LoginAttempts = u.LoginAttempts,
                IsActive = u.IsActive,
                IsLocked = u.IsLocked
            }).ToList();

            return ApiResponseDto<List<UserActivityDto>>.SuccessResult(activityDtos);
        }

        public async Task<ApiResponseDto> LockUserAsync(string userId, DateTime? lockoutEnd = null)
        {
            var user = await _userRepository.GetByIdAsync(userId);
            if (user == null)
                return ApiResponseDto.ErrorResult("User not found");

            user.IsLocked = true;
            user.LockoutEnd = lockoutEnd ?? DateTime.UtcNow.AddHours(24);
            user.UpdatedAt = DateTime.UtcNow;
            await _userRepository.UpdateAsync(user);

            return ApiResponseDto.SuccessResult("User locked successfully");
        }

        public async Task<ApiResponseDto> UnlockUserAsync(string userId)
        {
            var user = await _userRepository.GetByIdAsync(userId);
            if (user == null)
                return ApiResponseDto.ErrorResult("User not found");

            user.IsLocked = false;
            user.LockoutEnd = null;
            user.LoginAttempts = 0;
            user.UpdatedAt = DateTime.UtcNow;
            await _userRepository.UpdateAsync(user);

            return ApiResponseDto.SuccessResult("User unlocked successfully");
        }

        public async Task<ApiResponseDto> ActivateUserAsync(string userId)
        {
            var user = await _userRepository.GetByIdAsync(userId);
            if (user == null)
                return ApiResponseDto.ErrorResult("User not found");

            user.IsActive = true;
            user.UpdatedAt = DateTime.UtcNow;
            await _userRepository.UpdateAsync(user);

            return ApiResponseDto.SuccessResult("User activated successfully");
        }

        public async Task<ApiResponseDto> DeactivateUserAsync(string userId)
        {
            var user = await _userRepository.GetByIdAsync(userId);
            if (user == null)
                return ApiResponseDto.ErrorResult("User not found");

            user.IsActive = false;
            user.UpdatedAt = DateTime.UtcNow;
            await _userRepository.UpdateAsync(user);

            return ApiResponseDto.SuccessResult("User deactivated successfully");
        }

        public async Task<ApiResponseDto> ResetLoginAttemptsAsync(string userId)
        {
            var user = await _userRepository.GetByIdAsync(userId);
            if (user == null)
                return ApiResponseDto.ErrorResult("User not found");

            user.LoginAttempts = 0;
            user.UpdatedAt = DateTime.UtcNow;
            await _userRepository.UpdateAsync(user);

            return ApiResponseDto.SuccessResult("Login attempts reset successfully");
        }

        public async Task<ApiResponseDto> UpdateLastLoginAsync(string userId, string? ipAddress = null)
        {
            var user = await _userRepository.GetByIdAsync(userId);
            if (user == null)
                return ApiResponseDto.ErrorResult("User not found");

            user.LastLoginAt = DateTime.UtcNow;
            user.LastLoginIp = ipAddress;
            user.LoginAttempts = 0;
            user.UpdatedAt = DateTime.UtcNow;
            await _userRepository.UpdateAsync(user);

            return ApiResponseDto.SuccessResult("Last login updated successfully");
        }
    }
} 