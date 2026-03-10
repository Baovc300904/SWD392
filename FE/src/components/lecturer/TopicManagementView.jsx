import { useState, useEffect } from 'react';
import { Search, Plus, Filter, ChevronDown, Check, X, Eye } from 'lucide-react';
import topicService from '../../services/topic.service';

/**
 * Topic Management View - Task 19
 * List all topics with filtering and approval actions
 */
export function TopicManagementView() {
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);

  useEffect(() => {
    loadTopics();
  }, []);

  const loadTopics = async () => {
    try {
      setLoading(true);
      const response = await topicService.getAllTopics();
      setTopics(response.data || []);
    } catch (error) {
      console.error('Failed to load topics:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (topicId) => {
    try {
      await topicService.approveTopic(topicId);
      loadTopics(); // Reload list
    } catch (error) {
      console.error('Failed to approve topic:', error);
      alert('Lỗi khi duyệt đề tài: ' + (error.message || 'Unknown error'));
    }
  };

  const handleReject = async (topicId) => {
    const reason = prompt('Nhập lý do từ chối:');
    if (!reason) return;
    
    try {
      await topicService.rejectTopic(topicId, { reason });
      loadTopics();
    } catch (error) {
      console.error('Failed to reject topic:', error);
      alert('Lỗi khi từ chối đề tài: ' + (error.message || 'Unknown error'));
    }
  };

  const filteredTopics = topics.filter(topic => {
    const matchesSearch = topic.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         topic.description?.toLowerCase().includes(searchTerm.toLowerCase());
    // Case-insensitive status matching
    const matchesStatus = statusFilter === 'ALL' || topic.status?.toUpperCase() === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status) => {
    const statusUpper = status?.toUpperCase();
    const styles = {
      'PENDING': 'bg-gray-100 text-gray-700 border-gray-300',
      'APPROVED': 'bg-green-50 text-green-700 border-green-200',
      'REJECTED': 'bg-red-50 text-red-700 border-red-200'
    };
    return (
      <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold border ${styles[statusUpper] || styles['PENDING']}`}>
        {statusUpper === 'PENDING' ? 'WAITING' : statusUpper}
      </span>
    );
  };

  return (
    <div className="flex-1 bg-[#F3F4F6] overflow-auto">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Quản lý Đề tài</h1>
            <p className="text-sm text-gray-600 mt-1">Quản lý và duyệt các đề tài của sinh viên</p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-[#F27125] hover:bg-[#d96420] text-white rounded-lg font-medium transition-colors shadow-md">
            <Plus className="w-4 h-4" />
            Thêm mới
          </button>
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm theo tiêu đề hoặc mô tả..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
            />
          </div>

          {/* Filter Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowFilterDropdown(!showFilterDropdown)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Filter className="w-4 h-4" />
              <span className="text-sm font-medium">
                {statusFilter === 'ALL' ? 'Tất cả trạng thái' : 
                 statusFilter === 'PENDING' ? 'Chờ duyệt' :
                 statusFilter === 'APPROVED' ? 'Đã duyệt' : 'Từ chối'}
              </span>
              <ChevronDown className="w-4 h-4" />
            </button>
            
            {showFilterDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                {['ALL', 'PENDING', 'APPROVED', 'REJECTED'].map((status) => (
                  <button
                    key={status}
                    onClick={() => {
                      setStatusFilter(status);
                      setShowFilterDropdown(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 transition-colors"
                  >
                    {status === 'ALL' ? 'Tất cả trạng thái' : (status === 'PENDING' ? 'Chờ duyệt' : status === 'APPROVED' ? 'Đã duyệt' : 'Từ chối')}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="px-8 py-6">
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Tiêu đề</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Người tạo</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Trạng thái</th>
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
                ) : filteredTopics.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                      Không tìm thấy đề tài nào
                    </td>
                  </tr>
                ) : (
                  filteredTopics.map((topic) => (
                    <tr key={topic.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900 font-mono">
                        #{topic.id}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{topic.title}</div>
                        <div className="text-sm text-gray-500 truncate max-w-md">
                          {topic.description}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {topic.proposer?.fullName || 'N/A'}
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(topic.status)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            className="p-2 hover:bg-gray-100 rounded transition-colors"
                            title="Xem chi tiết"
                          >
                            <Eye className="w-4 h-4 text-gray-600" />
                          </button>
                          {topic.status?.toUpperCase() === 'PENDING' && (
                            <>
                              <button
                                onClick={() => handleApprove(topic.id)}
                                className="p-2 hover:bg-green-50 rounded transition-colors"
                                title="Duyệt"
                              >
                                <Check className="w-4 h-4 text-green-600" />
                              </button>
                              <button
                                onClick={() => handleReject(topic.id)}
                                className="p-2 hover:bg-red-50 rounded transition-colors"
                                title="Từ chối"
                              >
                                <X className="w-4 h-4 text-red-600" />
                              </button>
                            </>
                          )}
                        </div>
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
