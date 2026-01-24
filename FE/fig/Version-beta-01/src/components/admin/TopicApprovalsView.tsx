import { X, Check, FileQuestion } from 'lucide-react';

export function TopicApprovalsView() {
  const topics = [
    {
      id: 1,
      title: 'E-commerce AI System',
      lecturer: {
        name: 'Dr. Tran Minh',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Lecturer1',
      },
      tags: ['Spring 2026', 'Web App', 'Pending'],
      description:
        'An intelligent e-commerce platform using AI for personalized recommendations and dynamic pricing strategies.',
    },
    {
      id: 2,
      title: 'Smart Campus IoT',
      lecturer: {
        name: 'Dr. Nguyen Duc D',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Lecturer2',
      },
      tags: ['Spring 2026', 'IoT', 'Pending'],
      description:
        'IoT-based monitoring system for campus facilities including lighting, temperature, and security management.',
    },
    {
      id: 3,
      title: 'Hotel Management Platform',
      lecturer: {
        name: 'Dr. Pham Thi X',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Lecturer3',
      },
      tags: ['Spring 2026', 'Web App', 'Pending'],
      description:
        'Comprehensive hotel management system with booking, payment integration, and customer relationship features.',
    },
  ];

  if (topics.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <FileQuestion className="w-10 h-10 text-gray-400" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">No Pending Topics</h3>
        <p className="text-gray-600">All topics have been reviewed. Great job!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {topics.map((topic) => (
        <div
          key={topic.id}
          className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition flex flex-col"
        >
          {/* Header */}
          <div className="mb-4">
            <h3 className="text-lg font-bold text-gray-900 mb-3">{topic.title}</h3>
            <div className="flex items-center gap-3">
              <img
                src={topic.lecturer.avatar}
                alt={topic.lecturer.name}
                className="w-10 h-10 rounded-full"
              />
              <div>
                <div className="text-sm text-gray-500">Lecturer</div>
                <div className="text-sm font-semibold text-gray-900">{topic.lecturer.name}</div>
              </div>
            </div>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-4">
            {topic.tags.map((tag, index) => (
              <span
                key={index}
                className={`inline-flex px-2.5 py-1 text-xs font-semibold rounded-full ${
                  tag === 'Pending'
                    ? 'bg-yellow-100 text-yellow-700'
                    : tag === 'Spring 2026'
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Description */}
          <p className="text-sm text-gray-600 leading-relaxed mb-6 flex-1">{topic.description}</p>

          {/* Action Footer */}
          <div className="grid grid-cols-2 gap-3 pt-4 border-t border-gray-200">
            <button className="flex items-center justify-center gap-2 px-4 py-3 bg-white border-2 border-red-500 text-red-600 rounded-lg font-semibold hover:bg-red-50 transition">
              <X className="w-5 h-5" />
              Reject
            </button>
            <button className="flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition shadow-md">
              <Check className="w-5 h-5" />
              Approve
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
