using Microsoft.AspNetCore.Authorization;
using OrangeSiteInspector.Application.Interfaces;

namespace OrangeSiteInspector.API.Policies
{
    public class VisitManagementHandler : AuthorizationHandler<VisitManagementRequirement>
    {
        private readonly IVisitService _visitService;

        public VisitManagementHandler(IVisitService visitService)
        {
            _visitService = visitService;
        }

        protected override async Task HandleRequirementAsync(
            AuthorizationHandlerContext context, 
            VisitManagementRequirement requirement)
        {
            var user = context.User;
            var userId = user.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;

            if (string.IsNullOrEmpty(userId))
            {
                context.Fail();
                return;
            }

            // Admin can manage all visits
            if (user.IsInRole("Admin"))
            {
                context.Succeed(requirement);
                return;
            }

            // Check if the resource is a visit ID
            if (context.Resource is int visitId)
            {
                var visitResponse = await _visitService.GetByIdAsync(visitId);
                
                if (visitResponse.Success && visitResponse.Data != null)
                {
                    // Engineer can only manage their own visits (but not change status)
                    if (visitResponse.Data.UserId == userId)
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