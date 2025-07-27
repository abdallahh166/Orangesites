using FluentValidation;
using OrangeSiteInspector.Application.DTOs;

namespace OrangeSiteInspector.Application.Validation
{
    public class CreateSiteDtoValidator : AbstractValidator<CreateSiteDto>
    {
        public CreateSiteDtoValidator()
        {
            RuleFor(x => x.Name)
                .NotEmpty().WithMessage("Site name is required")
                .MinimumLength(3).WithMessage("Site name must be at least 3 characters")
                .MaximumLength(100).WithMessage("Site name cannot exceed 100 characters")
                .Matches("^[a-zA-Z0-9\\s\\-_\\.]+$").WithMessage("Site name can only contain letters, numbers, spaces, hyphens, underscores, and dots");

            RuleFor(x => x.Code)
                .NotEmpty().WithMessage("Site code is required")
                .MinimumLength(3).WithMessage("Site code must be at least 3 characters")
                .MaximumLength(20).WithMessage("Site code cannot exceed 20 characters")
                .Matches("^[A-Z0-9]+$").WithMessage("Site code can only contain uppercase letters and numbers")
                .Must(code => !code.Contains(" ")).WithMessage("Site code cannot contain spaces");

            RuleFor(x => x.Location)
                .NotEmpty().WithMessage("Location is required")
                .MinimumLength(2).WithMessage("Location must be at least 2 characters")
                .MaximumLength(200).WithMessage("Location cannot exceed 200 characters")
                .Matches("^[a-zA-Z0-9\\s\\-_,\\.]+$").WithMessage("Location can only contain letters, numbers, spaces, hyphens, underscores, commas, and dots");

            RuleFor(x => x.Address)
                .NotEmpty().WithMessage("Address is required")
                .MinimumLength(10).WithMessage("Address must be at least 10 characters")
                .MaximumLength(500).WithMessage("Address cannot exceed 500 characters")
                .Matches("^[a-zA-Z0-9\\s\\-_,\\.#]+$").WithMessage("Address can only contain letters, numbers, spaces, hyphens, underscores, commas, dots, and hash symbols");
        }
    }

    public class UpdateSiteDtoValidator : AbstractValidator<UpdateSiteDto>
    {
        public UpdateSiteDtoValidator()
        {
            RuleFor(x => x.Name)
                .NotEmpty().WithMessage("Site name is required")
                .MinimumLength(3).WithMessage("Site name must be at least 3 characters")
                .MaximumLength(100).WithMessage("Site name cannot exceed 100 characters")
                .Matches("^[a-zA-Z0-9\\s\\-_\\.]+$").WithMessage("Site name can only contain letters, numbers, spaces, hyphens, underscores, and dots");

            RuleFor(x => x.Location)
                .NotEmpty().WithMessage("Location is required")
                .MinimumLength(2).WithMessage("Location must be at least 2 characters")
                .MaximumLength(200).WithMessage("Location cannot exceed 200 characters")
                .Matches("^[a-zA-Z0-9\\s\\-_,\\.]+$").WithMessage("Location can only contain letters, numbers, spaces, hyphens, underscores, commas, and dots");

            RuleFor(x => x.Address)
                .NotEmpty().WithMessage("Address is required")
                .MinimumLength(10).WithMessage("Address must be at least 10 characters")
                .MaximumLength(500).WithMessage("Address cannot exceed 500 characters")
                .Matches("^[a-zA-Z0-9\\s\\-_,\\.#]+$").WithMessage("Address can only contain letters, numbers, spaces, hyphens, underscores, commas, dots, and hash symbols");
        }
    }

    public class SiteSearchDtoValidator : AbstractValidator<SiteSearchDto>
    {
        public SiteSearchDtoValidator()
        {
            RuleFor(x => x.Page)
                .GreaterThan(0).WithMessage("Page must be greater than 0")
                .LessThanOrEqualTo(1000).WithMessage("Page number cannot exceed 1000");

            RuleFor(x => x.PageSize)
                .GreaterThan(0).WithMessage("Page size must be greater than 0")
                .LessThanOrEqualTo(100).WithMessage("Page size cannot exceed 100");

            RuleFor(x => x.Name)
                .MaximumLength(100).WithMessage("Search name cannot exceed 100 characters")
                .When(x => !string.IsNullOrEmpty(x.Name));

            RuleFor(x => x.Code)
                .MaximumLength(20).WithMessage("Search code cannot exceed 20 characters")
                .Matches("^[A-Z0-9]*$").WithMessage("Search code can only contain uppercase letters and numbers")
                .When(x => !string.IsNullOrEmpty(x.Code));

            RuleFor(x => x.Location)
                .MaximumLength(200).WithMessage("Search location cannot exceed 200 characters")
                .When(x => !string.IsNullOrEmpty(x.Location));
        }
    }

    public class UpdateSiteStatusDtoValidator : AbstractValidator<UpdateSiteStatusDto>
    {
        public UpdateSiteStatusDtoValidator()
        {
            RuleFor(x => x.Status)
                .IsInEnum().WithMessage("Invalid site status");

            RuleFor(x => x.Reason)
                .MaximumLength(500).WithMessage("Reason cannot exceed 500 characters")
                .When(x => !string.IsNullOrEmpty(x.Reason));
        }
    }

    public class BulkUpdateSiteStatusDtoValidator : AbstractValidator<BulkUpdateSiteStatusDto>
    {
        public BulkUpdateSiteStatusDtoValidator()
        {
            RuleFor(x => x.SiteIds)
                .NotEmpty().WithMessage("Site IDs list cannot be empty")
                .Must(ids => ids.Count <= 100).WithMessage("Cannot update more than 100 sites at once");

            RuleFor(x => x.Status)
                .IsInEnum().WithMessage("Invalid site status");

            RuleFor(x => x.Reason)
                .MaximumLength(500).WithMessage("Reason cannot exceed 500 characters")
                .When(x => !string.IsNullOrEmpty(x.Reason));

            RuleForEach(x => x.SiteIds)
                .GreaterThan(0).WithMessage("Site ID must be greater than 0");
        }
    }
} 