import { useState } from 'react';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
import { FAQPage } from './pages/FAQPage';
import { AdminDashboard } from './pages/AdminDashboard';
import { SlackSidebar } from './components/slack/SlackSidebar';
import { SlackChat } from './components/slack/SlackChat';
import { LecturerView } from './components/lecturer/LecturerView';

export default function App() {
  const [currentPage, setCurrentPage] = useState('landing');
  const [userRole, setUserRole] = useState(null);
  const [activeChannel, setActiveChannel] = useState('general-chat');

  const handleLogin = (role) => {
    setUserRole(role);
    if (role === 'admin') {
      setCurrentPage('admin');
    } else if (role === 'lecturer') {
      setCurrentPage('lecturer');
    } else {
      setCurrentPage('group');
    }
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

  // Slack Clone (Single Group Workspace)
  if (currentPage === 'group') {
    return (
      <div className="flex h-screen bg-white overflow-hidden">
        <SlackSidebar 
          activeChannel={activeChannel}
          onChannelChange={setActiveChannel}
          onLogout={handleLogout}
        />
        <SlackChat channel={activeChannel} />
      </div>
    );
  }

  // Lecturer View
  if (currentPage === 'lecturer') {
    return <LecturerView onLogout={handleLogout} />;
  }

  return null;
}


