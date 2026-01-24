import { useState } from 'react';
import { 
  Hash,
  ChevronDown,
  Settings,
  LogOut,
  Plus
} from 'lucide-react';

interface GroupChatSidebarProps {
  activeChannel: string;
  onChannelChange: (channel: string) => void;
  onLogout: () => void;
}

export function GroupChatSidebar({ activeChannel, onChannelChange, onLogout }: GroupChatSidebarProps) {
  const [showChannels, setShowChannels] = useState(true);
  const [showDMs, setShowDMs] = useState(true);

  const channels = [
    { id: 'general', name: 'general', unread: 0 },
    { id: 'tasks-projects', name: 'tasks-projects', unread: 3 },
    { id: 'q&a-forum', name: 'q&a-forum', unread: 12 },
    { id: 'resources', name: 'resources', unread: 0 },
  ];

  const members = [
    { id: 'ai-bot', name: '🤖 AI Assistant', role: 'Bot', online: true, isBot: true },
    { id: 1, name: 'Nguyen Van A', role: 'Leader', online: true, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Member1' },
    { id: 2, name: 'Tran Thi B', role: 'Developer', online: true, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Member2' },
    { id: 3, name: 'Le Van C', role: 'Developer', online: false, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Member3' },
    { id: 4, name: 'Pham Thi D', role: 'Designer', online: true, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Member4' },
    { id: 5, name: 'Dr. Tran Minh', role: 'Mentor', online: true, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mentor1' },
  ];

  return (
    <div className="w-64 bg-[#0f172a] text-white flex flex-col h-screen">
      {/* Header */}
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div className="w-8 h-8 bg-[#F27125] rounded flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-sm">G4</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-bold text-sm truncate">Group 04 - SWP Hub</div>
            </div>
          </div>
          <button className="p-1 hover:bg-white/10 rounded">
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Channels Section */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-3">
          <button
            onClick={() => setShowChannels(!showChannels)}
            className="w-full flex items-center justify-between text-xs font-semibold text-gray-400 mb-2 px-2 hover:text-gray-300"
          >
            <div className="flex items-center gap-2">
              <ChevronDown
                className={`w-3 h-3 transition-transform ${!showChannels ? '-rotate-90' : ''}`}
              />
              CHANNELS
            </div>
            <Plus className="w-3 h-3" />
          </button>
          {showChannels && (
            <div className="space-y-0.5">
              {channels.map((channel) => (
                <button
                  key={channel.id}
                  onClick={() => onChannelChange(channel.id)}
                  className={`w-full flex items-center justify-between px-2 py-1.5 rounded text-sm transition ${
                    activeChannel === channel.id
                      ? 'bg-[#F27125] text-white font-medium'
                      : 'text-gray-300 hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Hash className="w-4 h-4" />
                    <span>{channel.name}</span>
                  </div>
                  {channel.unread > 0 && (
                    <span className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full font-semibold">
                      {channel.unread}
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Direct Messages Section */}
        <div className="p-3 border-t border-white/10">
          <button
            onClick={() => setShowDMs(!showDMs)}
            className="w-full flex items-center justify-between text-xs font-semibold text-gray-400 mb-2 px-2 hover:text-gray-300"
          >
            <div className="flex items-center gap-2">
              <ChevronDown
                className={`w-3 h-3 transition-transform ${!showDMs ? '-rotate-90' : ''}`}
              />
              DIRECT MESSAGES
            </div>
            <Plus className="w-3 h-3" />
          </button>
          {showDMs && (
            <div className="space-y-1">
              {members.map((member) => (
                <button
                  key={member.id}
                  onClick={() => onChannelChange(`dm-${member.id}`)}
                  className={`w-full flex items-center gap-2 px-2 py-1.5 rounded text-sm transition ${
                    activeChannel === `dm-${member.id}`
                      ? 'bg-[#F27125] text-white'
                      : 'text-gray-300 hover:bg-white/5'
                  }`}
                >
                  {member.isBot ? (
                    <div className="w-6 h-6 bg-gradient-to-br from-[#F27125] to-[#d96420] rounded flex items-center justify-center flex-shrink-0 text-sm">
                      🤖
                    </div>
                  ) : (
                    <div className="relative flex-shrink-0">
                      <img
                        src={member.avatar}
                        alt={member.name}
                        className="w-6 h-6 rounded"
                      />
                      <div
                        className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-[#0f172a] ${
                          member.online ? 'bg-green-500' : 'bg-gray-500'
                        }`}
                      />
                    </div>
                  )}
                  <div className="flex-1 min-w-0 text-left">
                    <div className="truncate">{member.name}</div>
                  </div>
                </button>
              ))}
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
