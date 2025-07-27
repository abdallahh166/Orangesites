# Orange Site Inspector API

A RESTful API for managing site inspections, visits, and user authentication built with ASP.NET Core 9.0.

## Features

- **Authentication & Authorization**: JWT-based authentication with role-based access control
- **User Management**: User registration, login, profile management
- **Profile Management**: User profile editing, theme preferences, password changes
- **Site Management**: CRUD operations for sites with search and filtering
- **Visit Management**: Create visits, manage components, upload images
- **Component Image Management**: Before/after image uploads for visit components
- **Report Generation**: Comprehensive visit reports with before/after images
- **Dashboard Analytics**: Comprehensive dashboard with role-based data filtering
- **Admin Dashboard**: Administrative functions for managing visits and system data
- **Admin Editing**: Site data and Orama structure management (Admin only)
- **File Upload**: Image upload functionality for visit documentation
- **Swagger Documentation**: Interactive API documentation
- **Global Exception Handling**: Centralized error handling and logging
- **Validation**: FluentValidation for request validation
- **Role-Based Authorization**: Comprehensive access control for Engineers and Admins

## Role-Based Authorization

### Engineer Role
- **Can create new visits** for sites they have access to
- **Can view only their own visits** and visit history
- **Can view only sites they have visited**
- **Can manage components** for their own visits
- **Can upload before/after images** for visit components
- **Cannot change visit status** (only Admins can)
- **Cannot access administrative functions**
- **Can view their own dashboard data** (filtered statistics and charts)
- **Cannot modify approved visits** (read-only after admin approval)

### Admin Role
- **Can view all visits** across the system
- **Can view all sites** regardless of visit history
- **Can accept or reject visits** (change visit status)
- **Can manage all system data** (sites, users, Orama groups/items)
- **Can access administrative dashboard**
- **Can view system statistics**
- **Can view global dashboard data** (all users, all sites, all visits)
- **Can view all visit reports** and component images

### Visit Status Management
- **New visits default to "Pending" status**
- **Only Admins can change visit status** (Accept/Reject)
- **Engineers cannot modify visit status** once created
- **Status changes are logged and tracked**
- **Approved visits become read-only** for engineers

## API Endpoints

### Authentication (/api/auth)
- POST /register - Register a new user
- POST /login - Login with credentials
- POST /change-password - Change user password (authenticated)
- POST /forgot-password - Request password reset
- POST /reset-password - Reset password with token
- POST /confirm-email - Confirm email address

### Users (/api/users)
- GET /profile - Get current user profile (authenticated)
- PUT /profile - Update current user profile (authenticated, Engineer can only edit own)
- PUT /theme - Update theme preference (light/dark/system)
- GET /check-email - Check if email exists
- GET /check-username - Check if username exists
- GET /{id} - Get user by ID (Admin only)
- GET / - Get all users with pagination (Admin only)
- GET /by-role/{role} - Get users by role (Admin only)
- PUT /{id} - Update user (Admin only)
- DELETE /{id} - Delete user (Admin only)

### Sites (/api/sites)
- GET / - Get all sites with pagination (filtered by role)
- POST /search - Search sites with filters (role-based access)
- GET /{id} - Get site by ID (with access control)
- GET /{id}/details - Get site details with recent visits (with access control)
- POST / - Create a new site (Admin only)
- PUT /{id} - Update site information (Admin only)
- DELETE /{id} - Delete site (Admin only)
- GET /code-exists/{code} - Check if site code exists (Admin only)
- GET /by-location/{location} - Get sites by location (with access control)

### Visits (/api/visits)
- GET / - Get all visits with pagination (filtered by role)
- POST /search - Search visits with filters (role-based access)
- GET /{id} - Get visit by ID (with ownership check)
- GET /{id}/details - Get visit details with components (with ownership check)
- POST / - Create a new visit (Engineer only)
- PUT /{id}/status - Update visit status (Admin only)
- DELETE /{id} - Delete visit (Admin only, or Engineer can delete their own)
- GET /by-site/{siteId} - Get visits by site ID (with access control)
- GET /my-visits - Get current user's visits
- GET /by-status/{status} - Get visits by status (Admin only)
- GET /by-date-range - Get visits by date range (Admin only)

