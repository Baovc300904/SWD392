import { useState, useEffect } from 'react';
import {
  Plus, Search, Edit, Trash2, X, Save, Loader2,
  Target, RefreshCw, Calendar, Percent, CheckCircle2, Clock, AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { milestoneService, classService } from '../../services/app.service';

function StatusBadge({ status }) {
  const map = {
    Active:    { bg: 'bg-green-100',  text: 'text-green-700',  icon: CheckCircle2 },
    Upcoming:  { bg: 'bg-blue-100',   text: 'text-blue-700',   icon: Clock },
    Completed: { bg: 'bg-gray-100',   text: 'text-gray-500',   icon: AlertCircle },
  };
  const cfg = map[status] || map.Upcoming;
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-full ${cfg.bg} ${cfg.text}`}>
      <Icon className="w-3 h-3" />{status}
    </span>
  );
}

const emptyForm = { name: '', description: '', classId: '', deadline: '', weight: 20, status: 'Upcoming' };

export function MilestoneManagementView() {
  const [milestones, setMilestones] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [classFilter, setClassFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchMilestones();
    fetchClasses();
  }, []);

  const fetchMilestones = async () => {
    try {
      setLoading(true);
      const params = {};
      if (classFilter) params.classId = classFilter;
      const res = await milestoneService.getAllMilestones(params);
      setMilestones(res?.data?.data || res?.data || []);
    } catch { toast.error('Failed to load milestones'); }
    finally { setLoading(false); }
  };

  const fetchClasses = async () => {
    try {
      const res = await classService.getAllClasses();
      setClasses(res?.data?.data || res?.data || []);
    } catch { /* ignore */ }
  };

  const openCreate = () => { setEditing(null); setForm(emptyForm); setModalOpen(true); };
  const openEdit = (m) => {
    setEditing(m);
    setForm({
      name: m.name,
      description: m.description || '',
      classId: m.classId || '',
      deadline: m.deadline?.slice(0, 16) || '',
      weight: m.weight ?? 20,
      status: m.status || 'Upcoming',
    });
    setModalOpen(true);
  };
  const closeModal = () => { setModalOpen(false); setEditing(null); setForm(emptyForm); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.deadline) { toast.error('Name and deadline are required'); return; }
    setSaving(true);
    try {
      if (editing) {
        await milestoneService.updateMilestone(editing.milestoneId || editing.id, form);
        toast.success('Milestone updated');
      } else {
        await milestoneService.createMilestone(form);
        toast.success('Milestone created');
      }
      closeModal();
      fetchMilestones();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Operation failed');
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await milestoneService.deleteMilestone(deleteTarget.milestoneId || deleteTarget.id);
      toast.success('Milestone deleted');
      setDeleteTarget(null);
      fetchMilestones();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to delete');
    } finally { setDeleting(false); }
  };

  const filtered = milestones.filter(m => {
    const matchSearch = m.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === 'all' || m.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalWeight = milestones.reduce((acc, m) => acc + (m.weight || 0), 0);

  return (
    <div className="flex-1 overflow-auto bg-gray-50 p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Milestones</h1>
          <p className="text-gray-500 mt-1">Manage project milestones and deadlines</p>
        </div>
        <div className="flex gap-3">
          <button onClick={fetchMilestones} className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-100 text-gray-600 text-sm transition">
            <RefreshCw className="w-4 h-4" />Refresh
          </button>
          <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 bg-[#F27125] hover:bg-[#d96420] text-white rounded-lg text-sm font-medium transition shadow">
            <Plus className="w-4 h-4" />New Milestone
          </button>
        </div>
      </div>

      {/* Weight summary */}
      {milestones.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6 flex items-center gap-4">
          <Percent className="w-5 h-5 text-[#F27125]" />
          <div className="flex-1">
            <div className="flex justify-between text-sm mb-1.5">
              <span className="font-medium text-gray-700">Total Weight Allocated</span>
              <span className={`font-bold ${totalWeight === 100 ? 'text-green-600' : totalWeight > 100 ? 'text-red-500' : 'text-[#F27125]'}`}>
                {totalWeight}%
              </span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${totalWeight > 100 ? 'bg-red-400' : 'bg-[#F27125]'}`}
                style={{ width: `${Math.min(totalWeight, 100)}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Search milestones..."
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#F27125]/30" />
        </div>
        <select value={classFilter} onChange={e => { setClassFilter(e.target.value); setTimeout(fetchMilestones, 50); }}
          className="px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#F27125]/30">
          <option value="">All Classes</option>
          {classes.map(c => <option key={c.classId || c.id} value={c.classId || c.id}>{c.className}</option>)}
        </select>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className="px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#F27125]/30">
          <option value="all">All Status</option>
          <option value="Upcoming">Upcoming</option>
          <option value="Active">Active</option>
          <option value="Completed">Completed</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-[#F27125] animate-spin" /></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <Target className="w-12 h-12 mx-auto mb-3 opacity-40" />
            <p className="font-medium">No milestones found</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50 text-left">
                <th className="px-6 py-3.5 font-semibold text-gray-600">Milestone</th>
                <th className="px-6 py-3.5 font-semibold text-gray-600">Class</th>
                <th className="px-6 py-3.5 font-semibold text-gray-600">Deadline</th>
                <th className="px-6 py-3.5 font-semibold text-gray-600">Weight</th>
                <th className="px-6 py-3.5 font-semibold text-gray-600">Submissions</th>
                <th className="px-6 py-3.5 font-semibold text-gray-600">Status</th>
                <th className="px-6 py-3.5 font-semibold text-gray-600 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(m => (
                <tr key={m.milestoneId || m.id} className="hover:bg-gray-50/60 transition">
                  <td className="px-6 py-4">
                    <p className="font-semibold text-gray-900">{m.name}</p>
                    {m.description && <p className="text-xs text-gray-400 mt-0.5 truncate max-w-[200px]">{m.description}</p>}
                  </td>
                  <td className="px-6 py-4 text-gray-600">{m.class?.className || '—'}</td>
                  <td className="px-6 py-4 text-gray-600">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-gray-400" />
                      {m.deadline ? new Date(m.deadline).toLocaleDateString('vi-VN') : '—'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-semibold text-[#F27125]">{m.weight}%</span>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{m.submissions?.length ?? 0}</td>
                  <td className="px-6 py-4"><StatusBadge status={m.status} /></td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => openEdit(m)} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-[#F27125] transition">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button onClick={() => setDeleteTarget(m)} className="p-1.5 hover:bg-red-50 rounded-lg text-gray-500 hover:text-red-500 transition">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ── Create / Edit Modal ── */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-lg font-bold text-gray-900">{editing ? 'Edit Milestone' : 'New Milestone'}</h2>
              <button onClick={closeModal} className="p-1.5 hover:bg-gray-100 rounded-lg transition">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Name <span className="text-red-500">*</span></label>
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. Milestone 1 — Proposal" required
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#F27125]/30" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  rows={2} placeholder="Optional description..."
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#F27125]/30 resize-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Class</label>
                <select value={form.classId} onChange={e => setForm(f => ({ ...f, classId: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#F27125]/30">
                  <option value="">Select class</option>
                  {classes.map(c => <option key={c.classId || c.id} value={c.classId || c.id}>{c.className}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Deadline <span className="text-red-500">*</span></label>
                  <input type="datetime-local" value={form.deadline} onChange={e => setForm(f => ({ ...f, deadline: e.target.value }))} required
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#F27125]/30" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Weight (%)</label>
                  <input type="number" min={0} max={100} value={form.weight} onChange={e => setForm(f => ({ ...f, weight: +e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#F27125]/30" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Status</label>
                <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#F27125]/30">
                  <option value="Upcoming">Upcoming</option>
                  <option value="Active">Active</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={closeModal} className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition">Cancel</button>
                <button type="submit" disabled={saving}
                  className="flex items-center gap-2 px-5 py-2 bg-[#F27125] hover:bg-[#d96420] text-white rounded-lg text-sm font-medium transition disabled:opacity-60">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {saving ? 'Saving…' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Delete Confirm ── */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Delete Milestone</h3>
                <p className="text-sm text-gray-500">This action cannot be undone</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-6">Are you sure you want to delete <strong>{deleteTarget.name}</strong>?</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteTarget(null)} className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-50 transition">Cancel</button>
              <button onClick={handleDelete} disabled={deleting}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition disabled:opacity-60">
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
