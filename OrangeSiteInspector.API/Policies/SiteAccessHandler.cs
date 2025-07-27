using Microsoft.AspNetCore.Authorization;
using OrangeSiteInspector.Application.Interfaces;

namespace OrangeSiteInspector.API.Policies
{
    public class SiteAccessHandler : AuthorizationHandler<SiteAccessRequirement>
    {
        private readonly ISiteService _siteService;
        private readonly IVisitService _visitService;

        public SiteAccessHandler(ISiteService siteService, IVisitService visitService)
        {
            _siteService = siteService;
            _visitService = visitService;
        }

        protected override async Task HandleRequirementAsync(
            AuthorizationHandlerContext context, 
            SiteAccessRequirement requirement)
        {
            var user = context.User;
            var userId = user.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;

            if (string.IsNullOrEmpty(userId))
            {
                context.Fail();
                return;
            }

            // Admin can access all sites
            if (user.IsInRole("Admin"))
            {
                context.Succeed(requirement);
                return;
            }

            // Check if the resource is a site ID
            if (context.Resource is int siteId)
            {
                // Engineer can access sites they have visited
                var visitsResponse = await _visitService.GetBySiteIdAsync(siteId);
                
                if (visitsResponse.Success && visitsResponse.Data != null)
                {
                    var hasVisited = visitsResponse.Data.Any(v => v.UserId == userId);
                    if (hasVisited)
                    {
                        context.Succeed(requirement);
                        return;
                    }
                }
            }

            context.Fail();
        }
    }
} 