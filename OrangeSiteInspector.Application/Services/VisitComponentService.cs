using AutoMapper;
using Microsoft.AspNetCore.Http;
using OrangeSiteInspector.Application.DTOs;
using OrangeSiteInspector.Application.Interfaces;
using OrangeSiteInspector.Domain.Entities;
using OrangeSiteInspector.Domain.Enums;
using OrangeSiteInspector.Infrastructure.Repositories;
using System.Security.Claims;

namespace OrangeSiteInspector.Application.Services
{
    public class VisitComponentService : IVisitComponentService
    {
        private readonly IGenericRepository<VisitComponent> _componentRepository;
        private readonly IGenericRepository<Visit> _visitRepository;
        private readonly IGenericRepository<Site> _siteRepository;
        private readonly IGenericRepository<User> _userRepository;
        private readonly IGenericRepository<OramaItem> _oramaItemRepository;
        private readonly IMapper _mapper;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public VisitComponentService(
            IGenericRepository<VisitComponent> componentRepository,
            IGenericRepository<Visit> visitRepository,
            IGenericRepository<Site> siteRepository,
            IGenericRepository<User> userRepository,
            IGenericRepository<OramaItem> oramaItemRepository,
            IMapper mapper,
            IHttpContextAccessor httpContextAccessor)
        {
            _componentRepository = componentRepository;
            _visitRepository = visitRepository;
            _siteRepository = siteRepository;
            _userRepository = userRepository;
            _oramaItemRepository = oramaItemRepository;
            _mapper = mapper;
            _httpContextAccessor = httpContextAccessor;
        }

        public async Task<ApiResponseDto<List<VisitComponentDto>>> GetByVisitIdAsync(int visitId)
        {
            var components = await _componentRepository.FindAsync(c => c.VisitId == visitId);
            var componentDtos = new List<VisitComponentDto>();

            foreach (var component in components)
            {
                var oramaItem = await _oramaItemRepository.GetByIdAsync(component.OramaItemId);
                var componentDto = _mapper.Map<VisitComponentDto>(component);
                componentDto.OramaItemName = oramaItem?.Name ?? string.Empty;
                componentDto.OramaGroupName = oramaItem?.OramaGroup?.Name ?? string.Empty;
                componentDtos.Add(componentDto);
            }

            return ApiResponseDto<List<VisitComponentDto>>.SuccessResult(componentDtos);
        }

        public async Task<ApiResponseDto<VisitComponentDto>> GetByIdAsync(int componentId)
        {
            var component = await _componentRepository.GetByIdAsync(componentId);
            if (component == null)
            {
                return ApiResponseDto<VisitComponentDto>.ErrorResult("Component not found");
            }

            var oramaItem = await _oramaItemRepository.GetByIdAsync(component.OramaItemId);
            var componentDto = _mapper.Map<VisitComponentDto>(component);
            componentDto.OramaItemName = oramaItem?.Name ?? string.Empty;
            componentDto.OramaGroupName = oramaItem?.OramaGroup?.Name ?? string.Empty;

            return ApiResponseDto<VisitComponentDto>.SuccessResult(componentDto);
        }

        public async Task<ApiResponseDto<VisitComponentDto>> CreateAsync(CreateVisitComponentDto createDto)
        {
            // Check if user can access this visit
            if (!await CanAccessVisit(createDto.VisitId))
            {
                return ApiResponseDto<VisitComponentDto>.ErrorResult("Access denied");
            }

            var component = _mapper.Map<VisitComponent>(createDto);
            component.CreatedAt = DateTime.UtcNow;

            var createdComponent = await _componentRepository.AddAsync(component);
            var oramaItem = await _oramaItemRepository.GetByIdAsync(component.OramaItemId);
            
            var componentDto = _mapper.Map<VisitComponentDto>(createdComponent);
            componentDto.OramaItemName = oramaItem?.Name ?? string.Empty;
            componentDto.OramaGroupName = oramaItem?.OramaGroup?.Name ?? string.Empty;

            return ApiResponseDto<VisitComponentDto>.SuccessResult(componentDto);
        }

