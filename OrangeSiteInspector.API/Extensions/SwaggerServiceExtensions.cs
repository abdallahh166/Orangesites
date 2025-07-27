using Microsoft.OpenApi.Models;
using System.Reflection;
using System.Text.Json.Serialization;
using Microsoft.OpenApi.Any;

namespace OrangeSiteInspector.API.Extensions
{
    public static class SwaggerServiceExtensions
    {
        public static IServiceCollection AddSwaggerDocumentation(this IServiceCollection services)
        {
            services.AddSwaggerGen(c =>
            {
                c.SwaggerDoc("v1", new OpenApiInfo
                {
                    Title = "Orange Site Inspector API",
                    Version = "v1",
                    Description = "API for managing site inspections and visits",
                    Contact = new OpenApiContact
                    {
                        Name = "Orange Site Inspector Team",
                        Email = "support@orange.com"
                    }
                });

                // Add JWT Authentication
                c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
                {
                    Description = "JWT Authorization header using the Bearer scheme. Example: \"Authorization: Bearer {token}\"",
                    Name = "Authorization",
                    In = ParameterLocation.Header,
                    Type = SecuritySchemeType.ApiKey,
                    Scheme = "Bearer"
                });

                c.AddSecurityRequirement(new OpenApiSecurityRequirement
                {
                    {
                        new OpenApiSecurityScheme
                        {
                            Reference = new OpenApiReference
                            {
                                Type = ReferenceType.SecurityScheme,
                                Id = "Bearer"
                            }
                        },
                        Array.Empty<string>()
                    }
                });

                // Add XML comments
                var xmlFile = $"{Assembly.GetExecutingAssembly().GetName().Name}.xml";
                var xmlPath = Path.Combine(AppContext.BaseDirectory, xmlFile);
                if (File.Exists(xmlPath))
                {
                    c.IncludeXmlComments(xmlPath);
                }

                // Customize operation IDs
                c.CustomOperationIds(apiDesc =>
                {
                    return apiDesc.RelativePath?.Replace("/", "_").Replace("{", "").Replace("}", "");
                });

                // Configure enum handling
                c.UseAllOfToExtendReferenceSchemas();
            });

            return services;
        }

        public static IApplicationBuilder UseSwaggerDocumentation(this IApplicationBuilder app)
        {
            app.UseSwagger();
            app.UseSwaggerUI(c =>
            {
                c.SwaggerEndpoint("/swagger/v1/swagger.json", "Orange Site Inspector API v1");
                c.RoutePrefix = "swagger";
                c.DocumentTitle = "Orange Site Inspector API Documentation";
                c.DefaultModelsExpandDepth(0);
                c.DefaultModelExpandDepth(3);
                c.DisplayRequestDuration();
                c.EnableDeepLinking();
                c.EnableFilter();
                c.ShowExtensions();
            });

            return app;
        }
    }
} 