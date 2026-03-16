import { useState, useEffect } from 'react';
import { Search, Plus, Filter, ChevronDown, Check, X, Eye, Upload } from 'lucide-react';
import topicService from '../../services/topic.service';
import authService from '../../services/auth.service';

/**
 * Topic Management View - Task 19
 * List all topics with filtering and approval actions
 */
export function TopicManagementView({ initialStatusFilter = 'ALL' }) {
  const currentUser = authService.getCurrentUser();
  const canApproveTopics = currentUser?.role?.toLowerCase() === 'manager';
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [formData, setFormData] = useState({ title: '', description: '', maxGroups: 1 });
  const [syllabusFile, setSyllabusFile] = useState(null);

  useEffect(() => {
    loadTopics();
  }, []);

  useEffect(() => {
    setStatusFilter(initialStatusFilter || 'ALL');
  }, [initialStatusFilter]);

  const loadTopics = async () => {
    try {
      setLoading(true);
      const response = await topicService.getAllTopics({ lecturerId: currentUser?.userId || currentUser?.id });
      setTopics(Array.isArray(response?.data) ? response.data : Array.isArray(response) ? response : []);
    } catch (error) {
      console.error('Failed to load topics:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({ title: '', description: '', maxGroups: 1 });
    setSyllabusFile(null);
  };

  const handleCreateTopic = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      alert('Vui lòng nhập tiêu đề đề tài');
      return;
    }

    const payload = {
      title: formData.title.trim(),
      description: formData.description,
    };

    try {
      setCreating(true);
      await topicService.createTopic(payload, syllabusFile);
      resetForm();
      setShowCreateForm(false);
      loadTopics();
    } catch (error) {
      alert('Lỗi khi tạo đề tài: ' + (error.message || 'Unknown error'));
    } finally {
      setCreating(false);
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
      await topicService.rejectTopic(topicId, reason);
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
            <p className="text-sm text-gray-600 mt-1">Quản lý đề tài và theo dõi trạng thái duyệt</p>
          </div>
          <button
            onClick={() => setShowCreateForm((prev) => !prev)}
            className="flex items-center gap-2 px-4 py-2 bg-[#F27125] hover:bg-[#d96420] text-white rounded-lg font-medium transition-colors shadow-md"
          >
            <Plus className="w-4 h-4" />
            {showCreateForm ? 'Đóng form' : 'Tạo đề tài'}
          </button>
        </div>

        {showCreateForm && (
          <form onSubmit={handleCreateTopic} className="mt-5 border border-gray-200 rounded-lg p-4 bg-gray-50 space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tiêu đề *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                  placeholder="Nhập tiêu đề đề tài"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Số nhóm tối đa</label>
                <input
                  type="number"
                  min="1"
                  value={formData.maxGroups}
                  onChange={(e) => setFormData((prev) => ({ ...prev, maxGroups: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
              <textarea
                rows="3"
                value={formData.description}
                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                placeholder="Mô tả đề tài"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">File syllabus (tùy chọn)</label>
              <div className="flex items-center gap-3">
                <label className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-[#F27125]/30 bg-[#F27125]/10 text-[#F27125] text-sm font-semibold cursor-pointer hover:bg-[#F27125]/20 transition-colors">
                  <Upload className="w-4 h-4" />
                  Chọn file
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => setSyllabusFile(e.target.files?.[0] || null)}
                    className="hidden"
                  />
                </label>
                <span className="text-sm text-gray-600 truncate max-w-xs">
                  {syllabusFile ? syllabusFile.name : 'Chưa chọn file nào'}
                </span>
                {syllabusFile && (
                  <button
                    type="button"
                    onClick={() => setSyllabusFile(null)}
                    className="text-xs text-red-600 hover:text-red-700 font-medium"
                  >
                    Bỏ chọn
                  </button>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowCreateForm(false);
                  resetForm();
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={creating}
                className="px-4 py-2 bg-[#F27125] hover:bg-[#d96420] text-white rounded-lg text-sm disabled:opacity-60"
              >
                {creating ? 'Đang tạo...' : 'Tạo đề tài'}
              </button>
            </div>
          </form>
        )}

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
                          {canApproveTopics && topic.status?.toUpperCase() === 'PENDING' && (
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
