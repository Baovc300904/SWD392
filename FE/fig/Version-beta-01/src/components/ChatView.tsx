import { MessageCard } from './MessageCard';
import { MessageInput } from './MessageInput';

interface ChatViewProps {
  channel: string;
  onMessageSelect: (messageId: string | null) => void;
  selectedMessage: string | null;
}

const mockMessages = [
  {
    id: 'msg-1',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Student1',
    author: 'Nguyen Minh Anh',
    timestamp: '10:30 AM',
    title: 'How to implement JWT authentication in Spring Boot?',
    body: 'I\'m working on the authentication module for our project. Can someone explain the best practices for implementing JWT tokens with Spring Security?',
    isStudent: true,
  },
  {
    id: 'msg-2',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Student2',
    author: 'Tran Van Binh',
    timestamp: '11:15 AM',
    title: 'Database schema review needed',
    body: 'Could a mentor review our ER diagram? We have questions about normalizing the order and payment tables.',
    isStudent: true,
  },
  {
    id: 'msg-3',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Student3',
    author: 'Le Thi Cam',
    timestamp: '1:45 PM',
    title: 'React state management - Context vs Redux?',
    body: 'For a medium-sized e-commerce app, should we use Context API or should we set up Redux Toolkit? What are the trade-offs?',
    isStudent: true,
  },
  {
    id: 'msg-4',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Student4',
    author: 'Pham Duc Dung',
    timestamp: '2:20 PM',
    title: 'Git merge conflict help',
    body: 'Our team is stuck with a merge conflict in the main branch. Multiple members edited the same service file. What\'s the safest way to resolve this?',
    isStudent: true,
  },
];

export function ChatView({ channel, onMessageSelect, selectedMessage }: ChatViewProps) {
  const channelDescriptions: Record<string, string> = {
    '#se1705-qa': 'General Q&A for Spring 2026',
    '#se1709-qa': 'Questions and discussions for SE1709',
  };

  return (
    <div className="flex flex-col h-full">
      {/* Channel Header */}
      <div className="border-b border-gray-200 px-6 py-4">
        <div className="flex items-center gap-2">
          <h1 className="font-bold text-xl">{channel}</h1>
        </div>
        <p className="text-sm text-gray-600 mt-1">
          {channelDescriptions[channel] || 'Channel description'}
        </p>
      </div>

      {/* Message Feed */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {mockMessages.map((message) => (
          <MessageCard
            key={message.id}
            message={message}
            isSelected={selectedMessage === message.id}
            onSelect={() => onMessageSelect(message.id)}
          />
        ))}
      </div>

      {/* Message Input */}
      <MessageInput channel={channel} />
    </div>
  );
}
