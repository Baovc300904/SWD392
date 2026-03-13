import { useState, useEffect } from 'react';
import {
  Target, Upload, Loader2, AlertCircle, RefreshCw,
  CheckCircle2, Clock, X, Link2, FileText, Award, Calendar
} from 'lucide-react';
import { toast } from 'sonner';
import { milestoneService, submissionService } from '../../services/app.service';

function MilestoneStatusBadge({ submission }) {
  if (!submission) return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-500">
      <Clock className="w-3 h-3" /> Chưa nộp
    </span>
  );
  if (submission.grade != null) return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-700">
      <Award className="w-3 h-3" /> Đã chấm điểm
    </span>
  );
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-700">
      <CheckCircle2 className="w-3 h-3" /> Đã nộp
    </span>
  );
}

export function StudentMilestoneView({ groupId, classId }) {
  const [milestones, setMilestones]     = useState([]);
  const [submissions, setSubmissions]   = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState(null);
  const [submitModal, setSubmitModal]   = useState(null);
  const [form, setForm]                 = useState({ fileUrl: '', notes: '' });
  const [submitting, setSubmitting]     = useState(false);

  useEffect(() => { fetchAll(); }, [groupId, classId]);

  const fetchAll = async () => {
    try {
      setLoading(true); setError(null);
      const [msRes, subRes] = await Promise.all([
        milestoneService.getAllMilestones(classId ? { classId } : {}),
        submissionService.getAllSubmissions(groupId ? { groupId } : {}),
      ]);
      const milestoneList = msRes?.data?.data || msRes?.data || [];
      const submissionList = subRes?.data?.data || subRes?.data || [];
      setMilestones(Array.isArray(milestoneList) ? milestoneList : []);
      setSubmissions(Array.isArray(submissionList) ? submissionList : []);
    } catch {
      setError('Không thể tải dữ liệu milestones.');
    } finally { setLoading(false); }
  };

  const normalizeText = (text) => String(text || '').trim().toLowerCase();

  const getSubmission = (milestoneTitle) => {
    const normalizedTitle = normalizeText(milestoneTitle);
    return submissions.find((submission) => normalizeText(submission?.milestoneName) === normalizedTitle);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.fileUrl.trim()) { toast.error('Vui lòng nhập link bài nộp.'); return; }
    setSubmitting(true);
    try {
      await submissionService.createSubmission({
        groupId,
        milestoneName: submitModal.title,
        fileUrl: form.fileUrl,
        notes: form.notes,
      });
      toast.success(`Nộp bài Milestone "${submitModal.title}" thành công!`);
      setSubmitModal(null);
      setForm({ fileUrl: '', notes: '' });
      fetchAll();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Nộp bài thất bại');
    } finally { setSubmitting(false); }
  };

  const isOverdue = (deadline) => deadline && new Date(deadline) < new Date();

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-24">
      <Loader2 className="w-8 h-8 text-[#F27125] animate-spin mb-3" />
      <p className="text-gray-500 text-sm">Đang tải milestones...</p>
    </div>
  );

  if (error) return (
    <div className="flex flex-col items-center justify-center py-24">
      <AlertCircle className="w-10 h-10 text-red-400 mb-3" />
      <p className="text-red-500 font-semibold mb-2">{error}</p>
      <button onClick={fetchAll} className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm">
        <RefreshCw className="w-4 h-4" /> Thử lại
      </button>
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Milestones</h2>
          <p className="text-gray-500 text-sm mt-1">{milestones.length} milestone trong kỳ học</p>
        </div>
        <button onClick={fetchAll} className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg">
          <RefreshCw className="w-4 h-4" /> Làm mới
        </button>
      </div>

      {milestones.length === 0 ? (
        <div className="bg-white rounded-2xl border-2 border-dashed border-gray-200 p-12 text-center">
          <Target className="w-14 h-14 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Chưa có Milestone</h3>
          <p className="text-gray-400 text-sm">Giảng viên chưa tạo milestone cho lớp này.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {milestones.map((ms, idx) => {
            const mid = ms.milestoneId || ms.id;
            const sub = getSubmission(mid);
            const overdue = isOverdue(ms.deadline);

            return (
              <div key={mid} className="bg-white rounded-2xl border border-gray-200 p-5 hover:shadow-md transition">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm
                      ${sub?.grade != null ? 'bg-purple-100 text-purple-700'
                        : sub ? 'bg-green-100 text-green-700'
                        : overdue ? 'bg-red-100 text-red-600'
                        : 'bg-[#F27125]/10 text-[#F27125]'}`}>
                      {idx + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-900 truncate">{ms.title}</h3>
                      {ms.description && <p className="text-sm text-gray-500 mt-0.5 line-clamp-2">{ms.description}</p>}
                      <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-gray-400">
                        {ms.deadline && (
                          <span className={`flex items-center gap-1 ${overdue && !sub ? 'text-red-500' : ''}`}>
                            <Calendar className="w-3 h-3" />
                            Hạn nộp: {new Date(ms.deadline).toLocaleDateString('vi-VN')}
                            {overdue && !sub && ' (Quá hạn)'}
                          </span>
                        )}
                        {ms.weight && (
                          <span className="flex items-center gap-1 text-[#F27125] font-semibold">
                            <Award className="w-3 h-3" /> {ms.weight}%
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    <MilestoneStatusBadge submission={sub} />
                    {sub?.grade != null && (
                      <span className="text-lg font-bold text-purple-700">{sub.grade}/10</span>
                    )}
                  </div>
                </div>

                {/* Submission detail or action */}
                <div className="mt-4 pt-4 border-t border-gray-100">
                  {sub ? (
                    <div className="space-y-1">
                      {(sub.fileUrl || sub.filePath) && (
                        <a href={sub.fileUrl || sub.filePath} target="_blank" rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs text-blue-600 hover:underline">
                          <Link2 className="w-3.5 h-3.5" /> {sub.fileUrl || sub.filePath}
                        </a>
                      )}
                      {sub.feedback && (
                        <div className="text-xs text-gray-600 bg-gray-50 rounded-lg p-2.5 mt-2">
                          <span className="font-semibold">Nhận xét: </span>{sub.feedback}
                        </div>
                      )}
                    </div>
                  ) : (
                    <button
                      onClick={() => { setSubmitModal(ms); setForm({ fileUrl: '', notes: '' }); }}
                      disabled={overdue}
                      className="flex items-center gap-2 px-4 py-2 bg-[#F27125] hover:bg-[#d96420] text-white text-sm font-semibold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed">
                      <Upload className="w-4 h-4" />
                      {overdue ? 'Đã quá hạn' : 'Nộp bài'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Submit Modal */}
      {submitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Nộp bài</h3>
                <p className="text-sm text-gray-500 mt-0.5">{submitModal.title}</p>
              </div>
              <button type="button" onClick={() => setSubmitModal(null)} className="text-gray-400 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Link bài nộp <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input value={form.fileUrl} onChange={e => setForm(p => ({ ...p, fileUrl: e.target.value }))}
                    placeholder="https://drive.google.com/... hoặc link ảnh/file"
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#F27125]" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Ghi chú <span className="text-gray-400 font-normal">(không bắt buộc)</span>
                </label>
                <textarea value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
                  placeholder="Mô tả những gì đã hoàn thành trong milestone này..."
                  rows={3} className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#F27125] resize-none" />
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button type="button" onClick={() => setSubmitModal(null)}
                className="flex-1 py-2.5 text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition">
                Hủy
              </button>
              <button type="submit" disabled={submitting}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold text-white bg-[#F27125] hover:bg-[#d96420] rounded-lg transition disabled:opacity-60">
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                {submitting ? 'Đang nộp...' : 'Nộp bài'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
