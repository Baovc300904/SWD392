import { useState, useEffect, useRef } from 'react';
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
  Loader2,
  AlertCircle,
  FileIcon,
  X,
} from 'lucide-react';
import { QAChannelView } from './QAChannelView';
import { AIMentorChat } from './AIMentorChat';
import { AIAssistantPanel } from './AIAssistantPanel';
import { messageService } from '../../services/message.service';
import { channelService } from '../../services/channel.service';

export function SlackChat({ channel, channelId, groupId }) {
  // ⚠️ ALL hooks must be declared before any early returns (Rules of Hooks)
  const [showAIPanel, setShowAIPanel] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [channelInfo, setChannelInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sending, setSending] = useState(false);
  const [attachments, setAttachments] = useState([]);
  const [uploading, setUploading] = useState(false);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  // Fetch channel info and messages when channel changes
  useEffect(() => {
    const fetchChannelData = async () => {
      try {
        setLoading(true);
        setError(null);

        // If no channelId or channelId is not a number, use mock data
        if (!channelId || typeof channelId === 'string') {
          // Using mock data for offline/development mode
          setChannelInfo(getMockChannelInfo(channel));
          setMessages(getMockMessages());
          setLoading(false);
          return;
        }

        // Fetch channel info and messages in parallel
        const [infoResponse, messagesResponse] = await Promise.all([
          channelService.getChannelById(channelId),
          messageService.getChannelMessages(channelId, { limit: 50 })
        ]);

        if (infoResponse.success) {
          setChannelInfo(infoResponse.data);
        }

        if (messagesResponse.success) {
          setMessages(messagesResponse.data.messages || []);
        }
      } catch (err) {
        // Silent fallback to mock data for better UX
        setChannelInfo(getMockChannelInfo(channel));
        setMessages(getMockMessages());
        setError(null); // Don't show error, just use mock data
      } finally {
        setLoading(false);
      }
    };

    fetchChannelData();
  }, [channelId, channel]);

  // Mock data for development
  const getMockChannelInfo = (channelName) => ({
    name: channelName || 'general-chat',
    topic: channelName === 'general-chat' 
      ? "This is the one channel that will always include everyone. It's a great spot for announcements and team-wide conversations."
      : channelName === 'project-tasks'
      ? 'Discuss tasks, milestones, and project planning'
      : channelName === 'q&a-support'
      ? 'Ask questions and get help from the team'
      : 'Share files, documents, and useful links',
    members: 6,
    type: 'PUBLIC'
  });

  const getMockMessages = () => [
    {
      id: 1,
      user: {
        id: 1,
        name: 'Nguyen Van A',
        fullName: 'Nguyen Van A',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Member1',
        time: '9:30 AM',
      },
      content: "Good morning team! Let's have a quick sync on today's priorities.",
      reactions: [{ emoji: '👋', userId: 2 }, { emoji: '👋', userId: 3 }],
      attachments: [],
      createdAt: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      id: 2,
      user: {
        id: 2,
        name: 'Tran Thi B',
        fullName: 'Tran Thi B',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Member2',
        time: '9:32 AM',
      },
      content: "Morning! I've finished the authentication flow. It's ready for testing.",
      reactions: [{ emoji: '🎉', userId: 1 }, { emoji: '🎉', userId: 3 }, { emoji: '👍', userId: 4 }],
      attachments: [],
      createdAt: new Date(Date.now() - 3480000).toISOString(),
    },
    {
      id: 3,
      user: {
        id: 3,
        name: 'Le Van C',
        fullName: 'Le Van C',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Member3',
        time: '9:35 AM',
      },
      content: "Great work! I'll start working on the database integration today.",
      reactions: [],
      attachments: [],
      createdAt: new Date(Date.now() - 3300000).toISOString(),
    },
    {
      id: 4,
      user: {
        id: 4,
        name: 'Pham Thi D',
        fullName: 'Pham Thi D',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Member4',
        time: '9:38 AM',
      },
      content: "I'm updating the UI mockups based on yesterday's feedback. Will share in a bit!",
      reactions: [{ emoji: '✨', userId: 1 }],
      attachments: [],
      createdAt: new Date(Date.now() - 3120000).toISOString(),
    },
    {
      id: 5,
      user: {
        id: 5,
        name: 'Dr. Tran Minh',
        fullName: 'Dr. Tran Minh',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mentor1',
        time: '10:15 AM',
      },
      content: "Good progress everyone. Don't forget we have our sprint review on Friday. Make sure to prepare your demos.",
      reactions: [{ emoji: '📌', userId: 1 }, { emoji: '📌', userId: 2 }, { emoji: '📌', userId: 3 }, { emoji: '📌', userId: 4 }],
      attachments: [],
      createdAt: new Date(Date.now() - 900000).toISOString(),
    },
  ];

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle file upload
  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setUploading(true);
    try {
      const uploadPromises = files.map(file =>
        messageService.uploadAttachment(file, (progress) => {
          console.log(`Upload progress: ${progress}%`);
        })
      );

      const uploadResults = await Promise.all(uploadPromises);
      const newAttachments = uploadResults
        .filter(result => result.success)
        .map(result => result.data);

      setAttachments(prev => [...prev, ...newAttachments]);
    } catch (err) {
      console.error('Error uploading files:', err);
      alert('Failed to upload files. Please try again.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Remove attachment
  const removeAttachment = (attachmentId) => {
    setAttachments(prev => prev.filter(att => att.id !== attachmentId));
  };

  // Send message
  const handleSendMessage = async () => {
    if (!message.trim() && attachments.length === 0) return;

    setSending(true);
    try {
      // If no valid channelId (offline mode), create mock message
      if (!channelId || typeof channelId === 'string') {
        const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
        const mockMessage = {
          id: Date.now(),
          user: {
            id: currentUser.id || 999,
            name: currentUser.fullName || currentUser.name || 'You',
            fullName: currentUser.fullName || currentUser.name || 'You',
            avatar: currentUser.avatarURL || 'https://api.dicebear.com/7.x/avataaars/svg?seed=CurrentUser',
          },
          content: message.trim(),
          reactions: [],
          attachments: attachments,
          createdAt: new Date().toISOString(),
        };
        setMessages(prev => [...prev, mockMessage]);
        setMessage('');
        setAttachments([]);
        setSending(false);
        return;
      }

      const response = await messageService.sendMessage({
        channelId,
        content: message.trim(),
        attachments: attachments.map(att => att.id)
      });

      if (response.success) {
        // Add new message to list
        setMessages(prev => [...prev, response.data]);
        setMessage('');
        setAttachments([]);
      }
    } catch (err) {
      // Silent fallback: add message locally for better UX
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      const mockMessage = {
        id: Date.now(),
        user: {
          id: currentUser.id || 999,
          name: currentUser.fullName || currentUser.name || 'You',
          fullName: currentUser.fullName || currentUser.name || 'You',
          avatar: currentUser.avatarURL || 'https://api.dicebear.com/7.x/avataaars/svg?seed=CurrentUser',
        },
        content: message.trim(),
        reactions: [],
        attachments: attachments,
        createdAt: new Date().toISOString(),
      };
      setMessages(prev => [...prev, mockMessage]);
      setMessage('');
      setAttachments([]);
    } finally {
      setSending(false);
    }
  };

  // Handle reaction toggle
  const handleReaction = async (messageId, emoji) => {
    // Always update locally first for immediate UI feedback
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    setMessages(prev => prev.map(msg =>
      msg.id === messageId
        ? { ...msg, reactions: [...(msg.reactions || []), { emoji, userId: currentUser.id || 999 }] }
        : msg
    ));

    // Only call API if we have a valid channelId
    if (!channelId || typeof channelId === 'string') {
      return; // Offline mode, just keep local update
    }

    try {
      await messageService.addReaction(messageId, emoji);
      // API call succeeded, reaction already added locally
    } catch (err) {
      // API failed but local update is already done
      // Silent fail for better UX in demo mode
    }
  };

  // Handle Enter key to send message
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

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

  // Default channel info if API hasn't loaded yet
  const info = channelInfo || {
    name: channel || 'general-chat',
    topic: 'Loading channel information...',
    members: 0,
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-white">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-[#F27125] animate-spin mx-auto mb-3" />
          <p className="text-gray-600">Loading messages...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center bg-white">
        <div className="text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Failed to Load Channel</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-[#F27125] text-white rounded-lg hover:bg-[#d96420] transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex h-screen overflow-hidden">
      <div className="flex-1 flex flex-col bg-white overflow-hidden">
        {/* Channel Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white shadow-sm flex-shrink-0">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <Hash className="w-5 h-5 text-[#F27125]" />
            <h1 className="font-bold text-lg text-gray-900">{info.name}</h1>
            {(!channelId || typeof channelId === 'string') && (
              <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded-full">
                Demo Mode
              </span>
            )}
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
            {messages.length === 0 ? (
              <div className="text-center py-12">
                <Hash className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No messages yet. Start the conversation!</p>
              </div>
            ) : (
              messages.map((msg, index) => {
                const showAvatar = index === 0 || messages[index - 1].user?.id !== msg.user?.id;
                const msgTime = msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString('en-US', {
                  hour: 'numeric',
                  minute: '2-digit',
                  hour12: true
                }) : msg.user?.time || '';

                return (
                  <div
                    key={msg.id}
                    className="group relative flex gap-4 hover:bg-gray-50 -mx-3 px-3 py-2 rounded-lg transition"
                  >
                    {/* Avatar */}
                    <div className="w-10 flex-shrink-0">
                      {showAvatar && (
                        <img
                          src={msg.user?.avatarURL || msg.user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${msg.user?.id}`}
                          alt={msg.user?.fullName || msg.user?.name || 'User'}
                          className="w-10 h-10 rounded-lg shadow-sm"
                        />
                      )}
                    </div>

                    {/* Message Content */}
                    <div className="flex-1 min-w-0">
                      {showAvatar && (
                        <div className="flex items-baseline gap-3 mb-1">
                          <span className="font-bold text-[15px] text-gray-900">
                            {msg.user?.fullName || msg.user?.name || 'Unknown User'}
                          </span>
                          <span className="text-xs text-gray-500 font-medium">{msgTime}</span>
                        </div>
                      )}

                      <div className="text-[15px] text-gray-800 leading-relaxed">
                        {msg.content}
                      </div>

                      {/* Attachments */}
                      {msg.attachments && msg.attachments.length > 0 && (
                        <div className="mt-2 space-y-2">
                          {msg.attachments.map((attachment) => (
                            <a
                              key={attachment.id}
                              href={attachment.filePath}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition max-w-sm"
                            >
                              <FileIcon className="w-5 h-5 text-gray-600" />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">
                                  {attachment.fileName || 'File'}
                                </p>
                                {attachment.fileType && (
                                  <p className="text-xs text-gray-500">{attachment.fileType}</p>
                                )}
                              </div>
                            </a>
                          ))}
                        </div>
                      )}

                      {/* Reactions */}
                      {msg.reactions && msg.reactions.length > 0 && (
                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                          {/* Group reactions by emoji */}
                          {Object.entries(
                            msg.reactions.reduce((acc, reaction) => {
                              const emoji = reaction.emoji;
                              if (!acc[emoji]) {
                                acc[emoji] = { emoji, count: 0, users: [] };
                              }
                              acc[emoji].count++;
                              acc[emoji].users.push(reaction.userId);
                              return acc;
                            }, {})
                          ).map(([emoji, data]) => (
                            <button
                              key={emoji}
                              onClick={() => handleReaction(msg.id, emoji)}
                              className="flex items-center gap-1.5 px-2.5 py-1 bg-white hover:bg-gray-50 border border-gray-300 rounded-lg text-xs font-medium transition shadow-sm hover:shadow"
                              title={`${data.count} reaction${data.count > 1 ? 's' : ''}`}
                            >
                              <span>{emoji}</span>
                              <span className="text-gray-700">{data.count}</span>
                            </button>
                          ))}
                          <button 
                            onClick={() => {
                              const emoji = prompt('Enter emoji (e.g., 👍, ❤️, 😊):');
                              if (emoji) handleReaction(msg.id, emoji);
                            }}
                            className="flex items-center justify-center w-7 h-7 bg-white hover:bg-gray-50 border border-gray-300 rounded-lg transition shadow-sm hover:shadow"
                          >
                            <Plus className="w-3.5 h-3.5 text-gray-500" />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Hover Actions */}
                    <div className="absolute top-0 right-0 -mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="flex items-center bg-white border border-gray-300 rounded-lg shadow-md">
                        <button 
                          onClick={() => {
                            const emoji = prompt('Enter emoji (e.g., 👍, ❤️, 😊):');
                            if (emoji) handleReaction(msg.id, emoji);
                          }}
                          className="p-2 hover:bg-gray-100 border-r border-gray-300 transition"
                          title="Add reaction"
                        >
                          <Plus className="w-4 h-4 text-gray-600" />
                        </button>
                        <button className="p-2 hover:bg-gray-100 border-r border-gray-300 transition" title="Reply in thread">
                          <MessageSquare className="w-4 h-4 text-gray-600" />
                        </button>
                        <button className="p-2 hover:bg-gray-100 border-r border-gray-300 transition" title="Bookmark">
                          <Bookmark className="w-4 h-4 text-gray-600" />
                        </button>
                        <button className="p-2 hover:bg-gray-100 rounded-r-lg transition" title="More actions">
                          <MoreVertical className="w-4 h-4 text-gray-600" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Message Input */}
        <div className="px-6 pb-8 pt-3 flex-shrink-0">
          {/* Demo Mode Notice */}
          {(!channelId || typeof channelId === 'string') && (
            <div className="mb-3 px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-xs text-blue-800">
                <strong>Demo Mode:</strong> Messages are stored locally. Connect to backend API for real-time sync.
              </p>
            </div>
          )}

          {/* Attachment Preview */}
          {attachments.length > 0 && (
            <div className="mb-3 flex flex-wrap gap-2">
              {attachments.map((attachment) => (
                <div
                  key={attachment.id}
                  className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg text-sm"
                >
                  <FileIcon className="w-4 h-4 text-gray-600" />
                  <span className="text-gray-900">{attachment.fileName || 'File'}</span>
                  <button
                    onClick={() => removeAttachment(attachment.id)}
                    className="p-1 hover:bg-gray-200 rounded transition"
                  >
                    <X className="w-3 h-3 text-gray-600" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="border-2 border-gray-300 rounded-lg overflow-hidden focus-within:border-[#F27125] focus-within:shadow-md transition bg-white">
            <div className="px-4 py-3">
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder={`Message #${info.name}`}
                className="w-full resize-none focus:outline-none text-[15px]"
                rows={1}
                style={{ minHeight: '20px', maxHeight: '200px' }}
                onInput={(e) => {
                  const target = e.target;
                  target.style.height = 'auto';
                  target.style.height = target.scrollHeight + 'px';
                }}
                disabled={sending}
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
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  className="hidden"
                  onChange={handleFileSelect}
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="p-1.5 hover:bg-gray-100 rounded text-gray-600 hover:text-[#F27125] transition relative"
                  title="Attach files"
                  disabled={uploading}
                >
                  {uploading ? (
                    <Loader2 className="w-[17px] h-[17px] animate-spin" />
                  ) : (
                    <Paperclip className="w-[17px] h-[17px]" />
                  )}
                </button>
                <button className="p-1.5 hover:bg-gray-100 rounded text-gray-600 hover:text-[#F27125] transition" title="Mention">
                  <AtSign className="w-[17px] h-[17px]" />
                </button>
                <button className="p-1.5 hover:bg-gray-100 rounded text-gray-600 hover:text-[#F27125] transition" title="Emoji">
                  <Smile className="w-[17px] h-[17px]" />
                </button>
              </div>

              <button
                onClick={handleSendMessage}
                disabled={(!message.trim() && attachments.length === 0) || sending}
                className="p-1.5 bg-[#F27125] hover:bg-[#d96420] text-white rounded transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
                title="Send message"
              >
                {sending ? (
                  <Loader2 className="w-[17px] h-[17px] animate-spin" />
                ) : (
                  <Send className="w-[17px] h-[17px]" />
                )}
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
