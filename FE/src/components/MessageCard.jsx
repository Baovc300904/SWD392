import { Reply, MessageCircle, ArrowUpRight } from 'lucide-react';

export function MessageCard({ message, isSelected, onSelect }) {
  return (
    <div
      onClick={onSelect}
      className={`group hover:bg-gray-50 rounded-lg p-4 transition cursor-pointer ${
        isSelected ? 'bg-blue-50 border-l-4 border-[#0054a6]' : ''
      }`}
    >
      <div className="flex gap-3">
        {/* Avatar */}
        <img
          src={message.avatar}
          alt={message.author}
          className="w-10 h-10 rounded-lg flex-shrink-0"
        />

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center gap-2 mb-1">
            <span className="font-semibold text-gray-900">{message.author}</span>
            {message.isStudent && (
              <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded">
                Student
              </span>
            )}
            <span className="text-xs text-gray-500">{message.timestamp}</span>
          </div>

          {/* Title */}
          <h3 className="font-semibold text-gray-900 mb-1">{message.title}</h3>

          {/* Body */}
          <p className="text-sm text-gray-700 leading-relaxed">{message.body}</p>

          {/* Action Bar */}
          <div className="flex items-center gap-1 mt-3 opacity-0 group-hover:opacity-100 transition">
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded hover:bg-white border border-gray-200 text-sm text-gray-700 transition">
              <Reply className="w-4 h-4" />
              Reply
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded hover:bg-white border border-gray-200 text-sm text-gray-700 transition">
              <MessageCircle className="w-4 h-4" />
              Thread
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded hover:bg-orange-50 border border-orange-200 text-sm text-orange-700 transition ml-auto">
              <ArrowUpRight className="w-4 h-4" />
              Escalate to Manager
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


