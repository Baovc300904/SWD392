import { useState, useEffect } from 'react';
import {
  Search, Check, X, FileQuestion, Loader2,
  RefreshCw, Eye, AlertCircle, CheckCircle2, Clock, XCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { topicService } from '../../services/app.service';

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
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState(null);
  const [searchTerm, setSearchTerm]     = useState('');
  const [statusFilter, setStatusFilter] = useState('Pending');
  const [actionLoading, setActionLoading] = useState({});
  const [detailTopic, setDetailTopic]   = useState(null);
  const [rejectModal, setRejectModal]   = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  useEffect(() => { fetchTopics(); }, []);

  useEffect(() => {
    setStatusFilter(initialStatusFilter || 'all');
  }, [initialStatusFilter]);

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
    if (!topicId) {
      toast.error('Không tìm thấy ID topic để duyệt');
      return;
    }

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
    if (!topicId) {
      toast.error('Không tìm thấy ID topic để từ chối');
      return;
    }

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

  const filtered = topics.filter(t => {
    const matchSearch = !searchTerm ||
      t.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === 'all' || normalizeStatus(t.status) === statusFilter;
    return matchSearch && matchStatus;
  });

  const counts = {
    all: topics.length,
    PENDING:  topics.filter(t => normalizeStatus(t.status) === 'PENDING').length,
    APPROVED: topics.filter(t => normalizeStatus(t.status) === 'APPROVED').length,
    REJECTED: topics.filter(t => normalizeStatus(t.status) === 'REJECTED').length,
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
            className={`p-4 rounded-xl border-2 text-left transition ${statusFilter === s.key ? 'border-[#F27125] shadow-md' : 'border-gray-100 hover:border-gray-300 bg-white'}`}>
            <div className="text-2xl font-bold text-gray-900">{s.count}</div>
            <div className={`inline-flex text-xs font-semibold px-2 py-0.5 rounded-full mt-1 ${s.color}`}>{s.label}</div>
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
          placeholder="Tìm kiếm theo tên hoặc mô tả..."
          className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#F27125]" />
      </div>

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
            return (
              <div key={tid} className="bg-white rounded-xl border border-gray-200 p-5 flex flex-col hover:shadow-md transition">
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
                <div className="flex gap-2 pt-3 border-t border-gray-100">
                  <button onClick={() => setDetailTopic(topic)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg">
                    <Eye className="w-3.5 h-3.5" /> Chi tiết
                  </button>
                  {(normalizeStatus(topic.status) === 'PENDING' || !topic.status) && (
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
            <StatusBadge status={detailTopic.status || 'Pending'} />
            <p className="mt-4 text-sm text-gray-600 leading-relaxed">{detailTopic.description}</p>
            {detailTopic.type && <p className="mt-3 text-xs text-gray-500"><span className="font-semibold">Loại: </span>{detailTopic.type}</p>}
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
              <button onClick={handleReject} disabled={!!actionLoading[rejectModal.topicId]}
                className="flex-1 py-2.5 text-sm font-semibold text-white bg-red-500 hover:bg-red-600 rounded-lg disabled:opacity-60 flex items-center justify-center gap-2">
                {actionLoading[getTopicId(rejectModal)] ? <Loader2 className="w-4 h-4 animate-spin" /> : <X className="w-4 h-4" />}
                Từ chối
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

