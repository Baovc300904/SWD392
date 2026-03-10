import React, { useState, useEffect, Component } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';

import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
import { FAQPage } from './pages/FAQPage';
import { AdminDashboard } from './pages/AdminDashboard';
import { DocumentationPage } from './pages/DocumentationPage';
import { SlackChat } from './components/slack/SlackChat';
import { LecturerView } from './components/lecturer/LecturerView';
import { UserProfilePage } from './pages/UserProfilePage';
import { GroupSidebar } from './components/group/GroupSidebar';
import { GroupDashboardView } from './components/group/GroupDashboardView';
import { TaskBoardView } from './components/group/TaskBoardView';
import { QAForumView } from './components/group/QAForumView';
import { AIAssistantView } from './components/group/AIAssistantView';
import { ResourcesView } from './components/group/ResourcesView';
import { StudentTopicView } from './components/group/StudentTopicView';
import authService from './services/auth.service';

/* ─── Error Boundary for Student Workspace ─── */
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Student Workspace Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex h-screen items-center justify-center bg-gray-50">
          <div className="text-center max-w-md p-8">
            <div className="text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Có lỗi xảy ra</h2>
            <p className="text-gray-600 mb-4">Component bị lỗi. Vui lòng tải lại trang.</p>
            <div className="text-xs text-gray-500 mb-4 p-3 bg-gray-100 rounded font-mono text-left overflow-auto max-h-32">
              {this.state.error?.toString()}
            </div>
            <button
              onClick={() => window.location.href = '/'}
              className="px-6 py-2 bg-[#F27125] hover:bg-[#d96420] text-white rounded-lg"
            >
              Quay về Trang chủ
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/* ─── Student group workspace (top-level to avoid re-mount on App re-render) ─── */
function StudentGroupWorkspace({ currentGroupId, onLogout }) {
  const [activeTool, setActiveTool] = useState('dashboard');
  const [activeChannel, setActiveChannel] = useState('general-chat');
  const [activeChannelId, setActiveChannelId] = useState(null);

  console.log('[StudentGroupWorkspace] Rendering, activeTool:', activeTool);

  const renderContent = () => {
    try {
      console.log('[renderContent] Rendering tool:', activeTool);
      
      // Simple fallback first
      if (!activeTool || activeTool === 'dashboard') {
        return (
          <div className="p-8 bg-white">
            <h1 className="text-3xl font-bold text-gray-800 mb-4">
              🎉 Group Workspace Dashboard
            </h1>
            <p className="text-gray-600 mb-4">
              Welcome to the Student Group Workspace! Active tool: {activeTool}
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-blue-800">
                ✅ If you see this, the basic rendering works!
              </p>
            </div>
          </div>
        );
      }
      
      switch (activeTool) {
        case 'topic':        return <StudentTopicView groupId={currentGroupId} />;
        case 'task-board':   return <TaskBoardView groupId={currentGroupId} />;
        case 'qa-forum':     return <QAForumView groupId={currentGroupId} />;
        case 'ai-assistant': return <AIAssistantView groupId={currentGroupId} />;
        case 'resources':    return <ResourcesView groupId={currentGroupId} />;
        case 'chat':         return <SlackChat channel={activeChannel} channelId={activeChannelId} groupId={currentGroupId} />;
        default:             
          return (
            <div className="p-8 bg-white">
              <h1 className="text-2xl font-bold mb-4">Unknown tool: {activeTool}</h1>
            </div>
          );
      }
    } catch (error) {
      console.error('[renderContent] Render error:', error);
      return (
        <div className="flex items-center justify-center h-full bg-white">
          <div className="text-center p-8">
            <div className="text-6xl mb-4">⚠️</div>
            <p className="text-red-600 mb-4 font-bold">Lỗi render component</p>
            <p className="text-sm text-gray-600 mb-4">{error.message}</p>
            <button 
              onClick={() => window.location.href = '/'}
              className="px-6 py-2 bg-[#F27125] text-white rounded-lg hover:bg-[#d96420]"
            >
              Quay về Trang chủ
            </button>
          </div>
        </div>
      );
    }
  };

  return (
    <ErrorBoundary>
      <div className="flex h-screen bg-white overflow-hidden">
        <GroupSidebar
          activeTool={activeTool}
          onToolChange={setActiveTool}
          onLogout={onLogout}
          groupId={currentGroupId}
        />
        <div className="flex-1 overflow-auto bg-gray-50">
          {renderContent()}
        </div>
      </div>
    </ErrorBoundary>
  );
}

