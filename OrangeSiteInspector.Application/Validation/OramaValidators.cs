using FluentValidation;
using OrangeSiteInspector.Application.DTOs;

namespace OrangeSiteInspector.Application.Validation
{
    public class CreateOramaGroupDtoValidator : AbstractValidator<CreateOramaGroupDto>
    {
        public CreateOramaGroupDtoValidator()
        {
            RuleFor(x => x.Name)
                .NotEmpty().WithMessage("Group name is required")
                .MinimumLength(2).WithMessage("Group name must be at least 2 characters")
                .MaximumLength(100).WithMessage("Group name cannot exceed 100 characters")
                .Matches("^[a-zA-Z0-9\\s\\-_\\.]+$").WithMessage("Group name can only contain letters, numbers, spaces, hyphens, underscores, and dots");

            RuleFor(x => x.Description)
                .MaximumLength(500).WithMessage("Description cannot exceed 500 characters")
                .When(x => !string.IsNullOrEmpty(x.Description));

            RuleFor(x => x.Priority)
                .InclusiveBetween(0, 100).WithMessage("Priority must be between 0 and 100");

            RuleFor(x => x.SortOrder)
                .GreaterThanOrEqualTo(0).WithMessage("Sort order must be 0 or greater");

            RuleFor(x => x.Category)
                .MaximumLength(50).WithMessage("Category cannot exceed 50 characters")
                .Must(BeValidCategory).WithMessage("Invalid category. Must be one of: Critical, Standard, Optional, Custom")
                .When(x => !string.IsNullOrEmpty(x.Category));

            RuleFor(x => x.Icon)
                .MaximumLength(100).WithMessage("Icon cannot exceed 100 characters")
                .When(x => !string.IsNullOrEmpty(x.Icon));

            RuleFor(x => x.Color)
                .MaximumLength(20).WithMessage("Color cannot exceed 20 characters")
                .Must(BeValidColor).WithMessage("Invalid color format. Use hex color code (e.g., #FF0000)")
                .When(x => !string.IsNullOrEmpty(x.Color));
        }

        private bool BeValidCategory(string category)
        {
            var validCategories = new[] { "Critical", "Standard", "Optional", "Custom" };
            return validCategories.Contains(category);
        }

        private bool BeValidColor(string color)
        {
            return System.Text.RegularExpressions.Regex.IsMatch(color, "^#[0-9A-Fa-f]{6}$");
        }
    }

    public class UpdateOramaGroupDtoValidator : AbstractValidator<UpdateOramaGroupDto>
    {
        public UpdateOramaGroupDtoValidator()
        {
            RuleFor(x => x.Name)
                .MinimumLength(2).WithMessage("Group name must be at least 2 characters")
                .MaximumLength(100).WithMessage("Group name cannot exceed 100 characters")
                .Matches("^[a-zA-Z0-9\\s\\-_\\.]+$").WithMessage("Group name can only contain letters, numbers, spaces, hyphens, underscores, and dots")
                .When(x => !string.IsNullOrEmpty(x.Name));

            RuleFor(x => x.Description)
                .MaximumLength(500).WithMessage("Description cannot exceed 500 characters")
                .When(x => !string.IsNullOrEmpty(x.Description));

            RuleFor(x => x.Priority)
                .InclusiveBetween(0, 100).WithMessage("Priority must be between 0 and 100")
                .When(x => x.Priority.HasValue);

            RuleFor(x => x.SortOrder)
                .GreaterThanOrEqualTo(0).WithMessage("Sort order must be 0 or greater")
                .When(x => x.SortOrder.HasValue);

            RuleFor(x => x.Category)
                .MaximumLength(50).WithMessage("Category cannot exceed 50 characters")
                .Must(BeValidCategory).WithMessage("Invalid category. Must be one of: Critical, Standard, Optional, Custom")
                .When(x => !string.IsNullOrEmpty(x.Category));

            RuleFor(x => x.Icon)
                .MaximumLength(100).WithMessage("Icon cannot exceed 100 characters")
                .When(x => !string.IsNullOrEmpty(x.Icon));

            RuleFor(x => x.Color)
                .MaximumLength(20).WithMessage("Color cannot exceed 20 characters")
                .Must(BeValidColor).WithMessage("Invalid color format. Use hex color code (e.g., #FF0000)")
                .When(x => !string.IsNullOrEmpty(x.Color));
        }

