using OrangeSiteInspector.Domain.Enums;

namespace OrangeSiteInspector.Application.DTOs
{
    public class UserDto
    {
        public string Id { get; set; } = string.Empty;
        public string UserName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public UserRole Role { get; set; }
        public bool EmailConfirmed { get; set; }
        public bool IsActive { get; set; }
        public bool IsLocked { get; set; }
        public DateTime? LastLoginAt { get; set; }
        public string? ProfilePictureUrl { get; set; }
        public string? PhoneNumber { get; set; }
        public string? Department { get; set; }
        public string? Position { get; set; }
        public string? LanguagePreference { get; set; }
        public string? TimeZone { get; set; }
        public string? ThemePreference { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }

    public class CreateUserDto
    {
        public string UserName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public UserRole Role { get; set; }
        public string? PhoneNumber { get; set; }
        public string? Department { get; set; }
        public string? Position { get; set; }
        public string? LanguagePreference { get; set; } = "en";
        public string? TimeZone { get; set; } = "UTC";
    }

    public class UpdateUserDto
    {
        public string? UserName { get; set; }
        public string? Email { get; set; }
        public string? FullName { get; set; }
        public UserRole? Role { get; set; }
        public bool? IsActive { get; set; }
        public bool? IsLocked { get; set; }
        public string? PhoneNumber { get; set; }
        public string? Department { get; set; }
        public string? Position { get; set; }
        public string? LanguagePreference { get; set; }
        public string? TimeZone { get; set; }
    }

    public class UpdateProfileDto
    {
        public string? FullName { get; set; }
        public string? Email { get; set; }
        public string? CurrentPassword { get; set; }
        public string? NewPassword { get; set; }
        public string? ConfirmPassword { get; set; }
        public string? ThemePreference { get; set; } // "light", "dark", "system"
        public string? PhoneNumber { get; set; }
        public string? Department { get; set; }
        public string? Position { get; set; }
        public string? LanguagePreference { get; set; }
        public string? TimeZone { get; set; }
        public string? ProfilePictureUrl { get; set; }
    }

    public class UpdateThemeDto
    {
        public string ThemePreference { get; set; } = string.Empty; // "light", "dark", "system"
    }

    public class UserProfileDto
    {
        public string Id { get; set; } = string.Empty;
        public string UserName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public UserRole Role { get; set; }
        public bool EmailConfirmed { get; set; }
        public bool IsActive { get; set; }
        public string? ProfilePictureUrl { get; set; }
        public string? PhoneNumber { get; set; }
        public string? Department { get; set; }
        public string? Position { get; set; }
        public string? LanguagePreference { get; set; }
        public string? TimeZone { get; set; }
        public string? ThemePreference { get; set; }
        public DateTime? LastLoginAt { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }

    public class LoginDto
    {
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }

    public class LoginResponseDto
    {
        public string Token { get; set; } = string.Empty;
        public string RefreshToken { get; set; } = string.Empty;
        public UserDto User { get; set; } = null!;
        public DateTime ExpiresAt { get; set; }
        public DateTime RefreshTokenExpiresAt { get; set; }
    }

    public class RefreshTokenDto
    {
        public string RefreshToken { get; set; } = string.Empty;
    }

    public class RefreshTokenResponseDto
    {
        public string Token { get; set; } = string.Empty;
        public string RefreshToken { get; set; } = string.Empty;
        public DateTime ExpiresAt { get; set; }
        public DateTime RefreshTokenExpiresAt { get; set; }
    }

    public class ChangePasswordDto
    {
        public string CurrentPassword { get; set; } = string.Empty;
        public string NewPassword { get; set; } = string.Empty;
        public string ConfirmPassword { get; set; } = string.Empty;
    }

    public class ResetPasswordDto
    {
        public string Email { get; set; } = string.Empty;
        public string Token { get; set; } = string.Empty;
        public string NewPassword { get; set; } = string.Empty;
        public string ConfirmPassword { get; set; } = string.Empty;
    }

    public class ForgotPasswordDto
    {
        public string Email { get; set; } = string.Empty;
    }

    // New DTOs for enhanced functionality
    public class UserStatusDto
    {
        public string Id { get; set; } = string.Empty;
        public bool IsActive { get; set; }
        public bool IsLocked { get; set; }
        public DateTime? LockoutEnd { get; set; }
        public int LoginAttempts { get; set; }
        public DateTime? LastLoginAt { get; set; }
        public string? LastLoginIp { get; set; }
    }

    public class UpdateUserStatusDto
    {
        public bool? IsActive { get; set; }
        public bool? IsLocked { get; set; }
        public DateTime? LockoutEnd { get; set; }
    }

    public class UserSearchDto
    {
        public string? SearchTerm { get; set; }
        public UserRole? Role { get; set; }
        public bool? IsActive { get; set; }
        public string? Department { get; set; }
        public DateTime? CreatedFrom { get; set; }
        public DateTime? CreatedTo { get; set; }
        public int Page { get; set; } = 1;
        public int PageSize { get; set; } = 10;
    }

    public class UserStatisticsDto
    {
        public int TotalUsers { get; set; }
        public int ActiveUsers { get; set; }
        public int LockedUsers { get; set; }
        public Dictionary<string, int> UsersByDepartment { get; set; } = new();
        public Dictionary<string, int> UsersByRole { get; set; } = new();
        public int NewUsersThisMonth { get; set; }
        public int UsersLoggedInToday { get; set; }
    }

    public class BulkUserOperationDto
    {
        public List<string> UserIds { get; set; } = new();
        public string Operation { get; set; } = string.Empty; // "activate", "deactivate", "lock", "unlock", "delete"
    }

    public class UserActivityDto
    {
        public string UserId { get; set; } = string.Empty;
        public string UserName { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public DateTime? LastLoginAt { get; set; }
        public string? LastLoginIp { get; set; }
        public int LoginAttempts { get; set; }
        public bool IsActive { get; set; }
        public bool IsLocked { get; set; }
    }
} 