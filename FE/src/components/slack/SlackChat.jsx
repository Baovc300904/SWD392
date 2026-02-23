import { useState } from 'react';
import {
  Hash,
  Star,
  Info,
  Users,
  Bold,
  Italic,
  Strikethrough,
  Code,
  Link,
  ListOrdered,
  Paperclip,
  AtSign,
  Smile,
  Send,
  MoreVertical,
  MessageSquare,
  Bookmark,
  Plus,
  Sparkles,
} from 'lucide-react';
import { QAChannelView } from './QAChannelView';
import { AIMentorChat } from './AIMentorChat';
import { AIAssistantPanel } from './AIAssistantPanel';

export function SlackChat({ channel }) {
  // ⚠️ ALL hooks must be declared before any early returns (Rules of Hooks)
  const [showAIPanel, setShowAIPanel] = useState(false);
  const [message, setMessage] = useState('');

  // AI Mentor channel → dedicated full UI
  if (channel === 'ai-mentor-bot') {
    return (
      <div className="flex-1 flex h-screen overflow-hidden">
        <AIMentorChat />
      </div>
    );
  }

  // Q&A channel → forum view
  if (channel === 'q&a-support') {
    return (
      <div className="flex-1 flex h-screen overflow-hidden">
        <QAChannelView />
        <AIAssistantPanel isOpen={showAIPanel} onClose={() => setShowAIPanel(false)} />
      </div>
    );
  }

  const channelData = {
    'general-chat': {
      name: 'general-chat',
      topic: 'This is the one channel that will always include everyone. It\'s a great spot for announcements and team-wide conversations.',
      members: 6,
    },
    'project-tasks': {
      name: 'project-tasks',
      topic: 'Discuss tasks, milestones, and project planning',
      members: 6,
    },
    'resources-files': {
      name: 'resources-files',
      topic: 'Share files, documents, and useful links',
      members: 6,
    },
  };

  const info = channelData[channel] || channelData['general-chat'];

  const messages = [
    {
      id: 1,
      user: {
        name: 'Nguyen Van A',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Member1',
        time: '9:30 AM',
      },
      content: 'Good morning team! Let\'s have a quick sync on today\'s priorities.',
      reactions: [{ emoji: '👋', count: 3 }],
    },
    {
      id: 2,
      user: {
        name: 'Tran Thi B',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Member2',
        time: '9:32 AM',
      },
      content: 'Morning! I\'ve finished the authentication flow. It\'s ready for testing.',
      reactions: [{ emoji: '🎉', count: 2 }, { emoji: '👍', count: 1 }],
    },
    {
      id: 3,
      user: {
        name: 'Le Van C',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Member3',
        time: '9:35 AM',
      },
      content: 'Great work! I\'ll start working on the database integration today.',
    },
    {
      id: 4,
      user: {
        name: 'Pham Thi D',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Member4',
        time: '9:38 AM',
      },
      content: 'I\'m updating the UI mockups based on yesterday\'s feedback. Will share in a bit!',
      reactions: [{ emoji: '✨', count: 1 }],
    },
    {
      id: 5,
      user: {
        name: 'Dr. Tran Minh',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mentor1',
        time: '10:15 AM',
      },
      content: 'Good progress everyone. Don\'t forget we have our sprint review on Friday. Make sure to prepare your demos.',
      reactions: [{ emoji: '📌', count: 4 }],
    },
  ];

  return (
    <div className="flex-1 flex h-screen overflow-hidden">
      <div className="flex-1 flex flex-col bg-white overflow-hidden">
        {/* Channel Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white shadow-sm flex-shrink-0">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <Hash className="w-5 h-5 text-[#F27125]" />
            <h1 className="font-bold text-lg text-gray-900">{info.name}</h1>
            <button className="p-1.5 hover:bg-gray-100 rounded-lg transition">
              <Star className="w-5 h-5 text-gray-400 hover:text-[#F27125] transition" />
            </button>
          </div>
          <div className="flex items-center gap-2">
            {/* ⚡ Ask AI Button */}
            <button
              onClick={() => setShowAIPanel(prev => !prev)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold transition border ${showAIPanel
                ? 'bg-[#F27125] text-white border-[#F27125] shadow-md'
                : 'text-[#F27125] bg-orange-50 border-orange-200 hover:bg-orange-100'
                }`}
            >
              <Sparkles className="w-4 h-4" />
              Ask AI
            </button>
            <button className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded-lg text-sm font-medium text-gray-700 transition">
              <Users className="w-4 h-4 text-gray-500" />
              <span>{info.members}</span>
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-lg transition">
              <Info className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Channel Topic */}
        <div className="px-6 py-3 bg-gray-50 border-b border-gray-200 flex-shrink-0">
          <p className="text-sm text-gray-600 leading-relaxed">{info.topic}</p>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          <div className="space-y-6">
            {messages.map((msg, index) => {
              const showAvatar = index === 0 || messages[index - 1].user.name !== msg.user.name;

              return (
                <div
                  key={msg.id}
                  className="group relative flex gap-4 hover:bg-gray-50 -mx-3 px-3 py-2 rounded-lg transition"
                >
                  {/* Avatar */}
                  <div className="w-10 flex-shrink-0">
                    {showAvatar && (
                      <img
                        src={msg.user.avatar}
                        alt={msg.user.name}
                        className="w-10 h-10 rounded-lg shadow-sm"
                      />
                    )}
                  </div>

                  {/* Message Content */}
                  <div className="flex-1 min-w-0">
                    {showAvatar && (
                      <div className="flex items-baseline gap-3 mb-1">
                        <span className="font-bold text-[15px] text-gray-900">{msg.user.name}</span>
                        <span className="text-xs text-gray-500 font-medium">{msg.user.time}</span>
                      </div>
                    )}

                    <div className="text-[15px] text-gray-800 leading-relaxed">
                      {msg.content}
                    </div>

                    {/* Reactions */}
                    {msg.reactions && msg.reactions.length > 0 && (
                      <div className="flex items-center gap-2 mt-2">
                        {msg.reactions.map((reaction, idx) => (
                          <button
                            key={idx}
                            className="flex items-center gap-1.5 px-2.5 py-1 bg-white hover:bg-gray-50 border border-gray-300 rounded-lg text-xs font-medium transition shadow-sm hover:shadow"
                          >
                            <span>{reaction.emoji}</span>
                            <span className="text-gray-700">{reaction.count}</span>
                          </button>
                        ))}
                        <button className="flex items-center justify-center w-7 h-7 bg-white hover:bg-gray-50 border border-gray-300 rounded-lg transition shadow-sm hover:shadow">
                          <Plus className="w-3.5 h-3.5 text-gray-500" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Hover Actions */}
                  <div className="absolute top-0 right-0 -mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="flex items-center bg-white border border-gray-300 rounded-lg shadow-md">
                      <button className="p-2 hover:bg-gray-100 border-r border-gray-300 transition">
                        <Plus className="w-4 h-4 text-gray-600" />
                      </button>
                      <button className="p-2 hover:bg-gray-100 border-r border-gray-300 transition">
                        <MessageSquare className="w-4 h-4 text-gray-600" />
                      </button>
                      <button className="p-2 hover:bg-gray-100 border-r border-gray-300 transition">
                        <Bookmark className="w-4 h-4 text-gray-600" />
                      </button>
                      <button className="p-2 hover:bg-gray-100 rounded-r-lg transition">
                        <MoreVertical className="w-4 h-4 text-gray-600" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Message Input */}
        <div className="px-6 pb-8 pt-3 flex-shrink-0">
          <div className="border-2 border-gray-300 rounded-lg overflow-hidden focus-within:border-[#F27125] focus-within:shadow-md transition bg-white">
            <div className="px-4 py-3">
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={`Message #${info.name}`}
                className="w-full resize-none focus:outline-none text-[15px]"
                rows={1}
                style={{ minHeight: '20px', maxHeight: '200px' }}
                onInput={(e) => {
                  const target = e.target;
                  target.style.height = 'auto';
                  target.style.height = target.scrollHeight + 'px';
                }}
              />
            </div>

            {/* Toolbar */}
            <div className="flex items-center justify-between px-2 py-1 border-t border-gray-200">
              <div className="flex items-center">
                <button className="p-1.5 hover:bg-gray-100 rounded text-gray-600 hover:text-[#F27125] transition" title="Bold">
                  <Bold className="w-[17px] h-[17px]" />
                </button>
                <button className="p-1.5 hover:bg-gray-100 rounded text-gray-600 hover:text-[#F27125] transition" title="Italic">
                  <Italic className="w-[17px] h-[17px]" />
                </button>
                <button className="p-1.5 hover:bg-gray-100 rounded text-gray-600 hover:text-[#F27125] transition" title="Strike">
                  <Strikethrough className="w-[17px] h-[17px]" />
                </button>
                <div className="w-px h-5 bg-gray-300 mx-1" />
                <button className="p-1.5 hover:bg-gray-100 rounded text-gray-600 hover:text-[#F27125] transition" title="Link">
                  <Link className="w-[17px] h-[17px]" />
                </button>
                <button className="p-1.5 hover:bg-gray-100 rounded text-gray-600 hover:text-[#F27125] transition" title="Ordered list">
                  <ListOrdered className="w-[17px] h-[17px]" />
                </button>
                <button className="p-1.5 hover:bg-gray-100 rounded text-gray-600 hover:text-[#F27125] transition" title="Code block">
                  <Code className="w-[17px] h-[17px]" />
                </button>
                <div className="w-px h-5 bg-gray-300 mx-1" />
                <button className="p-1.5 hover:bg-gray-100 rounded text-gray-600 hover:text-[#F27125] transition" title="Attach">
                  <Paperclip className="w-[17px] h-[17px]" />
                </button>
                <button className="p-1.5 hover:bg-gray-100 rounded text-gray-600 hover:text-[#F27125] transition" title="Mention">
                  <AtSign className="w-[17px] h-[17px]" />
                </button>
                <button className="p-1.5 hover:bg-gray-100 rounded text-gray-600 hover:text-[#F27125] transition" title="Emoji">
                  <Smile className="w-[17px] h-[17px]" />
                </button>
              </div>

              <button
                disabled={!message.trim()}
                className="p-1.5 bg-[#F27125] hover:bg-[#d96420] text-white rounded transition disabled:opacity-40 disabled:cursor-not-allowed"
                title="Send"
              >
                <Send className="w-[17px] h-[17px]" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mini AI Panel — fixed overlay */}
      <AIAssistantPanel isOpen={showAIPanel} onClose={() => setShowAIPanel(false)} />
    </div>
  );
}
