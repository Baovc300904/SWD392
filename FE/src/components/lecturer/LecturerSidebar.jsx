import { 
  LayoutDashboard, 
  Users, 
  CheckSquare, 
  BookOpen,
  LogOut,
  ChevronDown
} from 'lucide-react';

export function LecturerSidebar({ activeView, onViewChange, onLogout }) {
  const menuItems = [
    {
      id: 'dashboard',
      icon: LayoutDashboard,
      label: 'Dashboard',
      badge: null,
    },
    {
      id: 'groups',
      icon: Users,
      label: 'All Groups Overview',
      badge: null,
    },
    {
      id: 'approvals',
      icon: CheckSquare,
      label: 'Topic Approvals',
      badge: 3,
    },
    {
      id: 'syllabus',
      icon: BookOpen,
      label: 'Syllabus Config',
      badge: null,
    },
  ];

  return (
    <div className="w-[260px] bg-[#1a1d21] flex flex-col h-screen">
      {/* Header */}
      <div className="px-4 py-3 border-b border-white/10">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-white font-bold text-[15px]">Lecturer HQ</h2>
            <div className="flex items-center gap-1 mt-0.5">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-xs text-white/70">Online</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        <div className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => onViewChange(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded transition group ${
                  isActive
                    ? 'bg-[#F27125] text-white'
                    : 'text-white/70 hover:bg-[#F27125]/20 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Icon className="w-[18px] h-[18px]" />
                  <span className="text-[15px] font-medium">{item.label}</span>
                </div>
                {item.badge && (
                  <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Divider */}
        <div className="my-4 border-t border-white/10"></div>

        {/* Info Section */}
        <div className="px-3">
          <p className="text-xs text-white/50 mb-2">SEMESTER</p>
          <button className="w-full flex items-center justify-between px-3 py-2 bg-white/5 hover:bg-white/10 rounded text-white/90 text-sm transition">
            <span>Spring 2026</span>
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>
      </nav>

      {/* User Profile Section - Fixed at Bottom */}
      <div className="border-t border-white/10 p-3">
        <div className="flex items-center gap-3">
          <div className="relative">
            <img
              src="https://api.dicebear.com/7.x/avataaars/svg?seed=DrTranMinh"
              alt="Dr. Tran Minh"
              className="w-10 h-10 rounded"
            />
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-[#1a1d21] rounded-full"></div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-white font-semibold text-sm truncate">Dr. Tran Minh</div>
            <div className="text-white/60 text-xs truncate">Lecturer</div>
          </div>
          <button
            onClick={onLogout}
            className="p-2 hover:bg-white/10 rounded transition group"
            title="Log Out"
          >
            <LogOut className="w-[18px] h-[18px] text-white/70 group-hover:text-red-400 transition" />
          </button>
        </div>
      </div>
    </div>
  );
}

