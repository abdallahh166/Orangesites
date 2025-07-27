using FluentValidation;
using OrangeSiteInspector.Application.DTOs;
using OrangeSiteInspector.Domain.Enums;

namespace OrangeSiteInspector.Application.Validation
{
    public class CreateUserDtoValidator : AbstractValidator<CreateUserDto>
    {
        public CreateUserDtoValidator()
        {
            RuleFor(x => x.FullName)
                .NotEmpty().WithMessage("Full name is required")
                .MinimumLength(2).WithMessage("Full name must be at least 2 characters")
                .MaximumLength(100).WithMessage("Full name cannot exceed 100 characters")
                .Matches("^[a-zA-Z\\s\\-']+$").WithMessage("Full name can only contain letters, spaces, hyphens, and apostrophes");

            RuleFor(x => x.Email)
                .NotEmpty().WithMessage("Email is required")
                .EmailAddress().WithMessage("Invalid email format")
                .MaximumLength(100).WithMessage("Email cannot exceed 100 characters")
                .Must(BeValidEmailDomain).WithMessage("Email domain is not allowed");

            RuleFor(x => x.UserName)
                .NotEmpty().WithMessage("Username is required")
                .MinimumLength(3).WithMessage("Username must be at least 3 characters")
                .MaximumLength(50).WithMessage("Username cannot exceed 50 characters")
                .Matches("^[a-zA-Z0-9._-]+$").WithMessage("Username can only contain letters, numbers, dots, underscores, and hyphens")
                .Must(NotStartWithNumber).WithMessage("Username cannot start with a number");

            RuleFor(x => x.Password)
                .NotEmpty().WithMessage("Password is required")
                .MinimumLength(8).WithMessage("Password must be at least 8 characters")
                .MaximumLength(128).WithMessage("Password cannot exceed 128 characters")
                .Matches("[A-Z]").WithMessage("Password must contain at least one uppercase letter")
                .Matches("[a-z]").WithMessage("Password must contain at least one lowercase letter")
                .Matches("[0-9]").WithMessage("Password must contain at least one number")
                .Matches("[^a-zA-Z0-9]").WithMessage("Password must contain at least one special character")
                .Must(NotContainCommonPasswords).WithMessage("Password is too common, please choose a stronger password");

            RuleFor(x => x.Role)
                .IsInEnum().WithMessage("Invalid role")
                .Must(BeValidRoleForCreation).WithMessage("Invalid role for user creation");

            RuleFor(x => x.PhoneNumber)
                .Matches(@"^[\+]?[0-9\s\-\(\)]{10,20}$").WithMessage("Invalid phone number format")
                .When(x => !string.IsNullOrEmpty(x.PhoneNumber));

            RuleFor(x => x.Department)
                .MaximumLength(200).WithMessage("Department cannot exceed 200 characters")
                .When(x => !string.IsNullOrEmpty(x.Department));

            RuleFor(x => x.Position)
                .MaximumLength(100).WithMessage("Position cannot exceed 100 characters")
                .When(x => !string.IsNullOrEmpty(x.Position));

            RuleFor(x => x.LanguagePreference)
                .Must(BeValidLanguage).WithMessage("Language preference must be 'en' or 'ar'")
                .When(x => !string.IsNullOrEmpty(x.LanguagePreference));

            RuleFor(x => x.TimeZone)
                .Must(BeValidTimeZone).WithMessage("Invalid timezone format")
                .When(x => !string.IsNullOrEmpty(x.TimeZone));
        }

        private bool BeValidEmailDomain(string email)
        {
            if (string.IsNullOrEmpty(email)) return false;
            
            // For development/testing, allow all domains
            // In production, you might want to restrict to specific domains
            var allowedDomains = new[] { "orange.com", "orange.eg", "gmail.com", "outlook.com", "yahoo.com", "hotmail.com", "live.com" };
            var domain = email.Split('@').LastOrDefault()?.ToLower();
            return allowedDomains.Contains(domain);
        }

        private bool NotStartWithNumber(string userName)
        {
            return !string.IsNullOrEmpty(userName) && !char.IsDigit(userName[0]);
        }

