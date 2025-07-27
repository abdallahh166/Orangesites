using AutoMapper;
using OrangeSiteInspector.Domain.Entities;
using OrangeSiteInspector.Application.DTOs;

namespace OrangeSiteInspector.Application.Services.Mapping
{
    public class MappingProfile : Profile
    {
        public MappingProfile()
        {
            // User mappings
            CreateMap<User, UserDto>()
                .ForMember(dest => dest.UserName, opt => opt.MapFrom(src => src.UserName ?? src.Email))
                .ForMember(dest => dest.IsActive, opt => opt.MapFrom(src => src.IsActive))
                .ForMember(dest => dest.IsLocked, opt => opt.MapFrom(src => src.IsLocked))
                .ForMember(dest => dest.LastLoginAt, opt => opt.MapFrom(src => src.LastLoginAt))
                .ForMember(dest => dest.ProfilePictureUrl, opt => opt.MapFrom(src => src.ProfilePictureUrl))
                .ForMember(dest => dest.PhoneNumber, opt => opt.MapFrom(src => src.PhoneNumber))
                .ForMember(dest => dest.Department, opt => opt.MapFrom(src => src.Department))
                .ForMember(dest => dest.Position, opt => opt.MapFrom(src => src.Position))
                .ForMember(dest => dest.LanguagePreference, opt => opt.MapFrom(src => src.LanguagePreference))
                .ForMember(dest => dest.TimeZone, opt => opt.MapFrom(src => src.TimeZone));

            CreateMap<User, UserProfileDto>()
                .ForMember(dest => dest.UserName, opt => opt.MapFrom(src => src.UserName ?? src.Email))
                .ForMember(dest => dest.IsActive, opt => opt.MapFrom(src => src.IsActive))
                .ForMember(dest => dest.ProfilePictureUrl, opt => opt.MapFrom(src => src.ProfilePictureUrl))
                .ForMember(dest => dest.PhoneNumber, opt => opt.MapFrom(src => src.PhoneNumber))
                .ForMember(dest => dest.Department, opt => opt.MapFrom(src => src.Department))
                .ForMember(dest => dest.Position, opt => opt.MapFrom(src => src.Position))
                .ForMember(dest => dest.LanguagePreference, opt => opt.MapFrom(src => src.LanguagePreference))
                .ForMember(dest => dest.TimeZone, opt => opt.MapFrom(src => src.TimeZone))
                .ForMember(dest => dest.LastLoginAt, opt => opt.MapFrom(src => src.LastLoginAt));

            CreateMap<CreateUserDto, User>()
                .ForMember(dest => dest.UserName, opt => opt.MapFrom(src => src.UserName ?? src.Email))
                .ForMember(dest => dest.IsActive, opt => opt.MapFrom(src => true))
                .ForMember(dest => dest.IsLocked, opt => opt.MapFrom(src => false))
                .ForMember(dest => dest.LoginAttempts, opt => opt.MapFrom(src => 0))
                .ForMember(dest => dest.CreatedAt, opt => opt.MapFrom(src => DateTime.UtcNow));

            CreateMap<UpdateUserDto, User>()
                .ForAllMembers(opts => opts.Condition((src, dest, srcMember) => srcMember != null));

            // Enhanced User DTOs
            CreateMap<User, UserStatusDto>()
                .ForMember(dest => dest.Id, opt => opt.MapFrom(src => src.Id))
                .ForMember(dest => dest.IsActive, opt => opt.MapFrom(src => src.IsActive))
                .ForMember(dest => dest.IsLocked, opt => opt.MapFrom(src => src.IsLocked))
                .ForMember(dest => dest.LockoutEnd, opt => opt.MapFrom(src => src.LockoutEnd))
                .ForMember(dest => dest.LoginAttempts, opt => opt.MapFrom(src => src.LoginAttempts))
                .ForMember(dest => dest.LastLoginAt, opt => opt.MapFrom(src => src.LastLoginAt))
                .ForMember(dest => dest.LastLoginIp, opt => opt.MapFrom(src => src.LastLoginIp));

            CreateMap<User, UserActivityDto>()
                .ForMember(dest => dest.UserId, opt => opt.MapFrom(src => src.Id))
                .ForMember(dest => dest.UserName, opt => opt.MapFrom(src => src.UserName ?? src.Email))
                .ForMember(dest => dest.FullName, opt => opt.MapFrom(src => src.FullName))
                .ForMember(dest => dest.LastLoginAt, opt => opt.MapFrom(src => src.LastLoginAt))
                .ForMember(dest => dest.LastLoginIp, opt => opt.MapFrom(src => src.LastLoginIp))
                .ForMember(dest => dest.LoginAttempts, opt => opt.MapFrom(src => src.LoginAttempts))
                .ForMember(dest => dest.IsActive, opt => opt.MapFrom(src => src.IsActive))
                .ForMember(dest => dest.IsLocked, opt => opt.MapFrom(src => src.IsLocked));

            // Site mappings
            CreateMap<Site, SiteDto>()
                .ForMember(dest => dest.VisitCount, opt => opt.MapFrom(src => src.Visits.Count));

            CreateMap<Site, SiteDetailDto>()
                .ForMember(dest => dest.VisitCount, opt => opt.MapFrom(src => src.Visits.Count))
                .ForMember(dest => dest.RecentVisits, opt => opt.MapFrom(src => src.Visits.OrderByDescending(v => v.CreatedAt).Take(5)));

            CreateMap<CreateSiteDto, Site>();
            CreateMap<UpdateSiteDto, Site>()
                .ForAllMembers(opts => opts.Condition((src, dest, srcMember) => srcMember != null));

            // Visit mappings
            CreateMap<Visit, VisitDto>()
                .ForMember(dest => dest.SiteName, opt => opt.MapFrom(src => src.Site.Name))
                .ForMember(dest => dest.SiteCode, opt => opt.MapFrom(src => src.Site.Code))
                .ForMember(dest => dest.UserName, opt => opt.MapFrom(src => src.User.FullName))
                .ForMember(dest => dest.ComponentCount, opt => opt.MapFrom(src => src.Components.Count));

            CreateMap<Visit, VisitDetailDto>()
                .ForMember(dest => dest.SiteName, opt => opt.MapFrom(src => src.Site.Name))
                .ForMember(dest => dest.SiteCode, opt => opt.MapFrom(src => src.Site.Code))
                .ForMember(dest => dest.UserName, opt => opt.MapFrom(src => src.User.FullName))
                .ForMember(dest => dest.ComponentCount, opt => opt.MapFrom(src => src.Components.Count))
                .ForMember(dest => dest.Statistics, opt => opt.Ignore());

            CreateMap<Visit, VisitSummaryDto>()
                .ForMember(dest => dest.SiteName, opt => opt.MapFrom(src => src.Site.Name))
                .ForMember(dest => dest.UserName, opt => opt.MapFrom(src => src.User.FullName))
                .ForMember(dest => dest.ComponentCount, opt => opt.MapFrom(src => src.Components.Count));

            CreateMap<CreateVisitDto, Visit>();
            CreateMap<UpdateVisitDto, Visit>()
                .ForAllMembers(opts => opts.Condition((src, dest, srcMember) => srcMember != null));

            // VisitComponent mappings
            CreateMap<VisitComponent, VisitComponentDto>()
                .ForMember(dest => dest.OramaItemName, opt => opt.MapFrom(src => src.OramaItem.Name))
                .ForMember(dest => dest.OramaGroupName, opt => opt.MapFrom(src => src.OramaItem.OramaGroup.Name));

            CreateMap<CreateVisitComponentDto, VisitComponent>();
            CreateMap<UpdateVisitComponentDto, VisitComponent>()
                .ForAllMembers(opts => opts.Condition((src, dest, srcMember) => srcMember != null));

            // Basic Orama mappings
            CreateMap<OramaGroup, OramaGroupDto>()
                .ForMember(dest => dest.ItemCount, opt => opt.MapFrom(src => src.Items != null ? src.Items.Count : 0));

            CreateMap<OramaGroup, OramaGroupDetailDto>()
                .ForMember(dest => dest.ItemCount, opt => opt.MapFrom(src => src.Items != null ? src.Items.Count : 0));

            CreateMap<OramaItem, OramaItemDto>()
                .ForMember(dest => dest.OramaGroupName, opt => opt.MapFrom(src => src.OramaGroup != null ? src.OramaGroup.Name : ""));
        }
    }
} 