import { useState } from 'react';
import { GroupSwitcher } from './GroupSwitcher';
import { LecturerSidebar } from './LecturerSidebar';
import { LecturerDashboard } from './LecturerDashboard';
import { SlackSidebar } from '../slack/SlackSidebar';
import { SlackChat } from '../slack/SlackChat';

interface LecturerViewProps {
  onLogout: () => void;
}

export function LecturerView({ onLogout }: LecturerViewProps) {
  const [activeGroup, setActiveGroup] = useState<string | 'dashboard'>('dashboard');
  const [activeChannel, setActiveChannel] = useState('general-chat');
  const [dashboardView, setDashboardView] = useState<'dashboard' | 'groups' | 'approvals' | 'syllabus'>('dashboard');

  const isInDashboard = activeGroup === 'dashboard';

  return (
    <div className="flex h-screen bg-white overflow-hidden">
      {/* Column 1: Group Switcher (Discord-style Server Rail) */}
      <GroupSwitcher 
        activeGroup={activeGroup}
        onGroupChange={(groupId) => {
          setActiveGroup(groupId);
          if (groupId !== 'dashboard') {
            setActiveChannel('general-chat'); // Reset to general when switching groups
          }
        }}
      />

      {/* Column 2: Conditional Sidebar */}
      {isInDashboard ? (
        <LecturerSidebar 
          activeView={dashboardView}
          onViewChange={setDashboardView}
          onLogout={onLogout}
        />
      ) : (
        <SlackSidebar 
          activeChannel={activeChannel}
          onChannelChange={setActiveChannel}
          onLogout={onLogout}
        />
      )}

      {/* Column 3: Main Content */}
      {isInDashboard ? (
        <LecturerDashboard />
      ) : (
        <SlackChat channel={activeChannel} />
      )}
    </div>
  );
}