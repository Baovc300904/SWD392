import { useEffect, useMemo, useState } from 'react';
import { Activity, Clock3, Loader2, RefreshCw, Search, Users } from 'lucide-react';
import authService from '../../services/auth.service';
import classService from '../../services/class.service';

const formatDateTime = (value) => {
  if (!value) return 'No recent activity';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'No recent activity';
  return date.toLocaleString('en-GB');
};

export function LecturerStudentActivityView() {
  const currentUser = authService.getCurrentUser();
  const lecturerId = currentUser?.userId || currentUser?.id;

  const [classes, setClasses] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [students, setStudents] = useState([]);
  const [loadingClasses, setLoadingClasses] = useState(true);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [searchText, setSearchText] = useState('');

  const loadClasses = async () => {
    try {
      setLoadingClasses(true);
      const response = await classService.getAllClasses({ lecturerId });
      const classList = Array.isArray(response) ? response : [];
      setClasses(classList);

      if (!selectedClassId && classList[0]?.id) {
        setSelectedClassId(String(classList[0].id));
      }
    } finally {
      setLoadingClasses(false);
    }
  };

  const loadStudentActivity = async (classId) => {
    if (!classId) {
      setStudents([]);
      return;
    }

    try {
      setLoadingStudents(true);
      const response = await classService.getClassStudentsActivity(classId);
      setStudents(Array.isArray(response?.students) ? response.students : []);
    } finally {
      setLoadingStudents(false);
    }
  };

  useEffect(() => {
    loadClasses();
  }, [lecturerId]);

  useEffect(() => {
    loadStudentActivity(selectedClassId);
  }, [selectedClassId]);

  const filteredStudents = useMemo(() => {
    const keyword = String(searchText || '').trim().toLowerCase();
    if (!keyword) return students;

    return students.filter((student) => {
      const fullName = String(student?.fullName || '').toLowerCase();
      const email = String(student?.email || '').toLowerCase();
      return fullName.includes(keyword) || email.includes(keyword);
    });
  }, [students, searchText]);

  const onlineCount = filteredStudents.filter((student) => Boolean(student?.isOnline)).length;

  return (
    <div className="flex-1 bg-[#F3F4F6] overflow-auto p-8 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sinh viên theo lớp</h1>
          <p className="text-sm text-gray-600 mt-1">Theo dõi trạng thái online và hoạt động của sinh viên trong lớp phụ trách.</p>
        </div>
        <button
          type="button"
          onClick={() => loadStudentActivity(selectedClassId)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 bg-white text-sm text-gray-600 hover:bg-gray-50"
        >
          <RefreshCw className="w-4 h-4" /> Làm mới
        </button>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl p-4 grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Lớp</label>
          <select
            value={selectedClassId}
            onChange={(event) => setSelectedClassId(event.target.value)}
            className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#F27125]/40"
            disabled={loadingClasses}
          >
            {loadingClasses ? (
              <option value="">Đang tải lớp...</option>
            ) : classes.length === 0 ? (
              <option value="">Không có lớp phụ trách</option>
            ) : (
              classes.map((classItem) => (
                <option key={classItem.id} value={classItem.id}>{classItem.className}</option>
              ))
            )}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Tìm sinh viên</label>
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
              placeholder="Nhập tên hoặc email"
              className="w-full rounded-xl border border-gray-200 pl-9 pr-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#F27125]/40"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2">
            <div className="text-xs text-gray-500">Tổng sinh viên</div>
            <div className="text-xl font-bold text-gray-900">{filteredStudents.length}</div>
          </div>
          <div className="rounded-xl border border-green-200 bg-green-50 px-3 py-2">
            <div className="text-xs text-green-700">Đang online</div>
            <div className="text-xl font-bold text-green-700">{onlineCount}</div>
          </div>
        </div>
      </div>

      {loadingStudents ? (
        <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 text-[#F27125] animate-spin" /></div>
      ) : filteredStudents.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 p-10 bg-white text-center text-sm text-gray-500">
          Chưa có sinh viên trong lớp đã chọn.
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {filteredStudents.map((student) => {
            const studentGroups = Array.isArray(student?.groups) ? student.groups : [];
            const primaryGroup = studentGroups[0];
            const activity = student?.activity || {};

            return (
              <div key={student.id} className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-base font-bold text-gray-900">{student.fullName}</h3>
                    <p className="text-sm text-gray-500">{student.email}</p>
                  </div>
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${student.isOnline ? 'bg-green-100 text-green-700 border-green-200' : 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                    {student.isOnline ? 'Online' : 'Offline'}
                  </span>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded-xl bg-gray-50 border border-gray-100 px-3 py-2">
                    <div className="text-gray-500">Open tasks</div>
                    <div className="font-bold text-gray-900">{activity.openTasks || 0}</div>
                  </div>
                  <div className="rounded-xl bg-gray-50 border border-gray-100 px-3 py-2">
                    <div className="text-gray-500">Done tasks</div>
                    <div className="font-bold text-gray-900">{activity.doneTasks || 0}</div>
                  </div>
                  <div className="rounded-xl bg-gray-50 border border-gray-100 px-3 py-2">
                    <div className="text-gray-500">Questions</div>
                    <div className="font-bold text-gray-900">{activity.questionsAsked || 0}</div>
                  </div>
                  <div className="rounded-xl bg-gray-50 border border-gray-100 px-3 py-2">
                    <div className="text-gray-500">Submissions</div>
                    <div className="font-bold text-gray-900">{activity.submissionsCount || 0}</div>
                  </div>
                </div>

                <div className="mt-4 space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-gray-700">
                    <Activity className="w-4 h-4 text-[#F27125]" />
                    <span>{activity.current || 'No activity yet'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-500">
                    <Clock3 className="w-4 h-4" />
                    <span>Last seen: {formatDateTime(student.lastSeenAt)}</span>
                  </div>
                </div>

                <div className="mt-4 rounded-xl border border-gray-100 bg-gray-50 px-3 py-2">
                  <div className="text-xs uppercase text-gray-500 mb-1">Nhóm hiện tại</div>
                  {primaryGroup ? (
                    <div className="text-sm text-gray-800">
                      <div className="font-semibold">{primaryGroup.groupName}</div>
                      <div className="text-gray-600">Topic: {primaryGroup.topic?.title || 'Chưa có đề tài'}</div>
                    </div>
                  ) : (
                    <div className="text-sm text-gray-500 inline-flex items-center gap-2">
                      <Users className="w-4 h-4" /> Chưa tham gia nhóm
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}