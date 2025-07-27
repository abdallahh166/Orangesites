using Microsoft.AspNetCore.Authorization;
using OrangeSiteInspector.API.Policies;

namespace OrangeSiteInspector.API.Extensions
{
    public static class AuthorizationServiceExtensions
    {
        public static IServiceCollection AddAuthorizationPolicies(this IServiceCollection services)
        {
            services.AddAuthorization(options =>
            {
                // Admin policy - only Admin role can access
                options.AddPolicy("AdminOnly", policy =>
                    policy.RequireRole("Admin"));

                // Engineer policy - only Engineer role can access
                options.AddPolicy("EngineerOnly", policy =>
                    policy.RequireRole("Engineer"));

                // Admin or Engineer policy - either role can access
                options.AddPolicy("AdminOrEngineer", policy =>
                    policy.RequireRole("Admin", "Engineer"));

                // Visit owner policy - user can only access their own visits
                options.AddPolicy("VisitOwner", policy =>
                    policy.Requirements.Add(new VisitOwnerRequirement()));

                // Site access policy - user can access sites they have visited
                options.AddPolicy("SiteAccess", policy =>
                    policy.Requirements.Add(new SiteAccessRequirement()));

                // Visit management policy - Admin can manage all visits, Engineer can manage their own
                options.AddPolicy("VisitManagement", policy =>
                    policy.Requirements.Add(new VisitManagementRequirement()));
            });

            // Register authorization handlers
            services.AddScoped<IAuthorizationHandler, VisitOwnerHandler>();
            services.AddScoped<IAuthorizationHandler, SiteAccessHandler>();
            services.AddScoped<IAuthorizationHandler, VisitManagementHandler>();

            return services;
        }
    }
} 