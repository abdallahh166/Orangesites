using AutoMapper;
using OrangeSiteInspector.Application.DTOs;
using OrangeSiteInspector.Application.Interfaces;
using OrangeSiteInspector.Domain.Entities;
using OrangeSiteInspector.Domain.Enums;
using OrangeSiteInspector.Infrastructure.Repositories;

namespace OrangeSiteInspector.Application.Services
{
    public class OramaService : IOramaService
    {
        private readonly IGenericRepository<OramaGroup> _oramaGroupRepository;
        private readonly IGenericRepository<OramaItem> _oramaItemRepository;
        private readonly IMapper _mapper;

        public OramaService(
            IGenericRepository<OramaGroup> oramaGroupRepository,
            IGenericRepository<OramaItem> oramaItemRepository,
            IMapper mapper)
        {
            _oramaGroupRepository = oramaGroupRepository;
            _oramaItemRepository = oramaItemRepository;
            _mapper = mapper;
        }

        // Basic CRUD operations for Orama Groups
        public async Task<ApiResponseDto<List<OramaGroupDto>>> GetAllGroupsAsync()
        {
            var groups = await _oramaGroupRepository.GetAllAsync();
            var groupDtos = _mapper.Map<List<OramaGroupDto>>(groups);
            return ApiResponseDto<List<OramaGroupDto>>.SuccessResult(groupDtos);
        }

        public async Task<ApiResponseDto<OramaGroupDetailDto>> GetGroupByIdAsync(int id)
        {
            var group = await _oramaGroupRepository.GetByIdAsync(id);
            if (group == null)
                return ApiResponseDto<OramaGroupDetailDto>.ErrorResult("Orama group not found");

            var groupDetailDto = _mapper.Map<OramaGroupDetailDto>(group);
            return ApiResponseDto<OramaGroupDetailDto>.SuccessResult(groupDetailDto);
        }

