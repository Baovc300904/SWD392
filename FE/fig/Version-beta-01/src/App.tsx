import { useState } from 'react';
import { LandingPage } from './components/LandingPage';
import { LoginPage } from './components/LoginPage';
import { RegisterPage } from './components/RegisterPage';
import { ForgotPasswordPage } from './components/ForgotPasswordPage';
import { AboutPage } from './components/AboutPage';
import { ContactPage } from './components/ContactPage';
import { FAQPage } from './components/FAQPage';
import { AdminDashboard } from './components/AdminDashboard';
import { GroupChatSidebar } from './components/group/GroupChatSidebar';
import { ChatChannelView } from './components/group/ChatChannelView';

type Page = 'landing' | 'login' | 'register' | 'forgot-password' | 'about' | 'contact' | 'faq' | 'app' | 'admin' | 'group';
type UserRole = 'student' | 'admin' | null;

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('landing');
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [activeChannel, setActiveChannel] = useState('general');

  const handleLogin = (role: UserRole) => {
    setUserRole(role);
    setCurrentPage(role === 'admin' ? 'admin' : 'group');
  };

  const handleLogout = () => {
    setUserRole(null);
    setCurrentPage('landing');
  };

  // Landing & Info Pages
  if (currentPage === 'landing') {
    return <LandingPage onNavigate={setCurrentPage} />;
  }

  if (currentPage === 'about') {
    return <AboutPage onNavigate={setCurrentPage} />;
  }

  if (currentPage === 'contact') {
    return <ContactPage onNavigate={setCurrentPage} />;
  }

  if (currentPage === 'faq') {
    return <FAQPage onNavigate={setCurrentPage} />;
  }

  // Auth Pages
  if (currentPage === 'login') {
    return <LoginPage onNavigate={setCurrentPage} onLogin={handleLogin} />;
  }

  if (currentPage === 'register') {
    return <RegisterPage onNavigate={setCurrentPage} />;
  }

  if (currentPage === 'forgot-password') {
    return <ForgotPasswordPage onNavigate={setCurrentPage} />;
  }

  // Admin Dashboard
  if (currentPage === 'admin') {
    return <AdminDashboard onLogout={handleLogout} />;
  }

  // Group Chat (Slack-clone)
  if (currentPage === 'group') {
    return (
      <div className="flex h-screen bg-white overflow-hidden">
        <GroupChatSidebar 
          activeChannel={activeChannel}
          onChannelChange={setActiveChannel}
          onLogout={handleLogout}
        />
        <ChatChannelView channel={activeChannel} />
      </div>
    );
  }

  return null;
}