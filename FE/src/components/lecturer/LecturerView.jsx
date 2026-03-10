import { useState } from 'react';
import { Bell } from 'lucide-react';
import { LecturerSidebar } from './LecturerSidebar';
import { LecturerDashboard } from './LecturerDashboard';
import { TopicManagementView } from './TopicManagementView';
import { QAManagementView } from './QAManagementView';
import { GroupSubmissionView } from './GroupSubmissionView';

/**
 * Main Lecturer View - New Design
 * 2-column layout: Sidebar + Main Content
 */
export function LecturerView({ onLogout, currentUser }) {
  const [activeView, setActiveView] = useState('dashboard');

  const renderContent = () => {
    switch (activeView) {
      case 'dashboard':
        return <LecturerDashboard />;
      case 'topics':
        return <TopicManagementView />;
      case 'qa':
        return <QAManagementView />;
      case 'groups':
        return <GroupSubmissionView />;
      default:
        return <LecturerDashboard />;
    }
  };

  return (
    <div className="flex h-screen bg-[#F3F4F6]">
      {/* Sidebar */}
      <LecturerSidebar
        activeView={activeView}
        onViewChange={setActiveView}
        onLogout={onLogout}
        currentUser={currentUser}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header with Notification Bell and User Avatar */}
        <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-end gap-4">
          <button className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <Bell className="w-5 h-5 text-gray-600" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
          
          <div className="flex items-center gap-2">
            <div className="text-right">
              <div className="text-sm font-semibold text-gray-900">
                {currentUser?.fullName || 'Lecturer'}
              </div>
              <div className="text-xs text-gray-500 uppercase">
                {currentUser?.role || 'LECTURER'}
              </div>
            </div>
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-xs">
                {currentUser?.fullName?.charAt(0) || 'L'}
              </span>
            </div>
          </div>
        </div>

        {/* Content */}
        {renderContent()}
      </div>
    </div>
  );
}
