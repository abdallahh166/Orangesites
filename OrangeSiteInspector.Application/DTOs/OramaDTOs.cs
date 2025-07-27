using OrangeSiteInspector.Domain.Enums;

namespace OrangeSiteInspector.Application.DTOs
{
    // Enhanced Group DTOs
    public class OramaGroupDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public bool IsActive { get; set; }
        public bool IsDefault { get; set; }
        public int Priority { get; set; }
        public int SortOrder { get; set; }
        public string? Category { get; set; }
        public string? Icon { get; set; }
        public string? Color { get; set; }
        public int ItemCount { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }

    public class OramaGroupDetailDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public bool IsActive { get; set; }
        public bool IsDefault { get; set; }
        public int Priority { get; set; }
        public int SortOrder { get; set; }
        public string? Category { get; set; }
        public string? Icon { get; set; }
        public string? Color { get; set; }
        public int ItemCount { get; set; }
        public List<OramaItemDto> Items { get; set; } = new List<OramaItemDto>();
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }

    public class CreateOramaGroupDto
    {
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public bool IsActive { get; set; } = true;
        public bool IsDefault { get; set; } = false;
        public int Priority { get; set; } = 0;
        public int SortOrder { get; set; } = 0;
        public string? Category { get; set; }
        public string? Icon { get; set; }
        public string? Color { get; set; }
    }

    public class UpdateOramaGroupDto
    {
        public string? Name { get; set; }
        public string? Description { get; set; }
        public bool? IsActive { get; set; }
        public bool? IsDefault { get; set; }
        public int? Priority { get; set; }
        public int? SortOrder { get; set; }
        public string? Category { get; set; }
        public string? Icon { get; set; }
        public string? Color { get; set; }
    }

    // Enhanced Item DTOs
    public class OramaItemDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public int OramaGroupId { get; set; }
        public string OramaGroupName { get; set; } = string.Empty;
        public bool IsActive { get; set; }
        public bool IsRequired { get; set; }
        public bool IsCritical { get; set; }
        public int Priority { get; set; }
        public int SortOrder { get; set; }
        public string? Model { get; set; }
        public string? Manufacturer { get; set; }
        public string? SerialNumber { get; set; }
        public string? Location { get; set; }
        public string? MaintenanceFrequency { get; set; }
        public int? ExpectedLifespanYears { get; set; }
        public string? MaintenanceNotes { get; set; }
        public string? Category { get; set; }
        public string? Icon { get; set; }
        public string? Color { get; set; }
        public string? Tags { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }

    public class CreateOramaItemDto
    {
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public int OramaGroupId { get; set; }
        public bool IsActive { get; set; } = true;
        public bool IsRequired { get; set; } = true;
        public bool IsCritical { get; set; } = false;
        public int Priority { get; set; } = 0;
        public int SortOrder { get; set; } = 0;
        public string? Model { get; set; }
        public string? Manufacturer { get; set; }
        public string? SerialNumber { get; set; }
        public string? Location { get; set; }
        public string? MaintenanceFrequency { get; set; }
        public int? ExpectedLifespanYears { get; set; }
        public string? MaintenanceNotes { get; set; }
        public string? Category { get; set; }
        public string? Icon { get; set; }
        public string? Color { get; set; }
        public string? Tags { get; set; }
    }

    public class UpdateOramaItemDto
    {
        public string? Name { get; set; }
        public string? Description { get; set; }
        public int? OramaGroupId { get; set; }
        public bool? IsActive { get; set; }
        public bool? IsRequired { get; set; }
        public bool? IsCritical { get; set; }
        public int? Priority { get; set; }
        public int? SortOrder { get; set; }
        public string? Model { get; set; }
        public string? Manufacturer { get; set; }
        public string? SerialNumber { get; set; }
        public string? Location { get; set; }
        public string? MaintenanceFrequency { get; set; }
        public int? ExpectedLifespanYears { get; set; }
        public string? MaintenanceNotes { get; set; }
        public string? Category { get; set; }
        public string? Icon { get; set; }
        public string? Color { get; set; }
        public string? Tags { get; set; }
    }

    // Search and Filter DTOs
    public class OramaGroupSearchDto
    {
        public string? SearchTerm { get; set; }
        public bool? IsActive { get; set; }
        public string? Category { get; set; }
        public int? MinPriority { get; set; }
        public int? MaxPriority { get; set; }
        public DateTime? CreatedFrom { get; set; }
        public DateTime? CreatedTo { get; set; }
        public int Page { get; set; } = 1;
        public int PageSize { get; set; } = 10;
        public string SortBy { get; set; } = "Name";
        public bool SortDescending { get; set; } = false;
    }

    public class OramaItemSearchDto
    {
        public string? SearchTerm { get; set; }
        public int? GroupId { get; set; }
        public bool? IsActive { get; set; }
        public bool? IsRequired { get; set; }
        public bool? IsCritical { get; set; }
        public string? Category { get; set; }
        public string? Manufacturer { get; set; }
        public string? Location { get; set; }
        public string? MaintenanceFrequency { get; set; }
        public int? MinPriority { get; set; }
        public int? MaxPriority { get; set; }
        public DateTime? CreatedFrom { get; set; }
        public DateTime? CreatedTo { get; set; }
        public int Page { get; set; } = 1;
        public int PageSize { get; set; } = 10;
        public string SortBy { get; set; } = "Name";
        public bool SortDescending { get; set; } = false;
    }

    // Statistics and Analytics DTOs
    public class OramaStatisticsDto
    {
        public int TotalGroups { get; set; }
        public int ActiveGroups { get; set; }
        public int TotalItems { get; set; }
        public int ActiveItems { get; set; }
        public int CriticalItems { get; set; }
        public int RequiredItems { get; set; }
        public Dictionary<string, int> ItemsByCategory { get; set; } = new();
        public Dictionary<string, int> ItemsByManufacturer { get; set; } = new();
        public Dictionary<string, int> ItemsByMaintenanceFrequency { get; set; } = new();
        public int NewGroupsThisMonth { get; set; }
        public int NewItemsThisMonth { get; set; }
        public List<OramaGroupDto> TopGroupsByItemCount { get; set; } = new();
    }

    public class OramaItemAnalyticsDto
    {
        public int ItemId { get; set; }
        public string ItemName { get; set; } = string.Empty;
        public string GroupName { get; set; } = string.Empty;
        public int VisitCount { get; set; }
        public int IssueCount { get; set; }
        public double AverageInspectionTime { get; set; }
        public DateTime? LastInspectionDate { get; set; }
        public string? LastInspectedBy { get; set; }
        public bool IsOverdue { get; set; }
        public int DaysSinceLastInspection { get; set; }
    }

    // Bulk Operations DTOs
    public class BulkOramaGroupOperationDto
    {
        public List<int> GroupIds { get; set; } = new();
        public string Operation { get; set; } = string.Empty; // "activate", "deactivate", "delete", "update-priority"
        public Dictionary<string, object>? Parameters { get; set; }
    }

    public class BulkOramaItemOperationDto
    {
        public List<int> ItemIds { get; set; } = new();
        public string Operation { get; set; } = string.Empty; // "activate", "deactivate", "delete", "move-group", "update-priority"
        public Dictionary<string, object>? Parameters { get; set; }
    }

    // Import/Export DTOs
    public class OramaGroupImportDto
    {
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public bool IsActive { get; set; } = true;
        public int Priority { get; set; } = 0;
        public string? Category { get; set; }
        public string? Icon { get; set; }
        public string? Color { get; set; }
        public List<OramaItemImportDto> Items { get; set; } = new();
    }

    public class OramaItemImportDto
    {
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public bool IsActive { get; set; } = true;
        public bool IsRequired { get; set; } = true;
        public bool IsCritical { get; set; } = false;
        public int Priority { get; set; } = 0;
        public string? Model { get; set; }
        public string? Manufacturer { get; set; }
        public string? Location { get; set; }
        public string? MaintenanceFrequency { get; set; }
        public int? ExpectedLifespanYears { get; set; }
        public string? Category { get; set; }
        public string? Tags { get; set; }
    }

    // Legacy DTOs for backward compatibility
    public class CreateOramaItemRequest
    {
        public string Name { get; set; } = string.Empty;
        public int GroupId { get; set; }
    }

    public class UpdateOramaItemRequest
    {
        public string Name { get; set; } = string.Empty;
        public int GroupId { get; set; }
    }
} 