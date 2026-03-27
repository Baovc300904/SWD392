import { useState, useEffect } from 'react';
import {
  Plus, Search, Edit, Trash2, X, Save, Loader2,
  Calendar, CheckCircle2, Clock, Archive, RefreshCw, Lock
} from 'lucide-react';
import { toast } from 'sonner';
import { semesterService } from '../../services/app.service';

/* ── Status badge ── */
function StatusBadge({ status }) {
  const map = {
    Active:    { bg: 'bg-green-100',  text: 'text-green-700',  icon: CheckCircle2 },
    Upcoming:  { bg: 'bg-blue-100',   text: 'text-blue-700',   icon: Clock },
    Completed: { bg: 'bg-purple-100', text: 'text-purple-700', icon: Archive },
  };
  const cfg = map[status] || map.Upcoming;
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-full ${cfg.bg} ${cfg.text}`}>
      <Icon className="w-3 h-3" />
      {status}
    </span>
  );
}

/** Add exactly 3 months to a YYYY-MM-DD string */
const addThreeMonths = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  d.setMonth(d.getMonth() + 3);
  return d.toISOString().slice(0, 10);
};

const emptyForm = { name: '', startDate: '', endDate: '', status: 'Upcoming' };

/* ════════════════════════════════════════════════ */
export function SemesterManagementView() {
  const [semesters, setSemesters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);   // null = create mode
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => { fetchSemesters(); }, []);

  const fetchSemesters = async () => {
    try {
      setLoading(true);
      const res = await semesterService.getAllSemesters();
      setSemesters(res?.data?.data || res?.data || []);
    } catch (err) {
      toast.error('Failed to load semesters');
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (sem) => {
    setEditing(sem);
    setForm({
      name: sem.name,
      startDate: sem.startDate?.slice(0, 10) || '',
      endDate: sem.endDate?.slice(0, 10) || '',
      status: sem.status,
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditing(null);
    setForm(emptyForm);
  };

  /** When startDate changes, auto-suggest endDate = startDate + 3 months */
  const handleStartDateChange = (val) => {
    setForm(f => ({
      ...f,
      startDate: val,
      // Only auto-fill endDate if it's empty or hasn't been manually set
      endDate: f.endDate ? f.endDate : addThreeMonths(val),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.startDate || !form.endDate) {
      toast.error('Please fill in all required fields');
      return;
    }
    if (form.startDate >= form.endDate) {
      toast.error('End date must be after start date');
      return;
    }
    setSaving(true);
    try {
      if (editing) {
        await semesterService.updateSemester(editing.semesterId || editing.id, form);
        toast.success('Semester updated');
      } else {
        await semesterService.createSemester(form);
        toast.success('Semester created');
      }
      closeModal();
      fetchSemesters();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Operation failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await semesterService.deleteSemester(deleteTarget.semesterId || deleteTarget.id);
      toast.success('Semester deleted');
      setDeleteTarget(null);
      fetchSemesters();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to delete');
    } finally {
      setDeleting(false);
    }
  };

  const filtered = semesters.filter(s => {
    const matchSearch = s.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === 'all' || s.status === statusFilter;
    return matchSearch && matchStatus;
  });

  /* ── counts ── */
  const counts = {
    all: semesters.length,
    Upcoming: semesters.filter(s => s.status === 'Upcoming').length,
    Active: semesters.filter(s => s.status === 'Active').length,
    Completed: semesters.filter(s => s.status === 'Completed').length,
  };

  return (
    <div className="flex-1 overflow-auto bg-gray-50 p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Semester Management</h1>
          <p className="text-gray-500 mt-1">Create and manage academic semesters</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={fetchSemesters}
            className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-100 text-gray-600 text-sm transition"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 px-4 py-2 bg-[#F27125] hover:bg-[#d96420] text-white rounded-lg text-sm font-medium transition shadow"
          >
            <Plus className="w-4 h-4" />
            New Semester
          </button>
        </div>
      </div>

      {/* Status count tiles */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { key: 'all', label: 'All', color: 'bg-gray-100 text-gray-700 border-gray-200' },
          { key: 'Upcoming', label: 'Upcoming', color: 'bg-blue-50 text-blue-700 border-blue-200' },
          { key: 'Active', label: 'Active', color: 'bg-green-50 text-green-700 border-green-200' },
          { key: 'Completed', label: 'Completed', color: 'bg-purple-50 text-purple-700 border-purple-200' },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setStatusFilter(tab.key)}
            className={`p-3 rounded-xl border-2 text-left transition font-medium text-sm ${
              statusFilter === tab.key
                ? 'border-[#F27125] shadow-md bg-white'
                : `border-gray-100 ${tab.color} hover:border-gray-300`
            }`}
          >
            <div className="text-2xl font-bold text-gray-900">{counts[tab.key]}</div>
            <div>{tab.label}</div>
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search semesters by name..."
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#F27125]/30"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-[#F27125] animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <Calendar className="w-12 h-12 mx-auto mb-3 opacity-40" />
            <p className="font-medium">No semesters found</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50 text-left">
                <th className="px-6 py-3.5 font-semibold text-gray-600">Semester</th>
                <th className="px-6 py-3.5 font-semibold text-gray-600">Start Date</th>
                <th className="px-6 py-3.5 font-semibold text-gray-600">End Date</th>
                <th className="px-6 py-3.5 font-semibold text-gray-600">Duration</th>
                <th className="px-6 py-3.5 font-semibold text-gray-600">Status</th>
                <th className="px-6 py-3.5 font-semibold text-gray-600 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(sem => {
                const isCompleted = sem.status === 'Completed';
                /* compute duration in weeks */
                const weeks = sem.startDate && sem.endDate
                  ? Math.round((new Date(sem.endDate) - new Date(sem.startDate)) / (7 * 86400000))
                  : null;
                return (
                  <tr
                    key={sem.semesterId || sem.id}
                    className={`hover:bg-gray-50/60 transition ${isCompleted ? 'opacity-75' : ''}`}
                  >
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-900 flex items-center gap-2">
                        {isCompleted && <Lock className="w-3.5 h-3.5 text-purple-400" />}
                        {sem.name}
                      </div>
                      {isCompleted && (
                        <div className="text-xs text-purple-500 mt-0.5">Archived – read-only</div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-gray-600">{sem.startDate?.slice(0, 10)}</td>
                    <td className="px-6 py-4 text-gray-600">{sem.endDate?.slice(0, 10)}</td>
                    <td className="px-6 py-4 text-gray-400 text-xs">{weeks != null ? `${weeks} weeks` : '—'}</td>
                    <td className="px-6 py-4"><StatusBadge status={sem.status} /></td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {isCompleted ? (
                          <span
                            title="Completed semesters cannot be modified"
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs text-purple-400 bg-purple-50 rounded-lg cursor-not-allowed"
                          >
                            <Lock className="w-3 h-3" /> Archived
                          </span>
                        ) : (
                          <>
                            <button
                              onClick={() => openEdit(sem)}
                              className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-[#F27125] transition"
                              title="Edit semester"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setDeleteTarget(sem)}
                              className="p-1.5 hover:bg-red-50 rounded-lg text-gray-500 hover:text-red-500 transition"
                              title="Delete semester"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* ── Create / Edit Modal ── */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-lg font-bold text-gray-900">
                {editing ? 'Edit Semester' : 'New Semester'}
              </h2>
              <button onClick={closeModal} className="p-1.5 hover:bg-gray-100 rounded-lg transition">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Semester Name <span className="text-red-500">*</span>
                </label>
                <input
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. Spring 2026"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#F27125]/30"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Start Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={form.startDate}
                    onChange={e => handleStartDateChange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#F27125]/30"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    End Date <span className="text-red-500">*</span>
                    {form.startDate && form.endDate === addThreeMonths(form.startDate) && (
                      <span className="ml-1 text-xs text-[#F27125] font-normal">(auto ~3 months)</span>
                    )}
                  </label>
                  <input
                    type="date"
                    value={form.endDate}
                    onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))}
                    min={form.startDate || undefined}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#F27125]/30"
                    required
                  />
                </div>
              </div>
              {/* 3-month hint */}
              {form.startDate && !form.endDate && (
                <button
                  type="button"
                  onClick={() => setForm(f => ({ ...f, endDate: addThreeMonths(f.startDate) }))}
                  className="text-xs text-[#F27125] hover:underline"
                >
                  → Set end date to {addThreeMonths(form.startDate)} (3 months)
                </button>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Status</label>
                <select
                  value={form.status}
                  onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#F27125]/30"
                >
                  <option value="Upcoming">Upcoming</option>
                  <option value="Active">Active</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={closeModal} className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 px-5 py-2 bg-[#F27125] hover:bg-[#d96420] text-white rounded-lg text-sm font-medium transition disabled:opacity-60"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {saving ? 'Saving…' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Delete Confirm Modal ── */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Delete Semester</h3>
                <p className="text-sm text-gray-500">This action cannot be undone</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to delete <strong>{deleteTarget.name}</strong>?
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteTarget(null)} className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-50 transition">
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition disabled:opacity-60"
              >
                {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                {deleting ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
