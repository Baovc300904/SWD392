import { useState, useEffect } from 'react';
import {
  FileQuestion, Plus, Loader2, AlertCircle, RefreshCw,
  CheckCircle2, Clock, XCircle, Send, X
} from 'lucide-react';
import { toast } from 'sonner';
import { topicService } from '../../services/app.service';
import authService from '../../services/auth.service';

const STATUS_CONFIG = {
  Pending:  { bg: 'bg-yellow-50',  border: 'border-yellow-200', icon: Clock,         iconColor: 'text-yellow-500', label: 'Chờ duyệt' },
  Approved: { bg: 'bg-green-50',   border: 'border-green-200',  icon: CheckCircle2,  iconColor: 'text-green-500',  label: 'Đã duyệt' },
  Rejected: { bg: 'bg-red-50',     border: 'border-red-200',    icon: XCircle,       iconColor: 'text-red-500',    label: 'Bị từ chối' },
};

const TOPIC_TYPES = ['Web Application', 'Mobile Application', 'AI / ML', 'IoT System', 'Blockchain', 'Other'];

export function StudentTopicView({ groupId }) {
  const currentUser = authService.getCurrentUser();
  const [topic, setTopic]         = useState(null);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);
  const [showForm, setShowForm]   = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm]           = useState({ title: '', description: '', type: 'Web Application' });

  useEffect(() => { fetchTopic(); }, [groupId]);

  const fetchTopic = async () => {
    try {
      setLoading(true); setError(null);
      const res = await topicService.getAllTopics(groupId ? { groupId } : {});
      const list = res?.data?.data || res?.data || [];
      // Take the most recent topic for this group
      setTopic(list.length > 0 ? list[0] : null);
    } catch {
      setError('Không thể tải thông tin topic.');
    } finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.description.trim()) {
      toast.error('Vui lòng điền đầy đủ tiêu đề và mô tả.');
      return;
    }
    setSubmitting(true);
    try {
      await topicService.createTopic({ ...form, groupId, createdBy: currentUser?.userId });
      toast.success('Đã gửi đăng ký topic thành công!');
      setShowForm(false);
      setForm({ title: '', description: '', type: 'Web Application' });
      fetchTopic();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Gửi topic thất bại');
    } finally { setSubmitting(false); }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-24">
      <Loader2 className="w-8 h-8 text-[#F27125] animate-spin mb-3" />
      <p className="text-gray-500 text-sm">Đang tải...</p>
    </div>
  );

  if (error) return (
    <div className="flex flex-col items-center justify-center py-24">
      <AlertCircle className="w-10 h-10 text-red-400 mb-3" />
      <p className="text-red-500 font-semibold mb-2">{error}</p>
      <button onClick={fetchTopic} className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm">
        <RefreshCw className="w-4 h-4" /> Thử lại
      </button>
    </div>
  );

  const cfg = topic ? (STATUS_CONFIG[topic.status] || STATUS_CONFIG.Pending) : null;

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Topic Đăng ký</h2>
          <p className="text-gray-500 text-sm mt-1">Đề xuất và theo dõi topic của nhóm</p>
        </div>
        {(!topic || topic.status === 'Rejected') && (
          <button onClick={() => {
            setShowForm(!showForm);
            if (topic) setForm({ title: topic.title, description: topic.description, type: topic.type || 'Web Application' });
          }}
            className="flex items-center gap-2 px-4 py-2 bg-[#F27125] hover:bg-[#d96420] text-white rounded-lg text-sm font-semibold transition">
            <Plus className="w-4 h-4" />
            {topic ? 'Đề xuất lại' : 'Đăng ký Topic'}
          </button>
        )}
      </div>

      {/* Current Topic Card */}
      {topic && !showForm && (
        <div className={`rounded-2xl border-2 p-6 ${cfg.bg} ${cfg.border}`}>
          <div className="flex items-start gap-3 mb-4">
            <cfg.icon className={`w-6 h-6 mt-0.5 flex-shrink-0 ${cfg.iconColor}`} />
            <div className="flex-1">
              <div className="flex items-center gap-3 flex-wrap mb-1">
                <h3 className="text-lg font-bold text-gray-900">{topic.title}</h3>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${cfg.bg} ${cfg.iconColor} border ${cfg.border}`}>
                  {cfg.label}
                </span>
              </div>
              {topic.type && <span className="text-xs text-gray-500 bg-white/70 px-2.5 py-1 rounded-full">{topic.type}</span>}
            </div>
          </div>
          <p className="text-gray-700 leading-relaxed text-sm mb-4">{topic.description}</p>
          {topic.rejectionReason && (
            <div className="bg-red-100 border border-red-300 rounded-xl p-4">
              <p className="text-sm font-semibold text-red-700 mb-1">Lý do bị từ chối:</p>
              <p className="text-sm text-red-600">{topic.rejectionReason}</p>
            </div>
          )}
          {topic.status === 'Approved' && (
            <div className="flex items-center gap-2 mt-4 bg-green-100 rounded-xl p-3">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              <p className="text-sm font-medium text-green-700">Topic đã được duyệt — Nhóm bạn có thể bắt đầu phát triển!</p>
            </div>
          )}
        </div>
      )}

      {/* No topic yet */}
      {!topic && !showForm && (
        <div className="bg-white rounded-2xl border-2 border-dashed border-gray-200 p-12 text-center">
          <FileQuestion className="w-14 h-14 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Chưa có topic nào</h3>
          <p className="text-gray-400 text-sm mb-6">Nhóm bạn chưa đăng ký topic. Hãy bắt đầu bằng cách đề xuất một ý tưởng!</p>
          <button onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#F27125] hover:bg-[#d96420] text-white rounded-xl font-semibold text-sm transition">
            <Plus className="w-4 h-4" /> Đăng ký Topic ngay
          </button>
        </div>
      )}

      {/* Submit Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-bold text-gray-900">{topic ? 'Đề xuất lại Topic' : 'Đề xuất Topic mới'}</h3>
            <button type="button" onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-700">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Tên Topic <span className="text-red-500">*</span></label>
            <input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
              placeholder="VD: Hệ thống quản lý bán hàng thông minh"
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#F27125]" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Loại đề tài</label>
            <select value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#F27125] bg-white">
              {TOPIC_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Mô tả <span className="text-red-500">*</span></label>
            <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
              placeholder="Mô tả ngắn gọn về đề tài, mục tiêu, công nghệ sử dụng..."
              rows={4} className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#F27125] resize-none" />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setShowForm(false)}
              className="flex-1 py-2.5 text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition">
              Hủy
            </button>
            <button type="submit" disabled={submitting}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold text-white bg-[#F27125] hover:bg-[#d96420] rounded-lg transition disabled:opacity-60">
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              {submitting ? 'Đang gửi...' : 'Gửi đề xuất'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
