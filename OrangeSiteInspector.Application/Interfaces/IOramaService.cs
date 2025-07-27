using OrangeSiteInspector.Application.DTOs;

namespace OrangeSiteInspector.Application.Interfaces
{
    public interface IOramaService
    {
        // Orama Groups
        Task<ApiResponseDto<List<OramaGroupDto>>> GetAllGroupsAsync();
        Task<ApiResponseDto<OramaGroupDetailDto>> GetGroupByIdAsync(int id);
        Task<ApiResponseDto<OramaGroupDto>> CreateGroupAsync(string name);
        Task<ApiResponseDto<OramaGroupDto>> UpdateGroupAsync(int id, string name);
        Task<ApiResponseDto> DeleteGroupAsync(int id);

        // Enhanced Group Operations
        Task<ApiResponseDto<PagedResultDto<OramaGroupDto>>> SearchGroupsAsync(OramaGroupSearchDto searchDto);
        Task<ApiResponseDto<OramaStatisticsDto>> GetGroupStatisticsAsync();
        Task<ApiResponseDto> BulkGroupOperationAsync(BulkOramaGroupOperationDto bulkDto);

        // Orama Items
        Task<ApiResponseDto<List<OramaItemDto>>> GetAllItemsAsync();
        Task<ApiResponseDto<List<OramaItemDto>>> GetItemsByGroupIdAsync(int groupId);
        Task<ApiResponseDto<OramaItemDto>> GetItemByIdAsync(int id);
        Task<ApiResponseDto<OramaItemDto>> CreateItemAsync(string name, int groupId);
        Task<ApiResponseDto<OramaItemDto>> UpdateItemAsync(int id, string name, int groupId);
        Task<ApiResponseDto> DeleteItemAsync(int id);

        // Enhanced Item Operations
        Task<ApiResponseDto<PagedResultDto<OramaItemDto>>> SearchItemsAsync(OramaItemSearchDto searchDto);
        Task<ApiResponseDto<OramaItemAnalyticsDto>> GetItemAnalyticsAsync(int itemId);
        Task<ApiResponseDto> BulkItemOperationAsync(BulkOramaItemOperationDto bulkDto);
    }
} 