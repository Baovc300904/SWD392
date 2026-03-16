import { useEffect, useState } from 'react';
import {
  Upload,
  RefreshCw,
  FileText,
  Loader2,
  Award,
  Trash2,
  Pencil,
  X
} from 'lucide-react';
import { toast } from 'sonner';
import { submissionService } from '../../services/app.service';

const emptyForm = {
  milestoneName: '',
  fileUrl: '',
  notes: ''
};

const getGradeStyle = (grade) => {
  if (grade == null) return 'bg-gray-100 text-gray-500';
  if (grade < 5)   return 'bg-red-100 text-red-700';
  if (grade < 7)   return 'bg-yellow-100 text-yellow-700';
  if (grade < 8.5) return 'bg-blue-100 text-blue-700';
  return 'bg-green-100 text-green-700';
};

const toArray = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
};

export function StudentSubmissionView({ groupId }) {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalMode, setModalMode] = useState(null);
  const [editingSubmission, setEditingSubmission] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const loadSubmissions = async () => {
    if (!groupId) {
      setSubmissions([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await submissionService.getAllSubmissions({ groupId });
      setSubmissions(toArray(response));
    } catch (error) {
      console.error('Failed to load submissions:', error);
      toast.error(error?.message || 'Không thể tải danh sách bài nộp');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSubmissions();
  }, [groupId]);

  const openCreate = () => {
    setEditingSubmission(null);
    setForm(emptyForm);
    setModalMode('create');
  };

  const openEdit = (submission) => {
    setEditingSubmission(submission);
    setForm({
      milestoneName: submission.milestoneName || '',
      fileUrl: submission.fileUrl || '',
      notes: submission.notes || ''
    });
    setModalMode('edit');
  };

  const closeModal = () => {
    setModalMode(null);
    setEditingSubmission(null);
    setForm(emptyForm);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.milestoneName.trim() || !form.fileUrl.trim()) {
      toast.error('Milestone name và file URL là bắt buộc');
      return;
    }

    try {
      setSaving(true);
      if (modalMode === 'edit' && editingSubmission) {
        await submissionService.updateSubmission(editingSubmission.id, {
          milestoneName: form.milestoneName.trim(),
          fileUrl: form.fileUrl.trim(),
          notes: form.notes.trim()
        });
        toast.success('Cập nhật bài nộp thành công');
      } else {
        await submissionService.createSubmission({
          groupId,
          milestoneName: form.milestoneName.trim(),
          fileUrl: form.fileUrl.trim(),
          notes: form.notes.trim()
        });
        toast.success('Nộp bài thành công');
      }
      closeModal();
      await loadSubmissions();
    } catch (error) {
      console.error('Submission save failed:', error);
      toast.error(error?.message || 'Không thể lưu bài nộp');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (submissionId) => {
    try {
      setDeletingId(submissionId);
      await submissionService.deleteSubmission(submissionId);
      toast.success('Xóa bài nộp thành công');
      await loadSubmissions();
    } catch (error) {
      console.error('Delete submission failed:', error);
      toast.error(error?.message || 'Không thể xóa bài nộp');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Bài nộp của nhóm</h2>
          <p className="text-sm text-gray-500 mt-1">Nhóm có thể nộp, cập nhật hoặc xóa bài trước khi giảng viên chấm điểm.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={loadSubmissions}
            className="inline-flex items-center gap-2 px-3 py-2 text-sm text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg"
          >
            <RefreshCw className="w-4 h-4" /> Làm mới
          </button>
          <button
            onClick={openCreate}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#F27125] hover:bg-[#d96420] text-white text-sm font-semibold"
          >
            <Upload className="w-4 h-4" /> Nộp bài mới
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-8 h-8 text-[#F27125] animate-spin" />
          </div>
        ) : submissions.length === 0 ? (
          <div className="text-center py-16 px-6">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-800">Chưa có bài nộp nào</h3>
            <p className="text-sm text-gray-500 mt-2">Bắt đầu bằng cách nộp milestone đầu tiên của nhóm.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {submissions.map((submission) => {
              const status = String(submission.status || '').toUpperCase() || 'SUBMITTED';
              const isGraded = status === 'GRADED';
              const canEdit = status === 'SUBMITTED';

              const statusStyle = isGraded
                ? 'bg-purple-100 text-purple-700'
                : status === 'SUBMITTED'
                  ? 'bg-orange-100 text-orange-700'
                  : 'bg-gray-100 text-gray-700';

              return (
                <div key={submission.id} className="p-5 flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-3 flex-wrap mb-2">
                      <h3 className="font-bold text-gray-900">{submission.milestoneName || `Submission #${submission.id}`}</h3>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${statusStyle}`}>
                        {status}
                      </span>
                      {submission.grade != null && (
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${getGradeStyle(submission.grade)}`}>
                          <Award className="w-3.5 h-3.5" /> {submission.grade}/10
                        </span>
                      )}
                    </div>

                    <a
                      href={submission.fileUrl || submission.filePath}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline break-all"
                    >
                      {submission.fileUrl || submission.filePath}
                    </a>

                    {submission.notes && (
                      <p className="text-sm text-gray-600 mt-3 whitespace-pre-wrap">{submission.notes}</p>
                    )}

                    {submission.feedback && (
                      <div className="mt-3 rounded-xl bg-gray-50 border border-gray-200 p-3 text-sm text-gray-700">
                        <span className="font-semibold">Feedback: </span>{submission.feedback}
                      </div>
                    )}
                  </div>

                  {canEdit && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openEdit(submission)}
                        className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-[#F27125]"
                        title="Chỉnh sửa bài nộp"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(submission.id)}
                        disabled={deletingId === submission.id}
                        className="p-2 rounded-lg hover:bg-red-50 text-gray-500 hover:text-red-600 disabled:opacity-60"
                        title="Xóa bài nộp"
                      >
                        {deletingId === submission.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {modalMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <form onSubmit={handleSubmit} className="w-full max-w-lg rounded-2xl bg-white shadow-xl p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-gray-900">{modalMode === 'edit' ? 'Chỉnh sửa bài nộp' : 'Nộp bài mới'}</h3>
              <button type="button" onClick={closeModal} className="text-gray-400 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Milestone name</label>
                <input
                  value={form.milestoneName}
                  onChange={(event) => setForm((prev) => ({ ...prev, milestoneName: event.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                  placeholder="Ví dụ: Milestone 1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">File URL</label>
                <input
                  value={form.fileUrl}
                  onChange={(event) => setForm((prev) => ({ ...prev, fileUrl: event.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                  placeholder="https://drive.google.com/..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Notes</label>
                <textarea
                  value={form.notes}
                  onChange={(event) => setForm((prev) => ({ ...prev, notes: event.target.value }))}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm resize-none"
                  placeholder="Mô tả ngắn gọn nội dung bài nộp"
                />
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button type="button" onClick={closeModal} className="flex-1 py-2.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-sm font-semibold text-gray-700">
                Hủy
              </button>
              <button type="submit" disabled={saving} className="flex-1 py-2.5 rounded-lg bg-[#F27125] hover:bg-[#d96420] text-sm font-semibold text-white disabled:opacity-60">
                {saving ? 'Đang lưu...' : modalMode === 'edit' ? 'Cập nhật' : 'Nộp bài'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