        private bool BeValidCategory(string category)
        {
            var validCategories = new[] { "Critical", "Standard", "Optional", "Custom" };
            return validCategories.Contains(category);
        }

        private bool BeValidColor(string color)
        {
            return System.Text.RegularExpressions.Regex.IsMatch(color, "^#[0-9A-Fa-f]{6}$");
        }
    }

    public class CreateOramaItemDtoValidator : AbstractValidator<CreateOramaItemDto>
    {
        public CreateOramaItemDtoValidator()
        {
            RuleFor(x => x.Name)
                .NotEmpty().WithMessage("Item name is required")
                .MinimumLength(2).WithMessage("Item name must be at least 2 characters")
                .MaximumLength(100).WithMessage("Item name cannot exceed 100 characters")
                .Matches("^[a-zA-Z0-9\\s\\-_\\.]+$").WithMessage("Item name can only contain letters, numbers, spaces, hyphens, underscores, and dots");

            RuleFor(x => x.Description)
                .MaximumLength(500).WithMessage("Description cannot exceed 500 characters")
                .When(x => !string.IsNullOrEmpty(x.Description));

            RuleFor(x => x.OramaGroupId)
                .GreaterThan(0).WithMessage("Group ID must be greater than 0");

            RuleFor(x => x.Priority)
                .InclusiveBetween(0, 100).WithMessage("Priority must be between 0 and 100");

            RuleFor(x => x.SortOrder)
                .GreaterThanOrEqualTo(0).WithMessage("Sort order must be 0 or greater");

            RuleFor(x => x.Model)
                .MaximumLength(200).WithMessage("Model cannot exceed 200 characters")
                .When(x => !string.IsNullOrEmpty(x.Model));

            RuleFor(x => x.Manufacturer)
                .MaximumLength(100).WithMessage("Manufacturer cannot exceed 100 characters")
                .When(x => !string.IsNullOrEmpty(x.Manufacturer));

            RuleFor(x => x.SerialNumber)
                .MaximumLength(50).WithMessage("Serial number cannot exceed 50 characters")
                .When(x => !string.IsNullOrEmpty(x.SerialNumber));

            RuleFor(x => x.Location)
                .MaximumLength(100).WithMessage("Location cannot exceed 100 characters")
                .When(x => !string.IsNullOrEmpty(x.Location));

            RuleFor(x => x.MaintenanceFrequency)
                .MaximumLength(50).WithMessage("Maintenance frequency cannot exceed 50 characters")
                .Must(BeValidMaintenanceFrequency).WithMessage("Invalid maintenance frequency. Must be one of: Daily, Weekly, Monthly, Quarterly, Semi-Annually, Annually, As Needed")
                .When(x => !string.IsNullOrEmpty(x.MaintenanceFrequency));

            RuleFor(x => x.ExpectedLifespanYears)
                .InclusiveBetween(1, 50).WithMessage("Expected lifespan must be between 1 and 50 years")
                .When(x => x.ExpectedLifespanYears.HasValue);

            RuleFor(x => x.MaintenanceNotes)
                .MaximumLength(200).WithMessage("Maintenance notes cannot exceed 200 characters")
                .When(x => !string.IsNullOrEmpty(x.MaintenanceNotes));

            RuleFor(x => x.Category)
                .MaximumLength(50).WithMessage("Category cannot exceed 50 characters")
                .Must(BeValidItemCategory).WithMessage("Invalid category. Must be one of: Primary, Secondary, Backup, Auxiliary")
                .When(x => !string.IsNullOrEmpty(x.Category));

            RuleFor(x => x.Icon)
                .MaximumLength(100).WithMessage("Icon cannot exceed 100 characters")
                .When(x => !string.IsNullOrEmpty(x.Icon));

            RuleFor(x => x.Color)
                .MaximumLength(20).WithMessage("Color cannot exceed 20 characters")
                .Must(BeValidColor).WithMessage("Invalid color format. Use hex color code (e.g., #FF0000)")
                .When(x => !string.IsNullOrEmpty(x.Color));

            RuleFor(x => x.Tags)
                .MaximumLength(500).WithMessage("Tags cannot exceed 500 characters")
                .Must(BeValidTags).WithMessage("Invalid tags format. Use comma-separated values")
                .When(x => !string.IsNullOrEmpty(x.Tags));
        }

