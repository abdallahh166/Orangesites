using FluentValidation;
using OrangeSiteInspector.Application.DTOs;
using OrangeSiteInspector.Domain.Enums;
using Microsoft.AspNetCore.Http;

namespace OrangeSiteInspector.Application.Validation
{
    public class CreateVisitDtoValidator : AbstractValidator<CreateVisitDto>
    {
        public CreateVisitDtoValidator()
        {
            RuleFor(x => x.SiteId)
                .GreaterThan(0).WithMessage("Site ID must be greater than 0");

            RuleFor(x => x.UserId)
                .NotEmpty().WithMessage("User ID is required")
                .MaximumLength(450).WithMessage("User ID cannot exceed 450 characters");

            RuleFor(x => x.Status)
                .IsInEnum().WithMessage("Invalid visit status")
                .Must(status => status == VisitStatus.Pending)
                .WithMessage("New visits must have Pending status");
        }
    }

    public class UpdateVisitStatusDtoValidator : AbstractValidator<UpdateVisitStatusDto>
    {
        public UpdateVisitStatusDtoValidator()
        {
            RuleFor(x => x.Status)
                .IsInEnum().WithMessage("Invalid visit status")
                .Must(status => status != VisitStatus.Pending)
                .WithMessage("Cannot set status to Pending during update");
        }
    }

    public class CreateVisitComponentDtoValidator : AbstractValidator<CreateVisitComponentDto>
    {
        public CreateVisitComponentDtoValidator()
        {
            RuleFor(x => x.VisitId)
                .GreaterThan(0).WithMessage("Visit ID must be greater than 0");

            RuleFor(x => x.OramaItemId)
                .GreaterThan(0).WithMessage("Orama item ID must be greater than 0");

            RuleFor(x => x.Comment)
                .MaximumLength(1000).WithMessage("Comment cannot exceed 1000 characters")
                .When(x => !string.IsNullOrEmpty(x.Comment));
        }
    }

    public class UpdateVisitComponentDtoValidator : AbstractValidator<UpdateVisitComponentDto>
    {
        public UpdateVisitComponentDtoValidator()
        {
            RuleFor(x => x.VisitId)
                .GreaterThan(0).WithMessage("Visit ID must be greater than 0");

            RuleFor(x => x.Comment)
                .MaximumLength(1000).WithMessage("Comment cannot exceed 1000 characters")
                .When(x => !string.IsNullOrEmpty(x.Comment));
        }
    }

    public class BulkCreateVisitComponentsDtoValidator : AbstractValidator<BulkCreateVisitComponentsDto>
    {
        public BulkCreateVisitComponentsDtoValidator()
        {
            RuleFor(x => x.VisitId)
                .GreaterThan(0).WithMessage("Visit ID must be greater than 0");

            RuleFor(x => x.Components)
                .NotEmpty().WithMessage("At least one component is required")
                .Must(x => x.Count <= 50).WithMessage("Cannot add more than 50 components at once")
                .Must(x => x.Count > 0).WithMessage("At least one component must be provided");

            RuleForEach(x => x.Components).SetValidator(new CreateVisitComponentDtoValidator());
        }
    }

    public class VisitSearchDtoValidator : AbstractValidator<VisitSearchDto>
    {
        public VisitSearchDtoValidator()
        {
            RuleFor(x => x.Page)
                .GreaterThan(0).WithMessage("Page must be greater than 0")
                .LessThanOrEqualTo(1000).WithMessage("Page number cannot exceed 1000");

            RuleFor(x => x.PageSize)
                .GreaterThan(0).WithMessage("Page size must be greater than 0")
                .LessThanOrEqualTo(100).WithMessage("Page size cannot exceed 100");

            RuleFor(x => x.StartDate)
                .LessThanOrEqualTo(x => x.EndDate)
                .When(x => x.StartDate.HasValue && x.EndDate.HasValue)
                .WithMessage("Start date must be less than or equal to end date");

            RuleFor(x => x.StartDate)
                .GreaterThan(DateTime.MinValue)
                .When(x => x.StartDate.HasValue)
                .WithMessage("Start date is invalid");

            RuleFor(x => x.EndDate)
                .LessThan(DateTime.MaxValue)
                .When(x => x.EndDate.HasValue)
                .WithMessage("End date is invalid");

            RuleFor(x => x.SiteId)
                .GreaterThan(0)
                .When(x => x.SiteId.HasValue)
                .WithMessage("Site ID must be greater than 0");

            RuleFor(x => x.Status)
                .IsInEnum()
                .When(x => x.Status.HasValue)
                .WithMessage("Invalid visit status");

            RuleFor(x => x.UserId)
                .MaximumLength(450)
                .When(x => !string.IsNullOrEmpty(x.UserId))
                .WithMessage("User ID cannot exceed 450 characters");
        }
    }

