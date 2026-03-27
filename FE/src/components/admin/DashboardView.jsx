import { useEffect, useMemo, useState } from 'react';
import { Users, FileCheck, Clock, Activity, TrendingUp, CheckCircle } from 'lucide-react';
import { topicService, groupService, submissionService, semesterService } from '../../services/app.service';
import questionService from '../../services/question.service';
import taskService from '../../services/task.service';
import userService from '../../services/user.service';

const toArray = (value) => {
  if (Array.isArray(value?.data?.data)) return value.data.data;
  if (Array.isArray(value?.data)) return value.data;
  if (Array.isArray(value)) return value;
  return [];
};

const formatAgo = (dateValue) => {
  if (!dateValue) return 'Không có';
  const now = Date.now();
  const then = new Date(dateValue).getTime();
  if (Number.isNaN(then)) return 'Không có';
  const diffMinutes = Math.max(1, Math.floor((now - then) / 60000));
  if (diffMinutes < 60) return `${diffMinutes} phút trước`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours} giờ trước`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} ngày trước`;
};

const normalizeToken = (value) => String(value ?? '').trim().toLowerCase();

const buildSemesterTokens = (semester) => {
  if (!semester) return new Set();
  const raw = [
    semester.id,
    semester.semesterId,
    semester.name,
    semester.semesterName,
    semester.code,
    semester.semesterCode,
  ];
  return new Set(raw.map(normalizeToken).filter(Boolean));
};

const extractTopicSemesterTokens = (topic) => {
  const semester = topic?.semester || topic?.class?.semester || null;
  const raw = [
    topic?.semesterId,
    topic?.semester_id,
    topic?.semester?.id,
    topic?.semester?.semesterId,
    topic?.class?.semesterId,
    topic?.class?.semester_id,
    topic?.class?.semester?.id,
    topic?.class?.semester?.semesterId,
    semester?.name,
    semester?.semesterName,
    semester?.code,
    semester?.semesterCode,
  ];
  return new Set(raw.map(normalizeToken).filter(Boolean));
};

