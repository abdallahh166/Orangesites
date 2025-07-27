using OrangeSiteInspector.Domain.Enums;
using Microsoft.AspNetCore.Http;

namespace OrangeSiteInspector.Application.DTOs
{
    public class VisitComponentDto
    {
        public int Id { get; set; }
        public int VisitId { get; set; }
        public int OramaItemId { get; set; }
        public string? BeforeImagePath { get; set; }
        public string? AfterImagePath { get; set; }
        public string? Comment { get; set; }
        public string OramaItemName { get; set; } = string.Empty;
        public string OramaGroupName { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }

    public class CreateVisitComponentDto
    {
        public int VisitId { get; set; }
        public int OramaItemId { get; set; }
        public string? Comment { get; set; }
    }

    public class UpdateVisitComponentDto
    {
        public int VisitId { get; set; }
        public string? Comment { get; set; }
    }

    public class UploadComponentImageDto
    {
        public int ComponentId { get; set; }
        public string ImageType { get; set; } = string.Empty; // "before" or "after"
        public IFormFile Image { get; set; } = null!;
    }

    public class ComponentImageDto
    {
        public int ComponentId { get; set; }
        public string? BeforeImagePath { get; set; }
        public string? AfterImagePath { get; set; }
        public string? Comment { get; set; }
        public string OramaItemName { get; set; } = string.Empty;
        public string OramaGroupName { get; set; } = string.Empty;
    }

    public class VisitReportDto
    {
        public int VisitId { get; set; }
        public string SiteName { get; set; } = string.Empty;
        public string SiteCode { get; set; } = string.Empty;
        public string SiteAddress { get; set; } = string.Empty;
        public string EngineerName { get; set; } = string.Empty;
        public DateTime VisitDate { get; set; }
        public VisitStatus Status { get; set; }
        public string? VisitNotes { get; set; }
        public List<ComponentImageDto> Components { get; set; } = new();
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }

    public class VisitFinalReportDto
    {
        public int VisitId { get; set; }
        public string SiteName { get; set; } = string.Empty;
        public string SiteCode { get; set; } = string.Empty;
        public string SiteAddress { get; set; } = string.Empty;
        public string EngineerName { get; set; } = string.Empty;
        public DateTime VisitDate { get; set; }
        public VisitStatus Status { get; set; }
        public string? VisitNotes { get; set; }
        public List<ComponentFinalImageDto> Components { get; set; } = new();
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }

    public class ComponentFinalImageDto
    {
        public int ComponentId { get; set; }
        public string? AfterImagePath { get; set; }
        public string? Comment { get; set; }
        public string OramaItemName { get; set; } = string.Empty;
        public string OramaGroupName { get; set; } = string.Empty;
    }

    public class BulkUploadImagesDto
    {
        public int VisitId { get; set; }
        public List<ComponentImageUploadDto> Components { get; set; } = new List<ComponentImageUploadDto>();
    }

    public class BulkCreateVisitComponentsDto
    {
        public int VisitId { get; set; }
        public List<CreateVisitComponentDto> Components { get; set; } = new List<CreateVisitComponentDto>();
    }

    public class ComponentImageUploadDto
    {
        public int ComponentId { get; set; }
        public IFormFile? BeforeImage { get; set; }
        public IFormFile? AfterImage { get; set; }
        public string? Comment { get; set; }
    }

    public class VisitComponentReportDto
    {
        public int VisitId { get; set; }
        public string SiteName { get; set; } = string.Empty;
        public string SiteCode { get; set; } = string.Empty;
        public string SiteAddress { get; set; } = string.Empty;
        public string EngineerName { get; set; } = string.Empty;
        public DateTime VisitDate { get; set; }
        public VisitStatus Status { get; set; }
        public string? VisitNotes { get; set; }
        public List<ComponentImageDto> Components { get; set; } = new();
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }
} 