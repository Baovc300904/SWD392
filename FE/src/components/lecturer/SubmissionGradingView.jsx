import { useState, useEffect } from 'react';
import {
  Search, Star, CheckCircle2, Clock, AlertCircle,
  Loader2, FileText, ExternalLink, Save, X, RefreshCw, GraduationCap
} from 'lucide-react';
import { toast } from 'sonner';
import { submissionService, milestoneService } from '../../services/app.service';

function StatusBadge({ status }) {
  const map = {
    Graded:    { bg: 'bg-green-100',  text: 'text-green-700',  icon: CheckCircle2 },
    Submitted: { bg: 'bg-blue-100',   text: 'text-blue-700',   icon: Clock },
    Late:      { bg: 'bg-red-100',    text: 'text-red-600',    icon: AlertCircle },
  };
  const cfg = map[status] || map.Submitted;
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-full ${cfg.bg} ${cfg.text}`}>
      <Icon className="w-3 h-3" />{status}
    </span>
  );
}

function GradeChip({ grade }) {
  if (grade == null) return <span className="text-gray-400 text-sm">—</span>;
  const color = grade >= 8 ? 'text-green-600' : grade >= 6 ? 'text-[#F27125]' : 'text-red-500';
  return <span className={`font-bold text-base ${color}`}>{grade.toFixed(1)}</span>;
}

export function SubmissionGradingView() {
  const [submissions, setSubmissions] = useState([]);
  const [milestones, setMilestones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [milestoneFilter, setMilestoneFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const [gradeModal, setGradeModal] = useState(null);   // submission being graded
  const [gradeForm, setGradeForm] = useState({ grade: '', feedback: '' });
  const [grading, setGrading] = useState(false);

  useEffect(() => {
    fetchSubmissions();
    fetchMilestones();
  }, []);

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      const params = {};
      if (milestoneFilter) params.milestoneId = milestoneFilter;
      const res = await submissionService.getAllSubmissions(params);
      setSubmissions(res?.data?.data || res?.data || []);
    } catch { toast.error('Failed to load submissions'); }
    finally { setLoading(false); }
  };

  const fetchMilestones = async () => {
    try {
      const res = await milestoneService.getAllMilestones();
      setMilestones(res?.data?.data || res?.data || []);
    } catch { /* ignore */ }
  };

  const openGrade = (sub) => {
    setGradeModal(sub);
    setGradeForm({ grade: sub.grade ?? '', feedback: '' });
  };

  const handleGrade = async (e) => {
    e.preventDefault();
    const g = parseFloat(gradeForm.grade);
    if (isNaN(g) || g < 0 || g > 10) { toast.error('Grade must be between 0 and 10'); return; }
    setGrading(true);
    try {
      await submissionService.gradeSubmission(gradeModal.submissionId || gradeModal.id, g, gradeForm.feedback);
      toast.success('Submission graded successfully');
      setGradeModal(null);
      fetchSubmissions();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Grading failed');
    } finally { setGrading(false); }
  };

  const filtered = submissions.filter(s => {
    const term = searchTerm.toLowerCase();
    const matchSearch = s.group?.groupName?.toLowerCase().includes(term) || s.linkRepo?.toLowerCase().includes(term);
    const matchStatus = statusFilter === 'all' || s.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const stats = {
    total: submissions.length,
    graded: submissions.filter(s => s.status === 'Graded').length,
    pending: submissions.filter(s => s.status === 'Submitted').length,
    late: submissions.filter(s => s.status === 'Late').length,
  };

  return (
    <div className="flex-1 overflow-auto bg-gray-50 p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Submission Grading</h1>
          <p className="text-gray-500 mt-1">Review and grade group submissions</p>
        </div>
        <button onClick={fetchSubmissions} className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-100 text-gray-600 text-sm transition">
          <RefreshCw className="w-4 h-4" />Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total', value: stats.total, color: 'text-gray-700', bg: 'bg-white' },
          { label: 'Pending', value: stats.pending, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Graded', value: stats.graded, color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'Late', value: stats.late, color: 'text-red-500', bg: 'bg-red-50' },
        ].map(s => (
          <div key={s.label} className={`${s.bg} rounded-xl border border-gray-200 p-5`}>
            <p className="text-sm text-gray-500 mb-1">{s.label}</p>
            <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Search group or repo..."
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#F27125]/30" />
        </div>
        <select value={milestoneFilter} onChange={e => { setMilestoneFilter(e.target.value); setTimeout(fetchSubmissions, 50); }}
          className="px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#F27125]/30">
          <option value="">All Milestones</option>
          {milestones.map(m => <option key={m.milestoneId || m.id} value={m.milestoneId || m.id}>{m.name}</option>)}
        </select>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className="px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#F27125]/30">
          <option value="all">All Status</option>
          <option value="Submitted">Submitted</option>
          <option value="Graded">Graded</option>
          <option value="Late">Late</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-[#F27125] animate-spin" /></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <FileText className="w-12 h-12 mx-auto mb-3 opacity-40" />
            <p className="font-medium">No submissions found</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50 text-left">
                <th className="px-6 py-3.5 font-semibold text-gray-600">Group</th>
                <th className="px-6 py-3.5 font-semibold text-gray-600">Milestone</th>
                <th className="px-6 py-3.5 font-semibold text-gray-600">Repository</th>
                <th className="px-6 py-3.5 font-semibold text-gray-600">Submitted At</th>
                <th className="px-6 py-3.5 font-semibold text-gray-600">Grade</th>
                <th className="px-6 py-3.5 font-semibold text-gray-600">Status</th>
                <th className="px-6 py-3.5 font-semibold text-gray-600 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(sub => (
                <tr key={sub.submissionId || sub.id} className="hover:bg-gray-50/60 transition">
                  <td className="px-6 py-4 font-semibold text-gray-900">{sub.group?.groupName || '—'}</td>
                  <td className="px-6 py-4 text-gray-600">{sub.milestone?.name || '—'}</td>
                  <td className="px-6 py-4">
                    {sub.linkRepo ? (
                      <a href={sub.linkRepo} target="_blank" rel="noreferrer"
                        className="flex items-center gap-1.5 text-[#F27125] hover:underline text-xs font-medium">
                        <ExternalLink className="w-3.5 h-3.5" />
                        {sub.linkRepo.replace('https://github.com/', '')}
                      </a>
                    ) : '—'}
                  </td>
                  <td className="px-6 py-4 text-gray-500 text-xs">
                    {sub.submissionAt ? new Date(sub.submissionAt).toLocaleString('vi-VN') : '—'}
                  </td>
                  <td className="px-6 py-4"><GradeChip grade={sub.grade} /></td>
                  <td className="px-6 py-4"><StatusBadge status={sub.status} /></td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => openGrade(sub)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-[#F27125] hover:bg-[#d96420] text-white rounded-lg text-xs font-medium transition ml-auto">
                      <GraduationCap className="w-3.5 h-3.5" />
                      {sub.status === 'Graded' ? 'Re-grade' : 'Grade'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ── Grade Modal ── */}
      {gradeModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Grade Submission</h2>
                <p className="text-sm text-gray-500">{gradeModal.group?.groupName} — {gradeModal.milestone?.name}</p>
              </div>
              <button onClick={() => setGradeModal(null)} className="p-1.5 hover:bg-gray-100 rounded-lg transition">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Repo link */}
            {gradeModal.linkRepo && (
              <div className="px-6 py-3 bg-gray-50 border-b">
                <a href={gradeModal.linkRepo} target="_blank" rel="noreferrer"
                  className="flex items-center gap-2 text-sm text-[#F27125] hover:underline font-medium">
                  <ExternalLink className="w-4 h-4" />View Repository
                </a>
              </div>
            )}

            <form onSubmit={handleGrade} className="p-6 space-y-4">
              {/* Star visual */}
              <div className="flex justify-center gap-2 py-2">
                {[2, 4, 6, 8, 10].map(v => (
                  <button key={v} type="button"
                    onClick={() => setGradeForm(f => ({ ...f, grade: String(v) }))}
                    className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg border-2 transition text-sm font-bold ${
                      parseFloat(gradeForm.grade) >= v ? 'border-[#F27125] bg-[#F27125]/10 text-[#F27125]' : 'border-gray-200 text-gray-400 hover:border-gray-300'
                    }`}>
                    <Star className={`w-4 h-4 ${parseFloat(gradeForm.grade) >= v ? 'fill-[#F27125]' : ''}`} />
                    {v}
                  </button>
                ))}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Grade (0 – 10) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number" step="0.1" min="0" max="10"
                  value={gradeForm.grade}
                  onChange={e => setGradeForm(f => ({ ...f, grade: e.target.value }))}
                  placeholder="e.g. 8.5" required
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#F27125]/30"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Feedback</label>
                <textarea value={gradeForm.feedback}
                  onChange={e => setGradeForm(f => ({ ...f, feedback: e.target.value }))}
                  rows={3} placeholder="Leave feedback for the group..."
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#F27125]/30 resize-none"
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setGradeModal(null)} className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition">Cancel</button>
                <button type="submit" disabled={grading}
                  className="flex items-center gap-2 px-5 py-2 bg-[#F27125] hover:bg-[#d96420] text-white rounded-lg text-sm font-medium transition disabled:opacity-60">
                  {grading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {grading ? 'Saving…' : 'Submit Grade'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
