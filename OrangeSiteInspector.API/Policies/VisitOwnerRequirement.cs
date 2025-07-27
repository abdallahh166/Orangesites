using Microsoft.AspNetCore.Authorization;

namespace OrangeSiteInspector.API.Policies
{
    public class VisitOwnerRequirement : IAuthorizationRequirement
    {
        public VisitOwnerRequirement()
        {
        }
    }
} 