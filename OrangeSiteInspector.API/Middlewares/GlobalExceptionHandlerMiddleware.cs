using System.Net;
using System.Text.Json;
using OrangeSiteInspector.Application.DTOs;

namespace OrangeSiteInspector.API.Middlewares
{
    public class GlobalExceptionHandlerMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<GlobalExceptionHandlerMiddleware> _logger;

        public GlobalExceptionHandlerMiddleware(RequestDelegate next, ILogger<GlobalExceptionHandlerMiddleware> logger)
        {
            _next = next;
            _logger = logger;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            try
            {
                await _next(context);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An unhandled exception occurred");
                await HandleExceptionAsync(context, ex);
            }
        }

        private static async Task HandleExceptionAsync(HttpContext context, Exception exception)
        {
            context.Response.ContentType = "application/json";

            var response = new ApiResponseDto
            {
                Success = false,
                Message = "An error occurred while processing your request."
            };

            switch (exception)
            {
                case ArgumentException argEx:
                    context.Response.StatusCode = (int)HttpStatusCode.BadRequest;
                    response.Message = argEx.Message;
                    break;

                case UnauthorizedAccessException:
                    context.Response.StatusCode = (int)HttpStatusCode.Unauthorized;
                    response.Message = "Unauthorized access";
                    break;

                case InvalidOperationException invalidOpEx:
                    context.Response.StatusCode = (int)HttpStatusCode.BadRequest;
                    response.Message = invalidOpEx.Message;
                    break;

                case KeyNotFoundException:
                    context.Response.StatusCode = (int)HttpStatusCode.NotFound;
                    response.Message = "Resource not found";
                    break;

                default:
                    context.Response.StatusCode = (int)HttpStatusCode.InternalServerError;
                    response.Message = "An unexpected error occurred";
                    break;
            }

            var options = new JsonSerializerOptions
            {
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase
            };

            var jsonResponse = JsonSerializer.Serialize(response, options);
            await context.Response.WriteAsync(jsonResponse);
        }
    }
} 