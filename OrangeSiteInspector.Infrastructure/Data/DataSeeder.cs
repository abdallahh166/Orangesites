using Microsoft.AspNetCore.Identity;
using OrangeSiteInspector.Domain.Entities;
using OrangeSiteInspector.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace OrangeSiteInspector.Infrastructure.Data
{
    public static class DataSeeder
    {
        public static async Task SeedAsync(ApplicationDbContext context, UserManager<User> userManager, RoleManager<IdentityRole> roleManager)
        {
            // Seed Roles
            await SeedRolesAsync(roleManager);
            
            // Seed Users
            await SeedUsersAsync(userManager);
            
            // Seed Orama Groups and Items
            await SeedOramaDataAsync(context);
            
            // Seed Sample Sites
            await SeedSitesAsync(context);

            // Seed Visits
            await SeedVisitsAsync(context);
        }

        private static async Task SeedRolesAsync(RoleManager<IdentityRole> roleManager)
        {
            var roles = new[] { "Admin", "Engineer" };
            
            foreach (var role in roles)
            {
                if (!await roleManager.RoleExistsAsync(role))
                {
                    await roleManager.CreateAsync(new IdentityRole(role));
                }
            }
        }

        private static async Task SeedUsersAsync(UserManager<User> userManager)
        {
            // Admin User
            var adminUser = new User
            {
                UserName = "admin@orange.com",
                Email = "admin@orange.com",
                FullName = "System Administrator",
                Role = UserRole.Admin,
                EmailConfirmed = true,
                IsActive = true,
                IsLocked = false,
                PhoneNumber = "+201234567890",
                Department = "IT Department",
                Position = "System Administrator",
                LanguagePreference = "en",
                TimeZone = "Africa/Cairo",
                ThemePreference = "dark",
                LastLoginAt = DateTime.UtcNow.AddHours(-2),
                LastLoginIp = "192.168.1.100",
                LoginAttempts = 0,
                CreatedAt = DateTime.UtcNow.AddDays(-30),
                CreatedBy = "system"
            };

            if (await userManager.FindByEmailAsync(adminUser.Email) == null)
            {
                var result = await userManager.CreateAsync(adminUser, "Admin123!");
                if (result.Succeeded)
                {
                    await userManager.AddToRoleAsync(adminUser, "Admin");
                }
            }

            // Engineer User
            var engineerUser = new User
            {
                UserName = "engineer@orange.com",
                Email = "engineer@orange.com",
                FullName = "Site Engineer",
                Role = UserRole.Engineer,
                EmailConfirmed = true,
                IsActive = true,
                IsLocked = false,
                PhoneNumber = "+201234567891",
                Department = "Operations",
                Position = "Site Engineer",
                LanguagePreference = "en",
                TimeZone = "Africa/Cairo",
                ThemePreference = "light",
                LastLoginAt = DateTime.UtcNow.AddHours(-1),
                LastLoginIp = "192.168.1.101",
                LoginAttempts = 0,
                CreatedAt = DateTime.UtcNow.AddDays(-25),
                CreatedBy = "admin@orange.com"
            };

            if (await userManager.FindByEmailAsync(engineerUser.Email) == null)
            {
                var result = await userManager.CreateAsync(engineerUser, "Engineer123!");
                if (result.Succeeded)
                {
                    await userManager.AddToRoleAsync(engineerUser, "Engineer");
                }
            }

            // Additional Sample Users
            var additionalUsers = new List<User>
            {
                new User
                {
                    UserName = "ahmed.ali@orange.com",
                    Email = "ahmed.ali@orange.com",
                    FullName = "Ahmed Ali Hassan",
                    Role = UserRole.Engineer,
                    EmailConfirmed = true,
                    IsActive = true,
                    IsLocked = false,
                    PhoneNumber = "+201234567892",
                    Department = "Operations",
                    Position = "Senior Site Engineer",
                    LanguagePreference = "ar",
                    TimeZone = "Africa/Cairo",
                    ThemePreference = "system",
                    LastLoginAt = DateTime.UtcNow.AddHours(-3),
                    LastLoginIp = "192.168.1.102",
                    LoginAttempts = 0,
                    CreatedAt = DateTime.UtcNow.AddDays(-20),
                    CreatedBy = "admin@orange.com"
                },
                new User
                {
                    UserName = "fatima.mahmoud@orange.com",
                    Email = "fatima.mahmoud@orange.com",
                    FullName = "Fatima Mahmoud Saleh",
                    Role = UserRole.Engineer,
                    EmailConfirmed = true,
                    IsActive = true,
                    IsLocked = false,
                    PhoneNumber = "+201234567893",
                    Department = "Operations",
                    Position = "Site Engineer",
                    LanguagePreference = "ar",
                    TimeZone = "Africa/Cairo",
                    ThemePreference = "light",
                    LastLoginAt = DateTime.UtcNow.AddHours(-4),
                    LastLoginIp = "192.168.1.103",
                    LoginAttempts = 0,
                    CreatedAt = DateTime.UtcNow.AddDays(-15),
                    CreatedBy = "admin@orange.com"
                },
                new User
                {
                    UserName = "omar.khalil@orange.com",
                    Email = "omar.khalil@orange.com",
                    FullName = "Omar Khalil Ibrahim",
                    Role = UserRole.Engineer,
                    EmailConfirmed = true,
                    IsActive = false,
                    IsLocked = false,
                    PhoneNumber = "+201234567894",
                    Department = "Operations",
                    Position = "Site Engineer",
                    LanguagePreference = "en",
                    TimeZone = "Africa/Cairo",
                    ThemePreference = "dark",
                    LastLoginAt = DateTime.UtcNow.AddDays(-5),
                    LastLoginIp = "192.168.1.104",
                    LoginAttempts = 0,
                    CreatedAt = DateTime.UtcNow.AddDays(-10),
                    CreatedBy = "admin@orange.com"
                },
                new User
                {
                    UserName = "nour.ahmed@orange.com",
                    Email = "nour.ahmed@orange.com",
                    FullName = "Nour Ahmed Mohamed",
                    Role = UserRole.Engineer,
                    EmailConfirmed = true,
                    IsActive = true,
                    IsLocked = true,
                    LockoutEnd = DateTime.UtcNow.AddHours(2),
                    PhoneNumber = "+201234567895",
                    Department = "Operations",
                    Position = "Site Engineer",
                    LanguagePreference = "ar",
                    TimeZone = "Africa/Cairo",
                    ThemePreference = "system",
                    LastLoginAt = DateTime.UtcNow.AddDays(-1),
                    LastLoginIp = "192.168.1.105",
                    LoginAttempts = 5,
                    CreatedAt = DateTime.UtcNow.AddDays(-5),
                    CreatedBy = "admin@orange.com"
                }
            };

            foreach (var user in additionalUsers)
            {
                if (await userManager.FindByEmailAsync(user.Email) == null)
                {
                    var result = await userManager.CreateAsync(user, "User123!");
                    if (result.Succeeded)
                    {
                        await userManager.AddToRoleAsync(user, user.Role.ToString());
                    }
                }
            }
        }

        private static async Task SeedOramaDataAsync(ApplicationDbContext context)
        {
            if (!context.OramaGroups.Any())
            {
                var groups = new List<OramaGroup>
                {
                    new OramaGroup 
                    { 
                        Name = "Electrical Equipment",
                        Description = "All electrical systems and equipment including power distribution, UPS, generators, and batteries",
                        Status = OramaStatus.Active,
                        Priority = OramaPriority.High,
                        Metadata = new Dictionary<string, object>
                        {
                            { "category", "critical" },
                            { "maintenance_frequency", "monthly" },
                            { "voltage_range", "220-380V" }
                        },
                        CreatedAt = DateTime.UtcNow.AddDays(-60),
                        CreatedBy = "system",
                        UpdatedAt = DateTime.UtcNow.AddDays(-30),
                        UpdatedBy = "admin@orange.com"
                    },
                    new OramaGroup 
                    { 
                        Name = "Mechanical Equipment",
                        Description = "Mechanical systems including HVAC, pumps, compressors, and ventilation equipment",
                        Status = OramaStatus.Active,
                        Priority = OramaPriority.High,
                        Metadata = new Dictionary<string, object>
                        {
                            { "category", "critical" },
                            { "maintenance_frequency", "quarterly" },
                            { "temperature_range", "18-25°C" }
                        },
                        CreatedAt = DateTime.UtcNow.AddDays(-55),
                        CreatedBy = "system",
                        UpdatedAt = DateTime.UtcNow.AddDays(-25),
                        UpdatedBy = "admin@orange.com"
                    },
                    new OramaGroup 
                    { 
                        Name = "Safety Equipment",
                        Description = "Safety and emergency equipment including fire extinguishers, emergency exits, and first aid supplies",
                        Status = OramaStatus.Active,
                        Priority = OramaPriority.Critical,
                        Metadata = new Dictionary<string, object>
                        {
                            { "category", "safety" },
                            { "inspection_frequency", "weekly" },
                            { "compliance_required", true }
                        },
                        CreatedAt = DateTime.UtcNow.AddDays(-50),
                        CreatedBy = "system",
                        UpdatedAt = DateTime.UtcNow.AddDays(-20),
                        UpdatedBy = "admin@orange.com"
                    },
                    new OramaGroup 
                    { 
                        Name = "Infrastructure",
                        Description = "Building infrastructure including structure, roof, drainage, and foundation systems",
                        Status = OramaStatus.Active,
                        Priority = OramaPriority.Normal,
                        Metadata = new Dictionary<string, object>
                        {
                            { "category", "structural" },
                            { "inspection_frequency", "annually" },
                            { "building_code", "Egyptian Building Code 2018" }
                        },
                        CreatedAt = DateTime.UtcNow.AddDays(-45),
                        CreatedBy = "system",
                        UpdatedAt = DateTime.UtcNow.AddDays(-15),
                        UpdatedBy = "admin@orange.com"
                    },
                    new OramaGroup 
                    { 
                        Name = "Network Equipment",
                        Description = "Telecommunications and networking equipment including switches, routers, and cabling",
                        Status = OramaStatus.Active,
                        Priority = OramaPriority.High,
                        Metadata = new Dictionary<string, object>
                        {
                            { "category", "telecom" },
                            { "maintenance_frequency", "monthly" },
                            { "backup_required", true }
                        },
                        CreatedAt = DateTime.UtcNow.AddDays(-40),
                        CreatedBy = "admin@orange.com",
                        UpdatedAt = DateTime.UtcNow.AddDays(-10),
                        UpdatedBy = "admin@orange.com"
                    }
                };

                await context.OramaGroups.AddRangeAsync(groups);
                await context.SaveChangesAsync();

                var items = new List<OramaItem>
                {
                    // Electrical Equipment
                    new OramaItem 
                    { 
                        Name = "Power Distribution Panel",
                        Description = "Main electrical distribution panel for site power management",
                        OramaGroupId = groups[0].Id,
                        Status = OramaStatus.Active,
                        Priority = OramaPriority.Critical,
                        Metadata = new Dictionary<string, object>
                        {
                            { "model", "Siemens SIVACON" },
                            { "capacity", "400A" },
                            { "voltage", "380V" },
                            { "last_inspection", "2024-01-15" }
                        },
                        CreatedAt = DateTime.UtcNow.AddDays(-60),
                        CreatedBy = "system",
                        UpdatedAt = DateTime.UtcNow.AddDays(-30),
                        UpdatedBy = "admin@orange.com"
                    },
                    new OramaItem 
                    { 
                        Name = "UPS System",
                        Description = "Uninterruptible Power Supply system for critical equipment backup",
                        OramaGroupId = groups[0].Id,
                        Status = OramaStatus.Active,
                        Priority = OramaPriority.Critical,
                        Metadata = new Dictionary<string, object>
                        {
                            { "model", "APC Smart-UPS RT 5000VA" },
                            { "capacity", "5000VA" },
                            { "battery_life", "30 minutes" },
                            { "last_test", "2024-01-10" }
                        },
                        CreatedAt = DateTime.UtcNow.AddDays(-58),
                        CreatedBy = "system",
                        UpdatedAt = DateTime.UtcNow.AddDays(-28),
                        UpdatedBy = "admin@orange.com"
                    },
                    new OramaItem 
                    { 
                        Name = "Generator",
                        Description = "Backup diesel generator for emergency power supply",
                        OramaGroupId = groups[0].Id,
                        Status = OramaStatus.Active,
                        Priority = OramaPriority.Critical,
                        Metadata = new Dictionary<string, object>
                        {
                            { "model", "Cummins C1100D5" },
                            { "capacity", "1100kVA" },
                            { "fuel_type", "diesel" },
                            { "last_maintenance", "2024-01-05" }
                        },
                        CreatedAt = DateTime.UtcNow.AddDays(-56),
                        CreatedBy = "system",
                        UpdatedAt = DateTime.UtcNow.AddDays(-26),
                        UpdatedBy = "admin@orange.com"
                    },
                    new OramaItem 
                    { 
                        Name = "Battery Bank",
                        Description = "Battery backup system for UPS and emergency lighting",
                        OramaGroupId = groups[0].Id,
                        Status = OramaStatus.Active,
                        Priority = OramaPriority.High,
                        Metadata = new Dictionary<string, object>
                        {
                            { "type", "Lead-Acid" },
                            { "capacity", "200Ah" },
                            { "voltage", "48V" },
                            { "expected_life", "5 years" }
                        },
                        CreatedAt = DateTime.UtcNow.AddDays(-54),
                        CreatedBy = "system",
                        UpdatedAt = DateTime.UtcNow.AddDays(-24),
                        UpdatedBy = "admin@orange.com"
                    },
                    
                    // Mechanical Equipment
                    new OramaItem 
                    { 
                        Name = "HVAC System",
                        Description = "Heating, Ventilation, and Air Conditioning system for climate control",
                        OramaGroupId = groups[1].Id,
                        Status = OramaStatus.Active,
                        Priority = OramaPriority.High,
                        Metadata = new Dictionary<string, object>
                        {
                            { "model", "Carrier 48TC" },
                            { "capacity", "10 tons" },
                            { "refrigerant", "R410A" },
                            { "last_service", "2024-01-12" }
                        },
                        CreatedAt = DateTime.UtcNow.AddDays(-52),
                        CreatedBy = "system",
                        UpdatedAt = DateTime.UtcNow.AddDays(-22),
                        UpdatedBy = "admin@orange.com"
                    },
                    new OramaItem 
                    { 
                        Name = "Water Pump",
                        Description = "Water circulation pump for building water system",
                        OramaGroupId = groups[1].Id,
                        Status = OramaStatus.Active,
                        Priority = OramaPriority.Normal,
                        Metadata = new Dictionary<string, object>
                        {
                            { "model", "Grundfos CR 10-5" },
                            { "flow_rate", "10 m³/h" },
                            { "head", "50m" },
                            { "last_inspection", "2024-01-08" }
                        },
                        CreatedAt = DateTime.UtcNow.AddDays(-50),
                        CreatedBy = "system",
                        UpdatedAt = DateTime.UtcNow.AddDays(-20),
                        UpdatedBy = "admin@orange.com"
                    },
                    new OramaItem 
                    { 
                        Name = "Compressor",
                        Description = "Air compressor for pneumatic systems and tools",
                        OramaGroupId = groups[1].Id,
                        Status = OramaStatus.Active,
                        Priority = OramaPriority.Normal,
                        Metadata = new Dictionary<string, object>
                        {
                            { "model", "Atlas Copco GA 11" },
                            { "capacity", "11 kW" },
                            { "pressure", "8 bar" },
                            { "last_maintenance", "2024-01-03" }
                        },
                        CreatedAt = DateTime.UtcNow.AddDays(-48),
                        CreatedBy = "system",
                        UpdatedAt = DateTime.UtcNow.AddDays(-18),
                        UpdatedBy = "admin@orange.com"
                    },
                    
                    // Safety Equipment
                    new OramaItem 
                    { 
                        Name = "Fire Extinguisher",
                        Description = "Portable fire extinguishers distributed throughout the building",
                        OramaGroupId = groups[2].Id,
                        Status = OramaStatus.Active,
                        Priority = OramaPriority.Critical,
                        Metadata = new Dictionary<string, object>
                        {
                            { "type", "ABC Powder" },
                            { "capacity", "6kg" },
                            { "expiry_date", "2025-06-15" },
                            { "last_inspection", "2024-01-15" }
                        },
                        CreatedAt = DateTime.UtcNow.AddDays(-46),
                        CreatedBy = "system",
                        UpdatedAt = DateTime.UtcNow.AddDays(-16),
                        UpdatedBy = "admin@orange.com"
                    },
                    new OramaItem 
                    { 
                        Name = "Emergency Exit",
                        Description = "Emergency exit doors and evacuation routes",
                        OramaGroupId = groups[2].Id,
                        Status = OramaStatus.Active,
                        Priority = OramaPriority.Critical,
                        Metadata = new Dictionary<string, object>
                        {
                            { "type", "Fire Rated Door" },
                            { "rating", "EI60" },
                            { "exit_route", "marked" },
                            { "last_inspection", "2024-01-10" }
                        },
                        CreatedAt = DateTime.UtcNow.AddDays(-44),
                        CreatedBy = "system",
                        UpdatedAt = DateTime.UtcNow.AddDays(-14),
                        UpdatedBy = "admin@orange.com"
                    },
                    new OramaItem 
                    { 
                        Name = "First Aid Kit",
                        Description = "First aid kits and emergency medical supplies",
                        OramaGroupId = groups[2].Id,
                        Status = OramaStatus.Active,
                        Priority = OramaPriority.High,
                        Metadata = new Dictionary<string, object>
                        {
                            { "type", "Class A" },
                            { "contents", "complete" },
                            { "expiry_check", "monthly" },
                            { "last_check", "2024-01-20" }
                        },
                        CreatedAt = DateTime.UtcNow.AddDays(-42),
                        CreatedBy = "system",
                        UpdatedAt = DateTime.UtcNow.AddDays(-12),
                        UpdatedBy = "admin@orange.com"
                    },
                    
                    // Infrastructure
                    new OramaItem 
                    { 
                        Name = "Building Structure",
                        Description = "Main building structure and load-bearing elements",
                        OramaGroupId = groups[3].Id,
                        Status = OramaStatus.Active,
                        Priority = OramaPriority.High,
                        Metadata = new Dictionary<string, object>
                        {
                            { "construction_type", "Reinforced Concrete" },
                            { "floors", 5 },
                            { "age", "15 years" },
                            { "last_inspection", "2023-12-01" }
                        },
                        CreatedAt = DateTime.UtcNow.AddDays(-40),
                        CreatedBy = "system",
                        UpdatedAt = DateTime.UtcNow.AddDays(-10),
                        UpdatedBy = "admin@orange.com"
                    },
                    new OramaItem 
                    { 
                        Name = "Roof Condition",
                        Description = "Roof structure, waterproofing, and drainage systems",
                        OramaGroupId = groups[3].Id,
                        Status = OramaStatus.Active,
                        Priority = OramaPriority.Normal,
                        Metadata = new Dictionary<string, object>
                        {
                            { "roof_type", "Flat Roof" },
                            { "waterproofing", "Bitumen" },
                            { "drainage", "functional" },
                            { "last_inspection", "2023-11-15" }
                        },
                        CreatedAt = DateTime.UtcNow.AddDays(-38),
                        CreatedBy = "system",
                        UpdatedAt = DateTime.UtcNow.AddDays(-8),
                        UpdatedBy = "admin@orange.com"
                    },
                    new OramaItem 
                    { 
                        Name = "Drainage System",
                        Description = "Storm water and sanitary drainage systems",
                        OramaGroupId = groups[3].Id,
                        Status = OramaStatus.Active,
                        Priority = OramaPriority.Normal,
                        Metadata = new Dictionary<string, object>
                        {
                            { "type", "Combined" },
                            { "material", "PVC" },
                            { "capacity", "adequate" },
                            { "last_inspection", "2023-10-20" }
                        },
                        CreatedAt = DateTime.UtcNow.AddDays(-36),
                        CreatedBy = "system",
                        UpdatedAt = DateTime.UtcNow.AddDays(-6),
                        UpdatedBy = "admin@orange.com"
                    },
                    
                    // Network Equipment
                    new OramaItem 
                    { 
                        Name = "Network Switch",
                        Description = "Core network switch for data communication",
                        OramaGroupId = groups[4].Id,
                        Status = OramaStatus.Active,
                        Priority = OramaPriority.Critical,
                        Metadata = new Dictionary<string, object>
                        {
                            { "model", "Cisco Catalyst 2960" },
                            { "ports", 48 },
                            { "speed", "1Gbps" },
                            { "last_maintenance", "2024-01-18" }
                        },
                        CreatedAt = DateTime.UtcNow.AddDays(-34),
                        CreatedBy = "admin@orange.com",
                        UpdatedAt = DateTime.UtcNow.AddDays(-4),
                        UpdatedBy = "admin@orange.com"
                    },
                    new OramaItem 
                    { 
                        Name = "Router",
                        Description = "Internet router for external connectivity",
                        OramaGroupId = groups[4].Id,
                        Status = OramaStatus.Active,
                        Priority = OramaPriority.Critical,
                        Metadata = new Dictionary<string, object>
                        {
                            { "model", "Cisco ISR 4321" },
                            { "wan_ports", 2 },
                            { "backup_connection", true },
                            { "last_config", "2024-01-16" }
                        },
                        CreatedAt = DateTime.UtcNow.AddDays(-32),
                        CreatedBy = "admin@orange.com",
                        UpdatedAt = DateTime.UtcNow.AddDays(-2),
                        UpdatedBy = "admin@orange.com"
                    }
                };

                await context.OramaItems.AddRangeAsync(items);
                await context.SaveChangesAsync();
            }
        }

        private static async Task SeedSitesAsync(ApplicationDbContext context)
        {
            if (!context.Sites.Any())
            {
                var sites = new List<Site>
                {
                    new Site
                    {
                        Name = "Orange Cairo Main Office",
                        Code = "CAI001",
                        Location = "Cairo, Egypt",
                        Address = "123 Nile Street, Downtown Cairo",
                        Status = SiteStatus.Active
                    },
                    new Site
                    {
                        Name = "Orange Alexandria Branch",
                        Code = "ALX001",
                        Location = "Alexandria, Egypt",
                        Address = "456 Corniche Road, Alexandria",
                        Status = SiteStatus.Active
                    },
                    new Site
                    {
                        Name = "Orange Giza Data Center",
                        Code = "GIZ001",
                        Location = "Giza, Egypt",
                        Address = "789 Pyramid Street, Giza",
                        Status = SiteStatus.Active
                    },
                    new Site
                    {
                        Name = "Orange Luxor Regional Office",
                        Code = "LUX001",
                        Location = "Luxor, Egypt",
                        Address = "321 Karnak Avenue, Luxor",
                        Status = SiteStatus.Maintenance
                    },
                    new Site
                    {
                        Name = "Orange Aswan Branch",
                        Code = "ASW001",
                        Location = "Aswan, Egypt",
                        Address = "654 Nile Corniche, Aswan",
                        Status = SiteStatus.Inactive
                    }
                };

                await context.Sites.AddRangeAsync(sites);
                await context.SaveChangesAsync();
            }
        }

        private static async Task SeedVisitsAsync(ApplicationDbContext context)
        {
            if (!context.Visits.Any())
            {
                var users = await context.Users.ToListAsync();
                var sites = await context.Sites.ToListAsync();

                if (users.Any() && sites.Any())
                {
                    var visits = new List<Visit>
                    {
                        new Visit
                        {
                            SiteId = sites[0].Id,
                            UserId = users[0].Id,
                            Status = Domain.Enums.VisitStatus.Pending,
                            Priority = Domain.Enums.VisitPriority.High,
                            Type = Domain.Enums.VisitType.Routine,
                            ScheduledDate = DateTime.UtcNow.AddDays(1),
                            Notes = "Initial site inspection",
                            EstimatedDurationMinutes = 120,
                            CreatedAt = DateTime.UtcNow
                        },
                        new Visit
                        {
                            SiteId = sites[1].Id,
                            UserId = users[1].Id,
                            Status = Domain.Enums.VisitStatus.InProgress,
                            Priority = Domain.Enums.VisitPriority.Normal,
                            Type = Domain.Enums.VisitType.Maintenance,
                            ScheduledDate = DateTime.UtcNow.AddHours(2),
                            StartedAt = DateTime.UtcNow.AddHours(-1),
                            Notes = "Maintenance check",
                            EstimatedDurationMinutes = 90,
                            CreatedAt = DateTime.UtcNow.AddDays(-1)
                        },
                        new Visit
                        {
                            SiteId = sites[0].Id,
                            UserId = users[0].Id,
                            Status = Domain.Enums.VisitStatus.Completed,
                            Priority = Domain.Enums.VisitPriority.Low,
                            Type = Domain.Enums.VisitType.Quality,
                            ScheduledDate = DateTime.UtcNow.AddDays(-2),
                            StartedAt = DateTime.UtcNow.AddDays(-2).AddHours(1),
                            CompletedAt = DateTime.UtcNow.AddDays(-2).AddHours(3),
                            Notes = "Quality assurance check completed",
                            EstimatedDurationMinutes = 120,
                            ActualDurationMinutes = 120,
                            CreatedAt = DateTime.UtcNow.AddDays(-3)
                        }
                    };

                    await context.Visits.AddRangeAsync(visits);
                    await context.SaveChangesAsync();
                }
            }
        }
    }
} 