using Microsoft.AspNetCore.Authorization;

namespace OrangeSiteInspector.API.Policies
{
    public class VisitManagementRequirement : IAuthorizationRequirement
    {
        public VisitManagementRequirement()
        {
        }
    }
} 