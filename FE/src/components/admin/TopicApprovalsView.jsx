import { useState, useEffect, useRef } from 'react';
import {
  Search, Check, X, FileQuestion, Loader2,
  RefreshCw, Eye, AlertCircle, CheckCircle2, Clock, XCircle,
  Filter, Lock, Calendar, Download, ZoomIn, ZoomOut, Maximize2, Minimize2
} from 'lucide-react';
import { toast } from 'sonner';
import { topicService, semesterService } from '../../services/app.service';

const normalizeStatus = (status) => String(status || '').toUpperCase();
const getTopicId = (topic) => topic?.id ?? topic?.topicId;

function StatusBadge({ status }) {
  const map = {
    PENDING:  { bg: 'bg-yellow-100', text: 'text-yellow-700', icon: Clock, label: 'PENDING' },
    APPROVED: { bg: 'bg-green-100',  text: 'text-green-700',  icon: CheckCircle2, label: 'APPROVED' },
    REJECTED: { bg: 'bg-red-100',    text: 'text-red-700',    icon: XCircle, label: 'REJECTED' },
  };
  const cfg = map[normalizeStatus(status)] || map.PENDING;
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-full ${cfg.bg} ${cfg.text}`}>
      <Icon className="w-3 h-3" />{cfg.label}
    </span>
  );
}

export function TopicApprovalsView({ initialStatusFilter = 'all' }) {
  const [topics, setTopics]             = useState([]);
  const [semesters, setSemesters]       = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState(null);
  const [searchTerm, setSearchTerm]     = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [semesterFilter, setSemesterFilter] = useState('all');
  const [actionLoading, setActionLoading] = useState({});
  const [detailTopic, setDetailTopic]   = useState(null);
  const [previewSyllabus, setPreviewSyllabus] = useState(null);
  const [previewZoom, setPreviewZoom] = useState(1);
  const [isPreviewFullscreen, setIsPreviewFullscreen] = useState(false);
  const [rejectModal, setRejectModal]   = useState(null);
  const [rejectReason, setRejectReason] = useState('');
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
    fetchSemesters();
    fetchTopics();
  }, []);

  useEffect(() => {
    setStatusFilter(String(initialStatusFilter || 'all').toLowerCase() === 'all'
      ? 'all'
      : String(initialStatusFilter || 'all').toUpperCase());
  }, [initialStatusFilter]);

  useEffect(() => {
    const onFullscreenChange = () => {
      setIsPreviewFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', onFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange);
  }, []);

  const openSyllabusPreview = (topic) => {
    setPreviewZoom(1);
    setPreviewSyllabus({ url: extractSyllabusUrl(topic), title: topic.title || 'Syllabus' });
  };

  const togglePreviewFullscreen = async () => {
    if (!previewContainerRef.current) return;
    if (!document.fullscreenElement) {
      await previewContainerRef.current.requestFullscreen();
      return;
    }
    await document.exitFullscreen();
  };

  const fetchSemesters = async () => {
    try {
      const res = await semesterService.getAllSemesters();
      setSemesters(res?.data?.data || res?.data || []);
    } catch { /* ignore – non-critical */ }
  };

  const fetchTopics = async () => {
    try {
      setLoading(true); setError(null);
      const res = await topicService.getAllTopics();
      setTopics(res?.data?.data || res?.data || []);
    } catch (err) {
      setError('Không thể tải danh sách topic.');
    } finally { setLoading(false); }
  };

  const handleApprove = async (topic) => {
    const topicId = getTopicId(topic);
    if (!topicId) { toast.error('Không tìm thấy ID topic để duyệt'); return; }
    setActionLoading(p => ({ ...p, [topicId]: 'approve' }));
    try {
      await topicService.approveTopic(topicId);
      toast.success(`Đã duyệt "${topic.title}"`);
      fetchTopics();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Duyệt thất bại');
    } finally {
      setActionLoading(p => { const n = { ...p }; delete n[topicId]; return n; });
    }
  };

  const handleReject = async () => {
    if (!rejectModal) return;
    const topicId = getTopicId(rejectModal);
    if (!topicId) { toast.error('Không tìm thấy ID topic để từ chối'); return; }
    setActionLoading(p => ({ ...p, [topicId]: 'reject' }));
    try {
      await topicService.rejectTopic(topicId, rejectReason);
      toast.success(`Đã từ chối "${rejectModal.title}"`);
      setRejectModal(null); setRejectReason('');
      fetchTopics();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Từ chối thất bại');
    } finally {
      setActionLoading(p => { const n = { ...p }; delete n[topicId]; return n; });
    }
  };

  /* ── derive the status of the currently selected semester ── */
  const selectedSemester = semesterFilter !== 'all'
    ? semesters.find(s => String(s.id || s.semesterId) === String(semesterFilter))
    : null;
  const isCompletedSemester = selectedSemester?.status === 'Completed';

  const filtered = topics.filter(t => {
    const matchSearch = !searchTerm ||
      t.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const normalizedFilter = String(statusFilter || 'all').toLowerCase() === 'all'
      ? 'all'
      : String(statusFilter).toUpperCase();
    const matchStatus = normalizedFilter === 'all' || normalizeStatus(t.status) === normalizedFilter;
    const matchSemester = semesterFilter === 'all' ||
      String(t.semesterId || t.semester?.id) === String(semesterFilter);
    return matchSearch && matchStatus && matchSemester;
  });

  const semesterScopedTopics = semesterFilter === 'all'
    ? topics
    : topics.filter((t) => String(t.semesterId || t.semester?.id) === String(semesterFilter));

  const counts = {
    all: semesterScopedTopics.length,
    PENDING:  semesterScopedTopics.filter(t => normalizeStatus(t.status) === 'PENDING').length,
    APPROVED: semesterScopedTopics.filter(t => normalizeStatus(t.status) === 'APPROVED').length,
    REJECTED: semesterScopedTopics.filter(t => normalizeStatus(t.status) === 'REJECTED').length,
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-24">
      <Loader2 className="w-8 h-8 text-[#F27125] animate-spin mb-3" />
      <p className="text-gray-500">Đang tải danh sách topic...</p>
    </div>
  );
  if (error) return (
    <div className="flex flex-col items-center justify-center py-24">
      <AlertCircle className="w-10 h-10 text-red-400 mb-3" />
      <p className="text-red-500 font-semibold mb-2">{error}</p>
      <button onClick={fetchTopics} className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm">
        <RefreshCw className="w-4 h-4" /> Thử lại
      </button>
    </div>
  );

  const STATUSES = [
    { key: 'all',      label: 'Tất cả',    count: counts.all,      color: 'bg-gray-100 text-gray-700' },
    { key: 'PENDING',  label: 'Chờ duyệt', count: counts.PENDING,  color: 'bg-yellow-100 text-yellow-700' },
    { key: 'APPROVED', label: 'Đã duyệt',  count: counts.APPROVED, color: 'bg-green-100 text-green-700' },
    { key: 'REJECTED', label: 'Từ chối',   count: counts.REJECTED, color: 'bg-red-100 text-red-700' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Duyệt Topic</h2>
          <p className="text-gray-500 text-sm mt-1">{counts.PENDING} topic đang chờ duyệt</p>
        </div>
        <button onClick={fetchTopics} className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg">
          <RefreshCw className="w-4 h-4" /> Làm mới
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {STATUSES.map(s => (
          <button key={s.key} onClick={() => setStatusFilter(s.key)}
            className={`p-4 rounded-xl border-2 text-left transition ${statusFilter === s.key ? 'border-[#F27125] shadow-md bg-white' : 'border-gray-100 hover:border-gray-300 bg-white'}`}>
            <div className="text-2xl font-bold text-gray-900">{s.count}</div>
            <div className={`inline-flex text-xs font-semibold px-2 py-0.5 rounded-full mt-1 ${s.color}`}>{s.label}</div>
          </button>
        ))}
      </div>

      {/* Filters row */}
      <div className="flex flex-wrap gap-3 items-center bg-white border border-gray-200 rounded-xl p-4">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
            placeholder="Tìm kiếm theo tên hoặc mô tả..."
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#F27125]" />
        </div>

        {/* Semester filter */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <select
            value={semesterFilter}
            onChange={e => setSemesterFilter(e.target.value)}
            className="px-3 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#F27125]/30 min-w-[160px]"
          >
            <option value="all">Tất cả học kỳ</option>
            {semesters.map(s => (
              <option key={s.id || s.semesterId} value={s.id || s.semesterId}>
                {s.name}{s.status === 'Completed' ? ' 🔒' : s.status === 'Active' ? ' ✅' : ''}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Completed semester banner */}
      {isCompletedSemester && (
        <div className="flex items-center gap-3 px-5 py-4 bg-purple-50 border border-purple-200 rounded-xl">
          <Lock className="w-5 h-5 text-purple-500 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-purple-800">
              Học kỳ "{selectedSemester.name}" đã hoàn thành – Chế độ chỉ xem
            </p>
            <p className="text-xs text-purple-600 mt-0.5">
              Kết thúc: {selectedSemester.endDate?.slice(0, 10)} · Các topic thuộc học kỳ này không thể chỉnh sửa hoặc xóa.
            </p>
          </div>
        </div>
      )}

      {/* List */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <FileQuestion className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">Không có topic nào</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map(topic => {
            const tid = getTopicId(topic);
            const busy = actionLoading[tid];
            /* A topic is read-only if its own semester is Completed OR if a Completed semester filter is selected */
            const topicSemesterStatus = topic.semester?.status;
            const isReadOnly = topicSemesterStatus === 'Completed' || isCompletedSemester;
            const semesterName = topic.semester?.name;
            return (
              <div key={tid} className={`bg-white rounded-xl border flex flex-col hover:shadow-md transition ${isReadOnly ? 'border-purple-200' : 'border-gray-200'}`}>
                {/* Semester tag */}
                {semesterName && (
                  <div className={`flex items-center gap-1.5 px-4 pt-3 pb-0 text-xs font-medium ${isReadOnly ? 'text-purple-500' : 'text-gray-400'}`}>
                    <Calendar className="w-3 h-3" />
                    {semesterName}
                    {isReadOnly && <Lock className="w-3 h-3 ml-0.5" />}
                  </div>
                )}
                <div className="p-5 flex flex-col flex-1">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <h3 className="font-bold text-gray-900 leading-snug line-clamp-2">{topic.title}</h3>
                    <StatusBadge status={topic.status || 'Pending'} />
                  </div>
                  <p className="text-sm text-gray-500 leading-relaxed mb-4 flex-1 line-clamp-3">{topic.description}</p>
                  {topic.rejectionReason && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-2.5 mb-3 text-xs text-red-700">
                      <span className="font-semibold">Lý do từ chối: </span>{topic.rejectionReason}
                    </div>
                  )}
                  {extractSyllabusUrl(topic) && (
                    <div className="mb-3">
                      <button
                        type="button"
                        onClick={() => openSyllabusPreview(topic)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#F27125] border border-[#F27125]/30 bg-[#F27125]/10 hover:bg-[#F27125]/20 rounded-lg"
                      >
                        <Eye className="w-3.5 h-3.5" /> Xem syllabus
                      </button>
                    </div>
                  )}
                  <div className="flex gap-2 pt-3 border-t border-gray-100">
                    <button onClick={() => setDetailTopic(topic)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg">
                      <Eye className="w-3.5 h-3.5" /> Chi tiết
                    </button>
                    {isReadOnly ? (
                      <span className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-purple-500 bg-purple-50 border border-purple-200 rounded-lg">
                        <Lock className="w-3.5 h-3.5" /> Chỉ xem
                      </span>
                    ) : (normalizeStatus(topic.status) === 'PENDING' || !topic.status) && (
                      <>
                        <button onClick={() => { setRejectModal(topic); setRejectReason(''); }} disabled={!!busy}
                          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-red-600 border border-red-300 hover:bg-red-50 rounded-lg disabled:opacity-50">
                          {busy === 'reject' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <X className="w-3.5 h-3.5" />} Từ chối
                        </button>
                        <button onClick={() => handleApprove(topic)} disabled={!!busy}
                          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-[#F27125] hover:bg-[#d96420] rounded-lg disabled:opacity-50">
                          {busy === 'approve' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />} Duyệt
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Detail Modal */}
      {detailTopic && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setDetailTopic(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">{detailTopic.title}</h3>
              <button onClick={() => setDetailTopic(null)} className="text-gray-400 hover:text-gray-700"><X className="w-5 h-5" /></button>
            </div>
            <div className="flex items-center gap-2 flex-wrap mb-4">
              <StatusBadge status={detailTopic.status || 'Pending'} />
              {detailTopic.semester && (
                <span className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium ${
                  detailTopic.semester.status === 'Completed'
                    ? 'bg-purple-100 text-purple-700'
                    : 'bg-blue-100 text-blue-700'
                }`}>
                  <Calendar className="w-3 h-3" />
                  {detailTopic.semester.name}
                  {detailTopic.semester.status === 'Completed' && <Lock className="w-3 h-3" />}
                </span>
              )}
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">{detailTopic.description}</p>
            {extractSyllabusUrl(detailTopic) && (
              <button
                type="button"
                onClick={() => openSyllabusPreview(detailTopic)}
                className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#F27125] border border-[#F27125]/30 bg-[#F27125]/10 hover:bg-[#F27125]/20 rounded-lg"
              >
                <Eye className="w-3.5 h-3.5" /> Xem syllabus
              </button>
            )}
            {detailTopic.type && <p className="mt-3 text-xs text-gray-500"><span className="font-semibold">Loại: </span>{detailTopic.type}</p>}
            {detailTopic.proposer && (
              <p className="mt-2 text-xs text-gray-500"><span className="font-semibold">Đề xuất bởi: </span>{detailTopic.proposer.fullName}</p>
            )}
            {detailTopic.rejectionReason && (
              <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
                <span className="font-semibold">Lý do từ chối: </span>{detailTopic.rejectionReason}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {rejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Từ chối Topic</h3>
              <button onClick={() => setRejectModal(null)} className="text-gray-400 hover:text-gray-700"><X className="w-5 h-5" /></button>
            </div>
            <p className="text-sm text-gray-600 mb-1">Topic: <span className="font-semibold">{rejectModal.title}</span></p>
            <textarea value={rejectReason} onChange={e => setRejectReason(e.target.value)}
              placeholder="Nhập lý do từ chối (không bắt buộc)..."
              rows={4} className="w-full mt-3 px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#F27125] resize-none" />
            <div className="flex gap-3 mt-4">
              <button onClick={() => setRejectModal(null)}
                className="flex-1 py-2.5 text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg">
                Hủy
              </button>
              <button onClick={handleReject} disabled={!!actionLoading[getTopicId(rejectModal)]}
                className="flex-1 py-2.5 text-sm font-semibold text-white bg-red-500 hover:bg-red-600 rounded-lg disabled:opacity-60 flex items-center justify-center gap-2">
                {actionLoading[getTopicId(rejectModal)] ? <Loader2 className="w-4 h-4 animate-spin" /> : <X className="w-4 h-4" />}
                Từ chối
              </button>
            </div>
          </div>
        </div>
      )}

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