### Visit Components (/api/visitcomponents)
- GET /visit/{visitId} - Get all components for a visit (with access control)
- GET /{componentId} - Get specific component by ID (with access control)
- POST / - Create a new component for a visit (Engineer only)
- PUT /{componentId} - Update component comment (Engineer only, not for approved visits)
- DELETE /{componentId} - Delete component (Engineer only, not for approved visits)
- POST /upload-image - Upload before/after image for component (Engineer only)
- POST /bulk-upload - Bulk upload images for multiple components (Engineer only)
- DELETE /{componentId}/image/{imageType} - Delete image from component (Engineer only)
- GET /visit/{visitId}/report - Generate full visit report with before/after images
- GET /visit/{visitId}/final-report - Generate final report (after images only)

### Dashboard (/api/dashboard)
- GET /overview - Get dashboard overview (Admin only)
- GET /engineer - Get engineer dashboard data (filtered for current user)
- GET /admin - Get admin dashboard data (global view)
- GET /my-dashboard - Get role-specific dashboard data
- GET /stats - Get dashboard statistics with optional filtering
- GET /charts - Get dashboard charts with optional filtering
- GET /latest-visits - Get latest visits with optional filtering
- GET /recent-sites - Get recent sites with optional filtering
- GET /visits-by-status - Get visits by status chart data
- GET /visits-by-month - Get visits by month chart data
- GET /visits-by-day - Get visits by day chart data
- GET /top-sites - Get top sites by visit count
- GET /visits-by-engineer - Get visits by engineer (Admin only)
- GET /sites-by-visits - Get sites by visit count (Admin only)

### Admin (/api/admin)
- GET /visits/pending - Get all pending visits for review
- PUT /visits/{visitId}/accept - Accept a visit
- PUT /visits/{visitId}/reject - Reject a visit
- GET /dashboard/stats - Get dashboard statistics (legacy endpoint)
- GET /visits/recent - Get recent visits for admin review
- GET /visits/by-date-range - Get visits by date range for admin review
- GET /orama/groups - Get all Orama groups for management
- GET /orama/items - Get all Orama items for management
- POST /orama/groups - Create new Orama group
- POST /orama/items - Create new Orama item

### Orama (/api/orama)
- GET /groups - Get all Orama groups
- GET /groups/{id} - Get Orama group by ID with items
- POST /groups - Create new Orama group (Admin only)
- PUT /groups/{id} - Update Orama group (Admin only)
- DELETE /groups/{id} - Delete Orama group (Admin only)
- GET /items - Get all Orama items
- GET /groups/{groupId}/items - Get Orama items by group ID
- GET /items/{id} - Get Orama item by ID
- POST /items - Create new Orama item (Admin only)
- PUT /items/{id} - Update Orama item (Admin only)
- DELETE /items/{id} - Delete Orama item (Admin only)

### File Upload (/api/fileupload)
- POST /visit-image - Upload visit image
- POST /visit-images - Upload multiple visit images
- DELETE /visit-image - Delete visit image

### Health Check (/api/health)
- GET / - Basic health check
- GET /detailed - Detailed health check with database connectivity

## Component Image Management

### Image Upload Features
- **Before/After Images**: Engineers can upload both "before" and "after" images for each component
- **File Validation**: Supports JPG, JPEG, PNG, GIF formats with 10MB max file size
- **Organized Storage**: Images are stored in organized directory structure by visit and component
- **Unique Naming**: Files are saved with unique timestamps and GUIDs to prevent conflicts
- **Bulk Upload**: Support for uploading multiple images at once for efficiency

### Image Storage Structure
wwwroot/uploads/visits/{visitId}/components/{componentId}/
├── before_20241201_143022_abc123.jpg
├── after_20241201_143022_def456.png
└── ...


### Access Control
- **Engineers**: Can upload/delete images only for their own visits
- **Admins**: Can view all images but cannot modify them
- **Approved Visits**: Images become read-only after visit approval

## Report Generation

### Visit Report (Full)
- **Complete Documentation**: Includes all components with before/after images
- **Site Information**: Site details, engineer information, visit metadata
- **Component Details**: Each component with images, comments, and Orama item information
- **Timestamps**: Creation and update timestamps for audit trail

### Final Report (After Images Only)
- **Clean Presentation**: Shows only the final state (after images)
- **Professional Output**: Suitable for client delivery and documentation
- **Component Summary**: Essential information without before images
- **Streamlined Format**: Focused on results rather than process

### Report Access
- **Engineers**: Can generate reports for their own visits
- **Admins**: Can generate reports for any visit in the system
- **Read-Only**: Reports are view-only and cannot be modified

## User Profile Management

