import React, { Suspense, lazy } from 'react';
import { BrowserRouter, HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { BrandingProvider, useBranding } from './context/BrandingContext';
import { ToastProvider } from './context/ToastContext';
import { Layout } from './components/Layout';
import { LandingPage } from './pages/LandingPage';
import { DashboardPage } from './pages/DashboardPage';

// Performance-optimized dynamic code splitting for sub-pages
const LoginPage = lazy(() => import('./pages/LoginPage').then(m => ({ default: m.LoginPage })));
const PublicEnquiryPage = lazy(() => import('./pages/PublicEnquiryPage').then(m => ({ default: m.PublicEnquiryPage })));
const StudentsPage = lazy(() => import('./pages/StudentsPage').then(m => ({ default: m.StudentsPage })));
const AttendancePage = lazy(() => import('./pages/AttendancePage').then(m => ({ default: m.AttendancePage })));
const ExaminationsPage = lazy(() => import('./pages/ExaminationsPage').then(m => ({ default: m.ExaminationsPage })));
const FeesPage = lazy(() => import('./pages/FeesPage').then(m => ({ default: m.FeesPage })));
const ReportsPage = lazy(() => import('./pages/ReportsPage').then(m => ({ default: m.ReportsPage })));
const AcademicPage = lazy(() => import('./pages/AcademicPage').then(m => ({ default: m.AcademicPage })));
const TimetablePage = lazy(() => import('./pages/TimetablePage').then(m => ({ default: m.TimetablePage })));
const TransportPage = lazy(() => import('./pages/TransportPage').then(m => ({ default: m.TransportPage })));
const CareerPage = lazy(() => import('./pages/CareerPage').then(m => ({ default: m.CareerPage })));
const StaffAttendancePage = lazy(() => import('./pages/StaffAttendancePage').then(m => ({ default: m.StaffAttendancePage })));
const TreasuryPage = lazy(() => import('./pages/TreasuryPage').then(m => ({ default: m.TreasuryPage })));
const TuitionsAdminPage = lazy(() => import('./pages/TuitionsAdminPage').then(m => ({ default: m.TuitionsAdminPage })));
const TuitionRecommendationsPage = lazy(() => import('./pages/TuitionRecommendationsPage').then(m => ({ default: m.TuitionRecommendationsPage })));
const SocialWallPage = lazy(() => import('./pages/SocialWallPage').then(m => ({ default: m.SocialWallPage })));
const CoordinatorsPage = lazy(() => import('./pages/CoordinatorsPage').then(m => ({ default: m.CoordinatorsPage })));
const StudentRewardsPage = lazy(() => import('./pages/StudentRewardsPage').then(m => ({ default: m.StudentRewardsPage })));
const AdminRewardsPage = lazy(() => import('./pages/AdminRewardsPage').then(m => ({ default: m.AdminRewardsPage })));
const CustomizeAdminPage = lazy(() => import('./pages/CustomizeAdminPage').then(m => ({ default: m.CustomizeAdminPage })));
const ModuleHubPage = lazy(() => import('./pages/ModuleHubPage').then(m => ({ default: m.ModuleHubPage })));
const ParentNotificationsPage = lazy(() => import('./pages/ParentNotificationsPage').then(m => ({ default: m.ParentNotificationsPage })));
const InboxPage = lazy(() => import('./pages/InboxPage').then(m => ({ default: m.InboxPage })));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage').then(m => ({ default: m.NotFoundPage })));

import { WelcomeScreen } from './components/WelcomeScreen';
import { RoleGuard } from './components/RoleGuard';
import { ErrorBoundary } from './components/ErrorBoundary';

// Clean Apple-style lightweight route fallback loader
const RouteLoader: React.FC = () => (
  <div className="flex flex-col items-center justify-center min-h-[50vh] p-8 space-y-4 animate-fadeIn">
    <div className="w-9 h-9 border-3 border-[#0071E3] border-t-transparent rounded-full animate-spin"></div>
    <span className="text-xs font-semibold text-slate-500 tracking-wide">Loading module...</span>
  </div>
);

// In Electron / file protocol, HashRouter avoids file:// 404 routing issues; BrowserRouter is used on web
const isElectron =
  typeof window !== 'undefined' &&
  (window.location.protocol === 'file:' ||
    Boolean((window as any).electronAPI) ||
    navigator.userAgent.toLowerCase().includes('electron'));

const RouterComponent = isElectron ? HashRouter : BrowserRouter;

// Root handler: displays Public Landing Page when logged out, Dashboard when logged in
const RootHandler: React.FC = () => {
  const { token, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#E9EEF5]">
        <div className="w-8 h-8 border-3 border-[#0071E3] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!token) {
    return <LandingPage />;
  }

  return (
    <Layout>
      <DashboardPage />
    </Layout>
  );
};

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#E9EEF5]">
        <div className="w-8 h-8 border-3 border-[#0071E3] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!token) {
    return <Navigate to="/?login=true" replace />;
  }

  return <>{children}</>;
};