        public async Task<ApiResponseDto<VisitComponentDto>> UpdateAsync(int componentId, UpdateVisitComponentDto updateDto)
        {
            var component = await _componentRepository.GetByIdAsync(componentId);
            if (component == null)
            {
                return ApiResponseDto<VisitComponentDto>.ErrorResult("Component not found");
            }

            // Check if user can access this component
            if (!await CanAccessComponent(componentId))
            {
                return ApiResponseDto<VisitComponentDto>.ErrorResult("Access denied");
            }

            // Check if visit is approved (read-only)
            var visit = await _visitRepository.GetByIdAsync(component.VisitId);
            if (visit?.Status == VisitStatus.Accepted)
            {
                return ApiResponseDto<VisitComponentDto>.ErrorResult("Cannot update components of approved visits");
            }

            component.Comment = updateDto.Comment;
            component.UpdatedAt = DateTime.UtcNow;

            await _componentRepository.UpdateAsync(component);
            var oramaItem = await _oramaItemRepository.GetByIdAsync(component.OramaItemId);
            
            var componentDto = _mapper.Map<VisitComponentDto>(component);
            componentDto.OramaItemName = oramaItem?.Name ?? string.Empty;
            componentDto.OramaGroupName = oramaItem?.OramaGroup?.Name ?? string.Empty;

            return ApiResponseDto<VisitComponentDto>.SuccessResult(componentDto);
        }

        public async Task<ApiResponseDto<bool>> DeleteAsync(int componentId)
        {
            var component = await _componentRepository.GetByIdAsync(componentId);
            if (component == null)
            {
                return ApiResponseDto<bool>.ErrorResult("Component not found");
            }

            // Check if user can access this component
            if (!await CanAccessComponent(componentId))
            {
                return ApiResponseDto<bool>.ErrorResult("Access denied");
            }

            // Check if visit is approved (read-only)
            var visit = await _visitRepository.GetByIdAsync(component.VisitId);
            if (visit?.Status == VisitStatus.Accepted)
            {
                return ApiResponseDto<bool>.ErrorResult("Cannot delete components of approved visits");
            }

            await _componentRepository.DeleteAsync(component);
            return ApiResponseDto<bool>.SuccessResult(true);
        }

        public async Task<ApiResponseDto<VisitComponentDto>> UploadImageAsync(UploadComponentImageDto uploadDto)
        {
            var component = await _componentRepository.GetByIdAsync(uploadDto.ComponentId);
            if (component == null)
            {
                return ApiResponseDto<VisitComponentDto>.ErrorResult("Component not found");
            }

            // Check if user can access this component
            if (!await CanAccessComponent(uploadDto.ComponentId))
            {
                return ApiResponseDto<VisitComponentDto>.ErrorResult("Access denied");
            }

            // Check if visit is approved (read-only)
            var visit = await _visitRepository.GetByIdAsync(component.VisitId);
            if (visit?.Status == VisitStatus.Accepted)
            {
                return ApiResponseDto<VisitComponentDto>.ErrorResult("Cannot upload images to approved visits");
            }

            // Validate image type
            if (uploadDto.ImageType.ToLower() != "before" && uploadDto.ImageType.ToLower() != "after")
            {
                return ApiResponseDto<VisitComponentDto>.ErrorResult("Image type must be 'before' or 'after'");
            }

            // Save image to disk
            var imagePath = await SaveImageToDisk(uploadDto.Image, component.VisitId, uploadDto.ComponentId, uploadDto.ImageType);
            if (string.IsNullOrEmpty(imagePath))
            {
                return ApiResponseDto<VisitComponentDto>.ErrorResult("Failed to save image");
            }

            // Update component with image path
            if (uploadDto.ImageType.ToLower() == "before")
            {
                component.BeforeImagePath = imagePath;
            }
            else
            {
                component.AfterImagePath = imagePath;
            }

            component.UpdatedAt = DateTime.UtcNow;
            await _componentRepository.UpdateAsync(component);

            var oramaItem = await _oramaItemRepository.GetByIdAsync(component.OramaItemId);
            var componentDto = _mapper.Map<VisitComponentDto>(component);
            componentDto.OramaItemName = oramaItem?.Name ?? string.Empty;
            componentDto.OramaGroupName = oramaItem?.OramaGroup?.Name ?? string.Empty;

            return ApiResponseDto<VisitComponentDto>.SuccessResult(componentDto);
        }