        public async Task<ApiResponseDto<OramaGroupDto>> CreateGroupAsync(string name)
        {
            if (string.IsNullOrWhiteSpace(name))
                return ApiResponseDto<OramaGroupDto>.ErrorResult("Group name is required");

            var existingGroup = await _oramaGroupRepository.FindAsync(g => g.Name.ToLower() == name.ToLower());
            if (existingGroup.Any())
                return ApiResponseDto<OramaGroupDto>.ErrorResult("Group name already exists");

            var group = new OramaGroup 
            { 
                Name = name,
                Status = OramaStatus.Active,
                Priority = OramaPriority.Normal,
                Metadata = new Dictionary<string, object>(),
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
            await _oramaGroupRepository.AddAsync(group);

            var groupDto = _mapper.Map<OramaGroupDto>(group);
            return ApiResponseDto<OramaGroupDto>.SuccessResult(groupDto, "Orama group created successfully");
        }

        public async Task<ApiResponseDto<OramaGroupDto>> UpdateGroupAsync(int id, string name)
        {
            if (string.IsNullOrWhiteSpace(name))
                return ApiResponseDto<OramaGroupDto>.ErrorResult("Group name is required");

            var group = await _oramaGroupRepository.GetByIdAsync(id);
            if (group == null)
                return ApiResponseDto<OramaGroupDto>.ErrorResult("Orama group not found");

            var existingGroup = await _oramaGroupRepository.FindAsync(g => g.Name.ToLower() == name.ToLower() && g.Id != id);
            if (existingGroup.Any())
                return ApiResponseDto<OramaGroupDto>.ErrorResult("Group name already exists");

            group.Name = name;
            group.UpdatedAt = DateTime.UtcNow;
            await _oramaGroupRepository.UpdateAsync(group);

            var groupDto = _mapper.Map<OramaGroupDto>(group);
            return ApiResponseDto<OramaGroupDto>.SuccessResult(groupDto, "Orama group updated successfully");
        }

        public async Task<ApiResponseDto> DeleteGroupAsync(int id)
        {
            var group = await _oramaGroupRepository.GetByIdAsync(id);
            if (group == null)
                return ApiResponseDto.ErrorResult("Orama group not found");

            // Check if group has items
            var items = await _oramaItemRepository.FindAsync(item => item.OramaGroupId == id);
            if (items.Any())
                return ApiResponseDto.ErrorResult("Cannot delete group with existing items");

            await _oramaGroupRepository.DeleteAsync(group);
            return ApiResponseDto.SuccessResult("Orama group deleted successfully");
        }

        // Basic CRUD operations for Orama Items
        public async Task<ApiResponseDto<List<OramaItemDto>>> GetAllItemsAsync()
        {
            var items = await _oramaItemRepository.GetAllAsync();
            var itemDtos = _mapper.Map<List<OramaItemDto>>(items);
            return ApiResponseDto<List<OramaItemDto>>.SuccessResult(itemDtos);
        }

        public async Task<ApiResponseDto<List<OramaItemDto>>> GetItemsByGroupIdAsync(int groupId)
        {
            var items = await _oramaItemRepository.FindAsync(item => item.OramaGroupId == groupId);
            var itemDtos = _mapper.Map<List<OramaItemDto>>(items);
            return ApiResponseDto<List<OramaItemDto>>.SuccessResult(itemDtos);
        }

        public async Task<ApiResponseDto<OramaItemDto>> GetItemByIdAsync(int id)
        {
            var item = await _oramaItemRepository.GetByIdAsync(id);
            if (item == null)
                return ApiResponseDto<OramaItemDto>.ErrorResult("Orama item not found");

            var itemDto = _mapper.Map<OramaItemDto>(item);
            return ApiResponseDto<OramaItemDto>.SuccessResult(itemDto);
        }

        public async Task<ApiResponseDto<OramaItemDto>> CreateItemAsync(string name, int groupId)
        {
            if (string.IsNullOrWhiteSpace(name))
                return ApiResponseDto<OramaItemDto>.ErrorResult("Item name is required");

            // Validate group exists
            var group = await _oramaGroupRepository.GetByIdAsync(groupId);
            if (group == null)
                return ApiResponseDto<OramaItemDto>.ErrorResult("Orama group not found");

            // Check if item name already exists in the group
            var existingItem = await _oramaItemRepository.FindAsync(item => 
                item.OramaGroupId == groupId && item.Name.ToLower() == name.ToLower());
            if (existingItem.Any())
                return ApiResponseDto<OramaItemDto>.ErrorResult("Item name already exists in this group");

            var item = new OramaItem 
            { 
                Name = name, 
                OramaGroupId = groupId,
                Status = OramaStatus.Active,
                Priority = OramaPriority.Normal,
                Metadata = new Dictionary<string, object>(),
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
            await _oramaItemRepository.AddAsync(item);

            var itemDto = _mapper.Map<OramaItemDto>(item);
            return ApiResponseDto<OramaItemDto>.SuccessResult(itemDto, "Orama item created successfully");
        }

        public async Task<ApiResponseDto<OramaItemDto>> UpdateItemAsync(int id, string name, int groupId)
        {
            if (string.IsNullOrWhiteSpace(name))
                return ApiResponseDto<OramaItemDto>.ErrorResult("Item name is required");

            var item = await _oramaItemRepository.GetByIdAsync(id);
            if (item == null)
                return ApiResponseDto<OramaItemDto>.ErrorResult("Orama item not found");

            // Validate group exists
            var group = await _oramaGroupRepository.GetByIdAsync(groupId);
            if (group == null)
                return ApiResponseDto<OramaItemDto>.ErrorResult("Orama group not found");

            // Check if item name already exists in the group (excluding current item)
            var existingItem = await _oramaItemRepository.FindAsync(existing => 
                existing.OramaGroupId == groupId && 
                existing.Name.ToLower() == name.ToLower() && 
                existing.Id != id);
            if (existingItem.Any())
                return ApiResponseDto<OramaItemDto>.ErrorResult("Item name already exists in this group");

            item.Name = name;
            item.OramaGroupId = groupId;
            item.UpdatedAt = DateTime.UtcNow;
            await _oramaItemRepository.UpdateAsync(item);

            var itemDto = _mapper.Map<OramaItemDto>(item);
            return ApiResponseDto<OramaItemDto>.SuccessResult(itemDto, "Orama item updated successfully");
        }

        public async Task<ApiResponseDto> DeleteItemAsync(int id)
        {
            var item = await _oramaItemRepository.GetByIdAsync(id);
            if (item == null)
                return ApiResponseDto.ErrorResult("Orama item not found");

            await _oramaItemRepository.DeleteAsync(item);
            return ApiResponseDto.SuccessResult("Orama item deleted successfully");
        }

        // Enhanced operations - will be implemented later
        public async Task<ApiResponseDto<PagedResultDto<OramaGroupDto>>> SearchGroupsAsync(OramaGroupSearchDto searchDto)
        {
            throw new NotImplementedException("Search functionality will be implemented in the next phase");
        }

        public async Task<ApiResponseDto<OramaStatisticsDto>> GetGroupStatisticsAsync()
        {
            throw new NotImplementedException("Statistics functionality will be implemented in the next phase");
        }

        public async Task<ApiResponseDto> BulkGroupOperationAsync(BulkOramaGroupOperationDto bulkDto)
        {
            throw new NotImplementedException("Bulk operations will be implemented in the next phase");
        }

        public async Task<ApiResponseDto<PagedResultDto<OramaItemDto>>> SearchItemsAsync(OramaItemSearchDto searchDto)
        {
            throw new NotImplementedException("Search functionality will be implemented in the next phase");
        }

        public async Task<ApiResponseDto<OramaItemAnalyticsDto>> GetItemAnalyticsAsync(int itemId)
        {
            throw new NotImplementedException("Analytics functionality will be implemented in the next phase");
        }

        public async Task<ApiResponseDto> BulkItemOperationAsync(BulkOramaItemOperationDto bulkDto)
        {
            throw new NotImplementedException("Bulk operations will be implemented in the next phase");
        }
    }
} 