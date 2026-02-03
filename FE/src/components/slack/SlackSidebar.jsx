import { useState, useEffect } from 'react';
import { 
  Hash, 
  Lock, 
  ChevronDown, 
  Plus, 
  MessageSquare,
  MoreVertical,
  Search,
  Pencil,
  Circle,
  Edit3,
  HelpCircle,
  Settings,
  LogOut,
  GraduationCap
} from 'lucide-react';

export function SlackSidebar({ activeChannel, onChannelChange, onLogout }) {
  const [showChannels, setShowChannels] = useState(true);
  const [currentUser, setCurrentUser] = useState({ name: 'Loading...', role: 'user' });

  useEffect(() => {
    // Get user from localStorage
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setCurrentUser({
          name: user.name || 'User',
          role: user.role === 'admin' ? 'Admin' : 'Student'
        });
      } catch (e) {
        console.error('Error parsing user from localStorage:', e);
      }
    }
  }, []);
  const [showDMs, setShowDMs] = useState(true);

  const channels = [
    { id: 'general-chat', name: 'general-chat', unread: 0 },
    { id: 'project-tasks', name: 'project-tasks', unread: 2 },
    { id: 'q&a-support', name: 'q&a-support', unread: 4 },
    { id: 'ai-mentor-bot', name: 'ai-mentor-bot', unread: 0 },
    { id: 'resources-files', name: 'resources-files', unread: 1 },
  ];

  const directMessages = [
    { id: 'van-a', name: 'Nguyen Van A', online: true, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Member1' },
    { id: 'thi-b', name: 'Tran Thi B', online: true, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Member2' },
    { id: 'van-c', name: 'Le Van C', online: false, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Member3' },
    { id: 'thi-d', name: 'Pham Thi D', online: true, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Member4' },
    { id: 'mentor', name: 'Dr. Tran Minh', online: true, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mentor1' },
  ];

  return (
    <div className="w-[260px] bg-[#1a1d21] text-white flex flex-col h-screen shadow-lg">
      {/* Workspace Header */}
      <button className="flex items-center justify-between px-5 py-4 hover:bg-white/5 transition border-b border-white/10">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="w-9 h-9 bg-gradient-to-br from-[#F27125] to-[#d96420] rounded-lg flex items-center justify-center flex-shrink-0 shadow-md">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-white truncate text-[15px]">SWP Group 04</span>
        </div>
        <ChevronDown className="w-4 h-4 text-white/70" />
      </button>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto px-3 py-4">
        {/* Channels */}
        <div className="mb-6">
          <button
            onClick={() => setShowChannels(!showChannels)}
            className="w-full flex items-center justify-between px-2 py-1.5 hover:bg-white/10 rounded-lg transition group"
          >
            <div className="flex items-center gap-2 text-sm">
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform ${!showChannels ? '-rotate-90' : ''}`}
              />
              <span className="font-semibold text-gray-300">Channels</span>
            </div>
            <Plus className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
          
          {showChannels && (
            <div className="mt-2 space-y-0.5">{channels.map((channel) => (
                <button
                  key={channel.id}
                  onClick={() => onChannelChange(channel.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition ${
                    activeChannel === channel.id
                      ? 'bg-[#F27125] text-white font-medium shadow-md'
                      : 'text-gray-300 hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <Hash className="w-4 h-4 flex-shrink-0 opacity-80" />
                    <span className="truncate">{channel.name}</span>
                  </div>
                  {channel.unread > 0 && activeChannel !== channel.id && (
                    <span className="ml-auto flex-shrink-0 min-w-[20px] h-5 px-1.5 bg-[#F27125] text-white text-xs font-bold rounded-full flex items-center justify-center shadow-sm">
                      {channel.unread}
                    </span>
                  )}
                </button>
              ))}</div>
          )}
        </div>

        {/* Direct Messages */}
        <div className="pt-2 pb-4 border-t border-white/10 mt-2">
          <button
            onClick={() => setShowDMs(!showDMs)}
            className="w-full flex items-center justify-between px-4 py-1 hover:bg-white/10 transition group"
          >
            <div className="flex items-center gap-1.5 text-sm">
              <ChevronDown
                className={`w-3 h-3 transition-transform ${!showDMs ? '-rotate-90' : ''}`}
              />
              <span className="font-semibold">Direct messages</span>
            </div>
            <Plus className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
          
          {showDMs && (
            <div className="mt-1">
              {directMessages.map((dm) => (
                <button
                  key={dm.id}
                  onClick={() => onChannelChange(`dm-${dm.id}`)}
                  className={`w-full flex items-center gap-2 px-4 py-1 text-sm transition ${
                    activeChannel === `dm-${dm.id}`
                      ? 'bg-[#F27125] text-white font-semibold'
                      : 'text-white/70 hover:bg-[#F27125]/20 hover:text-white'
                  }`}
                >
                  <div className="relative flex-shrink-0">
                    <img
                      src={dm.avatar}
                      alt={dm.name}
                      className="w-5 h-5 rounded"
                    />
                    {dm.online && (
                      <Circle
                        className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 fill-green-500 stroke-[#1a1d21] stroke-2"
                      />
                    )}
                  </div>
                  <span className="truncate">{dm.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* User & Settings Section - Fixed at Bottom */}
      <div className="border-t border-white/10">
        {/* User Profile */}
        <div className="px-3 py-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="relative">
              <img
                src="https://api.dicebear.com/7.x/avataaars/svg?seed=CurrentUser"
                alt="Current User"
                className="w-9 h-9 rounded"
              />
              <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-[#1a1d21] rounded-full"></div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-white font-semibold text-sm truncate">{currentUser.name}</div>
              <div className="text-white/60 text-xs truncate">{currentUser.role}</div>
            </div>
          </div>
        </div>

        {/* Settings & Logout */}
        <div className="p-2 space-y-0.5">
          <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-white/70 hover:bg-white/10 hover:text-white rounded transition">
            <Settings className="w-4 h-4" />
            <span>Settings</span>
          </button>
          {onLogout && (
            <button
              onClick={onLogout}
              className="w-full flex items-center gap-3 px-3 py-2 text-sm text-white/70 hover:bg-red-500/20 hover:text-red-400 rounded transition group"
            >
              <LogOut className="w-4 h-4 group-hover:text-red-400 transition" />
              <span>Log Out</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

