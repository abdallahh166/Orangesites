using AutoMapper;
using OrangeSiteInspector.Application.DTOs;
using OrangeSiteInspector.Application.Interfaces;
using OrangeSiteInspector.Domain.Entities;
using OrangeSiteInspector.Domain.Enums;
using OrangeSiteInspector.Infrastructure.Repositories;

namespace OrangeSiteInspector.Application.Services
{
    public class VisitService : IVisitService
    {
        private readonly IVisitRepository _visitRepository;
        private readonly ISiteRepository _siteRepository;
        private readonly IUserRepository _userRepository;
        private readonly IGenericRepository<VisitComponent> _visitComponentRepository;
        private readonly IGenericRepository<OramaItem> _oramaItemRepository;
        private readonly IMapper _mapper;

        public VisitService(
            IVisitRepository visitRepository,
            ISiteRepository siteRepository,
            IUserRepository userRepository,
            IGenericRepository<VisitComponent> visitComponentRepository,
            IGenericRepository<OramaItem> oramaItemRepository,
            IMapper mapper)
        {
            _visitRepository = visitRepository;
            _siteRepository = siteRepository;
            _userRepository = userRepository;
            _visitComponentRepository = visitComponentRepository;
            _oramaItemRepository = oramaItemRepository;
            _mapper = mapper;
        }

        public async Task<ApiResponseDto<VisitDto>> GetByIdAsync(int id)
        {
            var visit = await _visitRepository.GetByIdAsync(id);
            if (visit == null)
                return ApiResponseDto<VisitDto>.ErrorResult("Visit not found");

            var visitDto = _mapper.Map<VisitDto>(visit);
            return ApiResponseDto<VisitDto>.SuccessResult(visitDto);
        }

        public async Task<ApiResponseDto<VisitDetailDto>> GetDetailByIdAsync(int id)
        {
            var visit = await _visitRepository.GetByIdAsync(id);
            if (visit == null)
                return ApiResponseDto<VisitDetailDto>.ErrorResult("Visit not found");

            var visitDetailDto = _mapper.Map<VisitDetailDto>(visit);
            return ApiResponseDto<VisitDetailDto>.SuccessResult(visitDetailDto);
        }

        public async Task<ApiResponseDto<PagedResultDto<VisitDto>>> GetAllAsync(int page = 1, int pageSize = 10)
        {
            var visits = await _visitRepository.GetAllAsync();
            var visitDtos = _mapper.Map<List<VisitDto>>(visits);

            var pagedResult = new PagedResultDto<VisitDto>
            {
                Items = visitDtos.Skip((page - 1) * pageSize).Take(pageSize).ToList(),
                TotalCount = visitDtos.Count,
                Page = page,
                PageSize = pageSize
            };

            return ApiResponseDto<PagedResultDto<VisitDto>>.SuccessResult(pagedResult);
        }

        public async Task<ApiResponseDto<PagedResultDto<VisitDto>>> SearchAsync(VisitSearchDto searchDto)
        {
            var visits = await _visitRepository.GetAllAsync();
            var filteredVisits = visits.AsEnumerable();

            if (searchDto.SiteId.HasValue)
            {
                filteredVisits = filteredVisits.Where(v => v.SiteId == searchDto.SiteId.Value);
            }

            if (!string.IsNullOrWhiteSpace(searchDto.UserId))
            {
                filteredVisits = filteredVisits.Where(v => v.UserId == searchDto.UserId);
            }

            if (searchDto.Status.HasValue)
            {
                filteredVisits = filteredVisits.Where(v => v.Status == searchDto.Status.Value);
            }

            if (searchDto.StartDate.HasValue)
            {
                filteredVisits = filteredVisits.Where(v => v.CreatedAt >= searchDto.StartDate.Value);
            }

            if (searchDto.EndDate.HasValue)
            {
                filteredVisits = filteredVisits.Where(v => v.CreatedAt <= searchDto.EndDate.Value);
            }

            var visitDtos = _mapper.Map<List<VisitDto>>(filteredVisits);

            var pagedResult = new PagedResultDto<VisitDto>
            {
                Items = visitDtos.Skip((searchDto.Page - 1) * searchDto.PageSize).Take(searchDto.PageSize).ToList(),
                TotalCount = visitDtos.Count,
                Page = searchDto.Page,
                PageSize = searchDto.PageSize
            };

            return ApiResponseDto<PagedResultDto<VisitDto>>.SuccessResult(pagedResult);
        }