        private bool NotContainCommonPasswords(string password)
        {
            var commonPasswords = new[] { "password", "123456", "qwerty", "admin", "user", "test" };
            return !commonPasswords.Contains(password.ToLower());
        }

        private bool BeValidRoleForCreation(UserRole role)
        {
            return role == UserRole.Engineer || role == UserRole.Admin;
        }

        private bool BeValidLanguage(string language)
        {
            var validLanguages = new[] { "en", "ar" };
            return validLanguages.Contains(language.ToLower());
        }

        private bool BeValidTimeZone(string timeZone)
        {
            try
            {
                TimeZoneInfo.FindSystemTimeZoneById(timeZone);
                return true;
            }
            catch
            {
                return false;
            }
        }
    }

    public class UpdateUserDtoValidator : AbstractValidator<UpdateUserDto>
    {
        public UpdateUserDtoValidator()
        {
            RuleFor(x => x.FullName)
                .MinimumLength(2).WithMessage("Full name must be at least 2 characters")
                .MaximumLength(100).WithMessage("Full name cannot exceed 100 characters")
                .Matches("^[a-zA-Z\\s\\-']+$").WithMessage("Full name can only contain letters, spaces, hyphens, and apostrophes")
                .When(x => !string.IsNullOrEmpty(x.FullName));

            RuleFor(x => x.Email)
                .EmailAddress().WithMessage("Invalid email format")
                .MaximumLength(100).WithMessage("Email cannot exceed 100 characters")
                .Must(BeValidEmailDomain).WithMessage("Email domain is not allowed")
                .When(x => !string.IsNullOrEmpty(x.Email));

            RuleFor(x => x.UserName)
                .MinimumLength(3).WithMessage("Username must be at least 3 characters")
                .MaximumLength(50).WithMessage("Username cannot exceed 50 characters")
                .Matches("^[a-zA-Z0-9._-]+$").WithMessage("Username can only contain letters, numbers, dots, underscores, and hyphens")
                .Must(NotStartWithNumber).WithMessage("Username cannot start with a number")
                .When(x => !string.IsNullOrEmpty(x.UserName));

            RuleFor(x => x.Role)
                .IsInEnum().WithMessage("Invalid role")
                .When(x => x.Role.HasValue);

            RuleFor(x => x.PhoneNumber)
                .Matches(@"^[\+]?[0-9\s\-\(\)]{10,20}$").WithMessage("Invalid phone number format")
                .When(x => !string.IsNullOrEmpty(x.PhoneNumber));

            RuleFor(x => x.Department)
                .MaximumLength(200).WithMessage("Department cannot exceed 200 characters")
                .When(x => !string.IsNullOrEmpty(x.Department));

            RuleFor(x => x.Position)
                .MaximumLength(100).WithMessage("Position cannot exceed 100 characters")
                .When(x => !string.IsNullOrEmpty(x.Position));

            RuleFor(x => x.LanguagePreference)
                .Must(BeValidLanguage).WithMessage("Language preference must be 'en' or 'ar'")
                .When(x => !string.IsNullOrEmpty(x.LanguagePreference));

            RuleFor(x => x.TimeZone)
                .Must(BeValidTimeZone).WithMessage("Invalid timezone format")
                .When(x => !string.IsNullOrEmpty(x.TimeZone));
        }

        private bool BeValidEmailDomain(string email)
        {
            if (string.IsNullOrEmpty(email)) return false;
            
            // For development/testing, allow all domains
            // In production, you might want to restrict to specific domains
            var allowedDomains = new[] { "orange.com", "orange.eg", "gmail.com", "outlook.com", "yahoo.com", "hotmail.com", "live.com" };
            var domain = email.Split('@').LastOrDefault()?.ToLower();
            return allowedDomains.Contains(domain);
        }

        private bool NotStartWithNumber(string userName)
        {
            return !string.IsNullOrEmpty(userName) && !char.IsDigit(userName[0]);
        }

        private bool BeValidLanguage(string language)
        {
            var validLanguages = new[] { "en", "ar" };
            return validLanguages.Contains(language.ToLower());
        }

