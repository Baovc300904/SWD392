import { useState, useEffect } from 'react';
import {
  Search, Filter, Edit, Trash2, ChevronLeft, ChevronRight,
  Loader2, X, Save, ShieldCheck, AlertTriangle
} from 'lucide-react';
import { toast } from 'sonner';
import userService from '../../services/user.service';

/* ── Helpers ── */
function RoleBadge({ role }) {
  const config = {
    Student: { bg: 'bg-blue-100', text: 'text-blue-700' },
    Lecturer: { bg: 'bg-purple-100', text: 'text-purple-700' },
    Admin: { bg: 'bg-orange-100', text: 'text-orange-700' },
  };
  const cfg = config[role] || config.Student;
  return (
    <span className={`inline-flex px-2.5 py-1 text-xs font-semibold rounded-full ${cfg.bg} ${cfg.text}`}>
      {role}
    </span>
  );
}

const PAGE_SIZE = 10;

/* ══════════════════════════════════════════════ */
export function UserManagementView() {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [editingUser, setEditingUser] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({ fullName: '', email: '', role: '', studentCode: '' });
  const [updateLoading, setUpdateLoading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await userService.getAllUsers();
      setUsers(data);
      setError(null);
    } catch (err) {
      if (err.response && (err.response.status === 401 || err.response.status === 403)) {
        setError('Unauthorized. Please login as Admin.');
      } else {
        setError('Failed to load users. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = (user) => {
    setEditingUser(user);
    setEditFormData({ fullName: user.fullName, email: user.email, role: user.role, studentCode: user.studentCode || '' });
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setEditingUser(null);
    setEditFormData({ fullName: '', email: '', role: '', studentCode: '' });
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    setUpdateLoading(true);
    try {
      const roleChanged = editFormData.role !== editingUser.role;
      await userService.updateUser(editingUser.userId, {
        fullName: editFormData.fullName,
        email: editFormData.email,
        studentCode: editFormData.studentCode,
      });
      if (roleChanged) await userService.updateUserRole(editingUser.userId, editFormData.role);
      await fetchUsers();
      closeEditModal();
      toast.success(`User "${editFormData.fullName}" updated successfully.`);
    } catch (err) {
      console.error('Failed to update user:', err);
      toast.error(err?.message || 'Failed to update user. Please try again.');
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await userService.deleteUser(deleteTarget.userId);
      await fetchUsers();
      toast.success(`User "${deleteTarget.fullName}" deleted.`);
    } catch (err) {
      console.error('Failed to delete user:', err);
      toast.error(err?.message || 'Failed to delete user.');
    } finally {
      setDeleteTarget(null);
      setDeleteLoading(false);
    }
  };

  const getUserStatus = (user) => {
    if (user.isOnline) return { text: 'Online', color: 'bg-green-500' };
    if (user.lastSeenAt) {
      const diffMinutes = Math.floor((new Date() - new Date(user.lastSeenAt)) / 60000);
      if (diffMinutes < 5) return { text: 'Away', color: 'bg-yellow-500' };
    }
    return { text: 'Offline', color: 'bg-gray-400' };
  };

  /* ── Client-side filtering ── */
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      (user.fullName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (user.email?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role?.toLowerCase() === roleFilter.toLowerCase();
    const userStatus = getUserStatus(user).text.toLowerCase();
    const matchesStatus = statusFilter === 'all' || userStatus === statusFilter.toLowerCase();
    return matchesSearch && matchesRole && matchesStatus;
  });

  /* ── Pagination ── */
  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const pagedUsers = filteredUsers.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  // Reset to page 1 when filters change
  const handleSearch = (v) => { setSearchTerm(v); setCurrentPage(1); };
  const handleRole = (v) => { setRoleFilter(v); setCurrentPage(1); };
  const handleStatus = (v) => { setStatusFilter(v); setCurrentPage(1); };

  return (
    <>
      {/* ── Filters bar ── */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-[200px] relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F27125] focus:border-transparent"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select value={roleFilter} onChange={(e) => handleRole(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F27125] bg-white">
              <option value="all">All Roles</option>
              <option value="student">Student</option>
              <option value="lecturer">Lecturer</option>
              <option value="admin">Admin</option>
            </select>
            <select value={statusFilter} onChange={(e) => handleStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F27125] bg-white">
              <option value="all">All Statuses</option>
              <option value="online">Online</option>
              <option value="away">Away</option>
              <option value="offline">Offline</option>
            </select>
          </div>
        </div>
      </div>

      {/* ── Table ── */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-[#F27125] animate-spin mb-4" />
            <p className="text-gray-500">Loading users...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-12">
            <AlertTriangle className="w-10 h-10 text-red-400 mb-3" />
            <div className="text-red-500 mb-2 font-semibold">Error Loading Data</div>
            <p className="text-gray-500">{error}</p>
            <button onClick={fetchUsers}
              className="mt-4 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition">
              Try Again
            </button>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    {['User Info', 'Student Code', 'Role', 'Status', 'Actions'].map(h => (
                      <th key={h} className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {pagedUsers.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                        No users found matching your filters.
                      </td>
                    </tr>
                  ) : (
                    pagedUsers.map((user) => {
                      const status = getUserStatus(user);
                      return (
                        <tr key={user.userId} className="hover:bg-gray-50 transition">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="relative">
                                <img
                                  src={user.avatarURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.fullName}`}
                                  alt={user.fullName}
                                  className="w-10 h-10 rounded-full border border-gray-200"
                                />
                                {user.isOnline && (
                                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-green-500 border-2 border-white" />
                                )}
                              </div>
                              <div>
                                <div className="font-semibold text-gray-900">{user.fullName}</div>
                                <div className="text-sm text-gray-500">{user.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="inline-flex px-3 py-1 bg-gray-100 text-gray-700 text-sm font-mono font-semibold rounded-full">
                              {user.studentCode || 'N/A'}
                            </span>
                          </td>
                          <td className="px-6 py-4"><RoleBadge role={user.role} /></td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <div className={`w-2 h-2 rounded-full ${status.color}`} />
                              <span className="text-sm text-gray-700">{status.text}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <button onClick={() => openEditModal(user)}
                                className="p-2 hover:bg-[#F27125]/10 rounded-lg transition group"
                                title="Edit user">
                                <Edit className="w-4 h-4 text-gray-400 group-hover:text-[#F27125]" />
                              </button>
                              <button onClick={() => setDeleteTarget(user)}
                                className="p-2 hover:bg-red-50 rounded-lg transition group"
                                title="Delete user">
                                <Trash2 className="w-4 h-4 text-gray-400 group-hover:text-red-600" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="border-t border-gray-200 px-6 py-4 flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Showing{' '}
                <span className="font-medium">{pagedUsers.length}</span>
                {' '}of{' '}
                <span className="font-medium">{filteredUsers.length}</span> users
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                  disabled={safePage === 1}
                  className="px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-1 text-sm">
                  <ChevronLeft className="w-4 h-4" />Previous
                </button>
                <span className="px-4 py-1.5 text-sm text-gray-700">
                  Page {safePage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                  disabled={safePage === totalPages}
                  className="px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-1 text-sm">
                  Next<ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* ══ EDIT USER MODAL ══ */}
      {isEditModalOpen && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={(e) => e.target === e.currentTarget && closeEditModal()}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <img
                  src={editingUser?.avatarURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${editingUser?.fullName}`}
                  alt="avatar"
                  className="w-10 h-10 rounded-full border border-gray-200"
                />
                <div>
                  <h2 className="text-base font-bold text-gray-900">Edit User</h2>
                  <p className="text-xs text-gray-500 mt-0.5">{editingUser?.email}</p>
                </div>
              </div>
              <button onClick={closeEditModal}
                className="p-1.5 hover:bg-gray-100 rounded-lg transition text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateUser} className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">Full Name</label>
                <input type="text" value={editFormData.fullName}
                  onChange={(e) => setEditFormData({ ...editFormData, fullName: e.target.value })}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F27125] text-sm" required />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">Email</label>
                <input type="email" value={editFormData.email}
                  onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F27125] text-sm" required />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">Student Code</label>
                <input type="text" value={editFormData.studentCode}
                  onChange={(e) => setEditFormData({ ...editFormData, studentCode: e.target.value })}
                  placeholder="SE######"
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F27125] text-sm" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">Role</label>
                <select value={editFormData.role}
                  onChange={(e) => setEditFormData({ ...editFormData, role: e.target.value })}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F27125] bg-white text-sm" required>
                  <option value="Student">Student</option>
                  <option value="Lecturer">Lecturer</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>

              {editFormData.role !== editingUser?.role && (
                <div className="flex items-start gap-2 px-3 py-2.5 rounded-lg text-xs bg-amber-50 border border-amber-200 text-amber-700">
                  <ShieldCheck className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                  Role will change: <strong className="mx-1">{editingUser?.role}</strong>→<strong className="ml-1">{editFormData.role}</strong>
                </div>
              )}

              <div className="flex items-center gap-3 pt-2">
                <button type="button" onClick={closeEditModal} disabled={updateLoading}
                  className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition text-sm font-medium disabled:opacity-40">
                  Cancel
                </button>
                <button type="submit" disabled={updateLoading}
                  className="flex-1 px-4 py-2.5 bg-[#F27125] text-white rounded-lg hover:bg-[#d96520] transition flex items-center justify-center gap-2 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed">
                  {updateLoading ? (
                    <><Loader2 className="w-4 h-4 animate-spin" />Saving...</>
                  ) : (
                    <>Save Changes</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══ DELETE CONFIRM ══ */}
      {deleteTarget && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={(e) => e.target === e.currentTarget && setDeleteTarget(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm text-center">
            <div className="px-6 pt-8 pb-6">
              <div className="w-14 h-14 rounded-2xl bg-red-100 flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-7 h-7 text-red-500" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">Delete User?</h3>
              <p className="text-sm text-gray-500 mb-1">You are about to permanently delete</p>
              <p className="text-sm font-semibold text-gray-900 mb-6">{deleteTarget.fullName}</p>
              <div className="flex items-center gap-3">
                <button onClick={() => setDeleteTarget(null)}
                  className="flex-1 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition text-sm font-medium">
                  Cancel
                </button>
                <button onClick={handleDeleteUser} disabled={deleteLoading}
                  className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-lg transition text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-50">
                  {deleteLoading ? (
                    <><Loader2 className="w-4 h-4 animate-spin" />Deleting...</>
                  ) : (
                    <><Trash2 className="w-4 h-4" />Delete</>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
