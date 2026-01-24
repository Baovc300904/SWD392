import { useState } from 'react';
import { 
  Hash, 
  Users, 
  Star, 
  Info,
  Bold,
  Italic,
  Code,
  Paperclip,
  Smile,
  Send,
  Sparkles,
  MoreVertical,
  Reply,
  ThumbsUp
} from 'lucide-react';

export function ChatChannelView({ channel }) {
  const [message, setMessage] = useState('');

  const channelInfo = {
    general: {
      name: 'general',
      topic: 'General discussion and project updates',
      members: 6,
    },
    'tasks-projects': {
      name: 'tasks-projects',
      topic: 'Task planning and project coordination',
      members: 6,
    },
    'q&a-forum': {
      name: 'q&a-forum',
      topic: 'Ask questions and get help from the team',
      members: 6,
    },
    resources: {
      name: 'resources',
      topic: 'Share files, documents, and useful links',
      members: 6,
    },
  };

  const info = channelInfo[channel typeof channelInfo] || channelInfo.general;

  const messages = [
    {
      id: 1,
      user: {
        name: 'Nguyen Van A',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Member1',
        role: 'Leader',
      },
      timestamp: '10:30 AM',
      content: 'Good morning team! Let\'s discuss our progress on Sprint 1.',
      reactions: [{ emoji: '👍', count: 3 }],
    },
    {
      id: 2,
      user: {
        name: 'Tran Thi B',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Member2',
        role: 'Developer',
      },
      timestamp: '10:32 AM',
      content: 'I\'ve completed the user authentication module. Ready for review!',
      reactions: [{ emoji: '🎉', count: 2 }, { emoji: '👏', count: 1 }],
    },
    {
      id: 3,
      user: {
        name: 'Le Van C',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Member3',
        role: 'Developer',
      },
      timestamp: '10:35 AM',
      content: 'Quick question: Should we use JWT tokens or session-based authentication for our API?',
      reactions: [],
    },
    {
      id: 4,
      user: {
        name: '🤖 AI Assistant',
        avatar: null,
        role: 'Bot',
        isBot: true,
      },
      timestamp: '10:35 AM',
      content: `Based on your course syllabus and modern best practices, I recommend using JWT tokens for the following reasons:

1. **Stateless Authentication**: JWT tokens are self-contained and don't require server-side session storage, making your API more scalable.

2. **Mobile-Friendly**: If you plan to build mobile apps later, JWT works seamlessly across platforms.

3. **Security**: When implemented correctly with HTTPS, short expiration times, and refresh tokens, JWT is secure and aligned with industry standards.

For your e-commerce project, I suggest implementing:
- Access tokens (15-minute expiry)
- Refresh tokens (7-day expiry)
- HttpOnly cookies for web clients

Would you like me to provide code examples?`,
      reactions: [{ emoji: '✨', count: 4 }],
      isAIGenerated: true,
    },
    {
      id: 5,
      user: {
        name: 'Le Van C',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Member3',
        role: 'Developer',
      },
      timestamp: '10:37 AM',
      content: 'Thank you! That\'s exactly what I needed. Yes, code examples would be great!',
      reactions: [{ emoji: '🙏', count: 1 }],
    },
    {
      id: 6,
      user: {
        name: 'Pham Thi D',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Member4',
        role: 'Designer',
      },
      timestamp: '11:15 AM',
      content: 'I\'ve uploaded the new landing page designs to #resources. Please take a look and share your feedback!',
      reactions: [{ emoji: '🎨', count: 2 }],
    },
  ];

  const handleSendMessage = () => {
    if (!message.trim()) return;
    console.log('Sending message:', message);
    setMessage('');
  };

  return (
    <div className="flex-1 flex flex-col h-screen bg-white">
      {/* Channel Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <Hash className="w-5 h-5 text-gray-600 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-gray-900">{info.name}</h1>
                <button className="p-1 hover:bg-gray-100 rounded">
                  <Star className="w-4 h-4 text-gray-400" />
                </button>
              </div>
              <p className="text-xs text-gray-600 truncate">{info.topic}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1.5 px-3 py-1.5 hover:bg-gray-100 rounded text-sm font-medium text-gray-700">
              <Users className="w-4 h-4" />
              {info.members}
            </button>
            <button className="p-1.5 hover:bg-gray-100 rounded">
              <Info className="w-4 h-4 text-gray-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Message Stream */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        <div className="max-w-5xl mx-auto space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className="group flex gap-3 hover:bg-gray-50 -mx-2 px-2 py-1 rounded"
            >
              {/* Avatar */}
              <div className="flex-shrink-0 pt-0.5">
                {msg.user.isBot ? (
                  <div className="w-9 h-9 bg-gradient-to-br from-[#F27125] to-[#d96420] rounded flex items-center justify-center text-lg">
                    🤖
                  </div>
                ) : (
                  <img
                    src={msg.user.avatar}
                    alt={msg.user.name}
                    className="w-9 h-9 rounded"
                  />
                )}
              </div>

              {/* Message Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="font-bold text-gray-900 text-sm">{msg.user.name}</span>
                  {msg.user.isBot && (
                    <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-medium">
                      BOT
                    </span>
                  )}
                  <span className="text-xs text-gray-500">{msg.timestamp}</span>
                </div>

                {/* Message Text */}
                <div className="text-sm text-gray-900 leading-relaxed whitespace-pre-wrap">
                  {msg.content}
                </div>

                {/* AI Generated Label */}
                {msg.isAIGenerated && (
                  <div className="flex items-center gap-1.5 mt-2 text-xs text-gray-500">
                    <Sparkles className="w-3 h-3" />
                    <span>AI-generated response</span>
                  </div>
                )}

                {/* Reactions */}
                {msg.reactions.length > 0 && (
                  <div className="flex items-center gap-1 mt-2">
                    {msg.reactions.map((reaction, index) => (
                      <button
                        key={index}
                        className="flex items-center gap-1 px-2 py-0.5 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-full text-xs transition"
                      >
                        <span>{reaction.emoji}</span>
                        <span className="text-gray-700 font-medium">{reaction.count}</span>
                      </button>
                    ))}
                  </div>
                )}

                {/* Hover Actions */}
                <div className="absolute right-4 top-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="flex items-center gap-1 bg-white border border-gray-300 rounded shadow-sm">
                    <button className="p-1.5 hover:bg-gray-100 rounded">
                      <ThumbsUp className="w-3.5 h-3.5 text-gray-600" />
                    </button>
                    <button className="p-1.5 hover:bg-gray-100 rounded">
                      <Reply className="w-3.5 h-3.5 text-gray-600" />
                    </button>
                    <button className="p-1.5 hover:bg-gray-100 rounded">
                      <MoreVertical className="w-3.5 h-3.5 text-gray-600" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Message Input */}
      <div className="border-t border-gray-200 p-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="border border-gray-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-[#0054a6] focus-within:border-transparent">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder={`Message #${info.name}...`}
              className="w-full px-4 py-3 focus:outline-none resize-none text-sm"
              rows={3}
            />
            <div className="bg-white px-3 py-2 flex items-center justify-between border-t border-gray-200">
              <div className="flex items-center gap-1">
                <button className="p-1.5 hover:bg-gray-100 rounded text-gray-600 transition">
                  <Bold className="w-4 h-4" />
                </button>
                <button className="p-1.5 hover:bg-gray-100 rounded text-gray-600 transition">
                  <Italic className="w-4 h-4" />
                </button>
                <button className="p-1.5 hover:bg-gray-100 rounded text-gray-600 transition">
                  <Code className="w-4 h-4" />
                </button>
                <div className="w-px h-4 bg-gray-300 mx-1" />
                <button className="p-1.5 hover:bg-gray-100 rounded text-gray-600 transition">
                  <Paperclip className="w-4 h-4" />
                </button>
                <button className="p-1.5 hover:bg-gray-100 rounded text-gray-600 transition">
                  <Smile className="w-4 h-4" />
                </button>
              </div>
              <div className="flex items-center gap-2">
                <button className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-[#F27125] to-[#d96420] hover:opacity-90 text-white rounded font-medium text-sm transition">
                  <Sparkles className="w-4 h-4" />
                  AI Sparkle
                </button>
                <button
                  onClick={handleSendMessage}
                  disabled={!message.trim()}
                  className="p-2 bg-[#0054a6] hover:bg-[#003d7a] text-white rounded transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


