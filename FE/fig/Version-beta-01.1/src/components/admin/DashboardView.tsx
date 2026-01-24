import { Users, FileCheck, Clock, Activity, TrendingUp, CheckCircle } from 'lucide-react';

export function DashboardView() {
  const stats = [
    {
      label: 'Total Students',
      value: '1,234',
      change: '+12% from last month',
      icon: Users,
      lightBg: 'bg-[#F27125]/10',
      textColor: 'text-[#F27125]',
    },
    {
      label: 'Active Topics',
      value: '87',
      change: '+5 new this week',
      icon: FileCheck,
      lightBg: 'bg-[#F27125]/10',
      textColor: 'text-[#F27125]',
    },
    {
      label: 'Pending Approvals',
      value: '23',
      change: '5 urgent items',
      icon: Clock,
      lightBg: 'bg-[#F27125]/10',
      textColor: 'text-[#F27125]',
    },
    {
      label: 'System Health',
      value: '99.9%',
      change: 'All systems operational',
      icon: Activity,
      lightBg: 'bg-[#F27125]/10',
      textColor: 'text-[#F27125]',
    },
  ];

  const recentActivities = [
    {
      id: 1,
      type: 'login',
      user: 'Dr. Tran Minh',
      email: 'minhtt@fpt.edu.vn',
      action: 'Logged in',
      timestamp: '2 minutes ago',
      status: 'success',
    },
    {
      id: 2,
      type: 'submission',
      user: 'Nguyen Van A',
      email: 'anvse150001@fpt.edu.vn',
      action: 'Submitted topic: E-commerce Platform',
      timestamp: '15 minutes ago',
      status: 'pending',
    },
    {
      id: 3,
      type: 'login',
      user: 'Le Thi B',
      email: 'bltse150025@fpt.edu.vn',
      action: 'Logged in',
      timestamp: '1 hour ago',
      status: 'success',
    },
    {
      id: 4,
      type: 'submission',
      user: 'Pham Van C',
      email: 'cpvse150050@fpt.edu.vn',
      action: 'Submitted topic: Hotel Management System',
      timestamp: '2 hours ago',
      status: 'pending',
    },
    {
      id: 5,
      type: 'approval',
      user: 'Dr. Nguyen Duc D',
      email: 'dnd@fpt.edu.vn',
      action: 'Approved topic: Smart Campus IoT',
      timestamp: '3 hours ago',
      status: 'success',
    },
  ];

  return (
    <>
      {/* Top Stats - 4 Cards */}
      <div className="grid grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg hover:border-[#F27125]/30 transition"
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`w-14 h-14 ${stat.lightBg} rounded-xl flex items-center justify-center shadow-sm`}>
                <stat.icon className={`w-7 h-7 ${stat.textColor}`} />
              </div>
            </div>
            <div className="mb-2">
              <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
              <div className="text-sm font-semibold text-gray-900">{stat.label}</div>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
              <TrendingUp className="w-3.5 h-3.5" />
              {stat.change}
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="px-6 py-5 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Recent Activity</h2>
          <p className="text-sm text-gray-500 mt-1 font-medium">
            Latest login logs and topic submissions
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Action
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {recentActivities.map((activity) => (
                <tr key={activity.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2.5 py-1 text-xs font-semibold rounded-full ${
                        activity.type === 'login'
                          ? 'bg-blue-100 text-blue-700'
                          : activity.type === 'submission'
                          ? 'bg-purple-100 text-purple-700'
                          : 'bg-green-100 text-green-700'
                      }`}
                    >
                      {activity.type === 'login' ? '🔐 Login' : activity.type === 'submission' ? '📝 Submit' : '✅ Approve'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{activity.user}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-600">{activity.email}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{activity.action}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-600">{activity.timestamp}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {activity.status === 'success' ? (
                      <div className="flex items-center gap-1.5 text-green-600">
                        <CheckCircle className="w-4 h-4" />
                        <span className="text-xs font-medium">Success</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 text-orange-600">
                        <Clock className="w-4 h-4" />
                        <span className="text-xs font-medium">Pending</span>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}