    public class UploadComponentImageDtoValidator : AbstractValidator<UploadComponentImageDto>
    {
        public UploadComponentImageDtoValidator()
        {
            RuleFor(x => x.ComponentId)
                .GreaterThan(0).WithMessage("Component ID must be greater than 0");

            RuleFor(x => x.ImageType)
                .NotEmpty().WithMessage("Image type is required")
                .Must(type => type.ToLower() == "before" || type.ToLower() == "after")
                .WithMessage("Image type must be 'before' or 'after'");

            RuleFor(x => x.Image)
                .NotNull().WithMessage("Image file is required")
                .Must(image => image != null && image.Length > 0)
                .WithMessage("Image file cannot be empty")
                .Must(image => image != null && image.Length <= 10 * 1024 * 1024)
                .WithMessage("Image file size cannot exceed 10MB")
                .Must(image => image != null && IsValidImageType(image))
                .WithMessage("Invalid image format. Only JPG, PNG, and GIF are allowed");
        }

        private bool IsValidImageType(IFormFile file)
        {
            if (file == null) return false;
            
            var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif" };
            var fileExtension = Path.GetExtension(file.FileName).ToLowerInvariant();
            return allowedExtensions.Contains(fileExtension);
        }
    }

    public class BulkUploadImagesDtoValidator : AbstractValidator<BulkUploadImagesDto>
    {
        public BulkUploadImagesDtoValidator()
        {
            RuleFor(x => x.VisitId)
                .GreaterThan(0).WithMessage("Visit ID must be greater than 0");

            RuleFor(x => x.Components)
                .NotEmpty().WithMessage("At least one component is required")
                .Must(x => x.Count <= 20).WithMessage("Cannot upload images for more than 20 components at once");

            RuleForEach(x => x.Components).SetValidator(new ComponentImageUploadDtoValidator());
        }
    }

    public class ComponentImageUploadDtoValidator : AbstractValidator<ComponentImageUploadDto>
    {
        public ComponentImageUploadDtoValidator()
        {
            RuleFor(x => x.ComponentId)
                .GreaterThan(0).WithMessage("Component ID must be greater than 0");

            RuleFor(x => x.Comment)
                .MaximumLength(1000).WithMessage("Comment cannot exceed 1000 characters")
                .When(x => !string.IsNullOrEmpty(x.Comment));

            RuleFor(x => x.BeforeImage)
                .Must(image => image == null || IsValidImage(image))
                .WithMessage("Invalid before image format. Only JPG, PNG, and GIF are allowed")
                .Must(image => image == null || image.Length <= 10 * 1024 * 1024)
                .WithMessage("Before image file size cannot exceed 10MB");

            RuleFor(x => x.AfterImage)
                .Must(image => image == null || IsValidImage(image))
                .WithMessage("Invalid after image format. Only JPG, PNG, and GIF are allowed")
                .Must(image => image == null || image.Length <= 10 * 1024 * 1024)
                .WithMessage("After image file size cannot exceed 10MB");
        }

        private bool IsValidImage(IFormFile file)
        {
            if (file == null) return false;
            
            var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif" };
            var fileExtension = Path.GetExtension(file.FileName).ToLowerInvariant();
            return allowedExtensions.Contains(fileExtension);
        }
    }
} 