export function DashboardView() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeTopics: 0,
    escalatedQuestions: 0,
    gradedSubmissions: 0
  });
  const [activeSemesterName, setActiveSemesterName] = useState('Không có');
  const [recentActivities, setRecentActivities] = useState([]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [usersRes, topicsRes, questionsRes, groupsRes, submissionsRes, tasksRes, activeSemesterRes] = await Promise.all([
        userService.getAllUsers(),
        topicService.getAllTopics(),
        questionService.getAllQuestions(),
        groupService.getAllGroups(),
        submissionService.getAllSubmissions(),
        taskService.getAllTasks(),
        semesterService.getActiveSemester().catch(() => null)
      ]);

      const users = toArray(usersRes);
      const topics = toArray(topicsRes);
      const questions = toArray(questionsRes);
      const groups = toArray(groupsRes);
      const submissions = toArray(submissionsRes);
      const tasks = toArray(tasksRes);
      const activeSemester = activeSemesterRes?.data?.data || activeSemesterRes?.data || null;

      const activeSemesterTokens = buildSemesterTokens(activeSemester);
      setActiveSemesterName(activeSemester?.name || activeSemester?.semesterName || activeSemester?.semesterCode || 'Không có');

      const activeTopics = topics.filter((item) => {
        const status = String(item.status || '').toUpperCase();
        const isActiveStatus = status === 'ACTIVE';
        if (!isActiveStatus) return false;
        if (activeSemesterTokens.size === 0) return false;
        const topicSemesterTokens = extractTopicSemesterTokens(item);
        return [...topicSemesterTokens].some((token) => activeSemesterTokens.has(token));
      }).length;
      const escalatedQuestions = questions.filter((item) => String(item.status || '').toUpperCase() === 'ESCALATED_TO_MANAGER').length;
      const gradedSubmissions = submissions.filter((item) => String(item.status || '').toUpperCase() === 'GRADED').length;

      setStats({
        totalUsers: users.length,
        activeTopics,
        escalatedQuestions,
        gradedSubmissions
      });

      const activities = [
        ...topics.map((topic) => ({
          topicStatus: String(topic.status || '').toUpperCase(),
          id: `topic_${topic.id}`,
          type: 'submission',
          user: topic.proposer?.fullName || 'Không xác định',
          email: topic.proposer?.email || 'Không có',
          action: `Đã gửi đề tài: ${topic.title || 'Chưa đặt tiêu đề'}`,
          timestampRaw: topic.createdAt,
          status:
            String(topic.status || '').toUpperCase() === 'APPROVED'
              ? 'success'
              : String(topic.status || '').toUpperCase() === 'REJECTED'
                ? 'rejected'
                : 'pending'
        })),
        ...questions.map((question) => ({
          id: `question_${question.id}`,
          type: 'login',
          user: question.asker?.fullName || 'Không xác định',
          email: question.asker?.email || 'Không có',
          action: `Đã đặt câu hỏi: ${question.title || 'Chưa đặt tiêu đề'}`,
          timestampRaw: question.createdAt,
          status: String(question.status || '').toUpperCase() === 'RESOLVED' ? 'success' : 'pending'
        })),
        ...groups.map((group) => ({
          id: `group_${group.id}`,
          type: 'approval',
          user: 'Hệ thống',
          email: 'Không có',
          action: `Đã tạo nhóm: ${group.groupName || 'Nhóm chưa đặt tên'}`,
          timestampRaw: group.createdAt,
          status: 'success'
        })),
        ...submissions.map((submission) => ({
          id: `submission_${submission.id}`,
          type: 'submission_review',
          user: submission.submitter?.fullName || 'Không xác định',
          email: submission.submitter?.email || 'Không có',
          action: `Đã nộp mốc: ${submission.milestoneName || `#${submission.id}`}`,
          timestampRaw: submission.submittedAt || submission.createdAt,
          status: String(submission.status || '').toUpperCase() === 'GRADED' ? 'success' : 'pending'
        })),
        ...tasks.map((task) => ({
          id: `task_${task.id}`,
          type: 'task',
          user: task.creator?.fullName || 'Không xác định',
          email: task.creator?.email || 'Không có',
          action: `Đã tạo công việc: ${task.title || 'Chưa đặt tiêu đề'}`,
          timestampRaw: task.createdAt,
          status: String(task.status || '').toUpperCase() === 'DONE' ? 'success' : 'pending'
        }))
      ]
        .sort((first, second) => new Date(second.timestampRaw || 0).getTime() - new Date(first.timestampRaw || 0).getTime())
        .slice(0, 8)
        .map((item) => ({ ...item, timestamp: formatAgo(item.timestampRaw) }));

      setRecentActivities(activities);
    } catch (error) {
      console.error('Failed to load admin dashboard:', error);
      setRecentActivities([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const cardItems = useMemo(() => ([
    {
      label: 'Tổng người dùng',
      value: stats.totalUsers,
      change: 'Theo dữ liệu hiện tại',
      icon: Users,
      lightBg: 'bg-[#F27125]/10',
      textColor: 'text-[#F27125]'
    },
    {
      label: 'Đề tài đang hoạt động',
      value: stats.activeTopics,
      change: `Học kỳ hiện tại: ${activeSemesterName}`,
      icon: FileCheck,
      lightBg: 'bg-[#F27125]/10',
      textColor: 'text-[#F27125]'
    },
    {
      label: 'Q&A chuyển cấp',
      value: stats.escalatedQuestions,
      change: 'Cần quản lý xử lý',
      icon: Clock,
      lightBg: 'bg-[#F27125]/10',
      textColor: 'text-[#F27125]'
    },
    {
      label: 'Bài nộp đã chấm',
      value: stats.gradedSubmissions,
      change: 'Toàn bộ lớp học',
      icon: Activity,
      lightBg: 'bg-[#F27125]/10',
      textColor: 'text-[#F27125]'
    }
  ]), [stats, activeSemesterName]);

  return (
    <>
      <div className="grid grid-cols-4 gap-6 mb-8">
        {cardItems.map((stat, index) => (
          <div key={index} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg hover:border-[#F27125]/30 transition">
            <div className="flex items-start justify-between mb-4">
              <div className={`w-14 h-14 ${stat.lightBg} rounded-xl flex items-center justify-center shadow-sm`}>
                <stat.icon className={`w-7 h-7 ${stat.textColor}`} />
              </div>
            </div>
            <div className="mb-2">
              <div className="text-3xl font-bold text-gray-900 mb-1">{loading ? '...' : stat.value}</div>
              <div className="text-sm font-semibold text-gray-900">{stat.label}</div>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
              <TrendingUp className="w-3.5 h-3.5" />
              {stat.change}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="px-6 py-5 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Hoạt động gần đây</h2>
          <p className="text-sm text-gray-500 mt-1 font-medium">Sự kiện mới nhất từ đề tài, Hỏi đáp, nhóm, bài nộp và công việc</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Loại</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Người dùng</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Hành động</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Thời gian</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {loading ? (
                <tr><td colSpan="6" className="px-6 py-6 text-sm text-gray-500 text-center">Đang tải...</td></tr>
              ) : recentActivities.length === 0 ? (
                <tr><td colSpan="6" className="px-6 py-6 text-sm text-gray-500 text-center">Không có hoạt động gần đây</td></tr>
              ) : (
                recentActivities.map((activity) => (
                  <tr key={activity.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2.5 py-1 text-xs font-semibold rounded-full ${
                        activity.type === 'login' ? 'bg-blue-100 text-blue-700' :
                        activity.type === 'submission' ? 'bg-purple-100 text-purple-700' :
                        activity.type === 'submission_review' ? 'bg-orange-100 text-orange-700' :
                        activity.type === 'task' ? 'bg-sky-100 text-sky-700' : 'bg-green-100 text-green-700'
                      }`}>
                        {activity.type === 'login' ? 'Hỏi đáp' : activity.type === 'submission' ? 'Đề tài' : activity.type === 'submission_review' ? 'Bài nộp' : activity.type === 'task' ? 'Công việc' : 'Nhóm'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap"><div className="text-sm font-medium text-gray-900">{activity.user}</div></td>
                    <td className="px-6 py-4 whitespace-nowrap"><div className="text-sm text-gray-600">{activity.email}</div></td>
                    <td className="px-6 py-4"><div className="text-sm text-gray-900">{activity.action}</div></td>
                    <td className="px-6 py-4 whitespace-nowrap"><div className="text-sm text-gray-600">{activity.timestamp}</div></td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {activity.status === 'success' ? (
                        <div className="flex items-center gap-1.5 text-green-600"><CheckCircle className="w-4 h-4" /><span className="text-xs font-medium">Thành công</span></div>
                      ) : activity.status === 'rejected' ? (
                        <div className="flex items-center gap-1.5 text-red-600"><Clock className="w-4 h-4" /><span className="text-xs font-medium">Từ chối</span></div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-orange-600"><Clock className="w-4 h-4" /><span className="text-xs font-medium">Chờ xử lý</span></div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
