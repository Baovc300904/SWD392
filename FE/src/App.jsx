import { useState, useEffect } from 'react';
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
import { SlackSidebar } from './components/slack/SlackSidebar';
import { SlackChat } from './components/slack/SlackChat';
import { LecturerView } from './components/lecturer/LecturerView';
import { UserProfilePage } from './pages/UserProfilePage';
import authService from './services/auth.service';

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
  const user = authService.getCurrentUser();
  if (!user || !user.token) {
    return <Navigate to="/login" replace />;
  }
  if (allowedRoles && !allowedRoles.includes(user.role?.toLowerCase())) {
    const role = user.role?.toLowerCase();
    const dest = role === 'admin' ? '/admin' : role === 'lecturer' ? '/lecturer' : '/group';
    return <Navigate to={dest} replace />;
  }
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
  const [activeChannel, setActiveChannel] = useState('general-chat');

  /* ─── Derive role from localStorage on mount ─── */
  useEffect(() => {
    const user = authService.getCurrentUser();
    if (user?.token) {
      setUserRole(user.role?.toLowerCase() || null);
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

  /* ─── Slack group view ─── */
  const GroupView = (
    <ProtectedRoute allowedRoles={['student']}>
      <div className="flex h-screen bg-white overflow-hidden">
        <SlackSidebar
          activeChannel={activeChannel}
          onChannelChange={setActiveChannel}
          onLogout={handleLogout}
          onNavigate={handleNavigate}
        />
        <SlackChat channel={activeChannel} />
      </div>
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
        <ProtectedRoute allowedRoles={['admin']}>
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