        public async Task<ApiResponseDto<bool>> BulkUploadImagesAsync(BulkUploadImagesDto bulkUploadDto)
        {
            // Check if user can access this visit
            if (!await CanAccessVisit(bulkUploadDto.VisitId))
            {
                return ApiResponseDto<bool>.ErrorResult("Access denied");
            }

            // Check if visit is approved (read-only)
            var visit = await _visitRepository.GetByIdAsync(bulkUploadDto.VisitId);
            if (visit?.Status == VisitStatus.Accepted)
            {
                return ApiResponseDto<bool>.ErrorResult("Cannot upload images to approved visits");
            }

            foreach (var componentUpload in bulkUploadDto.Components)
            {
                var component = await _componentRepository.GetByIdAsync(componentUpload.ComponentId);
                if (component == null || component.VisitId != bulkUploadDto.VisitId)
                {
                    continue; // Skip invalid components
                }

                // Update comment if provided
                if (!string.IsNullOrEmpty(componentUpload.Comment))
                {
                    component.Comment = componentUpload.Comment;
                }

                // Upload before image if provided
                if (componentUpload.BeforeImage != null)
                {
                    var beforeImagePath = await SaveImageToDisk(componentUpload.BeforeImage, bulkUploadDto.VisitId, componentUpload.ComponentId, "before");
                    if (!string.IsNullOrEmpty(beforeImagePath))
                    {
                        component.BeforeImagePath = beforeImagePath;
                    }
                }

                // Upload after image if provided
                if (componentUpload.AfterImage != null)
                {
                    var afterImagePath = await SaveImageToDisk(componentUpload.AfterImage, bulkUploadDto.VisitId, componentUpload.ComponentId, "after");
                    if (!string.IsNullOrEmpty(afterImagePath))
                    {
                        component.AfterImagePath = afterImagePath;
                    }
                }

                component.UpdatedAt = DateTime.UtcNow;
                await _componentRepository.UpdateAsync(component);
            }

            return ApiResponseDto<bool>.SuccessResult(true);
        }

        public async Task<ApiResponseDto<VisitReportDto>> GenerateVisitReportAsync(int visitId)
        {
            var visit = await _visitRepository.GetByIdAsync(visitId);
            if (visit == null)
            {
                return ApiResponseDto<VisitReportDto>.ErrorResult("Visit not found");
            }

            // Check if user can access this visit
            if (!await CanAccessVisit(visitId))
            {
                return ApiResponseDto<VisitReportDto>.ErrorResult("Access denied");
            }

            var site = await _siteRepository.GetByIdAsync(visit.SiteId);
            var engineer = await _userRepository.GetByIdAsync(visit.UserId);
            var components = await _componentRepository.FindAsync(c => c.VisitId == visitId);

            var report = new VisitReportDto
            {
                VisitId = visit.Id,
                SiteName = site?.Name ?? string.Empty,
                SiteCode = site?.Code ?? string.Empty,
                SiteAddress = site?.Address ?? string.Empty,
                EngineerName = engineer?.FullName ?? string.Empty,
                VisitDate = visit.CreatedAt,
                Status = visit.Status,
                VisitNotes = string.Empty, // Visit doesn't have Notes property
                CreatedAt = visit.CreatedAt,
                UpdatedAt = visit.UpdatedAt
            };

            foreach (var component in components)
            {
                var oramaItem = await _oramaItemRepository.GetByIdAsync(component.OramaItemId);
                report.Components.Add(new ComponentImageDto
                {
                    ComponentId = component.Id,
                    BeforeImagePath = component.BeforeImagePath,
                    AfterImagePath = component.AfterImagePath,
                    Comment = component.Comment,
                    OramaItemName = oramaItem?.Name ?? string.Empty,
                    OramaGroupName = oramaItem?.OramaGroup?.Name ?? string.Empty
                });
            }

            return ApiResponseDto<VisitReportDto>.SuccessResult(report);
        }

        public async Task<ApiResponseDto<VisitFinalReportDto>> GenerateFinalReportAsync(int visitId)
        {
            var visit = await _visitRepository.GetByIdAsync(visitId);
            if (visit == null)
            {
                return ApiResponseDto<VisitFinalReportDto>.ErrorResult("Visit not found");
            }

            // Check if user can access this visit
            if (!await CanAccessVisit(visitId))
            {
                return ApiResponseDto<VisitFinalReportDto>.ErrorResult("Access denied");
            }

            var site = await _siteRepository.GetByIdAsync(visit.SiteId);
            var engineer = await _userRepository.GetByIdAsync(visit.UserId);
            var components = await _componentRepository.FindAsync(c => c.VisitId == visitId);

            var report = new VisitFinalReportDto
            {
                VisitId = visit.Id,
                SiteName = site?.Name ?? string.Empty,
                SiteCode = site?.Code ?? string.Empty,
                SiteAddress = site?.Address ?? string.Empty,
                EngineerName = engineer?.FullName ?? string.Empty,
                VisitDate = visit.CreatedAt,
                Status = visit.Status,
                VisitNotes = string.Empty,
                CreatedAt = visit.CreatedAt,
                UpdatedAt = visit.UpdatedAt
            };

            foreach (var component in components)
            {
                var oramaItem = await _oramaItemRepository.GetByIdAsync(component.OramaItemId);
                report.Components.Add(new ComponentFinalImageDto
                {
                    ComponentId = component.Id,
                    AfterImagePath = component.AfterImagePath,
                    Comment = component.Comment,
                    OramaItemName = oramaItem?.Name ?? string.Empty,
                    OramaGroupName = oramaItem?.OramaGroup?.Name ?? string.Empty
                });
            }

            return ApiResponseDto<VisitFinalReportDto>.SuccessResult(report);
        }

