import { useEffect, useMemo, useState } from 'react';
import { Award, FileText, Loader2, MessageSquare, RefreshCw, School, X } from 'lucide-react';
import { toast } from 'sonner';
import { classService, submissionService } from '../../services/app.service';

const toArray = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
};

export function SubmissionManagementView() {
  const [classes, setClasses] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [gradingSubmission, setGradingSubmission] = useState(null);
  const [gradingForm, setGradingForm] = useState({ grade: '', feedback: '' });

  const loadData = async () => {
    try {
      setLoading(true);
      const [classList, submissionResponse] = await Promise.all([
        classService.getAllClasses(),
        submissionService.getAllSubmissions()
      ]);

      const nextClasses = Array.isArray(classList) ? classList : [];
      setClasses(nextClasses);
      setSubmissions(toArray(submissionResponse));

      if (!selectedClassId && nextClasses[0]?.id) {
        setSelectedClassId(String(nextClasses[0].id));
      }
    } catch (error) {
      console.error('Failed to load admin submissions:', error);
      toast.error(error?.message || 'Không thể tải danh sách submissions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredSubmissions = useMemo(() => {
    if (!selectedClassId) return submissions;
    return submissions.filter((item) => String(item.group?.class?.id || item.group?.classId || '') === String(selectedClassId));
  }, [submissions, selectedClassId]);

  const openGradeModal = (submission) => {
    setGradingSubmission(submission);
    setGradingForm({
      grade: submission.grade ?? '',
      feedback: submission.feedback || ''
    });
  };

  const closeGradeModal = () => {
    setGradingSubmission(null);
    setGradingForm({ grade: '', feedback: '' });
  };

  const handleGrade = async (event) => {
    event.preventDefault();
    if (!gradingSubmission) return;

    try {
      setSaving(true);
      await submissionService.gradeSubmission(
        gradingSubmission.id,
        Number(gradingForm.grade),
        gradingForm.feedback.trim()
      );
      toast.success('Đã cập nhật điểm submission');
      closeGradeModal();
      await loadData();
    } catch (error) {
      console.error('Failed to grade submission:', error);
      toast.error(error?.message || 'Không thể lưu điểm submission');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Submission Review</h2>
          <p className="text-sm text-gray-500 mt-1">Manager theo dõi bài nộp toàn hệ thống và có thể chấm lại khi cần.</p>
        </div>
        <button onClick={loadData} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 bg-white text-sm text-gray-600 hover:bg-gray-50">
          <RefreshCw className="w-4 h-4" /> Làm mới
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4 flex flex-wrap items-center gap-3">
        <div className="inline-flex items-center gap-2 text-sm font-semibold text-gray-700">
          <School className="w-4 h-4 text-[#F27125]" /> Lọc theo lớp
        </div>
        <select
          value={selectedClassId}
          onChange={(event) => setSelectedClassId(event.target.value)}
          className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
        >
          <option value="">Tất cả lớp</option>
          {classes.map((item) => (
            <option key={item.id} value={item.id}>{item.className}</option>
          ))}
        </select>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-24"><Loader2 className="w-8 h-8 text-[#F27125] animate-spin" /></div>
        ) : filteredSubmissions.length === 0 ? (
          <div className="text-center py-16 px-6">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-800">Chưa có submission</h3>
            <p className="text-sm text-gray-500 mt-2">Không có bài nộp nào trong phạm vi lọc hiện tại.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredSubmissions.map((submission) => (
              <div key={submission.id} className="p-5 flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap mb-2">
                    <h3 className="font-bold text-gray-900">{submission.milestoneName || `Submission #${submission.id}`}</h3>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${String(submission.status || '').toUpperCase() === 'GRADED' ? 'bg-purple-100 text-purple-700' : 'bg-orange-100 text-orange-700'}`}>
                      {String(submission.status || '').toUpperCase()}
                    </span>
                    <span className="text-xs text-gray-500">{submission.group?.groupName || 'Unknown group'} · {submission.group?.class?.className || 'Unknown class'}</span>
                  </div>
                  <a href={submission.fileUrl || submission.filePath} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline break-all">
                    {submission.fileUrl || submission.filePath}
                  </a>
                  {submission.feedback && (
                    <div className="mt-3 rounded-xl bg-gray-50 border border-gray-200 p-3 text-sm text-gray-700">
                      <span className="font-semibold">Feedback: </span>{submission.feedback}
                    </div>
                  )}
                </div>

                <div className="flex flex-col items-end gap-3">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-100 text-green-700 text-sm font-semibold">
                    <Award className="w-4 h-4" /> {submission.grade != null ? `${submission.grade}/10` : 'Chưa chấm'}
                  </div>
                  <button onClick={() => openGradeModal(submission)} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#F27125] hover:bg-[#d96420] text-white text-sm font-semibold">
                    <MessageSquare className="w-4 h-4" /> {submission.grade != null ? 'Cập nhật điểm' : 'Chấm bài'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {gradingSubmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <form onSubmit={handleGrade} className="w-full max-w-lg rounded-2xl bg-white shadow-xl p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Chấm điểm submission</h3>
                <p className="text-sm text-gray-500 mt-1">{gradingSubmission.group?.groupName || 'Unknown group'}</p>
              </div>
              <button type="button" onClick={closeGradeModal} className="text-gray-400 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Điểm</label>
                <input
                  type="number"
                  min="0"
                  max="10"
                  step="0.1"
                  value={gradingForm.grade}
                  onChange={(event) => setGradingForm((prev) => ({ ...prev, grade: event.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Feedback</label>
                <textarea
                  rows={5}
                  value={gradingForm.feedback}
                  onChange={(event) => setGradingForm((prev) => ({ ...prev, feedback: event.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm resize-none"
                />
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button type="button" onClick={closeGradeModal} className="flex-1 py-2.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-sm font-semibold text-gray-700">
                Hủy
              </button>
              <button type="submit" disabled={saving} className="flex-1 py-2.5 rounded-lg bg-[#F27125] hover:bg-[#d96420] text-sm font-semibold text-white disabled:opacity-60">
                {saving ? 'Đang lưu...' : 'Lưu điểm'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}