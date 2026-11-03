import React from 'react';
import { BrowserRouter, HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Layout } from './components/Layout';
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

import { WelcomeScreen } from './components/WelcomeScreen';

// In Electron / file protocol, HashRouter avoids file:// 404 routing issues; BrowserRouter is used on web
const isElectron =
  typeof window !== 'undefined' &&
  (window.location.protocol === 'file:' ||
    Boolean((window as any).electronAPI) ||
    navigator.userAgent.toLowerCase().includes('electron'));

const RouterComponent = isElectron ? HashRouter : BrowserRouter;

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!token) {
    return <Navigate to="/login" replace />;
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
      {showWelcome && (
        <WelcomeScreen
          schoolName="Ever Grow Schools"
          onComplete={() => setShowWelcome(false)}
        />
      )}
      <RouterComponent>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/admission-enquiry" element={<PublicEnquiryPage isPublic={true} />} />

          {/* Authenticated Dashboard Shell */}
          <Route
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route path="/" element={<DashboardPage />} />
            <Route path="/social-wall" element={<SocialWallPage />} />
            <Route path="/students" element={<StudentsPage />} />
            <Route path="/academic" element={<AcademicPage />} />
            <Route path="/attendance" element={<AttendancePage />} />
            <Route path="/timetable" element={<TimetablePage />} />
            <Route path="/examinations" element={<ExaminationsPage />} />
            <Route path="/fees" element={<FeesPage />} />
            <Route path="/transport" element={<TransportPage />} />
            <Route path="/career" element={<CareerPage />} />
            <Route path="/staff-attendance" element={<StaffAttendancePage />} />
            <Route path="/treasury" element={<TreasuryPage />} />
            <Route path="/tuitions" element={<TuitionsAdminPage />} />
            <Route path="/tuition-recommendations" element={<TuitionRecommendationsPage />} />
            <Route path="/coordinators" element={<CoordinatorsPage />} />
            <Route path="/rewards" element={<StudentRewardsPage />} />
            <Route path="/student/rewards" element={<StudentRewardsPage />} />
            <Route path="/admin/rewards" element={<AdminRewardsPage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/enquiry" element={<PublicEnquiryPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </RouterComponent>
    </AuthProvider>
  );
}

export default App;
