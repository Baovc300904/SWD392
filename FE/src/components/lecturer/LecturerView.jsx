import { useState, useEffect } from 'react';
import { GroupSwitcher } from './GroupSwitcher';
import { LecturerSidebar } from './LecturerSidebar';
import { LecturerDashboard } from './LecturerDashboard';
import { GroupManagementView } from './GroupManagementView';
import { MilestoneManagementView } from './MilestoneManagementView';
import { SubmissionGradingView } from './SubmissionGradingView';
import { TopicApprovalsView } from '../admin/TopicApprovalsView';
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
        <div className="flex-1 overflow-auto">
          {dashboardView === 'dashboard' && <LecturerDashboard />}
          {dashboardView === 'groups' && <GroupManagementView />}
          {dashboardView === 'milestones' && <MilestoneManagementView />}
          {dashboardView === 'grading' && <SubmissionGradingView />}
          {dashboardView === 'approvals' && <TopicApprovalsView />}
        </div>
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