### Profile Editing
- **Personal Information**: Users can update their full name and email address
- **Password Changes**: Secure password updates with current password verification
- **Theme Preferences**: Toggle between light, dark, and system theme modes
- **Access Control**: Engineers can only edit their own profile, Admins can edit any profile

### Theme Management
- **Light Mode**: Traditional light theme for bright environments
- **Dark Mode**: Dark theme for low-light conditions and reduced eye strain
- **System Mode**: Automatically follows the user's system preference
- **Persistent Storage**: Theme preference is saved in the database and restored on login

### Profile Security
- **Email Validation**: Email changes require validation to prevent unauthorized access
- **Password Verification**: Current password required for sensitive changes
- **Audit Trail**: Profile changes are tracked with timestamps
- **Role-Based Access**: Different permissions based on user role

## Admin Editing Capabilities

### Site Management (Admin Only)
- **Site Information**: Update site name, code, location, and address
- **Site Creation**: Create new sites with unique codes
- **Site Deletion**: Remove sites from the system (with validation)
- **Code Validation**: Ensure site codes are unique across the system
- **Location Filtering**: Search and filter sites by location

### Orama Structure Management (Admin Only)
- **Group Management**: Create, update, and delete Orama groups
- **Item Management**: Add, modify, and remove Orama items within groups
- **Structure Validation**: Ensure data integrity and prevent orphaned items
- **Future-Only Changes**: Orama edits only affect future visits, preserving historical data

### Data Integrity
- **Historical Preservation**: Existing visits retain their original Orama structure
- **Referential Integrity**: Prevent deletion of groups/items that are in use
- **Validation Rules**: Ensure data consistency and prevent conflicts
- **Audit Logging**: Track all administrative changes for accountability

## Dashboard Features

### Engineer Dashboard
Engineers can access their personalized dashboard with:
- **Personal Statistics**: Total visits, visits this month, pending/accepted/rejected visits
- **Performance Metrics**: Average visits per day, visits today/this week
- **Recent Activity**: Latest visits and recently visited sites
- **Charts**: Visits by status, visits by month, top visited sites
- **Filtered Data**: All data is automatically filtered to show only their own visits

### Admin Dashboard
Admins can access the global dashboard with:
- **Global Statistics**: Total visits across all users, system-wide metrics
- **User Management**: Recent users, visits by engineer
- **Site Analytics**: Top sites by visit count, recent sites
- **Comprehensive Charts**: All chart data across the entire system
- **Unfiltered Access**: Can view all data or apply filters as needed

### Dashboard Filtering
All dashboard endpoints support optional filtering:
- **Date Range**: Filter by start and end dates
- **User Filter**: Filter by specific user (Admin only)
- **Site Filter**: Filter by specific site
- **Status Filter**: Filter by visit status
- **Automatic Role Filtering**: Engineers automatically see only their data

### Chart Data
Dashboard provides various chart data points:
- **Visits by Status**: Pending, Accepted, Rejected counts
- **Visits by Month**: Monthly visit trends (configurable months)
- **Visits by Day**: Daily visit trends (configurable days)
- **Top Sites**: Sites with highest visit counts
- **Visits by Engineer**: Engineer performance comparison (Admin only)

## Authentication

The API uses JWT (JSON Web Tokens) for authentication. To access protected endpoints:

1. Register a user using POST /api/auth/register
2. Login using POST /api/auth/login to get a JWT token
3. Include the token in the Authorization header: Bearer {token}

## Authorization Policies

The API implements several authorization policies:

- **AdminOnly**: Only Admin role can access
- **EngineerOnly**: Only Engineer role can access
- **AdminOrEngineer**: Either Admin or Engineer role can access
- **VisitOwner**: User can only access their own visits
- **SiteAccess**: User can access sites they have visited
- **VisitManagement**: Admin can manage all visits, Engineer can manage their own

## Roles

- **Admin**: Full access to all endpoints and administrative functions
- **Engineer**: Can create visits, manage components, and view their own sites/visits
- **User**: Basic access to view sites and their own visits

## Access Control Examples

### Engineer Access
json
{
  "role": "Engineer",
  "permissions": {
    "visits": {
      "create": true,
      "view_own": true,
      "view_all": false,
      "change_status": false
    },
    "sites": {
      "view_visited": true,
      "view_all": false,
      "create": false,
      "update": false
    },
    "components": {
      "create": true,
      "update_own": true,
      "upload_images": true,
      "delete_own": true
    },
    "dashboard": {
      "view_own_stats": true,
      "view_global_stats": false,
      "view_own_charts": true,
      "view_global_charts": false
    }
  }
}


