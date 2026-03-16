import { useState, useEffect } from 'react';
import { 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  FileText,
  ChevronRight
} from 'lucide-react';
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
export function LecturerDashboard() {
  const [stats, setStats] = useState({
    pendingTopics: 0,
    unansweredQuestions: 0,
    escalatedQuestions: 0,
    totalGroups: 0
  });
  const [recentSubmissions, setRecentSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      const [topicsRes, questionsRes, groupsRes, submissionsRes] = await Promise.all([
        topicService.getAllTopics(),
        questionService.getAllQuestions(),
        groupService.getAllGroups(),
        submissionService.getAllSubmissions()
      ]);

      const topics = toArray(topicsRes);
      const questions = toArray(questionsRes);
      const groups = toArray(groupsRes);
      const submissions = toArray(submissionsRes);

      const pendingTopics = topics.filter((item) => String(item.status || '').toUpperCase() === 'PENDING').length;
      const unanswered = questions.filter((item) => !item.answers || item.answers.length === 0).length;
      const escalated = questions.filter((item) => Boolean(item.escalatedTo || item.escalatedBy || item.status === 'ESCALATED')).length;
      const totalGroups = groups.length;
      
      setStats({
        pendingTopics,
        unansweredQuestions: unanswered,
        escalatedQuestions: escalated,
        totalGroups
      });
      
      const latestSubmissions = submissions
        .sort((first, second) => new Date(second.submittedAt || second.createdAt || 0).getTime() - new Date(first.submittedAt || first.createdAt || 0).getTime())
        .slice(0, 5)
        .map((submission) => ({
          id: submission.id,
          groupName: submission.group?.groupName || `Group #${submission.groupId || 'N/A'}`,
          submissionType: submission.milestone?.name || submission.title || 'Submission',
          submittedBy: submission.submitter?.fullName || submission.student?.fullName || 'N/A',
          submittedAt: formatAgo(submission.submittedAt || submission.createdAt)
        }));

      setRecentSubmissions(latestSubmissions);
      
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
            onClick={() => {/* Navigate to topic approvals */}}
          />
          <StatCard
            title="Câu hỏi chưa trả lời"
            value={stats.unansweredQuestions}
            icon={AlertTriangle}
            onClick={() => {/* Navigate to Q&A */}}
          />
          <StatCard
            title="Câu hỏi Escalate"
            value={stats.escalatedQuestions}
            icon={AlertTriangle}
            highlight={true}
            onClick={() => {/* Navigate to escalated Q&A */}}
          />
          <StatCard
            title="Tổng số nhóm"
            value={stats.totalGroups}
            icon={CheckCircle2}
            onClick={() => {/* Navigate to groups */}}
          />
        </div>

        {/* Recent Submissions Table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900">Nộp bài gần đây (5 nhóm)</h2>
            <button className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1">
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
                        <button className="px-4 py-2 bg-[#F27125] hover:bg-[#d96420] text-white text-sm font-medium rounded-lg transition-colors shadow-md">
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
    </div>
  );
}