        public async Task<ApiResponseDto<List<VisitDto>>> GetBySiteIdAsync(int siteId)
        {
            var visits = await _visitRepository.GetBySiteIdAsync(siteId);
            var visitDtos = _mapper.Map<List<VisitDto>>(visits);
            return ApiResponseDto<List<VisitDto>>.SuccessResult(visitDtos);
        }

        public async Task<ApiResponseDto<List<VisitDto>>> GetByUserIdAsync(string userId)
        {
            var visits = await _visitRepository.GetByUserIdAsync(userId);
            var visitDtos = _mapper.Map<List<VisitDto>>(visits);
            return ApiResponseDto<List<VisitDto>>.SuccessResult(visitDtos);
        }

        public async Task<ApiResponseDto<List<VisitDto>>> GetByStatusAsync(VisitStatus status)
        {
            var visits = await _visitRepository.GetByStatusAsync(status);
            var visitDtos = _mapper.Map<List<VisitDto>>(visits);
            return ApiResponseDto<List<VisitDto>>.SuccessResult(visitDtos);
        }

        public async Task<ApiResponseDto<List<VisitDto>>> GetByDateRangeAsync(DateTime startDate, DateTime endDate)
        {
            var visits = await _visitRepository.GetByDateRangeAsync(startDate, endDate);
            var visitDtos = _mapper.Map<List<VisitDto>>(visits);
            return ApiResponseDto<List<VisitDto>>.SuccessResult(visitDtos);
        }

        public async Task<ApiResponseDto<VisitDto>> CreateAsync(CreateVisitDto createVisitDto)
        {
            var site = await _siteRepository.GetByIdAsync(createVisitDto.SiteId);
            if (site == null)
                return ApiResponseDto<VisitDto>.ErrorResult("Site not found");

            var user = await _userRepository.GetByIdAsync(createVisitDto.UserId);
            if (user == null)
                return ApiResponseDto<VisitDto>.ErrorResult("User not found");

            var visit = _mapper.Map<Visit>(createVisitDto);
            visit.CreatedAt = DateTime.UtcNow;
            visit.Status = VisitStatus.Pending;

            await _visitRepository.AddAsync(visit);

            var visitDto = _mapper.Map<VisitDto>(visit);
            return ApiResponseDto<VisitDto>.SuccessResult(visitDto, "Visit created successfully");
        }

        public async Task<ApiResponseDto<VisitDto>> UpdateAsync(int id, UpdateVisitDto updateVisitDto)
        {
            var visit = await _visitRepository.GetByIdAsync(id);
            if (visit == null)
                return ApiResponseDto<VisitDto>.ErrorResult("Visit not found");

            _mapper.Map(updateVisitDto, visit);
            visit.UpdatedAt = DateTime.UtcNow;
            await _visitRepository.UpdateAsync(visit);

            var visitDto = _mapper.Map<VisitDto>(visit);
            return ApiResponseDto<VisitDto>.SuccessResult(visitDto, "Visit updated successfully");
        }