// Notifications Dispatcher: Displays ParentNotificationsPage for parents, ModuleHubPage for staff
const NotificationsRouteDispatcher: React.FC = () => {
  const { user } = useAuth();
  if (user?.portal_type === 'parent') {
    return <ParentNotificationsPage />;
  }
  return (
    <RoleGuard allowedPortals={['staff']}>
      <ModuleHubPage />
    </RoleGuard>
  );
};

export function App() {
  const [showWelcome, setShowWelcome] = React.useState<boolean>(() => {
    try {
      return !sessionStorage.getItem('evergrow_welcome_shown');
    } catch {
      return false;
    }
  });

  return (
    <AuthProvider>
      <BrandingProvider>
        <ToastProvider>
        {showWelcome && (
          <WelcomeScreen
            schoolName="Ever Grow Schools"
            onComplete={() => setShowWelcome(false)}
          />
        )}
        <ErrorBoundary>
        <RouterComponent>
          <Suspense fallback={<RouteLoader />}>
            <Routes>
            {/* Root Route: Landing Page if guest, Dashboard if authenticated */}
            <Route path="/" element={<RootHandler />} />

            {/* Direct Login URL: Opens Full-Screen Split LoginPage */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/standalone-login" element={<LoginPage />} />

            {/* Public Admission Form */}
            <Route path="/admission-enquiry" element={<PublicEnquiryPage isPublic={true} />} />

            {/* Authenticated Dashboard Shell for Sub-pages */}
            <Route
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route path="/dashboard" element={<Navigate to="/" replace />} />
              <Route path="/social-wall" element={<SocialWallPage />} />
              
              {/* Staff-Only Protected Routes */}
              <Route
                path="/students"
                element={
                  <RoleGuard allowedPortals={['staff']} restrictedMessage="Access Restricted: Student Records & Admission portal is reserved for school staff.">
                    <StudentsPage />
                  </RoleGuard>
                }
              />
              <Route
                path="/academic"
                element={
                  <RoleGuard allowedPortals={['staff']} restrictedMessage="Access Restricted: Academic structure management is reserved for faculty and coordinators.">
                    <AcademicPage />
                  </RoleGuard>
                }
              />
              <Route path="/attendance" element={<AttendancePage />} />
              <Route path="/timetable" element={<TimetablePage />} />
              <Route path="/examinations" element={<ExaminationsPage />} />
              <Route path="/fees" element={<FeesPage />} />
              <Route path="/transport" element={<TransportPage />} />
              <Route path="/career" element={<CareerPage />} />
              <Route
                path="/staff-attendance"
                element={
                  <RoleGuard allowedPortals={['staff']} restrictedMessage="Access Restricted: Faculty attendance register is reserved for school administration.">
                    <StaffAttendancePage />
                  </RoleGuard>
                }
              />
              <Route
                path="/treasury"
                element={
                  <RoleGuard allowedPortals={['staff']} allowedRoles={['super_admin', 'school_admin', 'principal', 'accountant']} restrictedMessage="Access Restricted: School Treasury is restricted to authorized financial officers.">
                    <TreasuryPage />
                  </RoleGuard>
                }
              />
              <Route
                path="/tuitions"
                element={
                  <RoleGuard allowedPortals={['staff']} restrictedMessage="Access Restricted: After-school coaching directory management is reserved for staff.">
                    <TuitionsAdminPage />
                  </RoleGuard>
                }
              />
              <Route path="/tuition-recommendations" element={<TuitionRecommendationsPage />} />
              <Route
                path="/coordinators"
                element={
                  <RoleGuard allowedPortals={['staff']} restrictedMessage="Access Restricted: Academic Coordinators registry is restricted to faculty leads.">
                    <CoordinatorsPage />
                  </RoleGuard>
                }
              />
              <Route path="/rewards" element={<StudentRewardsPage />} />
              <Route path="/student/rewards" element={<StudentRewardsPage />} />
              <Route
                path="/admin/rewards"
                element={
                  <RoleGuard allowedPortals={['staff']} restrictedMessage="Access Restricted: Rewards & honors store management is reserved for school staff.">
                    <AdminRewardsPage />
                  </RoleGuard>
                }
              />
              <Route
                path="/reports"
                element={
                  <RoleGuard allowedPortals={['staff']} restrictedMessage="Access Restricted: Official institutional report cards and export generation is reserved for staff.">
                    <ReportsPage />
                  </RoleGuard>
                }
              />
              <Route path="/enquiry" element={<PublicEnquiryPage />} />

              {/* Extended Enterprise Modules */}
              <Route path="/approvals" element={<RoleGuard allowedPortals={['staff']}><ModuleHubPage /></RoleGuard>} />
              <Route path="/notifications" element={<NotificationsRouteDispatcher />} />
              <Route path="/parent-notifications" element={<ParentNotificationsPage />} />
              <Route path="/inbox" element={<InboxPage />} />
              <Route path="/parents" element={<RoleGuard allowedPortals={['staff']}><ModuleHubPage /></RoleGuard>} />
              <Route path="/homework" element={<RoleGuard allowedPortals={['staff']}><ModuleHubPage /></RoleGuard>} />
              <Route path="/library" element={<RoleGuard allowedPortals={['staff']}><ModuleHubPage /></RoleGuard>} />
              <Route path="/hostel" element={<Navigate to="/" replace />} />
              <Route path="/payroll" element={<RoleGuard allowedPortals={['staff']} allowedRoles={['super_admin', 'school_admin', 'principal', 'accountant']}><ModuleHubPage /></RoleGuard>} />
              <Route path="/inventory" element={<RoleGuard allowedPortals={['staff']}><ModuleHubPage /></RoleGuard>} />
              <Route path="/billing" element={<RoleGuard allowedPortals={['staff']}><ModuleHubPage /></RoleGuard>} />
              <Route path="/scholarships" element={<RoleGuard allowedPortals={['staff']}><ModuleHubPage /></RoleGuard>} />
              <Route path="/events" element={<RoleGuard allowedPortals={['staff']}><ModuleHubPage /></RoleGuard>} />
              <Route path="/visitors" element={<RoleGuard allowedPortals={['staff']}><ModuleHubPage /></RoleGuard>} />
              <Route path="/helpdesk" element={<RoleGuard allowedPortals={['staff']}><ModuleHubPage /></RoleGuard>} />
              <Route path="/analytics" element={<RoleGuard allowedPortals={['staff']} allowedRoles={['super_admin', 'school_admin', 'principal']}><ModuleHubPage /></RoleGuard>} />

              {/* Super Admin Dedicated Administration Hub */}
              <Route
                path="/admin/customize"
                element={
                  <RoleGuard allowedPortals={['staff']} allowedRoles={['super_admin']} restrictedMessage="Access Restricted: System Customization is exclusively reserved for the Super Administrator.">
                    <CustomizeAdminPage />
                  </RoleGuard>
                }
              />
              <Route
                path="/admin/roles-users"
                element={
                  <RoleGuard allowedPortals={['staff']} allowedRoles={['super_admin']} restrictedMessage="Access Restricted: User Account & Role administration is reserved for Super Administrator.">
                    <ModuleHubPage />
                  </RoleGuard>
                }
              />
              <Route
                path="/admin/integrations"
                element={
                  <RoleGuard allowedPortals={['staff']} allowedRoles={['super_admin']} restrictedMessage="Access Restricted: Integration gateways are reserved for Super Administrator.">
                    <ModuleHubPage />
                  </RoleGuard>
                }
              />
              <Route
                path="/admin/settings"
                element={
                  <RoleGuard allowedPortals={['staff']} allowedRoles={['super_admin']} restrictedMessage="Access Restricted: Institutional settings are reserved for Super Administrator.">
                    <ModuleHubPage />
                  </RoleGuard>
                }
              />
            </Route>

            {/* 404 Catch-All */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </RouterComponent>
      </ErrorBoundary>
        </ToastProvider>
      </BrandingProvider>
    </AuthProvider>
  );
}

export default App;
