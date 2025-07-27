using Microsoft.AspNetCore.Authorization;

namespace OrangeSiteInspector.API.Policies
{
    public class SiteAccessRequirement : IAuthorizationRequirement
    {
        public SiteAccessRequirement()
        {
        }
    }
} 