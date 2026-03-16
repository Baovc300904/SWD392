import { useEffect, useMemo, useState } from 'react';
import { CalendarClock, Loader2, RefreshCw, Users } from 'lucide-react';
import { toast } from 'sonner';
import taskService from '../../services/task.service';

const toArray = (payload) => {
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload)) return payload;
  return [];
};

export function TaskOverviewView() {
  const [tasks, setTasks] = useState([]);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);

  const loadTasks = async () => {
    try {
      setLoading(true);
      const response = await taskService.getAllTasks();
      setTasks(toArray(response));
    } catch (error) {
      console.error('Failed to load tasks:', error);
      toast.error(error?.message || 'Không thể tải task board');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const filteredTasks = useMemo(() => {
    if (statusFilter === 'ALL') return tasks;
    return tasks.filter((item) => String(item.status || '').toUpperCase() === statusFilter);
  }, [tasks, statusFilter]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Task Overview</h2>
          <p className="text-sm text-gray-500 mt-1">Manager chỉ theo dõi tiến độ task do giảng viên tạo cho từng nhóm.</p>
        </div>
        <button onClick={loadTasks} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 bg-white text-sm text-gray-600 hover:bg-gray-50">
          <RefreshCw className="w-4 h-4" /> Làm mới
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3">
        <span className="text-sm font-semibold text-gray-700">Trạng thái</span>
        <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="px-3 py-2 border border-gray-200 rounded-lg text-sm">
          <option value="ALL">Tất cả</option>
          <option value="TODO">TODO</option>
          <option value="IN_PROGRESS">IN_PROGRESS</option>
          <option value="REVIEW">REVIEW</option>
          <option value="DONE">DONE</option>
        </select>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-24"><Loader2 className="w-8 h-8 text-[#F27125] animate-spin" /></div>
        ) : filteredTasks.length === 0 ? (
          <div className="text-center py-16 px-6 text-gray-500">Chưa có task nào</div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredTasks.map((task) => (
              <div key={task.id} className="p-5 flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap mb-2">
                    <h3 className="font-bold text-gray-900">{task.title}</h3>
                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">{String(task.status || '').toUpperCase()}</span>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${String(task.priority || '').toUpperCase() === 'HIGH' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                      {String(task.priority || '').toUpperCase()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{task.description || 'Không có mô tả'}</p>
                  <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-gray-500">
                    <span className="inline-flex items-center gap-1"><Users className="w-3.5 h-3.5" /> {task.group?.groupName || 'Unknown group'}</span>
                    <span className="inline-flex items-center gap-1"><CalendarClock className="w-3.5 h-3.5" /> {task.dueDate ? new Date(task.dueDate).toLocaleDateString('vi-VN') : 'Không có hạn'}</span>
                    <span>Người giao: {task.creator?.fullName || 'Unknown'}</span>
                    <span>Phụ trách: {task.assignee?.fullName || 'Chưa gán'}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}