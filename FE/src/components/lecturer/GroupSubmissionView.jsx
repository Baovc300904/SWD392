import { useState, useEffect } from 'react';
import { Search, Filter, ChevronDown, FileText, Download, Eye } from 'lucide-react';
import groupService from '../../services/group.service';

/**
 * Group & Submission Management View
 * Display groups and their submissions
 */
export function GroupSubmissionView() {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

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
                        <button className="flex items-center gap-2 px-4 py-2 bg-[#F27125] hover:bg-[#d96420] text-white text-sm font-medium rounded-lg transition-colors shadow-md ml-auto">
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
    </div>
  );
}
