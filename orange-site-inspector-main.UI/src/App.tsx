import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { VisitProvider } from "./contexts/VisitContext";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Dashboard from "./pages/Dashboard";
import Sites from "./pages/Sites";
import Reports from "./pages/Reports";
import Visits from "./pages/Visits";
import EnhancedVisits from "./pages/EnhancedVisits";
import AddVisit from "./pages/AddVisit";
import AfterInspection from "./pages/AfterInspection";
import VisitCompletion from "./pages/VisitCompletion";
import Settings from "./pages/Settings";
import SiteElectricalReadings from "./pages/SiteElectricalReadings";
import InspectionPhotos from "./pages/InspectionPhotos";
import NotFound from "./pages/NotFound";
import Orama from "./pages/Orama";
import HealthMonitor from "./pages/HealthMonitor";
import TestDebug from "./pages/TestDebug";
import { Layout } from "@/components/Layout";
import AdminDashboard from "./pages/AdminDashboard";
import AdminUsers from "./pages/AdminUsers";
import AdminVisits from "./pages/AdminVisits";
import AdminOrama from "./pages/AdminOrama";
import EnhancedOrama from "./pages/EnhancedOrama";
import AdminFiles from "./pages/AdminFiles";
import RoleManagement from "./pages/RoleManagement";
import UserActivity from "./pages/UserActivity";
import AdvancedAnalytics from "./pages/AdvancedAnalytics";
import { NotificationProvider } from "./components/ui/notifications";
import { NetworkStatus } from "./components/ui/error-display";
import { useNetworkStatus } from "./hooks/use-network-status";
import { ErrorBoundary } from "./components/ui/ErrorBoundary";
import { LoadingSpinner } from "./components/ui/LoadingSpinner";
import SystemHealth from './pages/SystemHealth';
import TestPage from './pages/TestPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Protected Route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner fullScreen text="Checking authentication..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

// Public Route component (redirect if already authenticated)
const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner fullScreen text="Checking authentication..." />;
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

// AdminRoute: Only allow Admins
const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  if (isLoading) {
    return <LoadingSpinner fullScreen text="Checking permissions..." />;
  }
  if (!isAuthenticated || user?.role !== 'Admin') {
    return <Navigate to="/dashboard" replace />;
  }
  return <>{children}</>;
};

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<Navigate to="/login" replace />} />
    <Route path="/login" element={
      <PublicRoute>
        <ErrorBoundary><Login /></ErrorBoundary>
      </PublicRoute>
    } />
    <Route path="/signup" element={
      <PublicRoute>
        <ErrorBoundary><Signup /></ErrorBoundary>
      </PublicRoute>
    } />
    <Route path="/forgot-password" element={
      <PublicRoute>
        <ErrorBoundary><ForgotPassword /></ErrorBoundary>
      </PublicRoute>
    } />
    <Route path="/reset-password" element={
      <PublicRoute>
        <ErrorBoundary><ResetPassword /></ErrorBoundary>
      </PublicRoute>
    } />
    <Route path="/test-page" element={<TestPage />} />
    {/* Wrap all protected routes with Layout using nested routes and Outlet */}
    <Route element={<ProtectedRoute><Layout><Outlet /></Layout></ProtectedRoute>}>
      <Route path="/dashboard" element={<ErrorBoundary><Dashboard /></ErrorBoundary>} />
      <Route path="/sites" element={<ErrorBoundary><Sites /></ErrorBoundary>} />
      <Route path="/reports" element={<ErrorBoundary><Reports /></ErrorBoundary>} />
      <Route path="/visits" element={<ErrorBoundary><Visits /></ErrorBoundary>} />
      <Route path="/enhanced-visits" element={<ErrorBoundary><EnhancedVisits /></ErrorBoundary>} />
      <Route path="/add-visit" element={<ErrorBoundary><AddVisit /></ErrorBoundary>} />
      <Route path="/after-inspection/:visitId" element={<ErrorBoundary><AfterInspection /></ErrorBoundary>} />
      <Route path="/visit-completion" element={<ErrorBoundary><VisitCompletion /></ErrorBoundary>} />
      <Route path="/electrical-readings" element={<ErrorBoundary><SiteElectricalReadings /></ErrorBoundary>} />
      <Route path="/inspection-photos" element={<ErrorBoundary><InspectionPhotos /></ErrorBoundary>} />
      <Route path="/settings" element={<ErrorBoundary><Settings /></ErrorBoundary>} />
      <Route path="/orama" element={<ErrorBoundary><Orama /></ErrorBoundary>} />
      <Route path="/health-monitor" element={<ErrorBoundary><HealthMonitor /></ErrorBoundary>} />
      <Route path="/test-debug" element={<ErrorBoundary><TestDebug /></ErrorBoundary>} />
      <Route path="/user-activity" element={<ErrorBoundary><UserActivity /></ErrorBoundary>} />
      <Route path="/advanced-analytics" element={<ErrorBoundary><AdvancedAnalytics /></ErrorBoundary>} />
      <Route path="/system-health" element={<ErrorBoundary><SystemHealth /></ErrorBoundary>} />
      {/* Admin-only routes */}
      <Route path="/admin-dashboard" element={<AdminRoute><ErrorBoundary><AdminDashboard /></ErrorBoundary></AdminRoute>} />
      <Route path="/admin-users" element={<AdminRoute><ErrorBoundary><AdminUsers /></ErrorBoundary></AdminRoute>} />
      <Route path="/admin-visits" element={<AdminRoute><ErrorBoundary><AdminVisits /></ErrorBoundary></AdminRoute>} />
      <Route path="/admin-orama" element={<AdminRoute><ErrorBoundary><AdminOrama /></ErrorBoundary></AdminRoute>} />
      <Route path="/enhanced-orama" element={<AdminRoute><ErrorBoundary><EnhancedOrama /></ErrorBoundary></AdminRoute>} />
      <Route path="/admin-files" element={<AdminRoute><ErrorBoundary><AdminFiles /></ErrorBoundary></AdminRoute>} />
      <Route path="/role-management" element={<AdminRoute><ErrorBoundary><RoleManagement /></ErrorBoundary></AdminRoute>} />
    </Route>
    <Route path="*" element={<NotFound />} />
  </Routes>
);

function AppContent() {
  const { isOnline } = useNetworkStatus();

  return (
    <ErrorBoundary>
      <NetworkStatus isOnline={isOnline} />
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </ErrorBoundary>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <VisitProvider>
          <NotificationProvider>
            <TooltipProvider>
              <AppContent />
            </TooltipProvider>
          </NotificationProvider>
          </VisitProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
