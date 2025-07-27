using OrangeSiteInspector.Application.DTOs;
using OrangeSiteInspector.Domain.Enums;

namespace OrangeSiteInspector.Application.Interfaces
{
    public interface IUserService
    {
        Task<ApiResponseDto<UserDto>> GetByIdAsync(string id);
        Task<ApiResponseDto<UserDto>> GetByEmailAsync(string email);
        Task<ApiResponseDto<PagedResultDto<UserDto>>> GetAllAsync(int page = 1, int pageSize = 10);
        Task<ApiResponseDto<List<UserDto>>> GetByRoleAsync(UserRole role);
        Task<ApiResponseDto<LoginResponseDto>> CreateAsync(CreateUserDto createUserDto);
        Task<ApiResponseDto<UserDto>> UpdateAsync(string id, UpdateUserDto updateUserDto);
        Task<ApiResponseDto> DeleteAsync(string id);
        Task<ApiResponseDto<LoginResponseDto>> LoginAsync(LoginDto loginDto);
        Task<ApiResponseDto<RefreshTokenResponseDto>> RefreshTokenAsync(RefreshTokenDto refreshTokenDto);
        Task<ApiResponseDto> ChangePasswordAsync(string userId, ChangePasswordDto changePasswordDto);
        Task<ApiResponseDto> ConfirmEmailAsync(string userId, string token);
        Task<ApiResponseDto> ForgotPasswordAsync(string email);
        Task<ApiResponseDto> ResetPasswordAsync(string email, string token, string newPassword);
        Task<ApiResponseDto<UserProfileDto>> GetProfileAsync(string userId);
        Task<ApiResponseDto<UserProfileDto>> UpdateProfileAsync(string userId, UpdateProfileDto updateDto);
        Task<ApiResponseDto<bool>> UpdateThemeAsync(string userId, UpdateThemeDto themeDto);
        Task<ApiResponseDto<bool>> CheckEmailExistsAsync(string email);
        Task<ApiResponseDto<bool>> CheckUserNameExistsAsync(string userName);
        Task<ApiResponseDto<UserStatusDto>> GetUserStatusAsync(string userId);
        Task<ApiResponseDto<UserStatusDto>> UpdateUserStatusAsync(string userId, UpdateUserStatusDto statusDto);
        Task<ApiResponseDto<PagedResultDto<UserDto>>> SearchUsersAsync(UserSearchDto searchDto);
        Task<ApiResponseDto<UserStatisticsDto>> GetUserStatisticsAsync();
        Task<ApiResponseDto> BulkUserOperationAsync(BulkUserOperationDto bulkOperationDto);
        Task<ApiResponseDto<List<UserActivityDto>>> GetUserActivityAsync(int page = 1, int pageSize = 10);
        Task<ApiResponseDto> LockUserAsync(string userId, DateTime? lockoutEnd = null);
        Task<ApiResponseDto> UnlockUserAsync(string userId);
        Task<ApiResponseDto> ActivateUserAsync(string userId);
        Task<ApiResponseDto> DeactivateUserAsync(string userId);
        Task<ApiResponseDto> ResetLoginAttemptsAsync(string userId);
        Task<ApiResponseDto> UpdateLastLoginAsync(string userId, string? ipAddress = null);
    }
} 