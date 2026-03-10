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
      
      // Load topics (pending approval)
      const topicsRes = await topicService.getAllTopics();
      const pendingTopics = topicsRes.data?.filter(t => t.status === 'Pending')?.length || 0;
      
      // Load questions
      const questionsRes = await questionService.getAllQuestions();
      const questions = questionsRes.data || [];
      const unanswered = questions.filter(q => !q.answer || q.answer.length === 0)?.length || 0;
      const escalated = questions.filter(q => q.isEscalated)?.length || 0;
      
      // Load groups
      const groupsRes = await groupService.getAllGroups();
      const totalGroups = groupsRes.count || 0;
      
      setStats({
        pendingTopics,
        unansweredQuestions: unanswered,
        escalatedQuestions: escalated,
        totalGroups
      });
      
      // Mock recent submissions (replace with actual API)
      setRecentSubmissions([
        {
          id: 1,
          groupName: 'Group Alpha',
          submissionType: 'Final Report',
          submittedBy: 'Nguyễn Văn A',
          submittedAt: '2 hours ago'
        },
        {
          id: 2,
          groupName: 'Group Beta',
          submissionType: 'Milestone 3',
          submittedBy: 'Trần Thị B',
          submittedAt: '5 hours ago'
        },
        {
          id: 3,
          groupName: 'Group Gamma',
          submissionType: 'Code Review',
          submittedBy: 'Lê Văn C',
          submittedAt: '1 day ago'
        },
        {
          id: 4,
          groupName: 'Group Delta',
          submissionType: 'Progress Report',
          submittedBy: 'Phạm Thị D',
          submittedAt: '1 day ago'
        },
        {
          id: 5,
          groupName: 'Group Epsilon',
          submissionType: 'Design Document',
          submittedBy: 'Hoàng Văn E',
          submittedAt: '2 days ago'
        }
      ]);
      
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