        private bool BeValidTimeZone(string timeZone)
        {
            try
            {
                TimeZoneInfo.FindSystemTimeZoneById(timeZone);
                return true;
            }
            catch
            {
                return false;
            }
        }
    }

    public class LoginDtoValidator : AbstractValidator<LoginDto>
    {
        public LoginDtoValidator()
        {
            RuleFor(x => x.Email)
                .NotEmpty().WithMessage("Email is required")
                .EmailAddress().WithMessage("Invalid email format")
                .MaximumLength(100).WithMessage("Email cannot exceed 100 characters");

            RuleFor(x => x.Password)
                .NotEmpty().WithMessage("Password is required")
                .MaximumLength(128).WithMessage("Password cannot exceed 128 characters");
        }
    }

    public class ChangePasswordDtoValidator : AbstractValidator<ChangePasswordDto>
    {
        public ChangePasswordDtoValidator()
        {
            RuleFor(x => x.CurrentPassword)
                .NotEmpty().WithMessage("Current password is required")
                .MaximumLength(128).WithMessage("Current password cannot exceed 128 characters");

            RuleFor(x => x.NewPassword)
                .NotEmpty().WithMessage("New password is required")
                .MinimumLength(8).WithMessage("Password must be at least 8 characters")
                .MaximumLength(128).WithMessage("Password cannot exceed 128 characters")
                .Matches("[A-Z]").WithMessage("Password must contain at least one uppercase letter")
                .Matches("[a-z]").WithMessage("Password must contain at least one lowercase letter")
                .Matches("[0-9]").WithMessage("Password must contain at least one number")
                .Matches("[^a-zA-Z0-9]").WithMessage("Password must contain at least one special character")
                .Must(NotContainCommonPasswords).WithMessage("Password is too common, please choose a stronger password")
                .Must(BeDifferentFromCurrent).WithMessage("New password must be different from current password");

            RuleFor(x => x.ConfirmPassword)
                .NotEmpty().WithMessage("Confirm password is required")
                .Equal(x => x.NewPassword).WithMessage("Passwords do not match");
        }

        private bool NotContainCommonPasswords(string password)
        {
            var commonPasswords = new[] { "password", "123456", "qwerty", "admin", "user", "test" };
            return !commonPasswords.Contains(password.ToLower());
        }

        private bool BeDifferentFromCurrent(ChangePasswordDto dto, string newPassword)
        {
            return !string.Equals(dto.CurrentPassword, newPassword, StringComparison.OrdinalIgnoreCase);
        }
    }

