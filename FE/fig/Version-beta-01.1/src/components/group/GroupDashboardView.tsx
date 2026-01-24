import { Activity, TrendingUp, CheckCircle, Clock, AlertCircle } from 'lucide-react';

export function GroupDashboardView() {
  const stats = [
    {
      label: 'Tasks Completed',
      value: '8',
      total: '15',
      percentage: 53,
      icon: CheckCircle,
      color: 'bg-green-500',
      lightBg: 'bg-green-50',
      textColor: 'text-green-600',
    },
    {
      label: 'In Progress',
      value: '4',
      icon: Clock,
      color: 'bg-blue-500',
      lightBg: 'bg-blue-50',
      textColor: 'text-blue-600',
    },
    {
      label: 'Team Activity',
      value: '89%',
      icon: Activity,
      color: 'bg-purple-500',
      lightBg: 'bg-purple-50',
      textColor: 'text-purple-600',
    },
    {
      label: 'Pending Reviews',
      value: '3',
      icon: AlertCircle,
      color: 'bg-orange-500',
      lightBg: 'bg-orange-50',
      textColor: 'text-orange-600',
    },
  ];

  const recentActivities = [
    {
      id: 1,
      user: 'Nguyen Van A',
      action: 'completed task',
      target: 'Set up project repository',
      timestamp: '2 hours ago',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Member1',
    },
    {
      id: 2,
      user: 'Tran Thi B',
      action: 'commented on',
      target: 'User authentication implementation',
      timestamp: '3 hours ago',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Member2',
    },
    {
      id: 3,
      user: 'Le Van C',
      action: 'created task',
      target: 'Database schema design',
      timestamp: '5 hours ago',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Member3',
    },
    {
      id: 4,
      user: 'Pham Thi D',
      action: 'uploaded file',
      target: 'Landing page mockups.fig',
      timestamp: '1 day ago',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Member4',
    },
  ];

  const upcomingDeadlines = [
    {
      id: 1,
      task: 'Sprint 1 Demo',
      date: 'Jan 25, 2026',
      daysLeft: 3,
      priority: 'high',
    },
    {
      id: 2,
      task: 'Database Schema Review',
      date: 'Jan 28, 2026',
      daysLeft: 6,
      priority: 'medium',
    },
    {
      id: 3,
      task: 'Final Submission',
      date: 'Feb 15, 2026',
      daysLeft: 24,
      priority: 'high',
    },
  ];

  return (
    <div className="flex-1 flex flex-col h-screen bg-gray-50 overflow-y-auto">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <h1 className="text-xl font-bold text-gray-900"># 📊 dashboard</h1>
        <p className="text-sm text-gray-600 mt-0.5">Overview of your group's progress</p>
      </div>

      <div className="p-6 space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition"
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 ${stat.lightBg} rounded-lg flex items-center justify-center`}>
                  <stat.icon className={`w-5 h-5 ${stat.textColor}`} />
                </div>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">
                {stat.value}
                {stat.total && <span className="text-lg text-gray-400"> / {stat.total}</span>}
              </div>
              <div className="text-sm text-gray-600">{stat.label}</div>
              {stat.percentage && (
                <div className="mt-3">
                  <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${stat.color}`}
                      style={{ width: `${stat.percentage}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-2 gap-6">
          {/* Recent Activity */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-[#F27125]" />
              Recent Activity
            </h2>
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex gap-3">
                  <img
                    src={activity.avatar}
                    alt={activity.user}
                    className="w-9 h-9 rounded flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900">
                      <span className="font-semibold">{activity.user}</span>{' '}
                      <span className="text-gray-600">{activity.action}</span>{' '}
                      <span className="font-medium text-[#0054a6]">{activity.target}</span>
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">{activity.timestamp}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Upcoming Deadlines */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-[#F27125]" />
              Upcoming Deadlines
            </h2>
            <div className="space-y-3">
              {upcomingDeadlines.map((deadline) => (
                <div
                  key={deadline.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                >
                  <div className="flex-1">
                    <div className="font-medium text-gray-900 text-sm">{deadline.task}</div>
                    <div className="text-xs text-gray-600 mt-0.5">{deadline.date}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="text-sm font-semibold text-gray-900">
                        {deadline.daysLeft} days
                      </div>
                      <div className="text-xs text-gray-500">remaining</div>
                    </div>
                    <div
                      className={`w-2 h-2 rounded-full ${
                        deadline.priority === 'high' ? 'bg-red-500' : 'bg-yellow-500'
                      }`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Project Progress */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-[#F27125]" />
            Project Progress
          </h2>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Sprint 1</span>
                <span className="text-sm font-semibold text-gray-900">53%</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-green-500 rounded-full" style={{ width: '53%' }} />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Backend Development</span>
                <span className="text-sm font-semibold text-gray-900">38%</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full" style={{ width: '38%' }} />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Frontend Development</span>
                <span className="text-sm font-semibold text-gray-900">65%</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-purple-500 rounded-full" style={{ width: '65%' }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
