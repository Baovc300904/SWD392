import { useEffect, useMemo, useState } from 'react';
import { Users, FileCheck, Clock, Activity, TrendingUp, CheckCircle } from 'lucide-react';
import { topicService, groupService, submissionService } from '../../services/app.service';
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
  if (!dateValue) return 'N/A';
  const now = Date.now();
  const then = new Date(dateValue).getTime();
  if (Number.isNaN(then)) return 'N/A';
  const diffMinutes = Math.max(1, Math.floor((now - then) / 60000));
  if (diffMinutes < 60) return `${diffMinutes} minute(s) ago`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours} hour(s) ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} day(s) ago`;
};

export function DashboardView() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeTopics: 0,
    escalatedQuestions: 0,
    gradedSubmissions: 0
  });
  const [recentActivities, setRecentActivities] = useState([]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [usersRes, topicsRes, questionsRes, groupsRes, submissionsRes, tasksRes] = await Promise.all([
        userService.getAllUsers(),
        topicService.getAllTopics(),
        questionService.getAllQuestions(),
        groupService.getAllGroups(),
        submissionService.getAllSubmissions(),
        taskService.getAllTasks()
      ]);

      const users = toArray(usersRes);
      const topics = toArray(topicsRes);
      const questions = toArray(questionsRes);
      const groups = toArray(groupsRes);
      const submissions = toArray(submissionsRes);
      const tasks = toArray(tasksRes);

      const approvedTopics = topics.filter((item) => String(item.status || '').toUpperCase() === 'APPROVED').length;
      const escalatedQuestions = questions.filter((item) => String(item.status || '').toUpperCase() === 'ESCALATED_TO_MANAGER').length;
      const gradedSubmissions = submissions.filter((item) => String(item.status || '').toUpperCase() === 'GRADED').length;

      setStats({
        totalUsers: users.length,
        activeTopics: approvedTopics,
        escalatedQuestions,
        gradedSubmissions
      });

      const activities = [
        ...topics.map((topic) => ({
          id: `topic_${topic.id}`,
          type: 'submission',
          user: topic.proposer?.fullName || 'Unknown',
          email: topic.proposer?.email || 'N/A',
          action: `Submitted topic: ${topic.title || 'Untitled'}`,
          timestampRaw: topic.createdAt,
          status: String(topic.status || '').toUpperCase() === 'APPROVED' ? 'success' : 'pending'
        })),
        ...questions.map((question) => ({
          id: `question_${question.id}`,
          type: 'login',
          user: question.asker?.fullName || 'Unknown',
          email: question.asker?.email || 'N/A',
          action: `Asked Q&A: ${question.title || 'Untitled question'}`,
          timestampRaw: question.createdAt,
          status: String(question.status || '').toUpperCase() === 'RESOLVED' ? 'success' : 'pending'
        })),
        ...groups.map((group) => ({
          id: `group_${group.id}`,
          type: 'approval',
          user: 'System',
          email: 'N/A',
          action: `Created group: ${group.groupName || 'Unnamed group'}`,
          timestampRaw: group.createdAt,
          status: 'success'
        })),
        ...submissions.map((submission) => ({
          id: `submission_${submission.id}`,
          type: 'submission_review',
          user: submission.submitter?.fullName || 'Unknown',
          email: submission.submitter?.email || 'N/A',
          action: `Submitted milestone: ${submission.milestoneName || `#${submission.id}`}`,
          timestampRaw: submission.submittedAt || submission.createdAt,
          status: String(submission.status || '').toUpperCase() === 'GRADED' ? 'success' : 'pending'
        })),
        ...tasks.map((task) => ({
          id: `task_${task.id}`,
          type: 'task',
          user: task.creator?.fullName || 'Unknown',
          email: task.creator?.email || 'N/A',
          action: `Created task: ${task.title || 'Untitled task'}`,
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
      label: 'Total Users',
      value: stats.totalUsers,
      change: 'From current system data',
      icon: Users,
      lightBg: 'bg-[#F27125]/10',
      textColor: 'text-[#F27125]'
    },
    {
      label: 'Active Topics',
      value: stats.activeTopics,
      change: 'Approved topics',
      icon: FileCheck,
      lightBg: 'bg-[#F27125]/10',
      textColor: 'text-[#F27125]'
    },
    {
      label: 'Escalated Q&A',
      value: stats.escalatedQuestions,
      change: 'Need manager attention',
      icon: Clock,
      lightBg: 'bg-[#F27125]/10',
      textColor: 'text-[#F27125]'
    },
    {
      label: 'Graded Submissions',
      value: stats.gradedSubmissions,
      change: 'Across all classes',
      icon: Activity,
      lightBg: 'bg-[#F27125]/10',
      textColor: 'text-[#F27125]'
    }
  ]), [stats]);

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
          <h2 className="text-xl font-bold text-gray-900">Recent Activity</h2>
          <p className="text-sm text-gray-500 mt-1 font-medium">Latest events from topics, Q&A, groups, submissions, and tasks</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Action</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Time</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {loading ? (
                <tr><td colSpan="6" className="px-6 py-6 text-sm text-gray-500 text-center">Loading...</td></tr>
              ) : recentActivities.length === 0 ? (
                <tr><td colSpan="6" className="px-6 py-6 text-sm text-gray-500 text-center">No recent activities</td></tr>
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
                        {activity.type === 'login' ? 'Q&A' : activity.type === 'submission' ? 'Topic' : activity.type === 'submission_review' ? 'Submission' : activity.type === 'task' ? 'Task' : 'Group'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap"><div className="text-sm font-medium text-gray-900">{activity.user}</div></td>
                    <td className="px-6 py-4 whitespace-nowrap"><div className="text-sm text-gray-600">{activity.email}</div></td>
                    <td className="px-6 py-4"><div className="text-sm text-gray-900">{activity.action}</div></td>
                    <td className="px-6 py-4 whitespace-nowrap"><div className="text-sm text-gray-600">{activity.timestamp}</div></td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {activity.status === 'success' ? (
                        <div className="flex items-center gap-1.5 text-green-600"><CheckCircle className="w-4 h-4" /><span className="text-xs font-medium">Success</span></div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-orange-600"><Clock className="w-4 h-4" /><span className="text-xs font-medium">Pending</span></div>
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