    public class UpdateProfileDtoValidator : AbstractValidator<UpdateProfileDto>
    {
        public UpdateProfileDtoValidator()
        {
            RuleFor(x => x.FullName)
                .MinimumLength(2).WithMessage("Full name must be at least 2 characters")
                .MaximumLength(100).WithMessage("Full name cannot exceed 100 characters")
                .Matches("^[a-zA-Z\\s\\-']+$").WithMessage("Full name can only contain letters, spaces, hyphens, and apostrophes")
                .When(x => !string.IsNullOrEmpty(x.FullName));

            RuleFor(x => x.Email)
                .EmailAddress().WithMessage("Invalid email format")
                .MaximumLength(100).WithMessage("Email cannot exceed 100 characters")
                .Must(BeValidEmailDomain).WithMessage("Email domain is not allowed")
                .When(x => !string.IsNullOrEmpty(x.Email));

            RuleFor(x => x.ThemePreference)
                .Must(BeValidTheme).WithMessage("Theme preference must be 'light', 'dark', or 'system'")
                .When(x => !string.IsNullOrEmpty(x.ThemePreference));

            RuleFor(x => x.PhoneNumber)
                .Matches(@"^[\+]?[0-9\s\-\(\)]{10,20}$").WithMessage("Invalid phone number format")
                .When(x => !string.IsNullOrEmpty(x.PhoneNumber));

            RuleFor(x => x.Department)
                .MaximumLength(200).WithMessage("Department cannot exceed 200 characters")
                .When(x => !string.IsNullOrEmpty(x.Department));

            RuleFor(x => x.Position)
                .MaximumLength(100).WithMessage("Position cannot exceed 100 characters")
                .When(x => !string.IsNullOrEmpty(x.Position));

            RuleFor(x => x.LanguagePreference)
                .Must(BeValidLanguage).WithMessage("Language preference must be 'en' or 'ar'")
                .When(x => !string.IsNullOrEmpty(x.LanguagePreference));

            RuleFor(x => x.TimeZone)
                .Must(BeValidTimeZone).WithMessage("Invalid timezone format")
                .When(x => !string.IsNullOrEmpty(x.TimeZone));

            RuleFor(x => x.ProfilePictureUrl)
                .Must(BeValidUrl).WithMessage("Invalid profile picture URL")
                .When(x => !string.IsNullOrEmpty(x.ProfilePictureUrl));

            RuleFor(x => x.NewPassword)
                .MinimumLength(8).WithMessage("Password must be at least 8 characters")
                .MaximumLength(128).WithMessage("Password cannot exceed 128 characters")
                .Matches("[A-Z]").WithMessage("Password must contain at least one uppercase letter")
                .Matches("[a-z]").WithMessage("Password must contain at least one lowercase letter")
                .Matches("[0-9]").WithMessage("Password must contain at least one number")
                .Matches("[^a-zA-Z0-9]").WithMessage("Password must contain at least one special character")
                .Must(NotContainCommonPasswords).WithMessage("Password is too common, please choose a stronger password")
                .When(x => !string.IsNullOrEmpty(x.NewPassword));

            RuleFor(x => x.CurrentPassword)
                .NotEmpty().WithMessage("Current password is required when changing password")
                .When(x => !string.IsNullOrEmpty(x.NewPassword));

            RuleFor(x => x.ConfirmPassword)
                .Equal(x => x.NewPassword).WithMessage("Passwords do not match")
                .When(x => !string.IsNullOrEmpty(x.NewPassword));
        }

        private bool BeValidEmailDomain(string email)
        {
            if (string.IsNullOrEmpty(email)) return false;
            
            var allowedDomains = new[] { "orange.com", "orange.eg", "gmail.com", "outlook.com", "yahoo.com" };
            var domain = email.Split('@').LastOrDefault()?.ToLower();
            return allowedDomains.Contains(domain);
        }

        private bool BeValidTheme(string theme)
        {
            var validThemes = new[] { "light", "dark", "system" };
            return validThemes.Contains(theme.ToLower());
        }

        private bool NotContainCommonPasswords(string password)
        {
            var commonPasswords = new[] { "password", "123456", "qwerty", "admin", "user", "test" };
            return !commonPasswords.Contains(password.ToLower());
        }

        private bool BeValidLanguage(string language)
        {
            var validLanguages = new[] { "en", "ar" };
            return validLanguages.Contains(language.ToLower());
        }

        private bool BeValidTimeZone(string timeZone)
        {
            try
            {
                TimeZoneInfo.FindSystemTimeZoneById(timeZone);
                return true;
            }
            catch
            {
                return false;
            }
        }

        private bool BeValidUrl(string url)
        {
            return Uri.TryCreate(url, UriKind.Absolute, out _);
        }
    }

    public class UpdateThemeDtoValidator : AbstractValidator<UpdateThemeDto>
    {
        public UpdateThemeDtoValidator()
        {
            RuleFor(x => x.ThemePreference)
                .NotEmpty().WithMessage("Theme preference is required")
                .Must(BeValidTheme).WithMessage("Theme preference must be 'light', 'dark', or 'system'");
        }

        private bool BeValidTheme(string theme)
        {
            var validThemes = new[] { "light", "dark", "system" };
            return validThemes.Contains(theme.ToLower());
        }
    }

    public class ForgotPasswordDtoValidator : AbstractValidator<ForgotPasswordDto>
    {
        public ForgotPasswordDtoValidator()
        {
            RuleFor(x => x.Email)
                .NotEmpty().WithMessage("Email is required")
                .EmailAddress().WithMessage("Invalid email format")
                .MaximumLength(100).WithMessage("Email cannot exceed 100 characters");
        }
    }

