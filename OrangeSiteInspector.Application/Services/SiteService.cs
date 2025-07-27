using AutoMapper;
using OrangeSiteInspector.Application.DTOs;
using OrangeSiteInspector.Application.Interfaces;
using OrangeSiteInspector.Domain.Entities;
using OrangeSiteInspector.Infrastructure.Repositories;

namespace OrangeSiteInspector.Application.Services
{
    public class SiteService : ISiteService
    {
        private readonly ISiteRepository _siteRepository;
        private readonly IVisitRepository _visitRepository;
        private readonly IMapper _mapper;

        public SiteService(
            ISiteRepository siteRepository,
            IVisitRepository visitRepository,
            IMapper mapper)
        {
            _siteRepository = siteRepository;
            _visitRepository = visitRepository;
            _mapper = mapper;
        }

        public async Task<ApiResponseDto<SiteDto>> GetByIdAsync(int id)
        {
            var site = await _siteRepository.GetByIdAsync(id);
            if (site == null)
                return ApiResponseDto<SiteDto>.ErrorResult("Site not found");

            var siteDto = _mapper.Map<SiteDto>(site);
            return ApiResponseDto<SiteDto>.SuccessResult(siteDto);
        }

        public async Task<ApiResponseDto<SiteDetailDto>> GetDetailByIdAsync(int id)
        {
            var site = await _siteRepository.GetByIdAsync(id);
            if (site == null)
                return ApiResponseDto<SiteDetailDto>.ErrorResult("Site not found");

            var siteDetailDto = _mapper.Map<SiteDetailDto>(site);
            
            // Calculate visit statistics
            var visits = await _visitRepository.GetBySiteIdAsync(id);
            siteDetailDto.TotalVisits = visits.Count();
            siteDetailDto.PendingVisits = visits.Count(v => v.Status == Domain.Enums.VisitStatus.Pending);
            siteDetailDto.CompletedVisits = visits.Count(v => v.Status == Domain.Enums.VisitStatus.Accepted);
            
            return ApiResponseDto<SiteDetailDto>.SuccessResult(siteDetailDto);
        }

        public async Task<ApiResponseDto<PagedResultDto<SiteDto>>> GetAllAsync(int page = 1, int pageSize = 10)
        {
            var sites = await _siteRepository.GetAllAsync();
            var siteDtos = _mapper.Map<List<SiteDto>>(sites);

            var pagedResult = new PagedResultDto<SiteDto>
            {
                Items = siteDtos.Skip((page - 1) * pageSize).Take(pageSize).ToList(),
                TotalCount = siteDtos.Count,
                Page = page,
                PageSize = pageSize
            };

            return ApiResponseDto<PagedResultDto<SiteDto>>.SuccessResult(pagedResult);
        }

        public async Task<ApiResponseDto<PagedResultDto<SiteDto>>> SearchAsync(SiteSearchDto searchDto)
        {
            var sites = await _siteRepository.GetAllAsync();
            var filteredSites = sites.AsEnumerable();

            if (!string.IsNullOrWhiteSpace(searchDto.Name))
            {
                filteredSites = filteredSites.Where(s => s.Name.Contains(searchDto.Name, StringComparison.OrdinalIgnoreCase));
            }

            if (!string.IsNullOrWhiteSpace(searchDto.Code))
            {
                filteredSites = filteredSites.Where(s => s.Code.Contains(searchDto.Code, StringComparison.OrdinalIgnoreCase));
            }

            if (!string.IsNullOrWhiteSpace(searchDto.Location))
            {
                filteredSites = filteredSites.Where(s => s.Location.Contains(searchDto.Location, StringComparison.OrdinalIgnoreCase));
            }

            if (searchDto.Status.HasValue)
            {
                filteredSites = filteredSites.Where(s => s.Status == searchDto.Status.Value);
            }

            var siteDtos = _mapper.Map<List<SiteDto>>(filteredSites);

            var pagedResult = new PagedResultDto<SiteDto>
            {
                Items = siteDtos.Skip((searchDto.Page - 1) * searchDto.PageSize).Take(searchDto.PageSize).ToList(),
                TotalCount = siteDtos.Count,
                Page = searchDto.Page,
                PageSize = searchDto.PageSize
            };

            return ApiResponseDto<PagedResultDto<SiteDto>>.SuccessResult(pagedResult);
        }