        public async Task<ApiResponseDto<VisitDto>> UpdateStatusAsync(int id, UpdateVisitStatusDto updateStatusDto)
        {
            var visit = await _visitRepository.GetByIdAsync(id);
            if (visit == null)
                return ApiResponseDto<VisitDto>.ErrorResult("Visit not found");

            visit.Status = updateStatusDto.Status;
            visit.UpdatedAt = DateTime.UtcNow;

            if (updateStatusDto.Status == VisitStatus.Rejected && !string.IsNullOrEmpty(updateStatusDto.RejectionReason))
            {
                visit.RejectionReason = updateStatusDto.RejectionReason;
            }

            if (!string.IsNullOrEmpty(updateStatusDto.Notes))
            {
                visit.Notes = updateStatusDto.Notes;
            }

            await _visitRepository.UpdateAsync(visit);

            var visitDto = _mapper.Map<VisitDto>(visit);
            return ApiResponseDto<VisitDto>.SuccessResult(visitDto, "Visit status updated successfully");
        }

        public async Task<ApiResponseDto> DeleteAsync(int id)
        {
            var visit = await _visitRepository.GetByIdAsync(id);
            if (visit == null)
                return ApiResponseDto.ErrorResult("Visit not found");

            await _visitRepository.DeleteAsync(visit);
            return ApiResponseDto.SuccessResult("Visit deleted successfully");
        }

        public async Task<ApiResponseDto<VisitComponentDto>> AddComponentAsync(CreateVisitComponentDto createComponentDto)
        {
            var visit = await _visitRepository.GetByIdAsync(createComponentDto.VisitId);
            if (visit == null)
                return ApiResponseDto<VisitComponentDto>.ErrorResult("Visit not found");

            var oramaItem = await _oramaItemRepository.GetByIdAsync(createComponentDto.OramaItemId);
            if (oramaItem == null)
                return ApiResponseDto<VisitComponentDto>.ErrorResult("Orama item not found");

            var component = _mapper.Map<VisitComponent>(createComponentDto);
            await _visitComponentRepository.AddAsync(component);

            var componentDto = _mapper.Map<VisitComponentDto>(component);
            return ApiResponseDto<VisitComponentDto>.SuccessResult(componentDto, "Component added successfully");
        }

        public async Task<ApiResponseDto<VisitComponentDto>> UpdateComponentAsync(int componentId, UpdateVisitComponentDto updateComponentDto)
        {
            var component = await _visitComponentRepository.GetByIdAsync(componentId);
            if (component == null)
                return ApiResponseDto<VisitComponentDto>.ErrorResult("Component not found");

            _mapper.Map(updateComponentDto, component);
            await _visitComponentRepository.UpdateAsync(component);

            var componentDto = _mapper.Map<VisitComponentDto>(component);
            return ApiResponseDto<VisitComponentDto>.SuccessResult(componentDto, "Component updated successfully");
        }

        public async Task<ApiResponseDto<VisitComponentDto>> GetComponentByIdAsync(int componentId)
        {
            var component = await _visitComponentRepository.GetByIdAsync(componentId);
            if (component == null)
                return ApiResponseDto<VisitComponentDto>.ErrorResult("Component not found");

            var componentDto = _mapper.Map<VisitComponentDto>(component);
            return ApiResponseDto<VisitComponentDto>.SuccessResult(componentDto);
        }

        public async Task<ApiResponseDto> RemoveComponentAsync(int componentId)
        {
            var component = await _visitComponentRepository.GetByIdAsync(componentId);
            if (component == null)
                return ApiResponseDto.ErrorResult("Component not found");

            await _visitComponentRepository.DeleteAsync(component);
            return ApiResponseDto.SuccessResult("Component removed successfully");
        }

        public async Task<ApiResponseDto<List<VisitComponentDto>>> GetVisitComponentsAsync(int visitId)
        {
            var components = await _visitComponentRepository.FindAsync(vc => vc.VisitId == visitId);
            var componentDtos = _mapper.Map<List<VisitComponentDto>>(components);
            return ApiResponseDto<List<VisitComponentDto>>.SuccessResult(componentDtos);
        }

