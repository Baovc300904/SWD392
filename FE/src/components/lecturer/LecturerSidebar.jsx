import {
  LayoutDashboard,
  FileText,
  MessageSquare,
  Users,
  ChevronDown,
  LogOut
} from 'lucide-react';

/**
 * Lecturer Sidebar - Matches Admin Theme
 * Dark Navy (#1a1d21) with Orange (#F27125) accents
 */
export function LecturerSidebar({ activeView, onViewChange, onLogout, currentUser }) {
  const menuItems = [
    {
      id: 'dashboard',
      icon: LayoutDashboard,
      label: 'Dashboard',
      description: 'Thống kê'
    },
    {
      id: 'topics',
      icon: FileText,
      label: 'Quản lý Đề tài',
      description: 'Topics'
    },
    {
      id: 'qa',
      icon: MessageSquare,
      label: 'Quản lý Hỏi đáp',
      description: 'Q&A Tickets'
    },
    {
      id: 'groups',
      icon: Users,
      label: 'Quản lý Nhóm & Nộp bài',
      description: 'Groups & Submissions'
    }
  ];

  return (
    <div className="w-64 bg-[#1a1d21] text-white flex flex-col h-screen">
      {/* Logo & Branding */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-[#F27125] rounded-lg flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-lg">S</span>
          </div>
          <div>
            <div className="font-bold text-lg">SWP Hub</div>
            <div className="text-xs text-gray-400">Lecturer Portal</div>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 p-4">
        <div className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onViewChange(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition ${
                  isActive
                    ? 'bg-[#F27125] text-white shadow-lg'
                    : 'text-gray-300 hover:bg-white/10'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Semester Selector */}
      <div className="px-4 pb-4 border-b border-white/10">
        <button className="w-full flex items-center justify-between px-4 py-3 bg-[#0d0f11] hover:bg-white/5 rounded-lg transition-colors border border-white/10">
          <div className="text-left">
            <div className="text-xs text-gray-400 uppercase">Học kỳ</div>
            <div className="text-sm font-semibold text-white">Spring 2026</div>
          </div>
          <ChevronDown className="w-4 h-4 text-gray-400" />
        </button>
      </div>

      {/* User Profile */}
      <div className="mt-auto p-4 border-t border-white/10">
        <div className="flex items-center gap-3 mb-3">
          <div className="relative">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">
                {currentUser?.fullName?.charAt(0) || 'L'}
              </span>
            </div>
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-[#1a1d21] rounded-full"></div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold text-white truncate">
              {currentUser?.fullName || 'Lecturer'}
            </div>
            <div className="text-xs text-gray-400 truncate uppercase">
              {currentUser?.role || 'LECTURER'}
            </div>
          </div>
        </div>
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition"
        >
          <LogOut className="w-4 h-4" />
          Đăng xuất
        </button>
      </div>
    </div>
  );
}
