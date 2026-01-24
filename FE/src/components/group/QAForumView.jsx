import { useState } from 'react';
import { Search, Plus, MessageSquare, ThumbsUp, Pin } from 'lucide-react';

export function QAForumView() {
  const [searchTerm, setSearchTerm] = useState('');

  const threads = [
    {
      id: 1,
      author: { name: 'Nguyen Van A', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Member1' },
      title: 'How to implement JWT authentication in Node.js?',
      preview: 'I\'m trying to set up JWT authentication for our backend API. Should we use cookies or local storage?',
      timestamp: '2 hours ago',
      replies: 5,
      likes: 3,
      pinned: true,
      tags: ['Backend', 'Security'],
    },
    {
      id: 2,
      author: { name: 'Tran Thi B', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Member2' },
      title: 'Best practices for React state management?',
      preview: 'For our e-commerce app, should we use Redux or Context API? The app will have complex state...',
      timestamp: '5 hours ago',
      replies: 8,
      likes: 7,
      pinned: false,
      tags: ['Frontend', 'React'],
    },
    {
      id: 3,
      author: { name: 'Le Van C', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Member3' },
      title: 'Database schema design for products table',
      preview: 'Should we separate product variants into a different table or use JSON fields?',
      timestamp: '1 day ago',
      replies: 12,
      likes: 5,
      pinned: false,
      tags: ['Database', 'Design'],
    },
    {
      id: 4,
      author: { name: 'Pham Thi D', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Member4' },
      title: 'UI feedback: Landing page color scheme',
      preview: 'I\'ve created two versions of our landing page. Which color palette looks more professional?',
      timestamp: '2 days ago',
      replies: 4,
      likes: 2,
      pinned: false,
      tags: ['Design', 'UI/UX'],
    },
  ];

  const filteredThreads = threads.filter(
    (thread) =>
      thread.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      thread.preview.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex-1 flex flex-col h-screen bg-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900"># 💬 qa-forum</h1>
            <p className="text-sm text-gray-600 mt-0.5">Ask questions and share knowledge</p>
          </div>
          <button className="flex items-center gap-2 bg-[#F27125] hover:bg-[#d96420] text-white px-4 py-2 rounded-lg font-medium transition">
            <Plus className="w-4 h-4" />
            New Question
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search questions..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0054a6] focus:border-transparent"
          />
        </div>
      </div>

      {/* Thread List */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto space-y-3">
          {filteredThreads.map((thread) => (
            <div
              key={thread.id}
              className="bg-white border border-gray-200 rounded-lg p-4 hover:border-gray-300 hover:shadow-sm cursor-pointer transition"
            >
              <div className="flex gap-3">
                {/* Avatar */}
                <img
                  src={thread.author.avatar}
                  alt={thread.author.name}
                  className="w-10 h-10 rounded flex-shrink-0"
                />

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-2 mb-2">
                    {thread.pinned && (
                      <Pin className="w-4 h-4 text-[#F27125] flex-shrink-0 mt-0.5" />
                    )}
                    <h3 className="font-semibold text-gray-900 leading-snug flex-1">
                      {thread.title}
                    </h3>
                  </div>

                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{thread.preview}</p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1.5">
                        <MessageSquare className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">{thread.replies} replies</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <ThumbsUp className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">{thread.likes}</span>
                      </div>
                      <span className="text-sm text-gray-500">{thread.timestamp}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {thread.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredThreads.length === 0 && (
          <div className="text-center py-12">
            <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No questions found</p>
          </div>
        )}
      </div>

      {/* Rich Text Editor - Fixed at bottom */}
      <div className="border-t border-gray-200 p-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="border border-gray-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-[#0054a6] focus-within:border-transparent">
            <textarea
              placeholder="Ask a question or share your knowledge..."
              className="w-full px-4 py-3 focus:outline-none resize-none"
              rows={3}
            />
            <div className="bg-gray-50 px-4 py-2 flex items-center justify-between border-t border-gray-200">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <button className="hover:text-gray-700">
                  <strong>B</strong>
                </button>
                <button className="hover:text-gray-700">
                  <em>I</em>
                </button>
                <button className="hover:text-gray-700">Code</button>
                <button className="hover:text-gray-700">Link</button>
              </div>
              <button className="bg-[#F27125] hover:bg-[#d96420] text-white px-4 py-1.5 rounded text-sm font-medium transition">
                Post
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