        public async Task<ApiResponseDto> AddBulkComponentsAsync(BulkCreateVisitComponentsDto bulkCreateDto)
        {
            var visit = await _visitRepository.GetByIdAsync(bulkCreateDto.VisitId);
            if (visit == null)
                return ApiResponseDto.ErrorResult("Visit not found");

            var components = new List<VisitComponent>();
            foreach (var componentDto in bulkCreateDto.Components)
            {
                var oramaItem = await _oramaItemRepository.GetByIdAsync(componentDto.OramaItemId);
                if (oramaItem == null)
                    return ApiResponseDto.ErrorResult($"Orama item with ID {componentDto.OramaItemId} not found");

                var component = _mapper.Map<VisitComponent>(componentDto);
                components.Add(component);
            }

            await _visitComponentRepository.AddRangeAsync(components);
            return ApiResponseDto.SuccessResult($"{components.Count} components added successfully");
        }

        public async Task<ApiResponseDto<VisitDto>> StartVisitAsync(int id, StartVisitDto startVisitDto)
        {
            var visit = await _visitRepository.GetByIdAsync(id);
            if (visit == null)
                return ApiResponseDto<VisitDto>.ErrorResult("Visit not found");

            if (visit.Status != VisitStatus.Pending)
                return ApiResponseDto<VisitDto>.ErrorResult("Visit can only be started when status is Pending");

            visit.Status = VisitStatus.InProgress;
            visit.StartedAt = startVisitDto.StartedAt;
            visit.UpdatedAt = DateTime.UtcNow;

            if (!string.IsNullOrEmpty(startVisitDto.Notes))
            {
                visit.Notes = startVisitDto.Notes;
            }

            await _visitRepository.UpdateAsync(visit);

            var visitDto = _mapper.Map<VisitDto>(visit);
            return ApiResponseDto<VisitDto>.SuccessResult(visitDto, "Visit started successfully");
        }

        public async Task<ApiResponseDto<VisitDto>> CompleteVisitAsync(int id, CompleteVisitDto completeVisitDto)
        {
            var visit = await _visitRepository.GetByIdAsync(id);
            if (visit == null)
                return ApiResponseDto<VisitDto>.ErrorResult("Visit not found");

            if (visit.Status != VisitStatus.InProgress)
                return ApiResponseDto<VisitDto>.ErrorResult("Visit can only be completed when status is InProgress");

            visit.Status = VisitStatus.Completed;
            visit.CompletedAt = completeVisitDto.CompletedAt;
            visit.UpdatedAt = DateTime.UtcNow;

            if (completeVisitDto.ActualDurationMinutes.HasValue)
            {
                visit.ActualDurationMinutes = completeVisitDto.ActualDurationMinutes;
            }

            if (!string.IsNullOrEmpty(completeVisitDto.Notes))
            {
                visit.Notes = completeVisitDto.Notes;
            }

            await _visitRepository.UpdateAsync(visit);

            var visitDto = _mapper.Map<VisitDto>(visit);
            return ApiResponseDto<VisitDto>.SuccessResult(visitDto, "Visit completed successfully");
        }

        public async Task<ApiResponseDto<List<VisitDto>>> GetOverdueVisitsAsync()
        {
            var visits = await _visitRepository.GetAllAsync();
            var overdueVisits = visits.Where(v => 
                v.ScheduledDate.HasValue && 
                v.ScheduledDate.Value < DateTime.UtcNow && 
                (v.Status == VisitStatus.Pending || v.Status == VisitStatus.InProgress))
                .ToList();

            var visitDtos = _mapper.Map<List<VisitDto>>(overdueVisits);
            return ApiResponseDto<List<VisitDto>>.SuccessResult(visitDtos);
        }