        private bool BeValidMaintenanceFrequency(string frequency)
        {
            var validFrequencies = new[] { "Daily", "Weekly", "Monthly", "Quarterly", "Semi-Annually", "Annually", "As Needed" };
            return validFrequencies.Contains(frequency);
        }

        private bool BeValidItemCategory(string category)
        {
            var validCategories = new[] { "Primary", "Secondary", "Backup", "Auxiliary" };
            return validCategories.Contains(category);
        }

        private bool BeValidColor(string color)
        {
            return System.Text.RegularExpressions.Regex.IsMatch(color, "^#[0-9A-Fa-f]{6}$");
        }

        private bool BeValidTags(string tags)
        {
            if (string.IsNullOrEmpty(tags)) return true;
            var tagList = tags.Split(',', StringSplitOptions.RemoveEmptyEntries);
            return tagList.All(tag => tag.Trim().Length <= 50);
        }
    }

    public class UpdateOramaItemDtoValidator : AbstractValidator<UpdateOramaItemDto>
    {
        public UpdateOramaItemDtoValidator()
        {
            RuleFor(x => x.Name)
                .MinimumLength(2).WithMessage("Item name must be at least 2 characters")
                .MaximumLength(100).WithMessage("Item name cannot exceed 100 characters")
                .Matches("^[a-zA-Z0-9\\s\\-_\\.]+$").WithMessage("Item name can only contain letters, numbers, spaces, hyphens, underscores, and dots")
                .When(x => !string.IsNullOrEmpty(x.Name));

            RuleFor(x => x.Description)
                .MaximumLength(500).WithMessage("Description cannot exceed 500 characters")
                .When(x => !string.IsNullOrEmpty(x.Description));

            RuleFor(x => x.OramaGroupId)
                .GreaterThan(0).WithMessage("Group ID must be greater than 0")
                .When(x => x.OramaGroupId.HasValue);

            RuleFor(x => x.Priority)
                .InclusiveBetween(0, 100).WithMessage("Priority must be between 0 and 100")
                .When(x => x.Priority.HasValue);

            RuleFor(x => x.SortOrder)
                .GreaterThanOrEqualTo(0).WithMessage("Sort order must be 0 or greater")
                .When(x => x.SortOrder.HasValue);

            RuleFor(x => x.Model)
                .MaximumLength(200).WithMessage("Model cannot exceed 200 characters")
                .When(x => !string.IsNullOrEmpty(x.Model));

            RuleFor(x => x.Manufacturer)
                .MaximumLength(100).WithMessage("Manufacturer cannot exceed 100 characters")
                .When(x => !string.IsNullOrEmpty(x.Manufacturer));

            RuleFor(x => x.SerialNumber)
                .MaximumLength(50).WithMessage("Serial number cannot exceed 50 characters")
                .When(x => !string.IsNullOrEmpty(x.SerialNumber));

            RuleFor(x => x.Location)
                .MaximumLength(100).WithMessage("Location cannot exceed 100 characters")
                .When(x => !string.IsNullOrEmpty(x.Location));

            RuleFor(x => x.MaintenanceFrequency)
                .MaximumLength(50).WithMessage("Maintenance frequency cannot exceed 50 characters")
                .Must(BeValidMaintenanceFrequency).WithMessage("Invalid maintenance frequency. Must be one of: Daily, Weekly, Monthly, Quarterly, Semi-Annually, Annually, As Needed")
                .When(x => !string.IsNullOrEmpty(x.MaintenanceFrequency));

            RuleFor(x => x.ExpectedLifespanYears)
                .InclusiveBetween(1, 50).WithMessage("Expected lifespan must be between 1 and 50 years")
                .When(x => x.ExpectedLifespanYears.HasValue);

            RuleFor(x => x.MaintenanceNotes)
                .MaximumLength(200).WithMessage("Maintenance notes cannot exceed 200 characters")
                .When(x => !string.IsNullOrEmpty(x.MaintenanceNotes));

            RuleFor(x => x.Category)
                .MaximumLength(50).WithMessage("Category cannot exceed 50 characters")
                .Must(BeValidItemCategory).WithMessage("Invalid category. Must be one of: Primary, Secondary, Backup, Auxiliary")
                .When(x => !string.IsNullOrEmpty(x.Category));

            RuleFor(x => x.Icon)
                .MaximumLength(100).WithMessage("Icon cannot exceed 100 characters")
                .When(x => !string.IsNullOrEmpty(x.Icon));

            RuleFor(x => x.Color)
                .MaximumLength(20).WithMessage("Color cannot exceed 20 characters")
                .Must(BeValidColor).WithMessage("Invalid color format. Use hex color code (e.g., #FF0000)")
                .When(x => !string.IsNullOrEmpty(x.Color));

            RuleFor(x => x.Tags)
                .MaximumLength(500).WithMessage("Tags cannot exceed 500 characters")
                .Must(BeValidTags).WithMessage("Invalid tags format. Use comma-separated values")
                .When(x => !string.IsNullOrEmpty(x.Tags));
        }

