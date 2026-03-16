import { useState, useEffect } from 'react';
import { 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  FileText,
  ChevronRight,
  School,
  X
} from 'lucide-react';
import authService from '../../services/auth.service';
import classService from '../../services/class.service';
import topicService from '../../services/topic.service';
import questionService from '../../services/question.service';
import groupService from '../../services/group.service';
import { submissionService } from '../../services/app.service';

const toArray = (value) => {
  if (Array.isArray(value?.data?.data)) return value.data.data;
  if (Array.isArray(value?.data)) return value.data;
  if (Array.isArray(value)) return value;
  return [];
};

const formatAgo = (dateValue) => {
  if (!dateValue) return 'N/A';
  const now = Date.now();
  const then = new Date(dateValue).getTime();
  if (Number.isNaN(then)) return 'N/A';
  const minutes = Math.max(1, Math.floor((now - then) / 60000));
  if (minutes < 60) return `${minutes} phút trước`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} giờ trước`;
  const days = Math.floor(hours / 24);
  return `${days} ngày trước`;
};

/**
 * Lecturer Dashboard - Statistics & Recent Activity
 * Task 18: Display metrics and Q&A overview
 */
export function LecturerDashboard({ onAction }) {
  const [stats, setStats] = useState({
    pendingTopics: 0,
    unansweredQuestions: 0,
    escalatedQuestions: 0,
    totalGroups: 0
  });
  const [recentSubmissions, setRecentSubmissions] = useState([]);
  const [allRecentSubmissions, setAllRecentSubmissions] = useState([]);
  const [showAllSubmissions, setShowAllSubmissions] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const currentUser = authService.getCurrentUser();
      const lecturerId = currentUser?.userId || currentUser?.id;

      if (!lecturerId) {
        setStats({ pendingTopics: 0, unansweredQuestions: 0, escalatedQuestions: 0, totalGroups: 0 });
        setRecentSubmissions([]);
        setAllRecentSubmissions([]);
        return;
      }
      
      const [classesRes, topicsRes, questionsRes, groupsRes, submissionsRes] = await Promise.all([
        classService.getAllClasses({ lecturerId }),
        topicService.getAllTopics({ lecturerId }),
        questionService.getAllQuestions({ lecturerId }),
        groupService.getAllGroups({ lecturerId }),
        submissionService.getAllSubmissions({ limit: 100 })
      ]);

      const classes = toArray(classesRes);
      const topics = toArray(topicsRes);
      const questions = toArray(questionsRes);
      const groups = toArray(groupsRes);
      const allowedClassIds = new Set(classes.map((item) => Number(item.id)));
      const submissions = toArray(submissionsRes).filter((item) =>
        allowedClassIds.has(Number(item.group?.class?.id || item.group?.classId))
      );

      const pendingTopics = topics.filter((item) => String(item.status || '').toUpperCase() === 'PENDING').length;
      const unanswered = questions.filter((item) => String(item.status || '').toUpperCase() === 'WAITING_LECTURER').length;
      const escalated = questions.filter((item) => String(item.status || '').toUpperCase() === 'ESCALATED_TO_MANAGER').length;
      const totalGroups = groups.length;
      
      setStats({
        pendingTopics,
        unansweredQuestions: unanswered,
        escalatedQuestions: escalated,
        totalGroups
      });
      
      const scopedSubmissions = submissions
        .sort((first, second) => new Date(second.submittedAt || second.createdAt || 0).getTime() - new Date(first.submittedAt || first.createdAt || 0).getTime())
        .map((submission) => ({
          id: submission.id,
          groupName: submission.group?.groupName || `Group #${submission.groupId || 'N/A'}`,
          className: submission.group?.class?.className || 'N/A',
          submissionType: submission.milestone?.name || submission.title || 'Submission',
          submittedBy: submission.submitter?.fullName || submission.student?.fullName || 'N/A',
          submittedAt: formatAgo(submission.submittedAt || submission.createdAt),
          status: String(submission.status || '').toUpperCase() || 'SUBMITTED'
        }));

      setAllRecentSubmissions(scopedSubmissions);
      setRecentSubmissions(scopedSubmissions.slice(0, 5));
      
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, onClick, icon: Icon, highlight = false }) => (
    <div
      onClick={onClick}
      className={`bg-white rounded-lg p-6 cursor-pointer transition-all duration-200 hover:shadow-lg 
        ${highlight ? 'border-2 border-[#F27125] shadow-md' : 'border border-gray-200'}`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-lg ${highlight ? 'bg-[#F27125]' : 'bg-gray-100'}`}>
          <Icon className={`w-6 h-6 ${highlight ? 'text-white' : 'text-gray-600'}`} />
        </div>
      </div>
      <div className="text-3xl font-bold text-gray-900 mb-1">
        {loading ? '...' : value}
      </div>
      <div className="text-sm text-gray-600">{title}</div>
    </div>
  );

  return (
    <div className="flex-1 bg-[#F3F4F6] overflow-auto">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-600 mt-1">Overview of topics, questions, and group activities</p>
      </div>

      {/* Stats Cards */}
      <div className="px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            title="Đề tài chờ duyệt"
            value={stats.pendingTopics}
            icon={Clock}
            onClick={() => onAction?.({ view: 'topics', filter: 'PENDING' })}
          />
          <StatCard
            title="Câu hỏi chưa trả lời"
            value={stats.unansweredQuestions}
            icon={AlertTriangle}
            onClick={() => onAction?.({ view: 'qa', filter: 'UNANSWERED' })}
          />
          <StatCard
            title="Câu hỏi Escalate"
            value={stats.escalatedQuestions}
            icon={AlertTriangle}
            highlight={true}
            onClick={() => onAction?.({ view: 'qa', filter: 'ESCALATED' })}
          />
          <StatCard
            title="Tổng số nhóm"
            value={stats.totalGroups}
            icon={CheckCircle2}
            onClick={() => onAction?.({ view: 'classes' })}
          />
        </div>

        {/* Recent Submissions Table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900">Nộp bài gần đây (5 nhóm)</h2>
            <button onClick={() => setShowAllSubmissions(true)} className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1">
              Xem tất cả
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                    Nhóm
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                    Loại bài nộp
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                    Người nộp
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                    Thời gian
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase">
                    Hành động
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                      Đang tải...
                    </td>
                  </tr>
                ) : recentSubmissions.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                      Chưa có bài nộp nào
                    </td>
                  </tr>
                ) : (
                  recentSubmissions.map((submission) => (
                    <tr key={submission.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {submission.groupName}
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                          <FileText className="w-3 h-3" />
                          {submission.submissionType}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {submission.submittedBy}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {submission.submittedAt}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button onClick={() => onAction?.({ view: 'submissions' })} className="px-4 py-2 bg-[#F27125] hover:bg-[#d96420] text-white text-sm font-medium rounded-lg transition-colors shadow-md">
                          Xem chi tiết
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showAllSubmissions && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-5xl rounded-2xl bg-white shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Tất cả bài nộp gần đây</h3>
                <p className="text-sm text-gray-500 mt-1">Danh sách submission thuộc các lớp bạn đang phụ trách.</p>
              </div>
              <button onClick={() => setShowAllSubmissions(false)} className="text-gray-400 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="max-h-[70vh] overflow-y-auto divide-y divide-gray-100">
              {allRecentSubmissions.length === 0 ? (
                <div className="px-6 py-12 text-center text-sm text-gray-500">Chưa có submission nào trong phạm vi phụ trách.</div>
              ) : allRecentSubmissions.map((submission) => (
                <div key={submission.id} className="px-6 py-4 flex items-start justify-between gap-4 hover:bg-gray-50">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-1.5">
                      <p className="font-semibold text-gray-900">{submission.groupName}</p>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
                        <School className="w-3 h-3" /> {submission.className}
                      </span>
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${submission.status === 'GRADED' ? 'bg-purple-100 text-purple-700' : 'bg-orange-100 text-orange-700'}`}>
                        {submission.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700">{submission.submissionType}</p>
                    <p className="text-xs text-gray-500 mt-1">Người nộp: {submission.submittedBy} • {submission.submittedAt}</p>
                  </div>
                  <button onClick={() => onAction?.({ view: 'submissions' })} className="px-4 py-2 rounded-lg bg-[#F27125] hover:bg-[#d96420] text-white text-sm font-medium">
                    Mở chấm điểm
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