        public async Task<ApiResponseDto<SiteDto>> CreateAsync(CreateSiteDto createSiteDto)
        {
            if (await _siteRepository.CodeExistsAsync(createSiteDto.Code))
                return ApiResponseDto<SiteDto>.ErrorResult("Site code already exists");

            var site = _mapper.Map<Site>(createSiteDto);
            await _siteRepository.AddAsync(site);

            var siteDto = _mapper.Map<SiteDto>(site);
            return ApiResponseDto<SiteDto>.SuccessResult(siteDto, "Site created successfully");
        }

        public async Task<ApiResponseDto<SiteDto>> UpdateAsync(int id, UpdateSiteDto updateSiteDto)
        {
            var site = await _siteRepository.GetByIdAsync(id);
            if (site == null)
                return ApiResponseDto<SiteDto>.ErrorResult("Site not found");

            _mapper.Map(updateSiteDto, site);
            site.UpdatedAt = DateTime.UtcNow;
            await _siteRepository.UpdateAsync(site);

            var siteDto = _mapper.Map<SiteDto>(site);
            return ApiResponseDto<SiteDto>.SuccessResult(siteDto, "Site updated successfully");
        }

        public async Task<ApiResponseDto> DeleteAsync(int id)
        {
            var site = await _siteRepository.GetByIdAsync(id);
            if (site == null)
                return ApiResponseDto.ErrorResult("Site not found");

            // Check if site has visits
            var visits = await _visitRepository.GetBySiteIdAsync(id);
            if (visits.Any())
                return ApiResponseDto.ErrorResult("Cannot delete site with existing visits");

            await _siteRepository.DeleteAsync(site);
            return ApiResponseDto.SuccessResult("Site deleted successfully");
        }

        public async Task<ApiResponseDto<bool>> CodeExistsAsync(string code)
        {
            var exists = await _siteRepository.CodeExistsAsync(code);
            return ApiResponseDto<bool>.SuccessResult(exists);
        }

        public async Task<ApiResponseDto<List<SiteDto>>> GetByLocationAsync(string location)
        {
            var sites = await _siteRepository.GetByLocationAsync(location);
            var siteDtos = _mapper.Map<List<SiteDto>>(sites);
            return ApiResponseDto<List<SiteDto>>.SuccessResult(siteDtos);
        }

        // New enhanced methods implementation
        public async Task<ApiResponseDto<SiteDto>> UpdateStatusAsync(int id, UpdateSiteStatusDto updateStatusDto)
        {
            var site = await _siteRepository.GetByIdAsync(id);
            if (site == null)
                return ApiResponseDto<SiteDto>.ErrorResult("Site not found");

            site.Status = updateStatusDto.Status;
            site.UpdatedAt = DateTime.UtcNow;
            await _siteRepository.UpdateAsync(site);

            var siteDto = _mapper.Map<SiteDto>(site);
            return ApiResponseDto<SiteDto>.SuccessResult(siteDto, $"Site status updated to {updateStatusDto.Status}");
        }

        public async Task<ApiResponseDto<SiteStatisticsDto>> GetSiteStatisticsAsync()
        {
            var sites = await _siteRepository.GetAllAsync();
            var siteList = sites.ToList();

            var statistics = new SiteStatisticsDto
            {
                TotalSites = siteList.Count,
                ActiveSites = siteList.Count(s => s.Status == SiteStatus.Active),
                InactiveSites = siteList.Count(s => s.Status == SiteStatus.Inactive),
                MaintenanceSites = siteList.Count(s => s.Status == SiteStatus.Maintenance),
                DecommissionedSites = siteList.Count(s => s.Status == SiteStatus.Decommissioned),
                SitesByStatus = GetSitesByStatusChart(siteList),
                SitesByLocation = GetSitesByLocationChart(siteList)
            };

            return ApiResponseDto<SiteStatisticsDto>.SuccessResult(statistics);
        }

