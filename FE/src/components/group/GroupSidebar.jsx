import { useState, useEffect } from 'react';
import {
  ChevronDown,
  UserCircle,
  Settings,
  LogOut
} from 'lucide-react';
import groupService from '../../services/group.service';
import { semesterService } from '../../services/app.service';

export function GroupSidebar({ activeTool, onToolChange, onLogout, groupId, onNavigate }) {
  const [showMembers, setShowMembers] = useState(true);
  const [members, setMembers] = useState([]);
  const [groupInfo, setGroupInfo] = useState(null);
  const [activeSemesterName, setActiveSemesterName] = useState('Chưa xác định');
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
        const [group, membersList, activeSemesterRes] = await Promise.all([
          groupService.getGroupById(groupId),
          groupService.getGroupMembers(groupId),
          semesterService.getActiveSemester().catch(() => null)
        ]);
        setGroupInfo(group);
        setMembers(membersList);
        setActiveSemesterName(activeSemesterRes?.data?.name || 'Chưa xác định');
      } catch (error) {
        console.error('Failed to fetch group data:', error);
        setMembers([]);
        setGroupInfo(null);
        setActiveSemesterName('Chưa xác định');
      } finally {
        setLoading(false);
      }
    };

    fetchGroupData();
  }, [groupId]);

  const tools = [
    { id: 'dashboard', name: 'bang-dieu-khien', icon: '📊', label: 'Bảng điều khiển' },
    { id: 'topic', name: 'de-tai', icon: '📘', label: 'Đề tài' },
    { id: 'task-board', name: 'bang-cong-viec', icon: '📋', label: 'Bảng công việc' },
    { id: 'qa-forum', name: 'hoi-dap', icon: '💬', label: 'Diễn đàn hỏi đáp' },
    { id: 'submissions', name: 'bai-nop', icon: '📤', label: 'Bài nộp' },
  ];

  // Members are now fetched from API via useEffect above

  return (
    <div className="w-64 bg-[#0f172a] text-white flex flex-col h-screen">
      {/* Header */}
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-8 h-8 bg-[#F27125] rounded flex items-center justify-center">
            <span className="text-white font-bold text-sm">
              {groupInfo?.groupName?.slice(0, 2)?.toUpperCase() || 'G?'}
            </span>
          </div>
          <div className="flex-1">
            <div className="font-bold text-sm">{groupInfo?.groupName || 'Đang tải...'}</div>
            <div className="text-xs text-gray-400">{groupInfo?.topic?.title || 'Chưa có đề tài'}</div>
            <div className="text-[11px] text-gray-500 mt-0.5">Học kỳ hiện tại: {activeSemesterName}</div>
          </div>
        </div>
      </div>

      {/* Tools Section */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-3">
          <div className="text-xs font-semibold text-gray-400 mb-2 px-2">CÔNG CỤ</div>
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
            THÀNH VIÊN ({members.length})
          </button>
          {showMembers && (
            <div className="space-y-1">
              {loading && (
                <div className="text-xs text-gray-500 px-2 py-2">Đang tải...</div>
              )}
              {!loading && members.length === 0 && (
                <div className="text-xs text-gray-500 px-2 py-2">Chưa có thành viên</div>
              )}
              {!loading && members.map((member) => {
                const student = member.student || member;
                const displayName = student.fullName || student.name || 'Không xác định';
                const initials = displayName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
                const isOnline = student.isOnline !== undefined ? student.isOnline : (student.online || false);
                
                return (
                  <div
                    key={member.studentId || student.id}
                    className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-white/5 cursor-pointer transition"
                  >
                    <div className="relative">
                      {student.avatarURL ? (
                        <img
                          src={student.avatarURL}
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
                      <div className="text-xs text-gray-500">{student.email || 'Thành viên'}</div>
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
        {onNavigate && (
          <button
            onClick={() => onNavigate('profile')}
            className="w-full flex items-center gap-2 px-2 py-1.5 text-sm text-gray-300 hover:bg-white/5 rounded transition"
          >
            <UserCircle className="w-4 h-4" />
            Hồ sơ của tôi
          </button>
        )}
        <button className="w-full flex items-center gap-2 px-2 py-1.5 text-sm text-gray-300 hover:bg-white/5 rounded transition">
          <Settings className="w-4 h-4" />
          Cài đặt
        </button>
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-2 px-2 py-1.5 text-sm text-gray-300 hover:bg-red-500/20 hover:text-red-400 rounded transition"
        >
          <LogOut className="w-4 h-4" />
          Đăng xuất
        </button>
      </div>
    </div>
  );
}


