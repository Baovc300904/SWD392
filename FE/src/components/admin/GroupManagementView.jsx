import { useEffect, useState } from 'react';
import {
  Plus, Search, Edit, Trash2, X, Save, Loader2,
  Users, RefreshCw, UserPlus, UserMinus
} from 'lucide-react';
import { toast } from 'sonner';
import { classService, groupService, topicService } from '../../services/app.service';
import userService from '../../services/user.service';

const emptyForm = { groupName: '', classId: '', topicId: '' };

export function GroupManagementView() {
  const [groups, setGroups] = useState([]);
  const [classes, setClasses] = useState([]);
  const [topics, setTopics] = useState([]);
  const [students, setStudents] = useState([]);

  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const [membersGroup, setMembersGroup] = useState(null);
  const [members, setMembers] = useState([]);
  const [membersLoading, setMembersLoading] = useState(false);
  const [addingMember, setAddingMember] = useState(false);
  const [removingMemberId, setRemovingMemberId] = useState(null);
  const [selectedStudentId, setSelectedStudentId] = useState('');

  useEffect(() => {
    fetchGroups();
    fetchBaseData();
  }, []);

  const fetchGroups = async () => {
    try {
      setLoading(true);
      const res = await groupService.getAllGroups();
      setGroups(Array.isArray(res?.data) ? res.data : []);
    } catch {
      toast.error('Failed to load groups');
    } finally {
      setLoading(false);
    }
  };

  const fetchBaseData = async () => {
    try {
      const [classRes, topicRes, usersRes] = await Promise.all([
        classService.getAllClasses(),
        topicService.getAllTopics(),
        userService.getAllUsers()
      ]);

      setClasses(Array.isArray(classRes?.data) ? classRes.data : []);
      setTopics(Array.isArray(topicRes?.data) ? topicRes.data : []);

      const allUsers = Array.isArray(usersRes) ? usersRes : [];
      setStudents(allUsers.filter((u) => (u.role || '').toLowerCase() === 'student'));
    } catch {
      toast.error('Failed to load supporting data');
    }
  };

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (group) => {
    setEditing(group);
    setForm({
      groupName: group.groupName || '',
      classId: group.classId || group.class?.id || '',
      topicId: group.topicId || group.topic?.id || ''
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditing(null);
    setForm(emptyForm);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.groupName.trim() || !form.classId || !form.topicId) {
      toast.error('Group name, class and topic are required');
      return;
    }

    const payload = {
      groupName: form.groupName.trim(),
      classId: Number(form.classId),
      topicId: Number(form.topicId)
    };

    const isApprovedTopic = topics.some(
      (topic) => Number(topic.id) === payload.topicId && String(topic.status || '').toUpperCase() === 'APPROVED'
    );
    if (!isApprovedTopic) {
      toast.error('Please select an approved topic');
      return;
    }

    setSaving(true);
    try {
      if (editing) {
        await groupService.updateGroup(editing.id, payload);
        toast.success('Group updated');
      } else {
        await groupService.createGroup(payload);
        toast.success('Group created');
      }
      closeModal();
      fetchGroups();
    } catch (err) {
      toast.error(err?.message || 'Operation failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;

    setDeleting(true);
    try {
      await groupService.deleteGroup(deleteTarget.id);
      toast.success('Group deleted');
      setDeleteTarget(null);
      fetchGroups();
    } catch (err) {
      toast.error(err?.message || 'Failed to delete group');
    } finally {
      setDeleting(false);
    }
  };

  const openMembers = async (group) => {
    setMembersGroup(group);
    setMembersLoading(true);
    setSelectedStudentId('');
    try {
      const res = await groupService.getGroupMembers(group.id);
      setMembers(Array.isArray(res?.data) ? res.data : []);
    } catch {
      toast.error('Failed to load group members');
    } finally {
      setMembersLoading(false);
    }
  };

  const handleAddMember = async () => {
    if (!membersGroup || !selectedStudentId) return;

    setAddingMember(true);
    try {
      await groupService.addMember(membersGroup.id, Number(selectedStudentId));
      const res = await groupService.getGroupMembers(membersGroup.id);
      setMembers(Array.isArray(res?.data) ? res.data : []);
      setSelectedStudentId('');
      fetchGroups();
      toast.success('Member added');
    } catch (err) {
      toast.error(err?.message || 'Failed to add member');
    } finally {
      setAddingMember(false);
    }
  };

  const handleRemoveMember = async (studentId) => {
    if (!membersGroup) return;

    setRemovingMemberId(studentId);
    try {
      await groupService.removeMember(membersGroup.id, studentId);
      const res = await groupService.getGroupMembers(membersGroup.id);
      setMembers(Array.isArray(res?.data) ? res.data : []);
      fetchGroups();
      toast.success('Member removed');
    } catch (err) {
      toast.error(err?.message || 'Failed to remove member');
    } finally {
      setRemovingMemberId(null);
    }
  };

  const filteredGroups = groups.filter((group) => {
    const keyword = searchTerm.toLowerCase();
    return (group.groupName || '').toLowerCase().includes(keyword)
      || (group.class?.className || '').toLowerCase().includes(keyword)
      || (group.topic?.title || '').toLowerCase().includes(keyword);
  });

  const approvedTopics = topics.filter(
    (topic) => String(topic.status || '').toUpperCase() === 'APPROVED'
  );

  return (
    <div className="flex-1 overflow-auto bg-gray-50 p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Group Management</h1>
          <p className="text-gray-500 mt-1">Manage groups and group members</p>
        </div>
        <div className="flex gap-3">
          <button onClick={fetchGroups} className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-100 text-gray-600 text-sm transition">
            <RefreshCw className="w-4 h-4" />Refresh
          </button>
          <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 bg-[#F27125] hover:bg-[#d96420] text-white rounded-lg text-sm font-medium transition shadow">
            <Plus className="w-4 h-4" />New Group
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by group, class, topic..."
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#F27125]/30"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 text-[#F27125] animate-spin" /></div>
        ) : filteredGroups.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <Users className="w-12 h-12 mx-auto mb-3 opacity-40" />
            <p className="font-medium">No groups found</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50 text-left">
                <th className="px-6 py-3.5 font-semibold text-gray-600">Group</th>
                <th className="px-6 py-3.5 font-semibold text-gray-600">Class</th>
                <th className="px-6 py-3.5 font-semibold text-gray-600">Topic</th>
                <th className="px-6 py-3.5 font-semibold text-gray-600">Members</th>
                <th className="px-6 py-3.5 font-semibold text-gray-600 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredGroups.map((group) => (
                <tr key={group.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4 font-semibold text-gray-900">{group.groupName}</td>
                  <td className="px-6 py-4 text-gray-600">{group.class?.className || '—'}</td>
                  <td className="px-6 py-4 text-gray-600">{group.topic?.title || '—'}</td>
                  <td className="px-6 py-4">
                    <button onClick={() => openMembers(group)} className="flex items-center gap-1.5 text-[#F27125] hover:underline font-medium">
                      <Users className="w-4 h-4" />
                      {group.members?.length ?? 0}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => openEdit(group)} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-[#F27125] transition">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button onClick={() => setDeleteTarget(group)} className="p-1.5 hover:bg-red-50 rounded-lg text-gray-500 hover:text-red-500 transition">
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

      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-lg font-bold text-gray-900">{editing ? 'Edit Group' : 'New Group'}</h2>
              <button onClick={closeModal} className="p-1.5 hover:bg-gray-100 rounded-lg transition">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Group Name <span className="text-red-500">*</span></label>
                <input
                  value={form.groupName}
                  onChange={(e) => setForm((f) => ({ ...f, groupName: e.target.value }))}
                  placeholder="e.g. Group Alpha"
                  required
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#F27125]/30"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Class <span className="text-red-500">*</span></label>
                <select
                  value={form.classId}
                  onChange={(e) => setForm((f) => ({ ...f, classId: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#F27125]/30"
                >
                  <option value="">Select class</option>
                  {classes.map((cls) => (
                    <option key={cls.id} value={cls.id}>{cls.className}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Topic <span className="text-red-500">*</span></label>
                <select
                  value={form.topicId}
                  onChange={(e) => setForm((f) => ({ ...f, topicId: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#F27125]/30"
                >
                  <option value="">Select topic</option>
                  {approvedTopics.map((topic) => (
                    <option key={topic.id} value={topic.id}>{topic.title}</option>
                  ))}
                </select>
                {approvedTopics.length === 0 && (
                  <p className="mt-1.5 text-xs text-amber-600">No approved topics available. Please approve a topic first.</p>
                )}
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

      {deleteTarget && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Delete Group</h3>
                <p className="text-sm text-gray-500">This action cannot be undone</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-6">Are you sure you want to delete <strong>{deleteTarget.groupName}</strong>?</p>
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

      {membersGroup && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between p-6 border-b">
              <div>
                <h2 className="text-lg font-bold text-gray-900">{membersGroup.groupName} — Members</h2>
                <p className="text-sm text-gray-500">{members.length} member(s)</p>
              </div>
              <button onClick={() => { setMembersGroup(null); setMembers([]); }} className="p-1.5 hover:bg-gray-100 rounded-lg transition">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-4 border-b bg-gray-50">
              <div className="flex gap-2">
                <select
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#F27125]/30"
                >
                  <option value="">Select student to add</option>
                  {students.map((student) => (
                    <option key={student.userId || student.id} value={student.userId || student.id}>
                      {student.fullName} ({student.email})
                    </option>
                  ))}
                </select>
                <button
                  onClick={handleAddMember}
                  disabled={addingMember || !selectedStudentId}
                  className="flex items-center gap-1.5 px-3 py-2 bg-[#F27125] hover:bg-[#d96420] text-white rounded-lg text-sm font-medium transition disabled:opacity-60"
                >
                  {addingMember ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                  Add
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {membersLoading ? (
                <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 text-[#F27125] animate-spin" /></div>
              ) : members.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <Users className="w-10 h-10 mx-auto mb-2 opacity-40" />
                  <p>No members in this group</p>
                </div>
              ) : members.map((member, index) => {
                const student = member.student || {};
                const studentId = member.studentId || student.userId || student.id;

                return (
                  <div key={studentId || index} className="flex items-center justify-between gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 transition">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-[#F27125]/10 rounded-full flex items-center justify-center text-[#F27125] font-bold text-sm">
                        {(student.fullName || '?')[0]}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{student.fullName || 'Unknown student'}</p>
                        <p className="text-xs text-gray-500">{student.email || 'No email'}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemoveMember(studentId)}
                      disabled={removingMemberId === studentId}
                      className="inline-flex items-center gap-1 text-xs text-red-500 hover:text-red-600 font-medium disabled:opacity-60"
                    >
                      {removingMemberId === studentId ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <UserMinus className="w-3.5 h-3.5" />}
                      Remove
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
