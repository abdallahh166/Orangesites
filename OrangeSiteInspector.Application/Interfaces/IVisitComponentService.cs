using OrangeSiteInspector.Application.DTOs;

namespace OrangeSiteInspector.Application.Interfaces
{
    public interface IVisitComponentService
    {
        Task<ApiResponseDto<List<VisitComponentDto>>> GetByVisitIdAsync(int visitId);
        Task<ApiResponseDto<VisitComponentDto>> GetByIdAsync(int componentId);
        Task<ApiResponseDto<VisitComponentDto>> CreateAsync(CreateVisitComponentDto createDto);
        Task<ApiResponseDto<VisitComponentDto>> UpdateAsync(int componentId, UpdateVisitComponentDto updateDto);
        Task<ApiResponseDto<bool>> DeleteAsync(int componentId);
        Task<ApiResponseDto<VisitComponentDto>> UploadImageAsync(UploadComponentImageDto uploadDto);
        Task<ApiResponseDto<bool>> BulkUploadImagesAsync(BulkUploadImagesDto bulkUploadDto);
        Task<ApiResponseDto<VisitReportDto>> GenerateVisitReportAsync(int visitId);
        Task<ApiResponseDto<VisitFinalReportDto>> GenerateFinalReportAsync(int visitId);
        Task<ApiResponseDto<bool>> DeleteImageAsync(int componentId, string imageType);
    }
} 