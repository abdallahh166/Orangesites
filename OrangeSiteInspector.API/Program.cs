using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using OrangeSiteInspector.API.Extensions;
using OrangeSiteInspector.API.Middlewares;
using OrangeSiteInspector.Domain.Entities;
using OrangeSiteInspector.Infrastructure.Data;
using OrangeSiteInspector.Infrastructure.DependencyInjection;
using Microsoft.AspNetCore.RateLimiting;
using System.Threading.RateLimiting;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddInfrastructureServices(builder.Configuration, builder.Environment);
builder.Services.AddApiServices();

// Add authorization policies
builder.Services.AddAuthorizationPolicies();

// Add controllers with JSON configuration
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Converters.Add(new System.Text.Json.Serialization.JsonStringEnumConverter());
        options.JsonSerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
    })
    .ConfigureApiBehaviorOptions(options =>
    {
        options.InvalidModelStateResponseFactory = context =>
        {
            var errors = context.ModelState.Values
                .SelectMany(v => v.Errors)
                .Select(e => e.ErrorMessage)
                .ToList();
            var response = new OrangeSiteInspector.Application.DTOs.ApiResponseDto
            {
                Success = false,
                Message = "Validation failed",
                Errors = errors
            };
            return new BadRequestObjectResult(response)
            {
                ContentTypes = { "application/json" }
            };
        };
    });

// Add Swagger documentation
builder.Services.AddSwaggerDocumentation();

// Add CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
    // Production CORS policy - update the origin as needed
    options.AddPolicy("ProductionPolicy", policy =>
    {
        policy.WithOrigins("http://se7en.runasp.net/") // TODO: Replace with your real domain
              .AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials();
    });
    // Add CORS for frontend development
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://192.168.1.10:8080")
              .AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials();
    });
});

builder.Services.AddRateLimiter(options =>
{
    options.AddPolicy<System.Net.IPAddress>("AuthPolicy", httpContext =>
    {
        var ip = httpContext.Connection.RemoteIpAddress ?? System.Net.IPAddress.None;
        return RateLimitPartition.GetFixedWindowLimiter(ip, _ => new FixedWindowRateLimiterOptions
        {
            PermitLimit = 5,
            Window = TimeSpan.FromMinutes(1),
            QueueProcessingOrder = QueueProcessingOrder.OldestFirst,
            QueueLimit = 2
        });
    });
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwaggerDocumentation();
    app.UseCors("AllowAll");
}
else
{
    app.UseCors("ProductionPolicy");
}

app.UseHttpsRedirection();

// Add security headers
app.Use(async (context, next) =>
{
    context.Response.Headers.Add("X-Content-Type-Options", "nosniff");
    context.Response.Headers.Add("X-Frame-Options", "DENY");
    context.Response.Headers.Add("X-XSS-Protection", "1; mode=block");
    context.Response.Headers.Add("Referrer-Policy", "strict-origin-when-cross-origin");
    context.Response.Headers.Add("Permissions-Policy", "geolocation=(), microphone=(), camera=()");
    await next();
});

// Use static files
app.UseStaticFiles();

// Use global exception handling
app.UseMiddleware<GlobalExceptionHandlerMiddleware>();

// Use Authentication and Authorization
app.UseAuthentication();
app.UseAuthorization();

// Use CORS for frontend
app.UseCors("AllowFrontend");

app.UseRateLimiter();

// Map controllers
app.MapControllers();

// Seed data
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    var userManager = scope.ServiceProvider.GetRequiredService<UserManager<User>>();
    var roleManager = scope.ServiceProvider.GetRequiredService<RoleManager<IdentityRole>>();
    
    // Ensure database is created
    await context.Database.EnsureCreatedAsync();
    
    // Seed data
    await DataSeeder.SeedAsync(context, userManager, roleManager);
}

app.Run();

record WeatherForecast(DateOnly Date, int TemperatureC, string? Summary)
{
    public int TemperatureF => 32 + (int)(TemperatureC / 0.5556);
}
