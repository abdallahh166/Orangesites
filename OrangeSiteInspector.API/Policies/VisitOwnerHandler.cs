using Microsoft.AspNetCore.Authorization;
using OrangeSiteInspector.Application.Interfaces;
using OrangeSiteInspector.Domain.Enums;

namespace OrangeSiteInspector.API.Policies
{
    public class VisitOwnerHandler : AuthorizationHandler<VisitOwnerRequirement>
    {
        private readonly IVisitService _visitService;

        public VisitOwnerHandler(IVisitService visitService)
        {
            _visitService = visitService;
        }

        protected override async Task HandleRequirementAsync(
            AuthorizationHandlerContext context, 
            VisitOwnerRequirement requirement)
        {
            var user = context.User;
            var userId = user.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;

            if (string.IsNullOrEmpty(userId))
            {
                context.Fail();
                return;
            }

            // Admin can access all visits
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
                    // Engineer can only access their own visits
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