        public async Task<ApiResponseDto<List<VisitScheduleDto>>> GetScheduledVisitsAsync(DateTime? startDate = null, DateTime? endDate = null)
        {
            var visits = await _visitRepository.GetAllAsync();
            var scheduledVisits = visits.Where(v => v.ScheduledDate.HasValue).ToList();

            if (startDate.HasValue)
                scheduledVisits = scheduledVisits.Where(v => v.ScheduledDate >= startDate.Value).ToList();

            if (endDate.HasValue)
                scheduledVisits = scheduledVisits.Where(v => v.ScheduledDate <= endDate.Value).ToList();

            var scheduleDtos = scheduledVisits.Select(v => new VisitScheduleDto
            {
                VisitId = v.Id,
                SiteName = v.Site?.Name ?? string.Empty,
                EngineerName = v.User?.FullName ?? string.Empty,
                ScheduledDate = v.ScheduledDate.Value,
                Priority = v.Priority,
                Type = v.Type,
                Status = v.Status,
                EstimatedDurationMinutes = v.EstimatedDurationMinutes
            }).ToList();

            return ApiResponseDto<List<VisitScheduleDto>>.SuccessResult(scheduleDtos);
        }

        public async Task<ApiResponseDto<List<VisitDto>>> GetByPriorityAsync(VisitPriority priority)
        {
            var visits = await _visitRepository.GetAllAsync();
            var filteredVisits = visits.Where(v => v.Priority == priority).ToList();
            var visitDtos = _mapper.Map<List<VisitDto>>(filteredVisits);
            return ApiResponseDto<List<VisitDto>>.SuccessResult(visitDtos);
        }

        public async Task<ApiResponseDto<List<VisitDto>>> GetByTypeAsync(VisitType type)
        {
            var visits = await _visitRepository.GetAllAsync();
            var filteredVisits = visits.Where(v => v.Type == type).ToList();
            var visitDtos = _mapper.Map<List<VisitDto>>(filteredVisits);
            return ApiResponseDto<List<VisitDto>>.SuccessResult(visitDtos);
        }

        public async Task<ApiResponseDto<VisitStatisticsDto>> GetVisitStatisticsAsync(int visitId)
        {
            var visit = await _visitRepository.GetByIdAsync(visitId);
            if (visit == null)
                return ApiResponseDto<VisitStatisticsDto>.ErrorResult("Visit not found");

            var components = await _visitComponentRepository.FindAsync(c => c.VisitId == visitId);
            var componentList = components.ToList();

            var statistics = new VisitStatisticsDto
            {
                TotalComponents = componentList.Count,
                ComponentsWithImages = componentList.Count(c => !string.IsNullOrEmpty(c.BeforeImagePath) || !string.IsNullOrEmpty(c.AfterImagePath)),
                ComponentsWithBeforeImages = componentList.Count(c => !string.IsNullOrEmpty(c.BeforeImagePath)),
                ComponentsWithAfterImages = componentList.Count(c => !string.IsNullOrEmpty(c.AfterImagePath)),
                ComponentsWithComments = componentList.Count(c => !string.IsNullOrEmpty(c.Comment)),
                CompletionPercentage = componentList.Count > 0 ? (double)componentList.Count(c => !string.IsNullOrEmpty(c.AfterImagePath)) / componentList.Count * 100 : 0,
                Duration = visit.ActualDurationMinutes.HasValue ? TimeSpan.FromMinutes(visit.ActualDurationMinutes.Value) : null,
                IsOverdue = visit.ScheduledDate.HasValue && visit.ScheduledDate.Value < DateTime.UtcNow && 
                           (visit.Status == VisitStatus.Pending || visit.Status == VisitStatus.InProgress)
            };

            return ApiResponseDto<VisitStatisticsDto>.SuccessResult(statistics);
        }

