import { useEffect, useState } from 'react';
import { Users, BookOpen, School, Wifi, Loader2, RefreshCw, CalendarDays } from 'lucide-react';
import { toast } from 'sonner';
import groupService from '../../services/group.service';

function SummaryCard({ icon: Icon, label, value, hint, tone = 'orange' }) {
  const tones = {
    orange: 'bg-orange-50 text-orange-600',
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-sm transition">
      <div className="flex items-center justify-between mb-3">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${tones[tone]}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <div className="text-3xl font-bold text-gray-900 mb-1">{value}</div>
      <div className="text-sm text-gray-600">{label}</div>
      {hint && <div className="text-xs text-gray-400 mt-2">{hint}</div>}
    </div>
  );
}

export function GroupDashboardView({ groupId }) {
  const [group, setGroup] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchGroupData = async () => {
    if (!groupId) {
      setGroup(null);
      setMembers([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const [groupData, memberData] = await Promise.all([
        groupService.getGroupById(groupId),
        groupService.getGroupMembers(groupId),
      ]);
      setGroup(groupData);
      setMembers(Array.isArray(memberData) ? memberData : []);
    } catch (error) {
      console.error('Failed to fetch dashboard group data:', error);
      toast.error('Không thể tải dashboard của nhóm');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroupData();
  }, [groupId]);

  const onlineCount = members.filter((member) => member.student?.isOnline).length;
  const createdAt = group?.createdAt
    ? new Date(group.createdAt).toLocaleDateString('vi-VN')
    : 'N/A';

  return (
    <div className="flex-1 flex flex-col h-screen bg-gray-50 overflow-y-auto">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900"># dashboard</h1>
            <p className="text-sm text-gray-600 mt-0.5">Tổng quan dữ liệu nhóm hiện tại</p>
          </div>
          <button
            onClick={fetchGroupData}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition"
          >
            <RefreshCw className="w-4 h-4" />
            Làm mới
          </button>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-8 h-8 text-[#F27125] animate-spin" />
          </div>
        ) : !group ? (
          <div className="bg-white rounded-xl border border-gray-200 p-10 text-center text-gray-500">
            Không tìm thấy dữ liệu nhóm.
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
              <SummaryCard icon={Users} label="Thành viên" value={members.length} hint="Số thành viên hiện có" tone="orange" />
              <SummaryCard icon={Wifi} label="Đang online" value={onlineCount} hint="Theo trạng thái user" tone="green" />
              <SummaryCard icon={BookOpen} label="Topic" value={group.topic?.title || 'Chưa có'} hint={`Trạng thái: ${group.topic?.status || 'N/A'}`} tone="blue" />
              <SummaryCard icon={School} label="Lớp" value={group.class?.className || 'N/A'} hint={`Tạo ngày ${createdAt}`} tone="purple" />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <h2 className="font-bold text-gray-900 mb-4">Thông tin nhóm</h2>
                <div className="space-y-4 text-sm">
                  <div>
                    <div className="text-gray-500 mb-1">Tên nhóm</div>
                    <div className="font-semibold text-gray-900">{group.groupName}</div>
                  </div>
                  <div>
                    <div className="text-gray-500 mb-1">Topic</div>
                    <div className="font-semibold text-gray-900">{group.topic?.title || 'Chưa gán topic'}</div>
                  </div>
                  <div>
                    <div className="text-gray-500 mb-1">Lớp</div>
                    <div className="font-semibold text-gray-900">{group.class?.className || 'Chưa có lớp'}</div>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <CalendarDays className="w-4 h-4" />
                    <span>Tạo lúc {createdAt}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <h2 className="font-bold text-gray-900 mb-4">Thành viên nhóm</h2>
                <div className="space-y-3">
                  {members.map((member) => {
                    const student = member.student || {};
                    const initials = (student.fullName || '?')
                      .split(' ')
                      .map((word) => word[0])
                      .join('')
                      .slice(0, 2)
                      .toUpperCase();

                    return (
                      <div key={member.studentId || student.id} className="flex items-center justify-between gap-3 p-3 rounded-lg bg-gray-50">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-10 h-10 rounded-full bg-[#F27125] text-white flex items-center justify-center font-semibold">
                            {initials}
                          </div>
                          <div className="min-w-0">
                            <div className="font-medium text-gray-900 truncate">{student.fullName || 'Unknown member'}</div>
                            <div className="text-xs text-gray-500 truncate">{student.email || 'No email'}</div>
                          </div>
                        </div>
                        <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${student.isOnline ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'}`}>
                          {student.isOnline ? 'Online' : 'Offline'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}