        public async Task<ApiResponseDto<List<SiteDto>>> GetByStatusAsync(SiteStatus status)
        {
            var sites = await _siteRepository.GetAllAsync();
            var filteredSites = sites.Where(s => s.Status == status).ToList();
            var siteDtos = _mapper.Map<List<SiteDto>>(filteredSites);
            return ApiResponseDto<List<SiteDto>>.SuccessResult(siteDtos);
        }

        public async Task<ApiResponseDto<bool>> IsSiteAccessibleAsync(int siteId, string userId)
        {
            var site = await _siteRepository.GetByIdAsync(siteId);
            if (site == null)
                return ApiResponseDto<bool>.SuccessResult(false);

            // Check if site is active
            if (site.Status != SiteStatus.Active)
                return ApiResponseDto<bool>.SuccessResult(false);

            // Check if user has visited this site
            var visits = await _visitRepository.GetBySiteIdAsync(siteId);
            var hasVisited = visits.Any(v => v.UserId == userId);
            
            return ApiResponseDto<bool>.SuccessResult(hasVisited);
        }

        public async Task<ApiResponseDto<List<SiteDto>>> GetSitesNeedingMaintenanceAsync()
        {
            var sites = await _siteRepository.GetAllAsync();
            var maintenanceSites = sites.Where(s => s.Status == SiteStatus.Maintenance).ToList();
            var siteDtos = _mapper.Map<List<SiteDto>>(maintenanceSites);
            return ApiResponseDto<List<SiteDto>>.SuccessResult(siteDtos);
        }

        public async Task<ApiResponseDto<SiteDto>> BulkUpdateStatusAsync(List<int> siteIds, UpdateSiteStatusDto updateStatusDto)
        {
            var sites = await _siteRepository.GetAllAsync();
            var sitesToUpdate = sites.Where(s => siteIds.Contains(s.Id)).ToList();

            foreach (var site in sitesToUpdate)
            {
                site.Status = updateStatusDto.Status;
                site.UpdatedAt = DateTime.UtcNow;
                await _siteRepository.UpdateAsync(site);
            }

            return ApiResponseDto<SiteDto>.SuccessResult(null, $"Updated status for {sitesToUpdate.Count} sites");
        }

        private List<ChartDataPointDto> GetSitesByStatusChart(List<Site> sites)
        {
            var statusGroups = sites.GroupBy(s => s.Status).ToList();
            var chartData = new List<ChartDataPointDto>();

            foreach (var status in Enum.GetValues<SiteStatus>())
            {
                var count = statusGroups.FirstOrDefault(g => g.Key == status)?.Count() ?? 0;
                chartData.Add(new ChartDataPointDto
                {
                    Label = status.ToString(),
                    Value = count,
                    Color = GetStatusColor(status)
                });
            }

            return chartData;
        }

        private List<ChartDataPointDto> GetSitesByLocationChart(List<Site> sites)
        {
            var locationGroups = sites.GroupBy(s => s.Location).ToList();
            var chartData = new List<ChartDataPointDto>();

            foreach (var group in locationGroups.Take(10)) // Top 10 locations
            {
                chartData.Add(new ChartDataPointDto
                {
                    Label = group.Key,
                    Value = group.Count(),
                    Color = GetRandomColor()
                });
            }

            return chartData;
        }

        private string GetStatusColor(SiteStatus status)
        {
            return status switch
            {
                SiteStatus.Active => "#28A745", // Green
                SiteStatus.Inactive => "#6C757D", // Gray
                SiteStatus.Maintenance => "#FFA500", // Orange
                SiteStatus.Decommissioned => "#DC3545", // Red
                _ => "#6C757D" // Gray
            };
        }

        private string GetRandomColor()
        {
            var colors = new[] { "#007BFF", "#28A745", "#FFC107", "#DC3545", "#6F42C1", "#FD7E14", "#20C997", "#E83E8C" };
            var random = new Random();
            return colors[random.Next(colors.Length)];
        }
    }
} 