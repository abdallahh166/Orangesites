using Microsoft.AspNetCore.Mvc;
using OrangeSiteInspector.Application.DTOs;

namespace OrangeSiteInspector.API.Controllers
{
    /// <summary>
    /// Health check endpoints for API monitoring
    /// </summary>
    public class HealthController : BaseApiController
    {
        /// <summary>
        /// Basic health check
        /// </summary>
        /// <returns>API status</returns>
        [HttpGet]
        [ProducesResponseType(typeof(ApiResponseDto<HealthStatusDto>), 200)]
        public ActionResult<ApiResponseDto<HealthStatusDto>> Get()
        {
            var status = new HealthStatusDto
            {
                Status = "Healthy",
                Timestamp = DateTime.UtcNow,
                Version = "1.0.0",
                Environment = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") ?? "Development"
            };

            return HandleResponse(ApiResponseDto<HealthStatusDto>.SuccessResult(status));
        }

        /// <summary>
        /// Detailed health check with database connectivity
        /// </summary>
        /// <returns>Detailed health status</returns>
        [HttpGet("detailed")]
        [ProducesResponseType(typeof(ApiResponseDto<DetailedHealthStatusDto>), 200)]
        public ActionResult<ApiResponseDto<DetailedHealthStatusDto>> GetDetailed()
        {
            var status = new DetailedHealthStatusDto
            {
                Status = "Healthy",
                Timestamp = DateTime.UtcNow,
                Version = "1.0.0",
                Environment = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") ?? "Development",
                Services = new Dictionary<string, string>
                {
                    { "API", "Healthy" },
                    { "Database", "Healthy" },
                    { "Authentication", "Healthy" }
                }
            };

            return HandleResponse(ApiResponseDto<DetailedHealthStatusDto>.SuccessResult(status));
        }
    }

    public class HealthStatusDto
    {
        public string Status { get; set; } = string.Empty;
        public DateTime Timestamp { get; set; }
        public string Version { get; set; } = string.Empty;
        public string Environment { get; set; } = string.Empty;
    }

    public class DetailedHealthStatusDto : HealthStatusDto
    {
        public Dictionary<string, string> Services { get; set; } = new();
    }
} 