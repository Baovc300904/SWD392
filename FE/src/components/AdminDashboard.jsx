import { useState } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  FileCheck, 
  Settings,
  LogOut,
  Activity,
  CheckCircle,
  Clock,
  TrendingUp,
  Search,
  Filter,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  X,
  Check
} from 'lucide-react';
import { DashboardView } from './admin/DashboardView';
import { UserManagementView } from './admin/UserManagementView';
import { TopicApprovalsView } from './admin/TopicApprovalsView';
import { SettingsView } from './admin/SettingsView';

export function AdminDashboard({ onLogout }) {
  const [activeView, setActiveView] = useState('dashboard');

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Left Sidebar - Dark Navy */}
      <div className="w-64 bg-[#1a1d21] text-white flex flex-col">
        {/* Logo & Branding */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-[#F27125] rounded-lg flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-lg">S</span>
            </div>
            <div>
              <div className="font-bold text-lg">SWP Hub</div>
              <div className="text-xs text-gray-400">Admin Portal</div>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 p-4">
          <div className="space-y-1">
            <button
              onClick={() => setActiveView('dashboard')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition ${
                activeView === 'dashboard'
                  ? 'bg-[#F27125] text-white shadow-lg'
                  : 'text-gray-300 hover:bg-white/10'
              }`}
            >
              <LayoutDashboard className="w-5 h-5" />
              Dashboard
            </button>
            <button
              onClick={() => setActiveView('users')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition ${
                activeView === 'users'
                  ? 'bg-[#F27125] text-white shadow-lg'
                  : 'text-gray-300 hover:bg-white/10'
              }`}
            >
              <Users className="w-5 h-5" />
              User Management
            </button>
            <button
              onClick={() => setActiveView('topics')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition ${
                activeView === 'topics'
                  ? 'bg-[#F27125] text-white shadow-lg'
                  : 'text-gray-300 hover:bg-white/10'
              }`}
            >
              <FileCheck className="w-5 h-5" />
              Topic Approvals
            </button>
            <button
              onClick={() => setActiveView('settings')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition ${
                activeView === 'settings'
                  ? 'bg-[#F27125] text-white shadow-lg'
                  : 'text-gray-300 hover:bg-white/10'
              }`}
            >
              <Settings className="w-5 h-5" />
              Settings
            </button>
          </div>
        </nav>

        {/* Logout Button - Bottom */}
        <div className="p-4 border-t border-white/10">
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-white hover:bg-red-600 rounded-lg font-medium transition group"
          >
            <LogOut className="w-5 h-5 group-hover:text-white" />
            <span>Log out</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {activeView === 'dashboard' && 'Dashboard Overview'}
                {activeView === 'users' && 'User Management'}
                {activeView === 'topics' && 'Topic Approvals'}
                {activeView === 'settings' && 'Settings'}
              </h1>
              <p className="text-gray-600 mt-1">
                {activeView === 'dashboard' && 'Welcome back, Admin. Here\'s what\'s happening today.'}
                {activeView === 'users' && 'Manage students and lecturers'}
                {activeView === 'topics' && 'Review and approve project topics'}
                {activeView === 'settings' && 'Configure system settings'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-[#F27125] rounded-full flex items-center justify-center">
                <span className="text-white font-semibold">A</span>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          {activeView === 'dashboard' && <DashboardView />}
          {activeView === 'users' && <UserManagementView />}
          {activeView === 'topics' && <TopicApprovalsView />}
          {activeView === 'settings' && <SettingsView />}
        </div>
      </div>
    </div>
  );
}

