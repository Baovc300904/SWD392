import { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  ListTodo, 
  MessageSquare, 
  Bot, 
  FolderOpen,
  ChevronDown,
  Settings,
  LogOut,
  Circle
} from 'lucide-react';
import groupService from '../../services/group.service';

export function GroupSidebar({ activeTool, onToolChange, onLogout, groupId }) {
  const [showMembers, setShowMembers] = useState(true);
  const [members, setMembers] = useState([]);
  const [groupInfo, setGroupInfo] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch group data from API
  useEffect(() => {
    const fetchGroupData = async () => {
      if (!groupId) {
        setMembers([]);
        setGroupInfo(null);
        return;
      }
      
      setLoading(true);
      try {
        // Fetch group info and members in parallel
        const [group, membersList] = await Promise.all([
          groupService.getGroupById(groupId),
          groupService.getGroupMembers(groupId)
        ]);
        setGroupInfo(group);
        setMembers(membersList);
      } catch (error) {
        console.error('Failed to fetch group data:', error);
        setMembers([]);
        setGroupInfo(null);
      } finally {
        setLoading(false);
      }
    };

    fetchGroupData();
  }, [groupId]);

  const tools = [
    { id: 'dashboard', name: 'dashboard', icon: '📊', label: 'Dashboard' },
    { id: 'task-board', name: 'task-board', icon: '📋', label: 'Task Board' },
    { id: 'qa-forum', name: 'qa-forum', icon: '💬', label: 'Q&A Forum' },
    { id: 'ai-assistant', name: 'ai-assistant', icon: '🤖', label: 'AI Assistant' },
    { id: 'resources', name: 'resources', icon: '📂', label: 'Resources' },
  ];

  // Members are now fetched from API via useEffect above

  return (
    <div className="w-64 bg-[#0f172a] text-white flex flex-col h-screen">
      {/* Header */}
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-8 h-8 bg-[#F27125] rounded flex items-center justify-center">
            <span className="text-white font-bold text-sm">
              {groupInfo?.group_name?.slice(0, 2)?.toUpperCase() || 'G?'}
            </span>
          </div>
          <div className="flex-1">
            <div className="font-bold text-sm">{groupInfo?.group_name || 'Loading...'}</div>
            <div className="text-xs text-gray-400">{groupInfo?.topic_title || 'No topic'}</div>
          </div>
        </div>
      </div>

      {/* Tools Section */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-3">
          <div className="text-xs font-semibold text-gray-400 mb-2 px-2">TOOLS</div>
          <div className="space-y-0.5">
            {tools.map((tool) => (
              <button
                key={tool.id}
                onClick={() => onToolChange(tool.id)}
                className={`w-full flex items-center gap-2 px-2 py-1.5 rounded text-sm transition ${
                  activeTool === tool.id
                    ? 'bg-[#F27125] text-white font-medium'
                    : 'text-gray-300 hover:bg-white/5'
                }`}
              >
                <span className="text-base">{tool.icon}</span>
                <span># {tool.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Members Section */}
        <div className="p-3 border-t border-white/10">
          <button
            onClick={() => setShowMembers(!showMembers)}
            className="w-full flex items-center gap-2 text-xs font-semibold text-gray-400 mb-2 px-2 hover:text-gray-300"
          >
            <ChevronDown
              className={`w-3 h-3 transition-transform ${!showMembers ? '-rotate-90' : ''}`}
            />
            MEMBERS ({members.length})
          </button>
          {showMembers && (
            <div className="space-y-1">
              {loading && (
                <div className="text-xs text-gray-500 px-2 py-2">Loading...</div>
              )}
              {!loading && members.length === 0 && (
                <div className="text-xs text-gray-500 px-2 py-2">No members yet</div>
              )}
              {!loading && members.map((member) => {
                const displayName = member.full_name || member.name || 'Unknown';
                const initials = displayName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
                const isOnline = member.is_online !== undefined ? member.is_online : (member.online || false);
                
                return (
                  <div
                    key={member.id || member.student_id}
                    className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-white/5 cursor-pointer transition"
                  >
                    <div className="relative">
                      {member.avatar ? (
                        <img
                          src={member.avatar}
                          alt={displayName}
                          className="w-6 h-6 rounded object-cover"
                        />
                      ) : (
                        <div className="w-6 h-6 rounded bg-[#F27125] flex items-center justify-center">
                          <span className="text-white text-[10px] font-bold">{initials}</span>
                        </div>
                      )}
                      <div
                        className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-[#0f172a] ${
                          isOnline ? 'bg-green-500' : 'bg-gray-500'
                        }`}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-gray-300 truncate">{displayName}</div>
                      <div className="text-xs text-gray-500">{member.role || 'Member'}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-white/10 space-y-1">
        <button className="w-full flex items-center gap-2 px-2 py-1.5 text-sm text-gray-300 hover:bg-white/5 rounded transition">
          <Settings className="w-4 h-4" />
          Settings
        </button>
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-2 px-2 py-1.5 text-sm text-gray-300 hover:bg-red-500/20 hover:text-red-400 rounded transition"
        >
          <LogOut className="w-4 h-4" />
          Log out
        </button>
      </div>
    </div>
  );
}


