import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import axios from 'axios';

// Pages
import LandingPage from '@/pages/public/LandingPage';
import LoginPage from '@/pages/public/LoginPage';
import ForgotPasswordPage from '@/pages/public/ForgotPasswordPage';
import ResetPasswordPage from '@/pages/public/ResetPasswordPage';
import StudentRegisterPage from '@/pages/public/StudentRegisterPage';
import RecruiterRegisterPage from '@/pages/public/RecruiterRegisterPage';

import StudentDashboard from '@/pages/student/StudentDashboard';
import StudentProfile from '@/pages/student/StudentProfile';
import StudentDrives from '@/pages/student/StudentDrives';
import StudentApplications from '@/pages/student/StudentApplications';
import StudentNotifications from '@/pages/student/StudentNotifications';

import AdminDashboard from '@/pages/admin/AdminDashboard';
import AdminStudents from '@/pages/admin/AdminStudents';
import AdminRecruiters from '@/pages/admin/AdminRecruiters';
import AdminCompanies from '@/pages/admin/AdminCompanies';
import AdminDrives from '@/pages/admin/AdminDrives';
import AdminDriveApplicants from '@/pages/admin/AdminDriveApplicants';
import AdminUsers from '@/pages/admin/AdminUsers';
import AdminPlaceholder from '@/pages/admin/AdminPlaceholder';

import RecruiterDashboard from '@/pages/recruiter/RecruiterDashboard';
import RecruiterProfile from '@/pages/recruiter/RecruiterProfile';
import RecruiterDrives from '@/pages/recruiter/RecruiterDrives';
import RecruiterDriveApplicants from '@/pages/recruiter/RecruiterDriveApplicants';

import NotFound from '@/pages/not-found';
import PublicLayout from '@/components/layout/PublicLayout';
import DashboardLayout from '@/components/layout/DashboardLayout';

const queryClient = new QueryClient();

// Axios Base Setup
axios.defaults.baseURL = '/api';

function ProtectedRoute({ children, allowedRoles }: { children: React.ReactNode, allowedRoles?: string[] }) {
  const { user, isLoading, token } = useAuth();

  if (isLoading) {
    return <div className="h-screen w-full flex items-center justify-center">Loading...</div>;
  }

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to their respective dashboard
    const roleMap: Record<string, string> = {
      'STUDENT': '/student/dashboard',
      'PLACEMENT_OFFICER': '/plo/dashboard',
      'RECRUITER': '/recruiter/dashboard'
    };
    return <Navigate to={roleMap[user.role] || '/login'} replace />;
  }

  return <>{children}</>;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <BrowserRouter basename={import.meta.env.BASE_URL.replace(/\/$/, '')}>
            <Routes>
              {/* Public Routes */}
              <Route element={<PublicLayout />}>
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/reset-password" element={<ResetPasswordPage />} />
                <Route path="/register/student" element={<StudentRegisterPage />} />
                <Route path="/register/recruiter" element={<RecruiterRegisterPage />} />
              </Route>

              {/* Student Routes */}
              <Route element={<ProtectedRoute allowedRoles={['STUDENT']}><DashboardLayout role="STUDENT" /></ProtectedRoute>}>
                <Route path="/student" element={<Navigate to="/student/dashboard" replace />} />
                <Route path="/student/dashboard" element={<StudentDashboard />} />
                <Route path="/student/profile" element={<StudentProfile />} />
                <Route path="/student/drives" element={<StudentDrives />} />
                <Route path="/student/applications" element={<StudentApplications />} />
                <Route path="/student/notifications" element={<StudentNotifications />} />
              </Route>

              {/* Placement Officer Routes */}
              <Route element={<ProtectedRoute allowedRoles={['PLACEMENT_OFFICER']}><DashboardLayout role="PLACEMENT_OFFICER" /></ProtectedRoute>}>
                <Route path="/plo" element={<Navigate to="/plo/dashboard" replace />} />
                <Route path="/plo/dashboard" element={<AdminDashboard />} />
                <Route path="/plo/students" element={<AdminStudents />} />
                <Route path="/plo/recruiters" element={<AdminRecruiters />} />
                <Route path="/plo/companies" element={<AdminCompanies />} />
                <Route path="/plo/drives" element={<AdminDrives />} />
                <Route path="/plo/drives/:id/applicants" element={<AdminDriveApplicants />} />
                <Route path="/plo/users" element={<AdminUsers />} />
                <Route path="/plo/applications" element={<AdminPlaceholder title="Applications" description="The application review workspace is ready to be connected to its approval workflow." />} />
                <Route path="/plo/result-verification" element={<AdminPlaceholder title="Result verification" description="Verify drive outcomes and publish confirmed results from this workspace." />} />
                <Route path="/plo/offer-verification" element={<AdminPlaceholder title="Offer verification" description="Review offer details before they are recorded in student placement history." />} />
                <Route path="/plo/statistics" element={<AdminPlaceholder title="Statistics" description="Explore deeper placement outcomes and reporting once the statistics view is enabled." />} />
                <Route path="/plo/notifications" element={<AdminPlaceholder title="Notifications" description="Placement office alerts and system updates will appear here." />} />
                <Route path="/plo/profile" element={<AdminPlaceholder title="Officer profile" description="Manage your placement office profile and account preferences." />} />
              </Route>

              {/* Legacy admin links/bookmarks continue to land in the renamed PLO area. */}
              <Route path="/admin/*" element={<Navigate to="/plo/dashboard" replace />} />

              {/* Recruiter Routes */}
              <Route element={<ProtectedRoute allowedRoles={['RECRUITER']}><DashboardLayout role="RECRUITER" /></ProtectedRoute>}>
                <Route path="/recruiter" element={<Navigate to="/recruiter/dashboard" replace />} />
                <Route path="/recruiter/dashboard" element={<RecruiterDashboard />} />
                <Route path="/recruiter/profile" element={<RecruiterProfile />} />
                <Route path="/recruiter/drives" element={<RecruiterDrives />} />
                <Route path="/recruiter/drives/:id/applicants" element={<RecruiterDriveApplicants />} />
                <Route path="/recruiter/notifications" element={<StudentNotifications />} />
              </Route>

              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