        private bool BeValidMaintenanceFrequency(string frequency)
        {
            var validFrequencies = new[] { "Daily", "Weekly", "Monthly", "Quarterly", "Semi-Annually", "Annually", "As Needed" };
            return validFrequencies.Contains(frequency);
        }

        private bool BeValidItemCategory(string category)
        {
            var validCategories = new[] { "Primary", "Secondary", "Backup", "Auxiliary" };
            return validCategories.Contains(category);
        }

        private bool BeValidColor(string color)
        {
            return System.Text.RegularExpressions.Regex.IsMatch(color, "^#[0-9A-Fa-f]{6}$");
        }

        private bool BeValidTags(string tags)
        {
            if (string.IsNullOrEmpty(tags)) return true;
            var tagList = tags.Split(',', StringSplitOptions.RemoveEmptyEntries);
            return tagList.All(tag => tag.Trim().Length <= 50);
        }
    }

    public class OramaGroupSearchDtoValidator : AbstractValidator<OramaGroupSearchDto>
    {
        public OramaGroupSearchDtoValidator()
        {
            RuleFor(x => x.SearchTerm)
                .MaximumLength(100).WithMessage("Search term cannot exceed 100 characters")
                .When(x => !string.IsNullOrEmpty(x.SearchTerm));

            RuleFor(x => x.Category)
                .MaximumLength(50).WithMessage("Category cannot exceed 50 characters")
                .When(x => !string.IsNullOrEmpty(x.Category));

            RuleFor(x => x.MinPriority)
                .InclusiveBetween(0, 100).WithMessage("Minimum priority must be between 0 and 100")
                .When(x => x.MinPriority.HasValue);

            RuleFor(x => x.MaxPriority)
                .InclusiveBetween(0, 100).WithMessage("Maximum priority must be between 0 and 100")
                .When(x => x.MaxPriority.HasValue);

            RuleFor(x => x.MinPriority)
                .LessThanOrEqualTo(x => x.MaxPriority).WithMessage("Minimum priority must be less than or equal to maximum priority")
                .When(x => x.MinPriority.HasValue && x.MaxPriority.HasValue);

            RuleFor(x => x.CreatedFrom)
                .LessThanOrEqualTo(x => x.CreatedTo).WithMessage("Created from date must be before or equal to created to date")
                .When(x => x.CreatedFrom.HasValue && x.CreatedTo.HasValue);

            RuleFor(x => x.Page)
                .GreaterThan(0).WithMessage("Page must be greater than 0");

            RuleFor(x => x.PageSize)
                .InclusiveBetween(1, 100).WithMessage("Page size must be between 1 and 100");

            RuleFor(x => x.SortBy)
                .Must(BeValidSortField).WithMessage("Invalid sort field. Must be one of: Name, Priority, SortOrder, CreatedAt, ItemCount")
                .When(x => !string.IsNullOrEmpty(x.SortBy));
        }

        private bool BeValidSortField(string sortBy)
        {
            var validSortFields = new[] { "Name", "Priority", "SortOrder", "CreatedAt", "ItemCount" };
            return validSortFields.Contains(sortBy);
        }
    }

