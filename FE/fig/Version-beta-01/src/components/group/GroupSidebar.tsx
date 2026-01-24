import { useState } from 'react';
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

interface GroupSidebarProps {
  activeTool: string;
  onToolChange: (tool: string) => void;
  onLogout: () => void;
}

export function GroupSidebar({ activeTool, onToolChange, onLogout }: GroupSidebarProps) {
  const [showMembers, setShowMembers] = useState(true);

  const tools = [
    { id: 'dashboard', name: 'dashboard', icon: '📊', label: 'Dashboard' },
    { id: 'task-board', name: 'task-board', icon: '📋', label: 'Task Board' },
    { id: 'qa-forum', name: 'qa-forum', icon: '💬', label: 'Q&A Forum' },
    { id: 'ai-assistant', name: 'ai-assistant', icon: '🤖', label: 'AI Assistant' },
    { id: 'resources', name: 'resources', icon: '📂', label: 'Resources' },
  ];

  const members = [
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
        <div className="flex items-center gap-2 mb-1">
          <div className="w-8 h-8 bg-[#F27125] rounded flex items-center justify-center">
            <span className="text-white font-bold text-sm">G4</span>
          </div>
          <div className="flex-1">
            <div className="font-bold text-sm">Group 04</div>
            <div className="text-xs text-gray-400">E-commerce AI System</div>
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
              {members.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-white/5 cursor-pointer transition"
                >
                  <div className="relative">
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
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-gray-300 truncate">{member.name}</div>
                    <div className="text-xs text-gray-500">{member.role}</div>
                  </div>
                </div>
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
