using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using OrangeSiteInspector.Application.DTOs;

namespace OrangeSiteInspector.API.Controllers
{
    /// <summary>
    /// File upload endpoints for visit images
    /// </summary>
    [Authorize]
    public class FileUploadController : BaseApiController
    {
        private readonly IWebHostEnvironment _environment;

        public FileUploadController(IWebHostEnvironment environment)
        {
            _environment = environment;
        }

        /// <summary>
        /// Upload visit image
        /// </summary>
        /// <param name="file">Image file</param>
        /// <param name="visitId">Visit ID</param>
        /// <param name="componentId">Component ID (optional)</param>
        /// <returns>Upload result with file path</returns>
        [HttpPost("visit-image")]
        [ProducesResponseType(typeof(ApiResponseDto<FileUploadResultDto>), 200)]
        [ProducesResponseType(typeof(ApiResponseDto<FileUploadResultDto>), 400)]
        public async Task<ActionResult<ApiResponseDto<FileUploadResultDto>>> UploadVisitImage(
            IFormFile file, 
            [FromQuery] int visitId, 
            [FromQuery] int? componentId = null)
        {
            if (file == null || file.Length == 0)
            {
                return BadRequest(ApiResponseDto<FileUploadResultDto>.ErrorResult("No file provided"));
            }

            // Validate file type
            var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif" };
            var fileExtension = Path.GetExtension(file.FileName).ToLowerInvariant();
            
            if (!allowedExtensions.Contains(fileExtension))
            {
                return BadRequest(ApiResponseDto<FileUploadResultDto>.ErrorResult("Invalid file type. Only JPG, PNG, and GIF are allowed."));
            }

            // Validate file size (max 10MB)
            if (file.Length > 10 * 1024 * 1024)
            {
                return BadRequest(ApiResponseDto<FileUploadResultDto>.ErrorResult("File size too large. Maximum size is 10MB."));
            }

            try
            {
                // Create upload directory
                var uploadPath = Path.Combine(_environment.WebRootPath, "uploads", "visits", visitId.ToString());
                if (!Directory.Exists(uploadPath))
                {
                    Directory.CreateDirectory(uploadPath);
                }

                // Generate unique filename
                var fileName = $"{Guid.NewGuid()}{fileExtension}";
                var filePath = Path.Combine(uploadPath, fileName);

                // Save file
                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await file.CopyToAsync(stream);
                }

                // Create relative path for database storage
                var relativePath = $"/uploads/visits/{visitId}/{fileName}";

                var result = new FileUploadResultDto
                {
                    FileName = fileName,
                    FilePath = relativePath,
                    FileSize = file.Length,
                    ContentType = file.ContentType,
                    VisitId = visitId,
                    ComponentId = componentId
                };

                return HandleResponse(ApiResponseDto<FileUploadResultDto>.SuccessResult(result));
            }
            catch (Exception ex)
            {
                return BadRequest(ApiResponseDto<FileUploadResultDto>.ErrorResult($"Error uploading file: {ex.Message}"));
            }
        }

        /// <summary>
        /// Upload multiple visit images
        /// </summary>
        /// <param name="files">Image files</param>
        /// <param name="visitId">Visit ID</param>
        /// <param name="componentId">Component ID (optional)</param>
        /// <returns>Upload results</returns>
        [HttpPost("visit-images")]
        [ProducesResponseType(typeof(ApiResponseDto<List<FileUploadResultDto>>), 200)]
        [ProducesResponseType(typeof(ApiResponseDto<List<FileUploadResultDto>>), 400)]
        public async Task<ActionResult<ApiResponseDto<List<FileUploadResultDto>>>> UploadVisitImages(
            List<IFormFile> files, 
            [FromQuery] int visitId, 
            [FromQuery] int? componentId = null)
        {
            if (files == null || !files.Any())
            {
                return BadRequest(ApiResponseDto<List<FileUploadResultDto>>.ErrorResult("No files provided"));
            }

            if (files.Count > 10)
            {
                return BadRequest(ApiResponseDto<List<FileUploadResultDto>>.ErrorResult("Maximum 10 files allowed per upload"));
            }

            var results = new List<FileUploadResultDto>();
            var errors = new List<string>();

            foreach (var file in files)
            {
                if (file.Length == 0) continue;

                // Validate file type
                var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif" };
                var fileExtension = Path.GetExtension(file.FileName).ToLowerInvariant();
                
                if (!allowedExtensions.Contains(fileExtension))
                {
                    errors.Add($"Invalid file type for {file.FileName}. Only JPG, PNG, and GIF are allowed.");
                    continue;
                }

                // Validate file size (max 10MB)
                if (file.Length > 10 * 1024 * 1024)
                {
                    errors.Add($"File {file.FileName} is too large. Maximum size is 10MB.");
                    continue;
                }

                try
                {
                    // Create upload directory
                    var uploadPath = Path.Combine(_environment.WebRootPath, "uploads", "visits", visitId.ToString());
                    if (!Directory.Exists(uploadPath))
                    {
                        Directory.CreateDirectory(uploadPath);
                    }

                    // Generate unique filename
                    var fileName = $"{Guid.NewGuid()}{fileExtension}";
                    var filePath = Path.Combine(uploadPath, fileName);

                    // Save file
                    using (var stream = new FileStream(filePath, FileMode.Create))
                    {
                        await file.CopyToAsync(stream);
                    }

                    // Create relative path for database storage
                    var relativePath = $"/uploads/visits/{visitId}/{fileName}";

                    var result = new FileUploadResultDto
                    {
                        FileName = fileName,
                        FilePath = relativePath,
                        FileSize = file.Length,
                        ContentType = file.ContentType,
                        VisitId = visitId,
                        ComponentId = componentId
                    };

                    results.Add(result);
                }
                catch (Exception ex)
                {
                    errors.Add($"Error uploading {file.FileName}: {ex.Message}");
                }
            }

            if (errors.Any())
            {
                return BadRequest(ApiResponseDto<List<FileUploadResultDto>>.ErrorResult($"Upload completed with errors: {string.Join("; ", errors)}"));
            }

            return HandleResponse(ApiResponseDto<List<FileUploadResultDto>>.SuccessResult(results));
        }

        /// <summary>
        /// Delete visit image
        /// </summary>
        /// <param name="fileName">File name</param>
        /// <param name="visitId">Visit ID</param>
        /// <returns>Success message</returns>
        [HttpDelete("visit-image")]
        [ProducesResponseType(typeof(ApiResponseDto), 200)]
        [ProducesResponseType(typeof(ApiResponseDto), 404)]
        public ActionResult<ApiResponseDto> DeleteVisitImage([FromQuery] string fileName, [FromQuery] int visitId)
        {
            try
            {
                var filePath = Path.Combine(_environment.WebRootPath, "uploads", "visits", visitId.ToString(), fileName);
                
                if (!System.IO.File.Exists(filePath))
                {
                    return NotFound(ApiResponseDto.ErrorResult("File not found"));
                }

                System.IO.File.Delete(filePath);
                return HandleResponse(ApiResponseDto.SuccessResult("File deleted successfully"));
            }
            catch (Exception ex)
            {
                return BadRequest(ApiResponseDto.ErrorResult($"Error deleting file: {ex.Message}"));
            }
        }
    }

    public class FileUploadResultDto
    {
        public string FileName { get; set; } = string.Empty;
        public string FilePath { get; set; } = string.Empty;
        public long FileSize { get; set; }
        public string ContentType { get; set; } = string.Empty;
        public int VisitId { get; set; }
        public int? ComponentId { get; set; }
    }
} 