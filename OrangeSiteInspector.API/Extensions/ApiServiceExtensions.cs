using FluentValidation;
using OrangeSiteInspector.Application.Interfaces;
using OrangeSiteInspector.Application.Services;
using OrangeSiteInspector.Application.Validation;
using OrangeSiteInspector.Application.Services.Mapping;

namespace OrangeSiteInspector.API.Extensions
{
    public static class ApiServiceExtensions
    {
        public static IServiceCollection AddApiServices(this IServiceCollection services)
        {
            // Register Application Services
            services.AddScoped<IUserService, UserService>();
            services.AddScoped<IAuthService, AuthService>();
            services.AddScoped<ITokenService, TokenService>();
            services.AddScoped<ISiteService, SiteService>();
            services.AddScoped<IVisitService, VisitService>();
            services.AddScoped<IOramaService, OramaService>();
            services.AddScoped<IDashboardService, DashboardService>();
            services.AddScoped<IVisitComponentService, VisitComponentService>();

            // Register AutoMapper
            services.AddAutoMapper(typeof(MappingProfile));

            // Register FluentValidation
            services.AddValidatorsFromAssemblyContaining<CreateUserDtoValidator>();

            return services;
        }
    }
} 