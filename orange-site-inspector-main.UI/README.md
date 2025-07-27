# Orange Site Inspector - Frontend

A modern, responsive web application for managing site inspections, visits, and equipment tracking for Orange Egypt. Built with React, TypeScript, and Tailwind CSS.

## 🚀 Features

### Core Features
- **Authentication & Authorization**: Secure login with role-based access (Admin, Engineer, Viewer)
- **Site Management**: Create, view, and manage inspection sites
- **Visit Management**: Schedule, track, and complete site visits
- **Equipment Tracking**: Manage Orama equipment groups and items
- **Photo Capture**: Capture and store inspection photos
- **Reports**: Generate comprehensive inspection reports

### Advanced Features
- **Health Monitoring**: Real-time API health status and system monitoring
- **Advanced Analytics**: Comprehensive dashboard with charts and statistics
- **Enhanced Workflows**: Start/complete visits, status management
- **User Activity Tracking**: Monitor user actions and system usage
- **Test & Debug Tools**: Developer tools for API testing and debugging

### Admin Features
- **User Management**: Create, edit, and manage user accounts
- **Global Dashboard**: System-wide statistics and overview
- **Bulk Operations**: Mass update sites, visits, and users
- **System Health**: Monitor API endpoints and service status

## 🛠️ Tech Stack

- **Frontend Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS with shadcn/ui components
- **State Management**: React Context + React Query
- **Routing**: React Router v6
- **HTTP Client**: Custom API client with interceptors
- **Build Tool**: Vite
- **Package Manager**: Bun (or npm/yarn)

## 📋 Prerequisites

- Node.js 18+ or Bun
- Backend API running (see backend README)
- Modern web browser

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone <repository-url>
cd OrangeSiteInspector
```

### 2. Install Dependencies
```bash
# Using Bun (recommended)
bun install

# Or using npm
npm install

# Or using yarn
yarn install
```

### 3. Environment Configuration
Copy the example environment file and configure it:
```bash
cp .env.example .env
```

Edit `.env` with your configuration:
```env
# API Configuration
VITE_API_BASE_URL=http://localhost:5000/api
VITE_API_TIMEOUT=30000

# Environment
VITE_APP_ENV=development
VITE_APP_VERSION=1.0.0
```

### 4. Start Development Server
```bash
# Using Bun
bun dev

# Or using npm
npm run dev

# Or using yarn
yarn dev
```

The application will be available at `http://localhost:5173`

## 🏗️ Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # shadcn/ui components
│   ├── AppSidebar.tsx  # Main navigation sidebar
│   └── Layout.tsx      # Main layout wrapper
├── contexts/           # React contexts
│   ├── AuthContext.tsx # Authentication state
│   └── ThemeContext.tsx # Theme management
├── hooks/              # Custom React hooks
├── lib/                # Utility libraries
│   ├── api.ts          # API client
│   └── utils.ts        # Helper functions
├── pages/              # Page components
│   ├── Dashboard.tsx   # Main dashboard
│   ├── Sites.tsx       # Site management
│   ├── Visits.tsx      # Visit management
│   └── ...             # Other pages
└── App.tsx             # Main application component
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_BASE_URL` | Backend API base URL | `http://localhost:5000/api` |
| `VITE_API_TIMEOUT` | API request timeout (ms) | `30000` |
| `VITE_APP_ENV` | Application environment | `development` |
| `VITE_APP_VERSION` | Application version | `1.0.0` |

### API Configuration

The application uses a custom API client (`src/lib/api.ts`) that handles:
- Authentication tokens
- Request/response interceptors
- Error handling
- Automatic token refresh

## 🎨 UI Components

The application uses [shadcn/ui](https://ui.shadcn.com/) components with a custom design system:

- **Colors**: Orange brand colors with dark mode support
- **Typography**: Inter font family
- **Spacing**: Consistent 4px grid system
- **Components**: Button, Card, Dialog, Form, Table, etc.

## 🔐 Authentication

The application supports three user roles:

### Admin
- Full system access
- User management
- Global analytics
- System health monitoring

### Engineer
- Site visits and inspections
- Equipment management
- Personal dashboard
- Photo capture

### Viewer
- Read-only access
- View reports and data
- Limited functionality

## 📱 Responsive Design

The application is fully responsive with:
- Mobile-first design approach
- Collapsible sidebar on mobile
- Touch-friendly interfaces
- Optimized layouts for all screen sizes

## 🧪 Testing

### Run Tests
```bash
# Using Bun
bun test

# Or using npm
npm test

# Or using yarn
yarn test
```

### Test Coverage
```bash
# Using Bun
bun test --coverage

# Or using npm
npm run test:coverage
```

## 🏭 Building for Production

### Build the Application
```bash
# Using Bun
bun run build

# Or using npm
npm run build

# Or using yarn
yarn build
```

### Preview Production Build
```bash
# Using Bun
bun run preview

# Or using npm
npm run preview

# Or using yarn
yarn preview
```

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Netlify
1. Connect your GitHub repository to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `dist`
4. Configure environment variables

### Docker
```dockerfile
# Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "preview"]
```

### Environment Variables for Production
Ensure these are set in your deployment platform:
```env
VITE_API_BASE_URL=https://your-api-domain.com/api
VITE_APP_ENV=production
```

## 🔧 Development

### Code Style
- Use TypeScript for all new code
- Follow ESLint and Prettier configuration
- Use conventional commit messages

### Adding New Features
1. Create feature branch from `main`
2. Implement feature with tests
3. Update documentation
4. Create pull request

### API Integration
1. Add types in `src/lib/api.ts`
2. Add API methods in `ApiClient` class
3. Use React Query for data fetching
4. Handle loading and error states

## 🐛 Troubleshooting

### Common Issues

**API Connection Errors**
- Verify `VITE_API_BASE_URL` is correct
- Check if backend is running
- Verify CORS configuration

**Authentication Issues**
- Clear browser storage
- Check token expiration
- Verify user credentials

**Build Errors**
- Clear node_modules and reinstall
- Check TypeScript errors
- Verify environment variables

### Debug Mode
Enable debug mode by setting:
```env
VITE_APP_ENV=development
```

This will show additional error details and debug information.

## 📚 API Documentation

The backend API documentation is available at:
- Swagger UI: `http://localhost:5000/swagger`
- OpenAPI JSON: `http://localhost:5000/swagger/v1/swagger.json`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is proprietary software owned by Orange Egypt.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

---

**Version**: 1.0.0  
**Last Updated**: December 2024
