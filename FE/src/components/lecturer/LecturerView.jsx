import { useState } from 'react';
import { LecturerSidebar } from './LecturerSidebar';
import { LecturerDashboard } from './LecturerDashboard';
import { TopicManagementView } from './TopicManagementView';
import { QAManagementView } from './QAManagementView';
import { GroupSubmissionView } from './GroupSubmissionView';
import { LecturerClassesView } from './LecturerClassesView';
import { NotificationBell } from '../ui/NotificationBell';
import { usePortalNotifications } from '../../hooks/usePortalNotifications';

/**
 * Main Lecturer View - New Design
 * 2-column layout: Sidebar + Main Content
 */
export function LecturerView({ onLogout, currentUser, onNavigate }) {
  const [activeView, setActiveView] = useState('dashboard');
  const [viewFilters, setViewFilters] = useState({ qa: 'ALL', topics: 'ALL' });
  const { notifications, unreadCount, loading, refreshNotifications } = usePortalNotifications('lecturer');

  const handlePortalAction = ({ view, filter }) => {
    if (view) setActiveView(view);
    if (view === 'qa' && filter) {
      setViewFilters((previous) => ({ ...previous, qa: filter }));
    }
    if (view === 'topics' && filter) {
      setViewFilters((previous) => ({ ...previous, topics: filter }));
    }
  };

  const renderContent = () => {
    switch (activeView) {
      case 'dashboard':
        return <LecturerDashboard onAction={handlePortalAction} />;
      case 'classes':
        return <LecturerClassesView />;
      case 'topics':
        return <TopicManagementView initialStatusFilter={viewFilters.topics} />;
      case 'qa':
        return <QAManagementView initialStatusFilter={viewFilters.qa} />;
      case 'submissions':
        return <GroupSubmissionView />;
      default:
        return <LecturerDashboard onAction={handlePortalAction} />;
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
        onNavigate={onNavigate}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header with Notification Bell and User Avatar */}
        <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-end gap-4">
          <NotificationBell
            notifications={notifications}
            unreadCount={unreadCount}
            loading={loading}
            onRefresh={refreshNotifications}
            onSelect={handlePortalAction}
          />
          
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