        public async Task<ApiResponseDto> BulkUpdateStatusAsync(BulkUpdateVisitStatusDto bulkUpdateDto)
        {
            var visits = await _visitRepository.GetAllAsync();
            var visitsToUpdate = visits.Where(v => bulkUpdateDto.VisitIds.Contains(v.Id)).ToList();

            foreach (var visit in visitsToUpdate)
            {
                visit.Status = bulkUpdateDto.UpdateStatusDto.Status;
                visit.UpdatedAt = DateTime.UtcNow;

                if (bulkUpdateDto.UpdateStatusDto.Status == VisitStatus.Rejected && 
                    !string.IsNullOrEmpty(bulkUpdateDto.UpdateStatusDto.RejectionReason))
                {
                    visit.RejectionReason = bulkUpdateDto.UpdateStatusDto.RejectionReason;
                }

                if (!string.IsNullOrEmpty(bulkUpdateDto.UpdateStatusDto.Notes))
                {
                    visit.Notes = bulkUpdateDto.UpdateStatusDto.Notes;
                }

                await _visitRepository.UpdateAsync(visit);
            }

            return ApiResponseDto.SuccessResult($"Updated status for {visitsToUpdate.Count} visits");
        }

        public async Task<ApiResponseDto<bool>> CanStartVisitAsync(int visitId, string userId)
        {
            var visit = await _visitRepository.GetByIdAsync(visitId);
            if (visit == null)
                return ApiResponseDto<bool>.SuccessResult(false);

            return ApiResponseDto<bool>.SuccessResult(
                visit.UserId == userId && 
                visit.Status == VisitStatus.Pending);
        }

        public async Task<ApiResponseDto<bool>> CanCompleteVisitAsync(int visitId, string userId)
        {
            var visit = await _visitRepository.GetByIdAsync(visitId);
            if (visit == null)
                return ApiResponseDto<bool>.SuccessResult(false);

            return ApiResponseDto<bool>.SuccessResult(
                visit.UserId == userId && 
                visit.Status == VisitStatus.InProgress);
        }

        public async Task<ApiResponseDto<List<VisitDto>>> GetEngineerScheduleAsync(string userId, DateTime? date = null)
        {
            var visits = await _visitRepository.GetByUserIdAsync(userId);
            var scheduledVisits = visits.Where(v => v.ScheduledDate.HasValue).ToList();

            if (date.HasValue)
            {
                var startOfDay = date.Value.Date;
                var endOfDay = startOfDay.AddDays(1);
                scheduledVisits = scheduledVisits.Where(v => 
                    v.ScheduledDate >= startOfDay && v.ScheduledDate < endOfDay).ToList();
            }

            var visitDtos = _mapper.Map<List<VisitDto>>(scheduledVisits);
            return ApiResponseDto<List<VisitDto>>.SuccessResult(visitDtos);
        }

        public async Task<ApiResponseDto<VisitDto>> RescheduleVisitAsync(int id, DateTime newScheduledDate)
        {
            var visit = await _visitRepository.GetByIdAsync(id);
            if (visit == null)
                return ApiResponseDto<VisitDto>.ErrorResult("Visit not found");

            visit.ScheduledDate = newScheduledDate;
            visit.UpdatedAt = DateTime.UtcNow;
            await _visitRepository.UpdateAsync(visit);

            var visitDto = _mapper.Map<VisitDto>(visit);
            return ApiResponseDto<VisitDto>.SuccessResult(visitDto, "Visit rescheduled successfully");
        }

        public async Task<ApiResponseDto<List<VisitDto>>> GetVisitsNeedingAttentionAsync()
        {
            var visits = await _visitRepository.GetAllAsync();
            var attentionNeeded = visits.Where(v => 
                (v.Priority == VisitPriority.High || v.Priority == VisitPriority.Critical) &&
                (v.Status == VisitStatus.Pending || v.Status == VisitStatus.InProgress) &&
                (!v.ScheduledDate.HasValue || v.ScheduledDate.Value < DateTime.UtcNow))
                .ToList();

            var visitDtos = _mapper.Map<List<VisitDto>>(attentionNeeded);
            return ApiResponseDto<List<VisitDto>>.SuccessResult(visitDtos);
        }
    }
} 