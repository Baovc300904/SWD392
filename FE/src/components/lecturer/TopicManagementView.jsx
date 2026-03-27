import { useState, useEffect, useRef } from 'react';
import { Search, Plus, Filter, ChevronDown, Check, X, Eye, Upload, Download, ZoomIn, ZoomOut, Maximize2, Minimize2 } from 'lucide-react';
import topicService from '../../services/topic.service';
import authService from '../../services/auth.service';

/**
 * Topic Management View - Task 19
 * List all topics with filtering and approval actions
 */
export function TopicManagementView({ initialStatusFilter = 'ALL' }) {
  const currentUser = authService.getCurrentUser();
  const canApproveTopics = currentUser?.role?.toLowerCase() === 'manager';
  const isLecturer = currentUser?.role?.toLowerCase() === 'lecturer';
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [editingTopicId, setEditingTopicId] = useState(null);
  const [formData, setFormData] = useState({ title: '', description: '' });
  const [editFormData, setEditFormData] = useState({ title: '', description: '' });
  const [syllabusFile, setSyllabusFile] = useState(null);
  const [editSyllabusFile, setEditSyllabusFile] = useState(null);
  const [previewSyllabus, setPreviewSyllabus] = useState(null);
  const [previewZoom, setPreviewZoom] = useState(1);
  const [isPreviewFullscreen, setIsPreviewFullscreen] = useState(false);
  const previewContainerRef = useRef(null);

  const extractSyllabusUrl = (topic) => topic?.syllabus?.url || topic?.syllabusUrl || null;

  const getSyllabusExtension = (url) => {
    if (!url) return '';
    const cleaned = String(url).split('?')[0].split('#')[0];
    const file = cleaned.split('/').pop() || '';
    return (file.split('.').pop() || '').toLowerCase();
  };

  const canInlinePreview = (url) => getSyllabusExtension(url) === 'pdf';

  useEffect(() => {
    const onFullscreenChange = () => {
      setIsPreviewFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', onFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange);
  }, []);

  const openSyllabusPreview = (topic) => {
    setPreviewZoom(1);
    setPreviewSyllabus({
      url: extractSyllabusUrl(topic),
      title: topic.title || 'Syllabus'
    });
  };

  const togglePreviewFullscreen = async () => {
    if (!previewContainerRef.current) return;
    if (!document.fullscreenElement) {
      await previewContainerRef.current.requestFullscreen();
      return;
    }
    await document.exitFullscreen();
  };

  const normalizeTitle = (value) =>
    String(value || '')
      .trim()
      .replace(/\s+/g, ' ')
      .toLowerCase();

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
    setFormData({ title: '', description: '' });
    setSyllabusFile(null);
  };

  const handleCreateTopic = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      alert('Vui lòng nhập tiêu đề đề tài');
      return;
    }

    const normalizedNewTitle = normalizeTitle(formData.title);
    const hasDuplicateInList = topics.some((topic) => normalizeTitle(topic.title) === normalizedNewTitle);
    if (hasDuplicateInList) {
      alert('Tiêu đề đề tài đã tồn tại. Vui lòng nhập tiêu đề khác.');
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
      const duplicateByCode =
        error?.response?.data?.code === 'TOPIC_TITLE_DUPLICATE' ||
        error?.response?.data?.code === 'TOPIC_DUPLICATE' ||
        error?.data?.code === 'TOPIC_TITLE_DUPLICATE' ||
        error?.data?.code === 'TOPIC_DUPLICATE';
      const duplicateByMessage = String(error?.message || '').toLowerCase().includes('trùng') ||
        String(error?.message || '').toLowerCase().includes('duplicate');

      if (duplicateByCode || duplicateByMessage) {
        alert('Tiêu đề đề tài đã tồn tại trong học kỳ này. Vui lòng nhập tiêu đề khác.');
      } else {
        const serverDetail = error?.data?.detail || error?.response?.data?.detail;
        alert('Lỗi khi tạo đề tài: ' + (serverDetail || error.message || 'Unknown error'));
      }
    } finally {
      setCreating(false);
    }
  };

  const startEditTopic = (topic) => {
    setEditingTopicId(topic.id);
    setEditSyllabusFile(null);
    setEditFormData({
      title: topic.title || '',
      description: topic.description || ''
    });
  };

  const cancelEditTopic = () => {
    setEditingTopicId(null);
    setEditSyllabusFile(null);
    setEditFormData({ title: '', description: '' });
  };

  const handleUpdateTopic = async (topicId) => {
    if (!editFormData.title.trim()) {
      alert('Vui lòng nhập tiêu đề đề tài');
      return;
    }

    const normalizedEditedTitle = normalizeTitle(editFormData.title);
    const hasDuplicateInList = topics.some(
      (topic) => Number(topic.id) !== Number(topicId) && normalizeTitle(topic.title) === normalizedEditedTitle
    );
    if (hasDuplicateInList) {
      alert('Tiêu đề đề tài đã tồn tại. Vui lòng nhập tiêu đề khác.');
      return;
    }

    try {
      setUpdating(true);
      await topicService.updateTopic(
        topicId,
        {
          title: editFormData.title.trim(),
          description: editFormData.description,
        },
        editSyllabusFile
      );
      cancelEditTopic();
      loadTopics();
    } catch (error) {
      const statusCode = error?.response?.status;
      const duplicateByCode =
        error?.response?.data?.code === 'TOPIC_TITLE_DUPLICATE' ||
        error?.response?.data?.code === 'TOPIC_DUPLICATE' ||
        error?.data?.code === 'TOPIC_TITLE_DUPLICATE' ||
        error?.data?.code === 'TOPIC_DUPLICATE';

      if (duplicateByCode) {
        alert('Tiêu đề đề tài đã tồn tại trong học kỳ này. Vui lòng nhập tiêu đề khác.');
      } else if (statusCode === 403) {
        alert(error?.response?.data?.detail || 'Bạn chỉ có thể chỉnh sửa đề tài chưa được duyệt.');
      } else {
        const serverDetail = error?.data?.detail || error?.response?.data?.detail;
        alert('Lỗi khi cập nhật đề tài: ' + (serverDetail || error?.response?.data?.message || error.message || 'Unknown error'));
      }
    } finally {
      setUpdating(false);
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
            <div className="grid grid-cols-1 gap-3">
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
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Syllabus</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Trạng thái</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                      Đang tải...
                    </td>
                  </tr>
                ) : filteredTopics.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
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
                        {editingTopicId === topic.id ? (
                          <div className="space-y-2">
                            <input
                              type="text"
                              value={editFormData.title}
                              onChange={(e) => setEditFormData((prev) => ({ ...prev, title: e.target.value }))}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                              placeholder="Tiêu đề đề tài"
                            />
                            <textarea
                              rows="2"
                              value={editFormData.description}
                              onChange={(e) => setEditFormData((prev) => ({ ...prev, description: e.target.value }))}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                              placeholder="Mô tả"
                            />
                            <div className="flex items-center gap-3">
                              <label className="inline-flex items-center gap-2 px-3 py-1 rounded-lg border border-[#F27125]/30 bg-[#F27125]/10 text-[#F27125] text-xs font-semibold cursor-pointer hover:bg-[#F27125]/20 transition-colors">
                                <Upload className="w-3.5 h-3.5" />
                                Chọn file mới
                                <input
                                  type="file"
                                  accept=".pdf,.doc,.docx"
                                  onChange={(e) => setEditSyllabusFile(e.target.files?.[0] || null)}
                                  className="hidden"
                                />
                              </label>
                              <span className="text-xs text-gray-600 truncate max-w-[180px]">
                                {editSyllabusFile ? editSyllabusFile.name : 'Không đổi file'}
                              </span>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="font-medium text-gray-900">{topic.title}</div>
                            <div className="text-sm text-gray-500 truncate max-w-md">
                              {topic.description}
                            </div>
                          </>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {topic.proposer?.fullName || 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {extractSyllabusUrl(topic) ? (
                          <button
                            type="button"
                            onClick={() => openSyllabusPreview(topic)}
                            className="inline-flex items-center gap-2 px-3 py-1 rounded-lg border border-[#F27125]/30 bg-[#F27125]/10 text-[#F27125] hover:bg-[#F27125]/20 transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            Xem file
                          </button>
                        ) : (
                          <span className="text-gray-400">Không có</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(topic.status)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {editingTopicId === topic.id ? (
                            <>
                              <button
                                onClick={() => handleUpdateTopic(topic.id)}
                                disabled={updating}
                                className="px-3 py-1.5 text-xs font-semibold rounded bg-[#F27125] text-white hover:bg-[#d96420] disabled:opacity-60"
                              >
                                {updating ? 'Đang lưu...' : 'Lưu'}
                              </button>
                              <button
                                onClick={cancelEditTopic}
                                disabled={updating}
                                className="px-3 py-1.5 text-xs font-semibold rounded border border-gray-300 text-gray-700 hover:bg-gray-50"
                              >
                                Hủy
                              </button>
                            </>
                          ) : (
                            <button
                              className="p-2 hover:bg-gray-100 rounded transition-colors"
                              title="Xem chi tiết"
                            >
                              <Eye className="w-4 h-4 text-gray-600" />
                            </button>
                          )}
                          {isLecturer && editingTopicId !== topic.id && topic.status?.toUpperCase() !== 'APPROVED' && (
                            <button
                              onClick={() => startEditTopic(topic)}
                              className="px-3 py-1.5 text-xs font-semibold rounded border border-[#F27125]/40 text-[#F27125] hover:bg-[#F27125]/10"
                              title="Chỉnh sửa đề tài chưa duyệt"
                            >
                              Chỉnh sửa
                            </button>
                          )}
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

      {previewSyllabus && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setPreviewSyllabus(null)}>
          <div ref={previewContainerRef} className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl h-[80vh] p-5 flex flex-col" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-bold text-gray-900 line-clamp-1">Syllabus - {previewSyllabus.title}</h3>
              <div className="flex items-center gap-2">
                <a
                  href={previewSyllabus.url}
                  target="_blank"
                  rel="noreferrer"
                  download
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                >
                  <Download className="w-3.5 h-3.5" /> Tải xuống
                </a>
                <button
                  type="button"
                  onClick={() => setPreviewZoom((z) => Math.max(0.5, Number((z - 0.1).toFixed(2))))}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <span className="text-xs text-gray-600 min-w-[48px] text-center">{Math.round(previewZoom * 100)}%</span>
                <button
                  type="button"
                  onClick={() => setPreviewZoom((z) => Math.min(2, Number((z + 0.1).toFixed(2))))}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={togglePreviewFullscreen}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                >
                  {isPreviewFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
                </button>
                <button onClick={() => setPreviewSyllabus(null)} className="text-gray-400 hover:text-gray-700">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {canInlinePreview(previewSyllabus.url) ? (
              <div className="flex-1 overflow-auto rounded-lg border border-gray-200 bg-gray-100">
                <iframe
                  src={previewSyllabus.url}
                  title="Syllabus preview"
                  className="rounded-lg bg-white"
                  style={{
                    width: `${100 / previewZoom}%`,
                    height: `${100 / previewZoom}%`,
                    transform: `scale(${previewZoom})`,
                    transformOrigin: 'top left'
                  }}
                />
              </div>
            ) : (
              <div className="flex-1 rounded-lg border border-dashed border-gray-300 bg-gray-50 flex flex-col items-center justify-center text-center px-6">
                <p className="text-sm text-gray-700 font-medium">Không hỗ trợ preview trực tiếp cho định dạng này.</p>
                <p className="text-xs text-gray-500 mt-1">Bạn có thể mở file ở tab mới để xem nội dung.</p>
                <a
                  href={previewSyllabus.url}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#F27125] hover:bg-[#d96420] text-white text-sm font-semibold"
                >
                  Mở file ở tab mới
                </a>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
