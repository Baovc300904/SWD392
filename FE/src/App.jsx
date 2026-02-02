import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProtectedLayout, PublicLayout } from './layouts/ProtectedLayout';

// Pages
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
import { FAQPage } from './pages/FAQPage';
import { AiMentorPage } from './pages/AiMentorPage';
import { GroupMatchingPage } from './pages/GroupMatchingPage';
import { ProjectManagementPage } from './pages/ProjectManagementPage';
import { ShowcasePage } from './pages/ShowcasePage';
import { MentorsPage } from './pages/MentorsPage';
import { ResourcesPage } from './pages/ResourcesPage';
import { AdminDashboard } from './pages/AdminDashboard';
import { JoinGroupPage } from './pages/JoinGroupPage';
import { GroupInvitePage } from './pages/GroupInvitePage';
import { SlackSidebar } from './components/slack/SlackSidebar';
import { SlackChat } from './components/slack/SlackChat';
import { LecturerView } from './components/lecturer/LecturerView';
import { NoGroupState } from './components/workspace/NoGroupState';
import { useState } from 'react';

// Workspace Layout Wrapper
function WorkspaceLayout() {
  const [activeChannel, setActiveChannel] = useState('general-chat');
  const { logout, user } = useAuth();

  // Check if user has a group
  const hasGroup = user?.groupId; // This should come from API

  // If no group, show empty state
  if (!hasGroup) {
    return (
      <div className="flex h-screen bg-white overflow-hidden">
        <NoGroupState />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-white overflow-hidden">
      <SlackSidebar
        activeChannel={activeChannel}
        onChannelChange={setActiveChannel}
        onLogout={logout}
      />
      <SlackChat channel={activeChannel} />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster position="top-right" richColors />
        <Routes>
          {/* Public Routes - Accessible only when NOT logged in */}
          <Route element={<PublicLayout />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          </Route>

          {/* Semi-Public Routes - Accessible by everyone */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/faq" element={<FAQPage />} />
          <Route path="/ai-mentor" element={<AiMentorPage />} />
          <Route path="/group-matching" element={<GroupMatchingPage />} />
          <Route path="/project-management" element={<ProjectManagementPage />} />
          <Route path="/showcase" element={<ShowcasePage />} />
          <Route path="/mentors" element={<MentorsPage />} />
          <Route path="/resources" element={<ResourcesPage />} />
          
          {/* Group Invitation Routes - Accessible to logged in and non-logged in users */}
          <Route path="/join-group" element={<JoinGroupPage />} />
          <Route path="/join/:inviteCode" element={<GroupInvitePage />} />

          {/* Protected Routes */}
          <Route element={<ProtectedLayout allowedRoles={['admin']} />}>
            <Route path="/admin" element={<AdminDashboard />} />
          </Route>

          <Route element={<ProtectedLayout allowedRoles={['lecturer']} />}>
            <Route path="/lecturer" element={<LecturerView />} />
          </Route>

          <Route element={<ProtectedLayout allowedRoles={['student', 'admin', 'lecturer']} />}>
            <Route path="/workspace" element={<WorkspaceLayout />} />
          </Route>

          {/* Catch all - Redirect to Home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}


