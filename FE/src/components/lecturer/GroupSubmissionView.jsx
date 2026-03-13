import { useState, useEffect } from 'react';
import { Search, Filter, ChevronDown, FileText, Download, Eye, Users, X, Calendar, Mail } from 'lucide-react';
import groupService from '../../services/group.service';

/**
 * Group & Submission Management View
 * Display groups and their submissions
 */
export function GroupSubmissionView() {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    loadGroups();
  }, []);

  const loadGroups = async () => {
    try {
      setLoading(true);
      const response = await groupService.getAllGroups();
      setGroups(response.data || []);
    } catch (error) {
      console.error('Failed to load groups:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (group) => {
    setSelectedGroup(group);
    setShowDetailModal(true);
  };

  const filteredGroups = groups.filter(group => {
    return group.groupName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
           group.topic?.title?.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="flex-1 bg-[#F3F4F6] overflow-auto">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-6">
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-gray-900">Quản lý Nhóm & Nộp bài</h1>
          <p className="text-sm text-gray-600 mt-1">Theo dõi tiến độ và bài nộp của các nhóm</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-blue-600 font-medium">Tổng số nhóm</div>
                <div className="text-2xl font-bold text-blue-900 mt-1">{groups.length}</div>
              </div>
              <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-green-600 font-medium">Nhóm có đề tài</div>
                <div className="text-2xl font-bold text-green-900 mt-1">
                  {groups.filter(g => g.topic?.id).length}
                </div>
              </div>
              <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-lg border border-orange-200">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-orange-600 font-medium">Tổng thành viên</div>
                <div className="text-2xl font-bold text-orange-900 mt-1">
                  {groups.reduce((sum, g) => sum + (g.members?.length || 0), 0)}
                </div>
              </div>
              <div className="w-12 h-12 bg-[#F27125] rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm kiếm nhóm hoặc đề tài..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F27125] focus:border-transparent"
          />
        </div>
      </div>

      {/* Groups Table */}
      <div className="px-8 py-6">
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Nhóm</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Đề tài</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Số thành viên</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Lớp</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                      Đang tải...
                    </td>
                  </tr>
                ) : filteredGroups.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                      Không tìm thấy nhóm nào
                    </td>
                  </tr>
                ) : (
                  filteredGroups.map((group) => (
                    <tr key={group.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-[#F27125] text-white rounded-lg flex items-center justify-center font-bold shadow-md">
                            {group.id}
                          </div>
                          <div className="font-semibold text-gray-900">{group.groupName}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{group.topic?.title || 'Chưa có đề tài'}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {group.members?.length || 0} thành viên
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {group.class?.className || 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => handleViewDetails(group)}
                          className="flex items-center gap-2 px-4 py-2 bg-[#F27125] hover:bg-[#d96420] text-white text-sm font-medium rounded-lg transition-colors shadow-md ml-auto"
                        >
                          <Eye className="w-4 h-4" />
                          Xem chi tiết
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Group Detail Modal */}
      {showDetailModal && selectedGroup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-[#1a1d21] text-white">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-[#F27125] rounded-lg flex items-center justify-center font-bold text-lg shadow-md">
                  {selectedGroup.id}
                </div>
                <div>
                  <h2 className="text-xl font-bold">{selectedGroup.groupName}</h2>
                  <p className="text-sm text-gray-300">Chi tiết nhóm sinh viên</p>
                </div>
              </div>
              <button
                onClick={() => setShowDetailModal(false)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
              {/* Topic Info */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Đề tài</h3>
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-start gap-3">
                    <FileText className="w-5 h-5 text-[#F27125] mt-0.5" />
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900">
                        {selectedGroup.topic?.title || 'Chưa có đề tài'}
                      </div>
                      {selectedGroup.topic?.description && (
                        <p className="text-sm text-gray-600 mt-1">{selectedGroup.topic.description}</p>
                      )}
                      {selectedGroup.topic?.status && (
                        <span className={`inline-block mt-2 px-2 py-1 text-xs font-semibold rounded ${
                          selectedGroup.topic.status === 'Approved' 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {selectedGroup.topic.status}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Class Info */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Lớp học</h3>
                <div className="flex items-center gap-2 text-gray-700">
                  <Calendar className="w-4 h-4 text-[#F27125]" />
                  <span className="font-medium">{selectedGroup.class?.className || 'N/A'}</span>
                </div>
              </div>

              {/* Members List */}
              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3 flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Thành viên ({selectedGroup.members?.length || 0})
                </h3>
                {selectedGroup.members && selectedGroup.members.length > 0 ? (
                  <div className="space-y-2">
                    {selectedGroup.members.map((member, index) => (
                      <div 
                        key={index} 
                        className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
                      >
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                          <span className="text-white font-bold text-sm">
                            {member.student?.fullName?.charAt(0) || 'S'}
                          </span>
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold text-gray-900">
                            {member.student?.fullName || 'Unknown Student'}
                          </div>
                          {member.student?.email && (
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                              <Mail className="w-3 h-3" />
                              {member.student.email}
                            </div>
                          )}
                        </div>
                        {member.student?.isOnline && (
                          <div className="flex items-center gap-1 text-xs text-green-600">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            Online
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    Nhóm chưa có thành viên
                  </div>
                )}
              </div>

              {/* Created Date */}
              {selectedGroup.createdAt && (
                <div className="mt-6 pt-4 border-t border-gray-200 text-xs text-gray-500">
                  Ngày tạo: {new Date(selectedGroup.createdAt).toLocaleDateString('vi-VN')}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-3">
              <button
                onClick={() => setShowDetailModal(false)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors font-medium"
              >
                Đóng
              </button>
              <button
                className="px-4 py-2 bg-[#F27125] hover:bg-[#d96420] text-white rounded-lg transition-colors font-medium shadow-md"
              >
                Xem bài nộp
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