        public async Task<ApiResponseDto<bool>> DeleteImageAsync(int componentId, string imageType)
        {
            var component = await _componentRepository.GetByIdAsync(componentId);
            if (component == null)
            {
                return ApiResponseDto<bool>.ErrorResult("Component not found");
            }

            // Check if user can access this component
            if (!await CanAccessComponent(componentId))
            {
                return ApiResponseDto<bool>.ErrorResult("Access denied");
            }

            // Check if visit is approved (read-only)
            var visit = await _visitRepository.GetByIdAsync(component.VisitId);
            if (visit?.Status == VisitStatus.Accepted)
            {
                return ApiResponseDto<bool>.ErrorResult("Cannot delete images from approved visits");
            }

            // Delete image file from disk
            string? imagePath = null;
            if (imageType.ToLower() == "before")
            {
                imagePath = component.BeforeImagePath;
                component.BeforeImagePath = null;
            }
            else if (imageType.ToLower() == "after")
            {
                imagePath = component.AfterImagePath;
                component.AfterImagePath = null;
            }
            else
            {
                return ApiResponseDto<bool>.ErrorResult("Invalid image type");
            }

            if (!string.IsNullOrEmpty(imagePath))
            {
                DeleteImageFromDisk(imagePath);
            }

            component.UpdatedAt = DateTime.UtcNow;
            await _componentRepository.UpdateAsync(component);

            return ApiResponseDto<bool>.SuccessResult(true);
        }

        #region Private Helper Methods

        private async Task<bool> CanAccessVisit(int visitId)
        {
            var currentUserId = _httpContextAccessor.HttpContext?.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(currentUserId))
            {
                return false;
            }

            var isAdmin = _httpContextAccessor.HttpContext?.User.IsInRole("Admin") ?? false;
            if (isAdmin)
            {
                return true;
            }

            var visit = await _visitRepository.GetByIdAsync(visitId);
            return visit?.UserId == currentUserId;
        }

        private async Task<bool> CanAccessComponent(int componentId)
        {
            var component = await _componentRepository.GetByIdAsync(componentId);
            if (component == null)
            {
                return false;
            }

            return await CanAccessVisit(component.VisitId);
        }

        private async Task<string?> SaveImageToDisk(IFormFile image, int visitId, int componentId, string imageType)
        {
            try
            {
                if (image == null || image.Length == 0)
                {
                    return null;
                }

                // Validate file type
                var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif" };
                var fileExtension = Path.GetExtension(image.FileName).ToLowerInvariant();
                if (!allowedExtensions.Contains(fileExtension))
                {
                    return null;
                }

                // Validate file size (10MB max)
                if (image.Length > 10 * 1024 * 1024)
                {
                    return null;
                }

                // Create directory structure
                var uploadPath = Path.Combine("wwwroot", "uploads", "visits", visitId.ToString(), "components", componentId.ToString());
                Directory.CreateDirectory(uploadPath);

                // Generate unique filename
                var fileName = $"{imageType}_{DateTime.UtcNow:yyyyMMdd_HHmmss}_{Guid.NewGuid()}{fileExtension}";
                var filePath = Path.Combine(uploadPath, fileName);

                // Save file
                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await image.CopyToAsync(stream);
                }

                // Return relative path for database storage
                return Path.Combine("uploads", "visits", visitId.ToString(), "components", componentId.ToString(), fileName);
            }
            catch
            {
                return null;
            }
        }

        private void DeleteImageFromDisk(string imagePath)
        {
            try
            {
                var fullPath = Path.Combine("wwwroot", imagePath);
                if (File.Exists(fullPath))
                {
                    File.Delete(fullPath);
                }
            }
            catch
            {
                // Ignore errors when deleting files
            }
        }

        #endregion
    }
} 