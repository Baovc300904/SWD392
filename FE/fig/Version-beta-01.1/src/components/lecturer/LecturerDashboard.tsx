import { 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2, 
  Clock,
  ArrowRight,
  BarChart3
} from 'lucide-react';

export function LecturerDashboard() {
  const stats = [
    {
      label: 'Total Groups',
      value: '12',
      icon: Users,
      color: 'bg-[#F27125]',
      textColor: 'text-[#F27125]',
      bgLight: 'bg-[#F27125]/10',
    },
    {
      label: 'Pending Topics',
      value: '3',
      icon: Clock,
      color: 'bg-yellow-500',
      textColor: 'text-yellow-600',
      bgLight: 'bg-yellow-50',
    },
    {
      label: 'Lagging Behind',
      value: '2',
      icon: AlertTriangle,
      color: 'bg-red-500',
      textColor: 'text-red-600',
      bgLight: 'bg-red-50',
    },
    {
      label: 'Avg Progress',
      value: '65%',
      icon: TrendingUp,
      color: 'bg-green-500',
      textColor: 'text-green-600',
      bgLight: 'bg-green-50',
    },
  ];

  const groups = [
    {
      id: 'G01',
      name: 'Group 01',
      topic: 'E-commerce Platform for Local Businesses',
      phase: 'Development',
      progress: 75,
      status: 'on-track',
      members: 5,
      lastUpdate: '2 hours ago',
    },
    {
      id: 'G02',
      name: 'Group 02',
      topic: 'Student Management System with AI',
      phase: 'Testing',
      progress: 85,
      status: 'on-track',
      members: 6,
      lastUpdate: '5 hours ago',
    },
    {
      id: 'G03',
      name: 'Group 03',
      topic: 'Food Delivery App with Real-time Tracking',
      phase: 'Design',
      progress: 45,
      status: 'risk',
      members: 5,
      lastUpdate: '1 day ago',
    },
    {
      id: 'G04',
      name: 'Group 04',
      topic: 'Healthcare Appointment Booking System',
      phase: 'Development',
      progress: 60,
      status: 'on-track',
      members: 5,
      lastUpdate: '3 hours ago',
    },
    {
      id: 'G05',
      name: 'Group 05',
      topic: 'Online Learning Platform with Live Streaming',
      phase: 'Planning',
      progress: 25,
      status: 'risk',
      members: 4,
      lastUpdate: '2 days ago',
    },
    {
      id: 'G06',
      name: 'Group 06',
      topic: 'Real Estate Management Portal',
      phase: 'Development',
      progress: 70,
      status: 'on-track',
      members: 5,
      lastUpdate: '4 hours ago',
    },
  ];

  return (
    <div className="flex-1 flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Semester Spring 2026 Overview</h1>
            <p className="text-sm text-gray-600 mt-1">Monitor and manage all your supervised groups</p>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 px-4 py-2 bg-[#0054a6] hover:bg-[#003d7a] text-white rounded-lg font-medium transition">
              <BarChart3 className="w-4 h-4" />
              Export Report
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="px-6 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className="bg-white rounded-lg border border-gray-200 p-5 hover:shadow-md transition"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className={`${stat.bgLight} p-3 rounded-lg`}>
                    <Icon className={`w-6 h-6 ${stat.textColor}`} />
                  </div>
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Groups Table */}
      <div className="flex-1 px-6 pb-6 overflow-auto">
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          {/* Table Header */}
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h2 className="text-lg font-bold text-gray-900">All Supervised Groups</h2>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Group
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Topic Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Current Phase
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Progress
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Last Update
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {groups.map((group) => (
                  <tr key={group.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-[#0054a6] to-[#F27125] rounded-lg flex items-center justify-center">
                          <span className="text-white font-bold text-sm">{group.id}</span>
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">{group.name}</div>
                          <div className="text-xs text-gray-500">{group.members} members</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="max-w-xs">
                        <div className="text-sm text-gray-900 font-medium line-clamp-2">
                          {group.topic}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-1 bg-[#F27125]/10 text-[#F27125] text-xs font-semibold rounded-full">
                        {group.phase}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-[100px]">
                          <div
                            className={`h-2 rounded-full transition-all ${
                              group.status === 'on-track' ? 'bg-green-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${group.progress}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium text-gray-700">{group.progress}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {group.status === 'on-track' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                          <CheckCircle2 className="w-3 h-3" />
                          On Track
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded-full">
                          <AlertTriangle className="w-3 h-3" />
                          At Risk
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {group.lastUpdate}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <button className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#0054a6] hover:bg-[#003d7a] text-white text-sm font-medium rounded transition">
                        View
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

// Import Users for stats
function Users(props: React.ComponentProps<'svg'>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}