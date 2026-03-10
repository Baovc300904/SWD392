import { useState, useEffect } from 'react';
import {
  Search, Users, RefreshCw, ChevronDown, ChevronRight,
  Loader2, BookOpen, User, Tag
} from 'lucide-react';
import { toast } from 'sonner';
import { groupService } from '../../services/app.service';

function StatusBadge({ status }) {
  const active = status === 'Active';
  return (
    <span className={`inline-flex px-2.5 py-1 text-xs font-semibold rounded-full ${active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
      {status}
    </span>
  );
}

export function GroupManagementView() {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [expandedGroup, setExpandedGroup] = useState(null);

  useEffect(() => { fetchGroups(); }, []);

  const fetchGroups = async () => {
    try {
      setLoading(true);
      const res = await groupService.getAllGroups();
      setGroups(res?.data?.data || res?.data || []);
    } catch { toast.error('Failed to load groups'); }
    finally { setLoading(false); }
  };

  const filtered = groups.filter(g => {
    const matchSearch = g.groupName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      g.topic?.title?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === 'all' || g.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const toggleExpand = (id) => setExpandedGroup(prev => prev === id ? null : id);

  return (
    <div className="flex-1 overflow-auto bg-gray-50 p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Groups Overview</h1>
          <p className="text-gray-500 mt-1">Monitor all student groups and their progress</p>
        </div>
        <button onClick={fetchGroups} className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-100 text-gray-600 text-sm transition">
          <RefreshCw className="w-4 h-4" />Refresh
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Total Groups', value: groups.length, color: 'text-[#F27125]', bg: 'bg-[#F27125]/10' },
          { label: 'Active', value: groups.filter(g => g.status === 'Active').length, color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'With Topic', value: groups.filter(g => g.topicId).length, color: 'text-blue-600', bg: 'bg-blue-50' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-sm text-gray-500 mb-1">{s.label}</p>
            <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6 flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Search groups or topics..."
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#F27125]/30" />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className="px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#F27125]/30">
          <option value="all">All Status</option>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
        </select>
      </div>

      {/* Groups list */}
      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-[#F27125] animate-spin" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <Users className="w-12 h-12 mx-auto mb-3 opacity-40" />
          <p className="font-medium">No groups found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(group => {
            const id = group.groupId || group.id;
            const isExpanded = expandedGroup === id;
            const memberList = group.members || [];
            return (
              <div key={id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <button
                  onClick={() => toggleExpand(id)}
                  className="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-50/60 transition text-left"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-[#F27125]/10 rounded-xl flex items-center justify-center">
                      <Users className="w-5 h-5 text-[#F27125]" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{group.groupName}</p>
                      <p className="text-xs text-gray-500">{group.class?.className || '—'} · {memberList.length}/{group.maxMembers || '?'} members</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {group.topic && (
                      <span className="hidden sm:inline-flex items-center gap-1.5 text-xs text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full font-medium">
                        <Tag className="w-3 h-3" />{group.topic.title}
                      </span>
                    )}
                    <StatusBadge status={group.status} />
                    {isExpanded ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronRight className="w-4 h-4 text-gray-400" />}
                  </div>
                </button>

                {isExpanded && (
                  <div className="border-t border-gray-100 px-6 py-4 bg-gray-50/30">
                    {/* Topic info */}
                    {group.topic && (
                      <div className="mb-4 p-3 bg-blue-50 rounded-lg flex items-start gap-2">
                        <BookOpen className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                        <div>
                          <p className="text-xs font-semibold text-blue-700">Topic</p>
                          <p className="text-sm text-blue-800">{group.topic.title}</p>
                        </div>
                      </div>
                    )}
                    {/* Members grid */}
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Members</p>
                    {memberList.length === 0 ? (
                      <p className="text-sm text-gray-400">No members yet</p>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {memberList.map((m, i) => {
                          const u = m.student || m;
                          return (
                            <div key={u.userId || i} className="flex items-center gap-2 bg-white rounded-lg px-3 py-2 border border-gray-100">
                              <div className="w-7 h-7 bg-[#F27125]/10 rounded-full flex items-center justify-center">
                                <User className="w-3.5 h-3.5 text-[#F27125]" />
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">{u.fullName || '—'}</p>
                                <p className="text-xs text-gray-400 truncate">{u.email}</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
