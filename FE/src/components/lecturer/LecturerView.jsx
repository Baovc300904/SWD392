import { useState, useEffect } from 'react';
import { GroupSwitcher } from './GroupSwitcher';
import { LecturerSidebar } from './LecturerSidebar';
import { LecturerDashboard } from './LecturerDashboard';
import { SlackSidebar } from '../slack/SlackSidebar';
import { SlackChat } from '../slack/SlackChat';

export function LecturerView({ onLogout, onNavigate }) {
  const [activeGroup, setActiveGroup] = useState('dashboard');
  const [activeChannel, setActiveChannel] = useState('general-chat');
  const [activeChannelId, setActiveChannelId] = useState(null);
  const [dashboardView, setDashboardView] = useState('dashboard');
  const [currentGroupId, setCurrentGroupId] = useState(null);

  const isInDashboard = activeGroup === 'dashboard';

  // When switching groups, update the currentGroupId
  useEffect(() => {
    if (activeGroup !== 'dashboard') {
      // Extract numeric group ID if format is like 'group-1', 'group-2', etc.
      const groupIdMatch = activeGroup.match(/group-(\d+)/);
      if (groupIdMatch) {
        setCurrentGroupId(parseInt(groupIdMatch[1], 10));
      } else {
        setCurrentGroupId(activeGroup);
      }
    }
  }, [activeGroup]);

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
          onNavigate={onNavigate}
        />
      ) : (
        <SlackSidebar
          activeChannel={activeChannel}
          onChannelChange={(channelSlug, channelId) => {
            setActiveChannel(channelSlug);
            setActiveChannelId(channelId);
          }}
          onLogout={onLogout}
          groupId={currentGroupId}
        />
      )}

      {/* Column 3: Main Content */}
      {isInDashboard ? (
        <LecturerDashboard />
      ) : (
        <SlackChat 
          channel={activeChannel}
          channelId={activeChannelId}
          groupId={currentGroupId}
        />
      )}
    </div>
  );
}