    public class OramaItemSearchDtoValidator : AbstractValidator<OramaItemSearchDto>
    {
        public OramaItemSearchDtoValidator()
        {
            RuleFor(x => x.SearchTerm)
                .MaximumLength(100).WithMessage("Search term cannot exceed 100 characters")
                .When(x => !string.IsNullOrEmpty(x.SearchTerm));

            RuleFor(x => x.GroupId)
                .GreaterThan(0).WithMessage("Group ID must be greater than 0")
                .When(x => x.GroupId.HasValue);

            RuleFor(x => x.Category)
                .MaximumLength(50).WithMessage("Category cannot exceed 50 characters")
                .When(x => !string.IsNullOrEmpty(x.Category));

            RuleFor(x => x.Manufacturer)
                .MaximumLength(100).WithMessage("Manufacturer cannot exceed 100 characters")
                .When(x => !string.IsNullOrEmpty(x.Manufacturer));

            RuleFor(x => x.Location)
                .MaximumLength(100).WithMessage("Location cannot exceed 100 characters")
                .When(x => !string.IsNullOrEmpty(x.Location));

            RuleFor(x => x.MaintenanceFrequency)
                .MaximumLength(50).WithMessage("Maintenance frequency cannot exceed 50 characters")
                .When(x => !string.IsNullOrEmpty(x.MaintenanceFrequency));

            RuleFor(x => x.MinPriority)
                .InclusiveBetween(0, 100).WithMessage("Minimum priority must be between 0 and 100")
                .When(x => x.MinPriority.HasValue);

            RuleFor(x => x.MaxPriority)
                .InclusiveBetween(0, 100).WithMessage("Maximum priority must be between 0 and 100")
                .When(x => x.MaxPriority.HasValue);

            RuleFor(x => x.MinPriority)
                .LessThanOrEqualTo(x => x.MaxPriority).WithMessage("Minimum priority must be less than or equal to maximum priority")
                .When(x => x.MinPriority.HasValue && x.MaxPriority.HasValue);

            RuleFor(x => x.CreatedFrom)
                .LessThanOrEqualTo(x => x.CreatedTo).WithMessage("Created from date must be before or equal to created to date")
                .When(x => x.CreatedFrom.HasValue && x.CreatedTo.HasValue);

            RuleFor(x => x.Page)
                .GreaterThan(0).WithMessage("Page must be greater than 0");

            RuleFor(x => x.PageSize)
                .InclusiveBetween(1, 100).WithMessage("Page size must be between 1 and 100");

            RuleFor(x => x.SortBy)
                .Must(BeValidSortField).WithMessage("Invalid sort field. Must be one of: Name, Priority, SortOrder, CreatedAt, Manufacturer, Location")
                .When(x => !string.IsNullOrEmpty(x.SortBy));
        }

        private bool BeValidSortField(string sortBy)
        {
            var validSortFields = new[] { "Name", "Priority", "SortOrder", "CreatedAt", "Manufacturer", "Location" };
            return validSortFields.Contains(sortBy);
        }
    }

    public class BulkOramaGroupOperationDtoValidator : AbstractValidator<BulkOramaGroupOperationDto>
    {
        public BulkOramaGroupOperationDtoValidator()
        {
            RuleFor(x => x.GroupIds)
                .NotEmpty().WithMessage("Group IDs list cannot be empty")
                .Must(x => x.Count <= 100).WithMessage("Cannot perform bulk operation on more than 100 groups at once");

            RuleFor(x => x.Operation)
                .NotEmpty().WithMessage("Operation is required")
                .Must(BeValidOperation).WithMessage("Invalid operation. Must be one of: activate, deactivate, delete, update-priority, update-category");
        }

        private bool BeValidOperation(string operation)
        {
            var validOperations = new[] { "activate", "deactivate", "delete", "update-priority", "update-category" };
            return validOperations.Contains(operation.ToLower());
        }
    }

    public class BulkOramaItemOperationDtoValidator : AbstractValidator<BulkOramaItemOperationDto>
    {
        public BulkOramaItemOperationDtoValidator()
        {
            RuleFor(x => x.ItemIds)
                .NotEmpty().WithMessage("Item IDs list cannot be empty")
                .Must(x => x.Count <= 100).WithMessage("Cannot perform bulk operation on more than 100 items at once");

            RuleFor(x => x.Operation)
                .NotEmpty().WithMessage("Operation is required")
                .Must(BeValidOperation).WithMessage("Invalid operation. Must be one of: activate, deactivate, delete, move-group, update-priority, update-category");
        }

        private bool BeValidOperation(string operation)
        {
            var validOperations = new[] { "activate", "deactivate", "delete", "move-group", "update-priority", "update-category" };
            return validOperations.Contains(operation.ToLower());
        }
    }
}
 