    public class ResetPasswordDtoValidator : AbstractValidator<ResetPasswordDto>
    {
        public ResetPasswordDtoValidator()
        {
            RuleFor(x => x.Email)
                .NotEmpty().WithMessage("Email is required")
                .EmailAddress().WithMessage("Invalid email format")
                .MaximumLength(100).WithMessage("Email cannot exceed 100 characters");

            RuleFor(x => x.Token)
                .NotEmpty().WithMessage("Reset token is required");

            RuleFor(x => x.NewPassword)
                .NotEmpty().WithMessage("New password is required")
                .MinimumLength(8).WithMessage("Password must be at least 8 characters")
                .MaximumLength(128).WithMessage("Password cannot exceed 128 characters")
                .Matches("[A-Z]").WithMessage("Password must contain at least one uppercase letter")
                .Matches("[a-z]").WithMessage("Password must contain at least one lowercase letter")
                .Matches("[0-9]").WithMessage("Password must contain at least one number")
                .Matches("[^a-zA-Z0-9]").WithMessage("Password must contain at least one special character")
                .Must(NotContainCommonPasswords).WithMessage("Password is too common, please choose a stronger password");

            RuleFor(x => x.ConfirmPassword)
                .NotEmpty().WithMessage("Confirm password is required")
                .Equal(x => x.NewPassword).WithMessage("Passwords do not match");
        }

        private bool NotContainCommonPasswords(string password)
        {
            var commonPasswords = new[] { "password", "123456", "qwerty", "admin", "user", "test" };
            return !commonPasswords.Contains(password.ToLower());
        }
    }

    public class UpdateUserStatusDtoValidator : AbstractValidator<UpdateUserStatusDto>
    {
        public UpdateUserStatusDtoValidator()
        {
            RuleFor(x => x.LockoutEnd)
                .GreaterThan(DateTime.UtcNow).WithMessage("Lockout end must be in the future")
                .When(x => x.LockoutEnd.HasValue);
        }
    }

    public class UserSearchDtoValidator : AbstractValidator<UserSearchDto>
    {
        public UserSearchDtoValidator()
        {
            RuleFor(x => x.SearchTerm)
                .MaximumLength(100).WithMessage("Search term cannot exceed 100 characters")
                .When(x => !string.IsNullOrEmpty(x.SearchTerm));

            RuleFor(x => x.Role)
                .IsInEnum().WithMessage("Invalid role")
                .When(x => x.Role.HasValue);

            RuleFor(x => x.Department)
                .MaximumLength(200).WithMessage("Department cannot exceed 200 characters")
                .When(x => !string.IsNullOrEmpty(x.Department));

            RuleFor(x => x.CreatedFrom)
                .LessThanOrEqualTo(x => x.CreatedTo).WithMessage("Created from date must be before or equal to created to date")
                .When(x => x.CreatedFrom.HasValue && x.CreatedTo.HasValue);

            RuleFor(x => x.Page)
                .GreaterThan(0).WithMessage("Page must be greater than 0");

            RuleFor(x => x.PageSize)
                .InclusiveBetween(1, 100).WithMessage("Page size must be between 1 and 100");
        }
    }

    public class BulkUserOperationDtoValidator : AbstractValidator<BulkUserOperationDto>
    {
        public BulkUserOperationDtoValidator()
        {
            RuleFor(x => x.UserIds)
                .NotEmpty().WithMessage("User IDs list cannot be empty")
                .Must(x => x.Count <= 100).WithMessage("Cannot perform bulk operation on more than 100 users at once");

            RuleFor(x => x.Operation)
                .NotEmpty().WithMessage("Operation is required")
                .Must(BeValidOperation).WithMessage("Invalid operation. Must be one of: activate, deactivate, lock, unlock, delete");
        }

        private bool BeValidOperation(string operation)
        {
            var validOperations = new[] { "activate", "deactivate", "lock", "unlock", "delete" };
            return validOperations.Contains(operation.ToLower());
        }
    }
} 