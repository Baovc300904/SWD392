import { useState, useEffect } from 'react';
import {
  Plus, Search, Edit, Trash2, X, Save, Loader2,
  School, Users, RefreshCw, ChevronDown, BookOpen
} from 'lucide-react';
import { toast } from 'sonner';
import { classService, semesterService } from '../../services/app.service';

function StatusBadge({ status }) {
  const active = status === 'Active';
  return (
    <span className={`inline-flex px-2.5 py-1 text-xs font-semibold rounded-full ${active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
      {status}
    </span>
  );
}

const emptyForm = { className: '', semesterId: '', lecturerId: '', maxMembers: 30, status: 'Active' };

export function ClassManagementView() {
  const [classes, setClasses] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [semesterFilter, setSemesterFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const [membersClass, setMembersClass] = useState(null);
  const [members, setMembers] = useState([]);
  const [membersLoading, setMembersLoading] = useState(false);

  useEffect(() => {
    fetchClasses();
    fetchSemesters();
  }, []);

  const fetchClasses = async () => {
    try {
      setLoading(true);
      const params = {};
      if (semesterFilter) params.semesterId = semesterFilter;
      const res = await classService.getAllClasses(params);
      setClasses(res?.data?.data || res?.data || []);
    } catch { toast.error('Failed to load classes'); }
    finally { setLoading(false); }
  };

  const fetchSemesters = async () => {
    try {
      const res = await semesterService.getAllSemesters();
      setSemesters(res?.data?.data || res?.data || []);
    } catch { /* ignore */ }
  };

  const openCreate = () => { setEditing(null); setForm(emptyForm); setModalOpen(true); };
  const openEdit = (cls) => {
    setEditing(cls);
    setForm({
      className: cls.className,
      semesterId: cls.semesterId || '',
      lecturerId: cls.lecturerId || '',
      maxMembers: cls.maxMembers || 30,
      status: cls.status || 'Active',
    });
    setModalOpen(true);
  };
  const closeModal = () => { setModalOpen(false); setEditing(null); setForm(emptyForm); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.className.trim()) { toast.error('Class name is required'); return; }
    setSaving(true);
    try {
      if (editing) {
        await classService.updateClass(editing.classId || editing.id, form);
        toast.success('Class updated');
      } else {
        await classService.createClass(form);
        toast.success('Class created');
      }
      closeModal();
      fetchClasses();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Operation failed');
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await classService.deleteClass(deleteTarget.classId || deleteTarget.id);
      toast.success('Class deleted');
      setDeleteTarget(null);
      fetchClasses();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to delete');
    } finally { setDeleting(false); }
  };

  const openMembers = async (cls) => {
    setMembersClass(cls);
    setMembersLoading(true);
    try {
      const res = await classService.getClassMembers(cls.classId || cls.id);
      setMembers(res?.data?.data || res?.data || []);
    } catch { toast.error('Failed to load members'); }
    finally { setMembersLoading(false); }
  };

  const filtered = classes.filter(c => {
    const matchSearch = c.className?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="flex-1 overflow-auto bg-gray-50 p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Class Management</h1>
          <p className="text-gray-500 mt-1">Manage classes and student enrollment</p>
        </div>
        <div className="flex gap-3">
          <button onClick={fetchClasses} className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-100 text-gray-600 text-sm transition">
            <RefreshCw className="w-4 h-4" />Refresh
          </button>
          <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 bg-[#F27125] hover:bg-[#d96420] text-white rounded-lg text-sm font-medium transition shadow">
            <Plus className="w-4 h-4" />New Class
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Search classes..."
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#F27125]/30" />
        </div>
        <select value={semesterFilter} onChange={e => { setSemesterFilter(e.target.value); setTimeout(fetchClasses, 50); }}
          className="px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#F27125]/30">
          <option value="">All Semesters</option>
          {semesters.map(s => <option key={s.semesterId || s.id} value={s.semesterId || s.id}>{s.name}</option>)}
        </select>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className="px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#F27125]/30">
          <option value="all">All Status</option>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 text-[#F27125] animate-spin" /></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <School className="w-12 h-12 mx-auto mb-3 opacity-40" />
            <p className="font-medium">No classes found</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50 text-left">
                <th className="px-6 py-3.5 font-semibold text-gray-600">Class</th>
                <th className="px-6 py-3.5 font-semibold text-gray-600">Semester</th>
                <th className="px-6 py-3.5 font-semibold text-gray-600">Lecturer</th>
                <th className="px-6 py-3.5 font-semibold text-gray-600">Members</th>
                <th className="px-6 py-3.5 font-semibold text-gray-600">Status</th>
                <th className="px-6 py-3.5 font-semibold text-gray-600 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(cls => (
                <tr key={cls.classId || cls.id} className="hover:bg-gray-50/60 transition">
                  <td className="px-6 py-4 font-semibold text-gray-900">{cls.className}</td>
                  <td className="px-6 py-4 text-gray-600">{cls.semester?.name || '—'}</td>
                  <td className="px-6 py-4 text-gray-600">{cls.lecturer?.fullName || '—'}</td>
                  <td className="px-6 py-4">
                    <button onClick={() => openMembers(cls)} className="flex items-center gap-1.5 text-[#F27125] hover:underline font-medium">
                      <Users className="w-4 h-4" />
                      {cls.members?.length ?? '—'} / {cls.maxMembers}
                    </button>
                  </td>
                  <td className="px-6 py-4"><StatusBadge status={cls.status} /></td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => openEdit(cls)} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-[#F27125] transition">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button onClick={() => setDeleteTarget(cls)} className="p-1.5 hover:bg-red-50 rounded-lg text-gray-500 hover:text-red-500 transition">
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
              <h2 className="text-lg font-bold text-gray-900">{editing ? 'Edit Class' : 'New Class'}</h2>
              <button onClick={closeModal} className="p-1.5 hover:bg-gray-100 rounded-lg transition">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Class Name <span className="text-red-500">*</span></label>
                <input value={form.className} onChange={e => setForm(f => ({ ...f, className: e.target.value }))}
                  placeholder="e.g. SE1701" required
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#F27125]/30" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Semester</label>
                <select value={form.semesterId} onChange={e => setForm(f => ({ ...f, semesterId: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#F27125]/30">
                  <option value="">Select semester</option>
                  {semesters.map(s => <option key={s.semesterId || s.id} value={s.semesterId || s.id}>{s.name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Max Members</label>
                  <input type="number" min={1} value={form.maxMembers} onChange={e => setForm(f => ({ ...f, maxMembers: +e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#F27125]/30" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Status</label>
                  <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#F27125]/30">
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
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
                <h3 className="font-bold text-gray-900">Delete Class</h3>
                <p className="text-sm text-gray-500">This action cannot be undone</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-6">Are you sure you want to delete <strong>{deleteTarget.className}</strong>?</p>
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

      {/* ── Members Drawer ── */}
      {membersClass && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between p-6 border-b">
              <div>
                <h2 className="text-lg font-bold text-gray-900">{membersClass.className} — Members</h2>
                <p className="text-sm text-gray-500">{members.length} enrolled students</p>
              </div>
              <button onClick={() => { setMembersClass(null); setMembers([]); }} className="p-1.5 hover:bg-gray-100 rounded-lg transition">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {membersLoading ? (
                <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 text-[#F27125] animate-spin" /></div>
              ) : members.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <Users className="w-10 h-10 mx-auto mb-2 opacity-40" />
                  <p>No members enrolled</p>
                </div>
              ) : members.map((m, i) => (
                <div key={m.userId || i} className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 transition">
                  <div className="w-8 h-8 bg-[#F27125]/10 rounded-full flex items-center justify-center text-[#F27125] font-bold text-sm">
                    {(m.student?.fullName || m.fullName || '?')[0]}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{m.student?.fullName || m.fullName}</p>
                    <p className="text-xs text-gray-500">{m.student?.email || m.email}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