/* ─── Map page name → path ─── */
const PAGE_TO_ROUTE = {
  landing: '/',
  login: '/login',
  register: '/register',
  'forgot-password': '/forgot-password',
  about: '/about',
  contact: '/contact',
  faq: '/faq',
  docs: '/docs',
  admin: '/admin',
  group: '/group',
  lecturer: '/lecturer',
  profile: '/profile',
};

/* ─── ProtectedRoute: chỉ cho user đã đăng nhập ─── */
function ProtectedRoute({ allowedRoles, children }) {
  const location = useLocation();
  const user = authService.getCurrentUser();
  
  if (!user || !user.token) {
    return <Navigate to="/login" replace />;
  }
  
  // Normalize role to lowercase: manager, lecturer, student
  const normalizedRole = user.role?.toLowerCase();
  
  if (allowedRoles && !allowedRoles.includes(normalizedRole)) {
    // Determine correct destination based on role
    const dest = normalizedRole === 'manager' ? '/admin' : 
                 normalizedRole === 'lecturer' ? '/lecturer' : '/group';
    
    // Prevent redirect loop
    if (location.pathname === dest) {
      return (
        <div className="flex items-center justify-center h-screen bg-gray-50">
          <div className="text-center p-8 max-w-md">
            <div className="text-6xl mb-4">🚫</div>
            <h2 className="text-2xl font-bold text-red-600 mb-2">Access Denied</h2>
            <p className="text-gray-600 mb-4">
              Your role cannot access this page.
            </p>
            <button
              onClick={() => {
                authService.logout();
                window.location.href = '/login';
              }}
              className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg"
            >
              Logout & Login Again
            </button>
          </div>
        </div>
      );
    }
    
    return <Navigate to={dest} replace />;
  }
  
  console.log('[ProtectedRoute] Access granted to', location.pathname);
  return children;
}

/* ─── GuestOnlyRoute: chỉ cho user CHƯA đăng nhập ─── */
function GuestOnlyRoute({ children }) {
  const user = authService.getCurrentUser();
  if (user?.token) {
    const role = user.role?.toLowerCase();
    const dest = role === 'admin' ? '/admin' : role === 'lecturer' ? '/lecturer' : '/group';
    return <Navigate to={dest} replace />;
  }
  return children;
}

/* ─── Page not found ─── */
function NotFoundPage({ onNavigate }) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="text-8xl font-bold text-gray-200 mb-4">404</div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Page not found</h1>
        <p className="text-gray-500 mb-6">The page you are looking for does not exist.</p>
        <button
          onClick={() => onNavigate('landing')}
          className="px-6 py-3 bg-[#F27125] hover:bg-[#d96420] text-white font-semibold rounded-lg transition">
          Back to Home
        </button>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════ */
