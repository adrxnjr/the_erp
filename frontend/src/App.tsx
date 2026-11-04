import React from 'react';
import { BrowserRouter, HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { Layout } from './components/Layout';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { PublicEnquiryPage } from './pages/PublicEnquiryPage';
import { DashboardPage } from './pages/DashboardPage';
import { StudentsPage } from './pages/StudentsPage';
import { AttendancePage } from './pages/AttendancePage';
import { ExaminationsPage } from './pages/ExaminationsPage';
import { FeesPage } from './pages/FeesPage';
import { ReportsPage } from './pages/ReportsPage';
import { AcademicPage } from './pages/AcademicPage';
import { TimetablePage } from './pages/TimetablePage';
import { TransportPage } from './pages/TransportPage';
import { CareerPage } from './pages/CareerPage';
import { StaffAttendancePage } from './pages/StaffAttendancePage';
import { TreasuryPage } from './pages/TreasuryPage';
import { TuitionsAdminPage } from './pages/TuitionsAdminPage';
import { TuitionRecommendationsPage } from './pages/TuitionRecommendationsPage';
import { SocialWallPage } from './pages/SocialWallPage';
import { CoordinatorsPage } from './pages/CoordinatorsPage';
import { StudentRewardsPage } from './pages/StudentRewardsPage';
import { AdminRewardsPage } from './pages/AdminRewardsPage';
import { NotFoundPage } from './pages/NotFoundPage';

import { WelcomeScreen } from './components/WelcomeScreen';
import { RoleGuard } from './components/RoleGuard';
import { ErrorBoundary } from './components/ErrorBoundary';

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
      <ToastProvider>
        {showWelcome && (
          <WelcomeScreen
            schoolName="Ever Grow Schools"
            onComplete={() => setShowWelcome(false)}
          />
        )}
        <ErrorBoundary>
        <RouterComponent>
          <Routes>
            {/* Root Route: Landing Page if guest, Dashboard if authenticated */}
            <Route path="/" element={<RootHandler />} />

            {/* Direct Login URL: Opens Landing Page with Login Modal pre-activated */}
            <Route path="/login" element={<LandingPage initialOpenLogin={true} />} />
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
            </Route>

            {/* 404 Catch-All */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </RouterComponent>
      </ErrorBoundary>
    </ToastProvider>
  </AuthProvider>
  );
}

export default App;