### Admin Access
json
{
  "role": "Admin",
  "permissions": {
    "visits": {
      "create": true,
      "view_own": true,
      "view_all": true,
      "change_status": true
    },
    "sites": {
      "view_visited": true,
      "view_all": true,
      "create": true,
      "update": true
    },
    "components": {
      "create": true,
      "update_all": true,
      "upload_images": true,
      "delete_all": true
    },
    "dashboard": {
      "view_own_stats": true,
      "view_global_stats": true,
      "view_own_charts": true,
      "view_global_charts": true
    }
  }
}


## File Upload

The API supports image upload for visit documentation:

- Supported formats: JPG, JPEG, PNG, GIF
- Maximum file size: 10MB per file
- Maximum files per upload: 10 files
- Organized storage structure by visit and component
- Automatic file validation and sanitization

## Swagger Documentation

Access the interactive API documentation at /swagger when running in development mode.

## Getting Started

### Prerequisites

- .NET 9.0 SDK
- SQL Server (or SQL Server Express)
- Visual Studio 2022 or VS Code

### Configuration

1. Update the connection string in appsettings.json
2. Configure JWT settings in appsettings.json
3. Ensure the database is created and seeded

### Running the API

bash
cd OrangeSiteInspector.API
dotnet run


The API will be available at:
- API: https://localhost:7001
- Swagger: https://localhost:7001/swagger
- Health Check: https://localhost:7001/api/health

## Error Handling

The API uses centralized error handling with consistent response formats:

json
{
  "success": false,
  "message": "Error description",
  "data": null
}


## Validation

All request DTOs are validated using FluentValidation with detailed error messages.

## CORS

CORS is configured to allow all origins in development. Configure appropriately for production.

## Database

The API uses Entity Framework Core with SQL Server. The database will be created automatically on first run with seeded data including:

- Default roles (Admin, Engineer, User)
- Sample users
- Sample Orama groups and items
- Sample sites

## Security

- JWT tokens with configurable expiration
- Password hashing using ASP.NET Core Identity
- Role-based authorization with custom policies
- Input validation and sanitization
- File upload security (type and size validation)
- Visit ownership validation
- Site access control based on visit history i want a prompt to make a front end for this api 



You are a frontend engineer building a luxury, modern web application for the Orange Site Inspector API, a RESTful API for managing site inspections.


🧭 MAIN STRUCTURE:
- **Auth Pages**: Login, Register, Forgot Password, Reset Password, Change Password
- **Main Layout**: Navbar (Dashboard, Sites, New Visit, Reports, Settings), Sidebar (for roles), Theme Toggle
- **Dashboard**: Role-specific dashboards (Admin & Engineer) showing stats, charts, and recent activity
- **Sites**:
  - List with search, filters, pagination
  - Site Details with latest visits
  - Admin: Create, Edit, Delete
- **Visits**:
  - Engineer: Create new visit via multistep wizard (select site → select components → upload images)
  - Admin & Engineer: View visit details (with comments, images, status)
  - Admin: Accept/Reject visit
- **Reports**:
  - Full visit report (before/after)
  - Final report (after only)
  - PDF Export Button
- **Component Management**:
  - Upload before/after images
  - Add comments
  - Status display: Pending, Accepted, Rejected
- **Orama Editor** (Admin only):
  - View Orama groups & items
  - Create/Edit/Delete groups/items
- **Settings**:
  - Profile Edit (Full name, email)
  - Theme Preference
  - Password change
  - Admin: Edit users, assign roles

🔐 AUTH & ROLES:
- Use JWT token from backend for login/session.
- Decode token to extract role (Admin / Engineer).
- Route guard and interceptor for protected APIs.
- Role-based conditional rendering of components/routes.

📦 INTEGRATION:
- Integrate all endpoints from the documented API (e.g., `/api/auth/login`, `/api/sites`, `/api/visits`)
- Use services with HttpClient to call APIs and return observables
- Handle loading states, errors, and success notifications

📊 CHARTS & ANALYTICS:
- showing charts (visits by status/month/day, top sites)
- Admin can see global data, engineers see their own only


- Add unit testing with Jasmine/Karma for key components and services
- Add internationalization (i18n) support for English and Arabic
- Add offline-ready features using service workers 

💡 GOAL:
Build a production-ready frontend fully connected to the Orange Site Inspector API with role-based UI, responsive UX, theming, and comprehensive CRUD operations.