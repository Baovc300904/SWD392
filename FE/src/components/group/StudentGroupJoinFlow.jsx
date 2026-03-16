import { useState, useEffect } from 'react';
import { Users, ChevronRight, BookOpen, Loader2, LogOut, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import authService from '../../services/auth.service';
import classService from '../../services/class.service';
import groupService from '../../services/group.service';
import topicService from '../../services/topic.service';

const toArray = (payload) => {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (Array.isArray(payload?.data)) {
    return payload.data;
  }

  if (Array.isArray(payload?.rows)) {
    return payload.rows;
  }

  return [];
};

/**
 * StudentGroupJoinFlow
 * Luồng cho sinh viên khi chưa có nhóm:
 * 1. Check student đã enroll vào class nào
 * 2. Check student đã join nhóm nào chưa
 * 3. Hiển thị danh sách nhóm trong class hoặc form tạo nhóm mới
 * 4. Sau khi join/tạo nhóm → Redirect vào workspace
 */
export function StudentGroupJoinFlow({ onGroupJoined, onLogout }) {
  const currentUser = authService.getCurrentUser();
  const role = currentUser?.role?.toLowerCase() || 'student';
  const canCreateGroup = role === 'student';
  
  const [loading, setLoading] = useState(true);
  const [classes, setClasses] = useState([]);
  const [groups, setGroups] = useState([]);
  const [topics, setTopics] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedClassId, setSelectedClassId] = useState('');
  
  // Form state
  const [formData, setFormData] = useState({
    groupName: '',
    classId: '',
    topicId: '',
  });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchStudentData();
  }, []);

  const fetchStudentData = async () => {
    try {
      setLoading(true);

      const [classData, groupsData, topicsData] = await Promise.all([
        classService.getAllClasses(),
        groupService.getAllGroups(),
        topicService.getAllTopics({ status: 'APPROVED' })
      ]);

      const availableClasses = toArray(classData);
      const availableGroups = toArray(groupsData);
      const approvedTopics = toArray(topicsData);

      setClasses(availableClasses);
      setGroups(availableGroups);
      setTopics(approvedTopics);

      const initialClassId = availableClasses[0]?.id ? String(availableClasses[0].id) : '';
      setSelectedClassId(initialClassId);
      setFormData((prev) => ({ ...prev, classId: initialClassId }));
      
    } catch (error) {
      console.error('Failed to fetch student data:', error);
      toast.error('Không thể tải thông tin. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinGroup = async (groupId) => {
    try {
      await groupService.addGroupMember(groupId, currentUser.userId);
      toast.success('Đã tham gia nhóm thành công!');
      
      // Notify parent component
      if (onGroupJoined) {
        onGroupJoined(groupId);
      }
    } catch (error) {
      console.error('Failed to join group:', error);
      toast.error(error?.response?.data?.message || 'Không thể tham gia nhóm');
    }
  };

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    
    if (!formData.groupName.trim()) {
      toast.error('Vui lòng nhập tên nhóm');
      return;
    }

    if (!formData.topicId) {
      toast.error('Vui lòng chọn đề tài');
      return;
    }

    setCreating(true);
    try {
      const newGroup = await groupService.createGroup({
        classId: Number(formData.classId),
        topicId: formData.topicId,
        groupName: formData.groupName,
      });

      toast.success('Tạo nhóm thành công!');
      const groupId = newGroup.id || newGroup.groupId;
      
      // Notify parent
      if (onGroupJoined) {
        onGroupJoined(groupId);
      }
    } catch (error) {
      console.error('Failed to create group:', error);
      toast.error(error?.response?.data?.message || 'Không thể tạo nhóm');
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-[#F27125] mx-auto mb-4" />
          <p className="text-gray-600">Đang tải thông tin...</p>
        </div>
      </div>
    );
  }

  const filteredGroups = selectedClassId
    ? groups.filter((group) => String(group.classId || group.class?.id || '') === String(selectedClassId))
    : groups;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-50 text-orange-700 text-xs font-semibold mb-3">
                <ShieldCheck className="w-3.5 h-3.5" />
                Vai trò hiện tại: {role === 'manager' ? 'Manager' : role === 'lecturer' ? 'Lecturer' : 'Student'}
              </div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Chọn Nhóm</h1>
              <p className="text-gray-600">
                Dữ liệu nhóm đang được lấy trực tiếp từ API. {canCreateGroup
                  ? 'Bạn có thể tham gia nhóm có sẵn hoặc tạo nhóm mới trong lớp của mình.'
                  : 'Bạn chỉ có thể tham gia nhóm có sẵn.'}
              </p>
            </div>
            <button
              type="button"
              onClick={onLogout}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition text-sm font-medium"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Lọc theo lớp</label>
          <select
            value={selectedClassId}
            onChange={(e) => {
              setSelectedClassId(e.target.value);
              setFormData((prev) => ({ ...prev, classId: e.target.value }));
            }}
            className="w-full md:w-80 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#F27125] focus:border-transparent"
          >
            <option value="">Tất cả lớp</option>
            {classes.map((item) => (
              <option key={item.id} value={item.id}>{item.className}</option>
            ))}
          </select>
        </div>

        {/* Create Group Button */}
        {canCreateGroup && (
          <div className="mb-6">
            <button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="flex items-center gap-2 px-6 py-3 bg-[#F27125] text-white rounded-lg hover:bg-[#d96420] font-medium"
            >
              Tạo Nhóm Mới
            </button>
          </div>
        )}

        {/* Create Group Form */}
        {canCreateGroup && showCreateForm && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-bold mb-4">Tạo Nhóm Mới</h2>
            <form onSubmit={handleCreateGroup} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tên Nhóm *
                </label>
                <input
                  type="text"
                  value={formData.groupName}
                  onChange={(e) => setFormData({ ...formData, groupName: e.target.value })}
                  placeholder="VD: Nhóm 1 - SWD Team"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#F27125] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Chọn Lớp *
                </label>
                <select
                  value={formData.classId}
                  onChange={(e) => setFormData({ ...formData, classId: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#F27125] focus:border-transparent"
                >
                  <option value="">-- Chọn lớp --</option>
                  {classes.map((item) => (
                    <option key={item.id} value={item.id}>{item.className}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Chọn Đề Tài *
                </label>
                <select
                  value={formData.topicId}
                  onChange={(e) => setFormData({ ...formData, topicId: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#F27125] focus:border-transparent"
                >
                  <option value="">-- Chọn đề tài --</option>
                  {topics.map((topic) => (
                    <option key={topic.id} value={topic.id}>
                      {topic.title}
                    </option>
                  ))}
                </select>
                {topics.length === 0 && (
                  <p className="text-sm text-yellow-600 mt-1">
                    Chưa có đề tài nào được duyệt. Vui lòng chờ giảng viên đăng ký đề tài.
                  </p>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={creating}
                  className="px-6 py-2 bg-[#F27125] text-white rounded-lg hover:bg-[#d96420] disabled:bg-gray-400 font-medium"
                >
                  {creating ? 'Đang tạo...' : 'Tạo Nhóm'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Existing Groups List */}
        <div className="bg-white rounded-lg shadow-md p-6 border border-slate-200">
          <div className="flex items-center justify-between gap-4 mb-4">
            <div>
              <h2 className="text-xl font-bold text-slate-800">Danh Sách Nhóm Hiện Có</h2>
              <p className="text-sm text-slate-600 mt-1">
                {selectedClassId ? `Đang hiển thị nhóm của lớp đã chọn.` : 'Đang hiển thị tất cả nhóm khả dụng.'}
              </p>
            </div>
            <div className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-sm font-semibold">
              {filteredGroups.length} nhóm
            </div>
          </div>
          
          {filteredGroups.length === 0 ? (
            <div className="text-center py-14 px-6 rounded-2xl border border-dashed border-slate-300 bg-slate-50">
              <Users className="w-16 h-16 text-slate-400 mx-auto mb-4" />
              <p className="text-lg font-semibold text-slate-700">Chưa có nhóm nào phù hợp</p>
              <p className="text-sm text-slate-600 mt-2 max-w-xl mx-auto">
                {canCreateGroup
                  ? 'Hiện chưa có nhóm trong bộ lọc này. Bạn có thể tạo nhóm mới để bắt đầu ngay.'
                  : 'Hiện chưa có nhóm trong bộ lọc này. Nếu cần được phân vào nhóm, vui lòng liên hệ lecturer.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredGroups.map((group) => (
                <div
                  key={group.id}
                  className="border rounded-lg p-4 hover:shadow-lg transition"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-800">{group.groupName}</h3>
                      <p className="text-sm text-gray-500 mt-1">
                        <BookOpen className="w-4 h-4 inline mr-1" />
                        {group.topic?.title || 'Chưa chọn đề tài'}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        Lớp: {group.class?.className || 'N/A'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
                    <span>
                      <Users className="w-4 h-4 inline mr-1" />
                      {group.members?.length || 0} thành viên
                    </span>
                  </div>

                  <button
                    onClick={() => handleJoinGroup(group.id)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-[#F27125] text-white rounded-lg hover:bg-[#d96420] disabled:bg-gray-300 disabled:cursor-not-allowed font-medium"
                  >
                    Tham Gia Nhóm
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
