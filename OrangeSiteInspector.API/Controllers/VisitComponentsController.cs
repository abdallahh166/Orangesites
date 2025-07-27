using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using OrangeSiteInspector.Application.DTOs;
using OrangeSiteInspector.Application.Interfaces;

namespace OrangeSiteInspector.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class VisitComponentsController : BaseApiController
    {
        private readonly IVisitComponentService _componentService;

        public VisitComponentsController(IVisitComponentService componentService)
        {
            _componentService = componentService;
        }

        /// <summary>
        /// Get all components for a specific visit
        /// </summary>
        [HttpGet("visit/{visitId}")]
        public async Task<ActionResult<ApiResponseDto<List<VisitComponentDto>>>> GetByVisitId(int visitId)
        {
            var result = await _componentService.GetByVisitIdAsync(visitId);
            return HandleResponse(result);
        }

        /// <summary>
        /// Get a specific component by ID
        /// </summary>
        [HttpGet("{componentId}")]
        public async Task<ActionResult<ApiResponseDto<VisitComponentDto>>> GetById(int componentId)
        {
            var result = await _componentService.GetByIdAsync(componentId);
            return HandleResponse(result);
        }

        /// <summary>
        /// Create a new component for a visit
        /// </summary>
        [HttpPost]
        [Authorize(Roles = "Engineer")]
        public async Task<ActionResult<ApiResponseDto<VisitComponentDto>>> Create([FromBody] CreateVisitComponentDto createDto)
        {
            var result = await _componentService.CreateAsync(createDto);
            return HandleResponse(result);
        }

        /// <summary>
        /// Update a component (comment only)
        /// </summary>
        [HttpPut("{componentId}")]
        [Authorize(Roles = "Engineer")]
        public async Task<ActionResult<ApiResponseDto<VisitComponentDto>>> Update(int componentId, [FromBody] UpdateVisitComponentDto updateDto)
        {
            var result = await _componentService.UpdateAsync(componentId, updateDto);
            return HandleResponse(result);
        }

        /// <summary>
        /// Delete a component
        /// </summary>
        [HttpDelete("{componentId}")]
        [Authorize(Roles = "Engineer")]
        public async Task<ActionResult<ApiResponseDto<bool>>> Delete(int componentId)
        {
            var result = await _componentService.DeleteAsync(componentId);
            return HandleResponse(result);
        }

        /// <summary>
        /// Upload an image for a component (before or after)
        /// </summary>
        [HttpPost("upload-image")]
        [Authorize(Roles = "Engineer")]
        public async Task<ActionResult<ApiResponseDto<VisitComponentDto>>> UploadImage([FromForm] UploadComponentImageDto uploadDto)
        {
            var result = await _componentService.UploadImageAsync(uploadDto);
            return HandleResponse(result);
        }

        /// <summary>
        /// Bulk upload images for multiple components
        /// </summary>
        [HttpPost("bulk-upload")]
        [Authorize(Roles = "Engineer")]
        public async Task<ActionResult<ApiResponseDto<bool>>> BulkUploadImages([FromForm] BulkUploadImagesDto bulkUploadDto)
        {
            var result = await _componentService.BulkUploadImagesAsync(bulkUploadDto);
            return HandleResponse(result);
        }

        /// <summary>
        /// Delete an image from a component
        /// </summary>
        [HttpDelete("{componentId}/image/{imageType}")]
        [Authorize(Roles = "Engineer")]
        public async Task<ActionResult<ApiResponseDto<bool>>> DeleteImage(int componentId, string imageType)
        {
            var result = await _componentService.DeleteImageAsync(componentId, imageType);
            return HandleResponse(result);
        }

        /// <summary>
        /// Generate a full visit report with before/after images
        /// </summary>
        [HttpGet("visit/{visitId}/report")]
        public async Task<ActionResult<ApiResponseDto<VisitReportDto>>> GenerateVisitReport(int visitId)
        {
            var result = await _componentService.GenerateVisitReportAsync(visitId);
            return HandleResponse(result);
        }

        /// <summary>
        /// Generate a final visit report (after images only)
        /// </summary>
        [HttpGet("visit/{visitId}/final-report")]
        public async Task<ActionResult<ApiResponseDto<VisitFinalReportDto>>> GenerateFinalReport(int visitId)
        {
            var result = await _componentService.GenerateFinalReportAsync(visitId);
            return HandleResponse(result);
        }
    }
} 