export default function App() {
  const navigate = useNavigate();
  const location = useLocation();

  const [userRole, setUserRole] = useState(null);
  const [currentGroupId, setCurrentGroupId] = useState(null);

  /* ─── Derive role from localStorage on mount ─── */
  useEffect(() => {
    const user = authService.getCurrentUser();
    if (user?.token) {
      setUserRole(user.role?.toLowerCase() || null);
      // TODO: Fetch user's current group from API
      // For now, use null to enable offline mode with mock data
      setCurrentGroupId(null);
    }
  }, []);

  /* ─── Scroll to top on route change ─── */
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [location.pathname]);

  /* ─── Auto-logout on browser close ─── */
  useEffect(() => {
    const handleBeforeUnload = () => {
      // Chỉ logout khi đóng tab nếu KHÔNG có Remember Me
      if (authService.isRemembered()) return;
      const user = authService.getCurrentUser();
      if (user?.token) {
        const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';
        try {
          const xhr = new XMLHttpRequest();
          xhr.open('POST', `${API_BASE}/auth/logout`, false);
          xhr.setRequestHeader('Authorization', `Bearer ${user.token}`);
          xhr.setRequestHeader('Content-Type', 'application/json');
          xhr.send(JSON.stringify({}));
        } catch { /* ignore */ }
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [userRole]);

  /* ─── Helpers ─── */
  // pageName = key từ PAGE_TO_ROUTE, options = { replace: bool }
  const handleNavigate = (pageName, options = {}) => {
    const route = PAGE_TO_ROUTE[pageName];
    if (route) navigate(route, options);
  };

  // Dùng cho nút "Back" — replace history thay vì push
  const handleBack = (pageName) => handleNavigate(pageName, { replace: true });

  const handleLogin = (role) => {
    setUserRole(role?.toLowerCase());
    const dest =
      role?.toLowerCase() === 'admin' ? '/admin' :
        role?.toLowerCase() === 'lecturer' ? '/lecturer' : '/group';
    navigate(dest, { replace: true });
  };

  const handleLogout = async () => {
    try { await authService.logout(); } catch { /* ignore */ }
    setUserRole(null);
    navigate('/', { replace: true });
  };

  /* ─── Student group workspace ─── */
  const GroupView = (
    <ProtectedRoute allowedRoles={['student']}>
      <StudentGroupWorkspace currentGroupId={currentGroupId} onLogout={handleLogout} />
    </ProtectedRoute>
  );

  return (
    <Routes>
      {/* ── Public ── */}
      <Route path="/" element={
        <GuestOnlyRoute>
          <LandingPage onNavigate={handleNavigate} />
        </GuestOnlyRoute>
      } />
      <Route path="/about" element={<AboutPage onNavigate={handleNavigate} />} />
      <Route path="/contact" element={<ContactPage onNavigate={handleNavigate} />} />
      <Route path="/faq" element={<FAQPage onNavigate={handleNavigate} />} />
      <Route path="/docs" element={<DocumentationPage onNavigate={handleNavigate} />} />

      {/* ── Auth (GuestOnly — redirect đến dashboard nếu đã login) ── */}
      <Route path="/login" element={
        <GuestOnlyRoute>
          <LoginPage onNavigate={handleNavigate} onLogin={handleLogin} />
        </GuestOnlyRoute>
      } />
      <Route path="/register" element={
        <GuestOnlyRoute>
          <RegisterPage onNavigate={handleNavigate} onLogin={handleLogin} />
        </GuestOnlyRoute>
      } />
      <Route path="/forgot-password" element={
        <GuestOnlyRoute>
          <ForgotPasswordPage onNavigate={handleNavigate} />
        </GuestOnlyRoute>
      } />

      {/* ── Protected: Admin ── */}
      <Route path="/admin" element={
        <ProtectedRoute allowedRoles={['manager']}>
          <AdminDashboard onLogout={handleLogout} onNavigate={handleNavigate} />
        </ProtectedRoute>
      } />

      {/* ── Protected: Student workspace ── */}
      <Route path="/group" element={GroupView} />

      {/* ── Protected: Lecturer ── */}
      <Route path="/lecturer" element={
        <ProtectedRoute allowedRoles={['lecturer']}>
          <LecturerView onLogout={handleLogout} onNavigate={handleNavigate} />
        </ProtectedRoute>
      } />

      {/* ── Protected: Profile (all roles) ── */}
      <Route path="/profile" element={
        <ProtectedRoute>
          <UserProfilePage onNavigate={handleNavigate} onLogout={handleLogout} />
        </ProtectedRoute>
      } />

      {/* ── 404 ── */}
      <Route path="*" element={<NotFoundPage onNavigate={handleNavigate} />} />
    </Routes>
  );
}
