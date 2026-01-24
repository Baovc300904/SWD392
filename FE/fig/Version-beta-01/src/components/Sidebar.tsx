import { ChevronDown, Hash, MessageSquare, Circle, LogOut } from 'lucide-react';

interface SidebarProps {
  activeChannel: string;
  onChannelChange: (channel: string) => void;
  onLogout?: () => void;
}

export function Sidebar({ activeChannel, onChannelChange, onLogout }: SidebarProps) {
  const managementChannels = [
    { id: '#topic-approvals', name: 'topic-approvals', unread: 5 },
    { id: '#group-requests', name: 'group-requests', unread: 2 },
  ];

  const classChannels = [
    { id: '#se1705-qa', name: 'se1705-qa' },
    { id: '#se1709-qa', name: 'se1709-qa' },
  ];

  const directMessages = [
    { id: 'dm-1', name: 'Dr. Tran Minh', online: true },
    { id: 'dm-2', name: 'Nguyen Van A', online: true },
    { id: 'dm-3', name: 'Le Thi B', online: false },
    { id: 'dm-4', name: 'Pham Van C', online: true },
  ];

  return (
    <div className="w-64 bg-[#0054a6] text-white flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-white/10">
        <button className="w-full flex items-center justify-between hover:bg-white/10 rounded px-3 py-2 transition">
          <span className="font-semibold">SWP Department</span>
          <ChevronDown className="w-4 h-4" />
        </button>
      </div>

      {/* Channels */}
      <div className="flex-1 overflow-y-auto">
        {/* Management Section */}
        <div className="px-3 py-4">
          <div className="text-white/60 text-xs font-semibold uppercase mb-2 px-2">
            Management
          </div>
          {managementChannels.map((channel) => (
            <button
              key={channel.id}
              onClick={() => onChannelChange(channel.id)}
              className={`w-full flex items-center justify-between px-2 py-1.5 rounded mb-0.5 transition ${
                activeChannel === channel.id
                  ? 'bg-[#1164B4] text-white'
                  : 'text-white/80 hover:bg-white/10'
              }`}
            >
              <div className="flex items-center gap-2">
                <Hash className="w-4 h-4" />
                <span className="text-sm">{channel.name}</span>
              </div>
              {channel.unread > 0 && (
                <span className="bg-white text-[#0054a6] text-xs font-semibold px-2 py-0.5 rounded-full">
                  {channel.unread}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Classes Section */}
        <div className="px-3 py-4 border-t border-white/10">
          <div className="text-white/60 text-xs font-semibold uppercase mb-2 px-2">
            Classes
          </div>
          {classChannels.map((channel) => (
            <button
              key={channel.id}
              onClick={() => onChannelChange(channel.id)}
              className={`w-full flex items-center gap-2 px-2 py-1.5 rounded mb-0.5 transition ${
                activeChannel === channel.id
                  ? 'bg-[#1164B4] text-white'
                  : 'text-white/80 hover:bg-white/10'
              }`}
            >
              <Hash className="w-4 h-4" />
              <span className="text-sm">{channel.name}</span>
            </button>
          ))}
        </div>

        {/* Direct Messages Section */}
        <div className="px-3 py-4 border-t border-white/10">
          <div className="text-white/60 text-xs font-semibold uppercase mb-2 px-2">
            Direct Messages
          </div>
          {directMessages.map((dm) => (
            <button
              key={dm.id}
              onClick={() => onChannelChange(dm.id)}
              className={`w-full flex items-center gap-2 px-2 py-1.5 rounded mb-0.5 transition ${
                activeChannel === dm.id
                  ? 'bg-[#1164B4] text-white'
                  : 'text-white/80 hover:bg-white/10'
              }`}
            >
              <div className="relative">
                <MessageSquare className="w-4 h-4" />
                {dm.online && (
                  <Circle className="w-2 h-2 fill-green-400 text-green-400 absolute -bottom-0.5 -right-0.5" />
                )}
              </div>
              <span className="text-sm">{dm.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Logout Button */}
      {onLogout && (
        <div className="p-4 border-t border-white/10">
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-2 px-3 py-2 text-white/80 hover:bg-red-600 hover:text-white rounded transition"
          >
            <LogOut className="w-4 h-4" />
            <span className="text-sm font-medium">Logout</span>
          </button>
        </div>
      )}
    </div>
  );
}