import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Plus, ChevronRight, BookOpen, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import authService from '../../services/auth.service';
import userService from '../../services/user.service';
import classService from '../../services/class.service';
import groupService from '../../services/group.service';
import topicService from '../../services/topic.service';

/**
 * StudentGroupJoinFlow
 * Luồng cho sinh viên khi chưa có nhóm:
 * 1. Check student đã enroll vào class nào
 * 2. Check student đã join nhóm nào chưa
 * 3. Hiển thị danh sách nhóm trong class hoặc form tạo nhóm mới
 * 4. Sau khi join/tạo nhóm → Redirect vào workspace
 */
export function StudentGroupJoinFlow({ onGroupJoined }) {
  const navigate = useNavigate();
  const currentUser = authService.getCurrentUser();
  
  const [loading, setLoading] = useState(true);
  const [userClass, setUserClass] = useState(null);
  const [groups, setGroups] = useState([]);
  const [topics, setTopics] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    groupName: '',
    topicId: '',
    maxMembers: 5
  });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchStudentData();
  }, []);

  const fetchStudentData = async () => {
    try {
      setLoading(true);
      
      // Step 1: Lấy thông tin user hiện tại để biết thuộc class nào
      const userData = await userService.getUserProfile();
      
      // Step 2: Lấy danh sách classes của semester hiện tại
      // (Giả sử BE trả về classId trong user profile hoặc qua enrollment)
      // Nếu không có, cần call API enrollment
      if (!userData.classId && !userData.class_id) {
        toast.error('Bạn chưa được phân vào lớp nào. Vui lòng liên hệ quản lý.');
        setLoading(false);
        return;
      }

      const classId = userData.classId || userData.class_id;
      const classData = await classService.getClassById(classId);
      setUserClass(classData);

      // Step 3: Lấy danh sách groups trong class này
      const groupsData = await groupService.getAllGroups({ classId });
      setGroups(groupsData?.data || groupsData || []);

      // Step 4: Lấy danh sách topics đã approved để hiển thị khi tạo nhóm
      const topicsData = await topicService.getAllTopics({ status: 'APPROVED' });
      setTopics(topicsData?.data || topicsData || []);
      
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
        classId: userClass.id || userClass.classId,
        topicId: formData.topicId,
        groupName: formData.groupName,
        maxMembers: formData.maxMembers
      });

      toast.success('Tạo nhóm thành công!');
      
      // Auto join as creator
      const groupId = newGroup.id || newGroup.groupId;
      await groupService.addGroupMember(groupId, currentUser.userId);
      
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

  if (!userClass) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md text-center">
          <AlertCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Chưa có lớp học</h2>
          <p className="text-gray-600 mb-4">
            Bạn chưa được phân vào lớp nào. Vui lòng liên hệ giảng viên hoặc quản lý.
          </p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-2 bg-[#F27125] text-white rounded-lg hover:bg-[#d96420]"
          >
            Quay về Trang chủ
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Chọn hoặc Tạo Nhóm</h1>
          <p className="text-gray-600">
            Lớp: <span className="font-semibold">{userClass.class_name || userClass.className}</span> • 
            Giảng viên: <span className="font-semibold">{userClass.lecturer?.full_name || 'Chưa có'}</span>
          </p>
        </div>

        {/* Create Group Button */}
        <div className="mb-6">
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="flex items-center gap-2 px-6 py-3 bg-[#F27125] text-white rounded-lg hover:bg-[#d96420] font-medium"
          >
            <Plus className="w-5 h-5" />
            Tạo Nhóm Mới
          </button>
        </div>

        {/* Create Group Form */}
        {showCreateForm && (
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
                  Chọn Đề Tài * (Chỉ đề tài đã duyệt)
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Số Thành Viên Tối Đa
                </label>
                <input
                  type="number"
                  min="3"
                  max="10"
                  value={formData.maxMembers}
                  onChange={(e) => setFormData({ ...formData, maxMembers: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#F27125] focus:border-transparent"
                />
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
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-4">Danh Sách Nhóm Hiện Có</h2>
          
          {groups.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Chưa có nhóm nào trong lớp này</p>
              <p className="text-sm text-gray-400 mt-2">Hãy tạo nhóm mới để bắt đầu!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {groups.map((group) => (
                <div
                  key={group.id}
                  className="border rounded-lg p-4 hover:shadow-lg transition"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-800">{group.group_name || group.groupName}</h3>
                      <p className="text-sm text-gray-500 mt-1">
                        <BookOpen className="w-4 h-4 inline mr-1" />
                        {group.topic?.title || 'Chưa chọn đề tài'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
                    <span>
                      <Users className="w-4 h-4 inline mr-1" />
                      {group.members?.length || 0} / {group.max_members || group.maxMembers || 5} thành viên
                    </span>
                  </div>

                  <button
                    onClick={() => handleJoinGroup(group.id)}
                    disabled={(group.members?.length || 0) >= (group.max_members || group.maxMembers || 5)}
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
