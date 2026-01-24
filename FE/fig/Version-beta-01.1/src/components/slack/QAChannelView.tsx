import { useState } from 'react';
import { 
  Hash, 
  Star, 
  Info,
  ArrowUp,
  MessageSquare,
  AlertCircle,
  Search,
  SlidersHorizontal
} from 'lucide-react';

export function QAChannelView() {
  const [searchTerm, setSearchTerm] = useState('');

  const questions = [
    {
      id: 1,
      user: {
        name: 'Le Van C',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Member3',
        time: '2 hours ago',
      },
      status: 'solved',
      title: 'Error 403 when calling API from React frontend',
      description: 'I\'m getting a 403 Forbidden error when trying to call our backend API from the React app. CORS is configured on the backend. What could be wrong?',
      tags: ['React', 'Backend', 'CORS'],
      votes: 12,
      answers: 5,
    },
    {
      id: 2,
      user: {
        name: 'Tran Thi B',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Member2',
        time: '5 hours ago',
      },
      status: 'pending',
      title: 'Best practice for storing JWT tokens in React?',
      description: 'Should I use localStorage, sessionStorage, or HTTP-only cookies for storing JWT tokens? What\'s the most secure approach for our e-commerce app?',
      tags: ['Security', 'JWT', 'React'],
      votes: 8,
      answers: 3,
    },
    {
      id: 3,
      user: {
        name: 'Pham Thi D',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Member4',
        time: '1 day ago',
      },
      status: 'pending',
      title: 'How to implement real-time notifications with Socket.io?',
      description: 'Need help setting up Socket.io for real-time order notifications. Should the connection be established on app mount or when user logs in?',
      tags: ['Socket.io', 'Real-time', 'Backend'],
      votes: 15,
      answers: 7,
    },
    {
      id: 4,
      user: {
        name: 'Nguyen Van A',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Member1',
        time: '2 days ago',
      },
      status: 'solved',
      title: 'Database schema design for product variants',
      description: 'What\'s the best way to handle product variants (size, color) in our database? Should we use separate tables or JSON columns?',
      tags: ['Database', 'Design', 'PostgreSQL'],
      votes: 20,
      answers: 9,
    },
  ];

  return (
    <div className="flex-1 flex flex-col h-screen bg-gray-50">
      {/* Channel Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white shadow-sm">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <Hash className="w-5 h-5 text-[#F27125]" />
          <h1 className="font-bold text-lg text-gray-900">q&a-support</h1>
          <button className="p-1.5 hover:bg-gray-100 rounded-lg transition">
            <Star className="w-5 h-5 text-gray-400 hover:text-[#F27125] transition" />
          </button>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-2 hover:bg-gray-100 rounded-lg transition">
            <Info className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="px-6 py-4 bg-white border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search questions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-[#F27125] focus:ring-2 focus:ring-[#F27125]/20 transition"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium text-gray-700">
            <SlidersHorizontal className="w-4 h-4" />
            <span>Filter</span>
          </button>
        </div>
      </div>

      {/* Questions List */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="space-y-4">
          {questions.map((q) => (
            <div
              key={q.id}
              className="bg-white border border-gray-200 rounded-lg p-6 hover:border-[#F27125] hover:shadow-md transition cursor-pointer"
            >
              {/* Question Header */}
              <div className="flex items-start gap-4 mb-4">
                <img
                  src={q.user.avatar}
                  alt={q.user.name}
                  className="w-11 h-11 rounded-lg shadow-sm flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-lg text-gray-900 mb-2 leading-snug">{q.title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed line-clamp-2 mb-3">
                    {q.description}
                  </p>
                  
                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-3">
                    {q.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="inline-flex px-3 py-1 bg-gray-100 text-gray-700 text-xs font-semibold rounded-lg hover:bg-gray-200 transition"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Meta Info */}
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span className="font-medium">{q.user.name}</span>
                    <span>•</span>
                    <span>{q.user.time}</span>
                  </div>
                </div>

                {/* Stats */}
                <div className="flex flex-col items-end gap-3 flex-shrink-0">
                  <div className={`px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm ${
                    q.status === 'solved'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-orange-100 text-orange-700'
                  }`}>
                    {q.status === 'solved' ? '✓ Solved' : 'Pending'}
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5 text-gray-600">
                      <ArrowUp className="w-4 h-4 text-[#F27125]" />
                      <span className="text-sm font-bold">{q.votes}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-gray-600">
                      <MessageSquare className="w-4 h-4 text-gray-400" />
                      <span className="text-sm font-bold">{q.answers}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}