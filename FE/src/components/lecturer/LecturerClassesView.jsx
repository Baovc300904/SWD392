import { useEffect, useState } from 'react';
import { Loader2, RefreshCw, School, Users, BookOpen } from 'lucide-react';
import authService from '../../services/auth.service';
import classService from '../../services/class.service';
import groupService from '../../services/group.service';

export function LecturerClassesView() {
  const currentUser = authService.getCurrentUser();
  const lecturerId = currentUser?.userId || currentUser?.id;
  const [classes, setClasses] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const [classList, groupList] = await Promise.all([
        classService.getAllClasses({ lecturerId }),
        groupService.getAllGroups({ lecturerId })
      ]);
      setClasses(Array.isArray(classList) ? classList : []);
      setGroups(Array.isArray(groupList) ? groupList : []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [lecturerId]);

  return (
    <div className="flex-1 bg-[#F3F4F6] overflow-auto p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Lớp phụ trách</h1>
          <p className="text-sm text-gray-600 mt-1">Danh sách lớp và nhóm sinh viên thuộc phạm vi giảng viên.</p>
        </div>
        <button onClick={loadData} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 bg-white text-sm text-gray-600 hover:bg-gray-50">
          <RefreshCw className="w-4 h-4" /> Làm mới
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24"><Loader2 className="w-8 h-8 text-[#F27125] animate-spin" /></div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {classes.map((classItem) => {
            const classGroups = groups.filter((group) => Number(group.class?.id || group.classId) === Number(classItem.id));
            return (
              <div key={classItem.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 text-gray-900 font-bold text-lg">
                      <School className="w-5 h-5 text-[#F27125]" />
                      {classItem.className}
                    </div>
                    <p className="text-sm text-gray-500 mt-1">{classGroups.length} nhóm đang hoạt động</p>
                  </div>
                </div>

                <div className="p-5 space-y-3">
                  {classGroups.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-gray-200 p-5 text-sm text-gray-500 text-center">
                      Chưa có nhóm nào trong lớp này.
                    </div>
                  ) : classGroups.map((group) => (
                    <div key={group.id} className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="font-semibold text-gray-900">{group.groupName}</h3>
                          <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                            <BookOpen className="w-4 h-4 text-[#F27125]" />
                            {group.topic?.title || 'Chưa có đề tài'}
                          </div>
                        </div>
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white border border-gray-200 text-xs font-semibold text-gray-700">
                          <Users className="w-3.5 h-3.5" /> {group.members?.length || 0}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
