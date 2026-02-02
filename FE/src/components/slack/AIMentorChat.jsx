import { useState, useRef, useEffect } from 'react';
import {
  Hash,
  Star,
  Info,
  Users,
  Send,
  Sparkles,
  Code,
  Database,
  GitBranch,
  Bug,
  Loader2,
  MessageSquare,
  Brain
} from 'lucide-react';

const SUGGESTED_PROMPTS = [
  {
    icon: Code,
    title: "Code Review",
    prompt: "Can you review my React component and suggest improvements?"
  },
  {
    icon: Database,
    title: "Database Design",
    prompt: "Help me design a database schema for an e-commerce application"
  },
  {
    icon: GitBranch,
    title: "Git Workflow",
    prompt: "What's the best Git branching strategy for a team of 5 developers?"
  },
  {
    icon: Bug,
    title: "Debug Issue",
    prompt: "I'm getting a CORS error in my React app. How do I fix it?"
  }
];

export function AIMentorChat() {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [inputValue]);

  const handleSendMessage = async (content) => {
    if (!content.trim()) return;

    const userMessage = {
      id: Date.now(),
      role: 'user',
      content: content.trim(),
      timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const aiMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: getAIResponse(content),
        timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, aiMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const getAIResponse = (userInput) => {
    const input = userInput.toLowerCase();
    
    if (input.includes('react')) {
      return "I'd be happy to help with your React question! React is a powerful library for building user interfaces. Could you provide more specific details about what you're working on?\n\n• Are you facing an error?\n• Do you need help with state management?\n• Are you looking for best practices?\n\nThe more context you provide, the better I can assist you.";
    } else if (input.includes('database') || input.includes('sql')) {
      return "Great question about database design! Here are some key principles to consider:\n\n**1. Normalization:** Organize data to reduce redundancy\n**2. Relationships:** Define clear relationships between tables\n**3. Indexing:** Add indexes on frequently queried columns\n**4. Constraints:** Use foreign keys to maintain data integrity\n\nWould you like me to help you design a specific schema? Share your requirements!";
    } else if (input.includes('git')) {
      return "For a team of 5 developers, I recommend **GitHub Flow** strategy:\n\n• `main` branch is always deployable\n• Create feature branches from `main`\n• Use pull requests for code review\n• Merge to `main` after approval\n• Deploy immediately after merge\n\nThis is simpler than Git Flow and works great for continuous deployment. Want me to explain the workflow in more detail?";
    } else if (input.includes('cors')) {
      return "CORS errors are common! Here's how to fix it:\n\n**Backend Solution (Recommended):**\n```javascript\n// Express.js\nconst cors = require('cors');\napp.use(cors({\n  origin: 'http://localhost:3000',\n  credentials: true\n}));\n```\n\n**Development Proxy (React):**\nAdd to `package.json`:\n```json\n\"proxy\": \"http://localhost:5000\"\n```\n\nWhich backend framework are you using?";
    }
    
    return "Thank you for your question! I'm here to help with:\n\n✅ **Code Review & Best Practices**\n✅ **Architecture & Design Patterns**\n✅ **Debugging & Problem Solving**\n✅ **Database Design**\n✅ **Git & Version Control**\n✅ **Testing Strategies**\n\nCould you provide more details about what you need help with?";
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(inputValue);
    }
  };

  const handlePromptClick = (prompt) => {
    handleSendMessage(prompt);
  };

  return (
    <div className="flex-1 flex flex-col h-screen bg-white">
      {/* Channel Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white shadow-sm">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <Hash className="w-5 h-5 text-[#F27125]" />
          <h1 className="font-bold text-lg text-gray-900">ai-mentor-bot</h1>
          <button className="p-1.5 hover:bg-gray-100 rounded-lg transition">
            <Star className="w-5 h-5 text-gray-400 hover:text-[#F27125] transition" />
          </button>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-[#F27125] to-[#d96420] rounded-full">
            <Sparkles className="w-4 h-4 text-white" />
            <span className="text-sm font-medium text-white">AI Assistant</span>
          </div>
          <button className="p-2 hover:bg-gray-100 rounded-lg transition">
            <Info className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Channel Topic */}
      <div className="px-6 py-3 bg-gradient-to-r from-orange-50 to-amber-50 border-b border-orange-200">
        <p className="text-sm text-gray-700 leading-relaxed">
          🤖 Get help from our AI assistant. Ask questions about code, architecture, debugging, and best practices.
        </p>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        {messages.length === 0 ? (
          // Welcome State
          <div className="h-full flex flex-col items-center justify-center">
            <div className="w-16 h-16 bg-gradient-to-br from-[#F27125] to-[#d96420] rounded-2xl flex items-center justify-center mb-4 shadow-lg">
              <Brain className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">AI Mentor</h2>
            <p className="text-gray-600 text-center mb-8 max-w-md">
              Your intelligent assistant for software project success. Get instant answers and guidance.
            </p>

            {/* Suggested Prompts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-2xl">
              {SUGGESTED_PROMPTS.map((suggestion, index) => {
                const Icon = suggestion.icon;
                return (
                  <button
                    key={index}
                    onClick={() => handlePromptClick(suggestion.prompt)}
                    className="group p-4 bg-white border border-gray-200 rounded-xl hover:border-[#F27125] hover:shadow-md transition text-left"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-[#F27125] transition">
                        <Icon className="w-5 h-5 text-[#F27125] group-hover:text-white transition" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-1">{suggestion.title}</h3>
                        <p className="text-sm text-gray-600">{suggestion.prompt}</p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          // Chat Messages
          <div className="space-y-6 max-w-4xl mx-auto">
            {messages.map((message) => (
              <div
                key={message.id}
                className="flex gap-4"
              >
                {/* Avatar */}
                <div className="w-10 flex-shrink-0">
                  {message.role === 'assistant' ? (
                    <div className="w-10 h-10 bg-gradient-to-br from-[#F27125] to-[#d96420] rounded-lg flex items-center justify-center shadow-sm">
                      <Brain className="w-5 h-5 text-white" />
                    </div>
                  ) : (
                    <div className="w-10 h-10 bg-[#0054a6] rounded-lg flex items-center justify-center shadow-sm">
                      <MessageSquare className="w-5 h-5 text-white" />
                    </div>
                  )}
                </div>

                {/* Message Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-3 mb-1">
                    <span className="font-bold text-[15px] text-gray-900">
                      {message.role === 'assistant' ? 'AI Mentor' : 'You'}
                    </span>
                    <span className="text-xs text-gray-500 font-medium">{message.timestamp}</span>
                  </div>
                  
                  <div className="text-[15px] text-gray-800 leading-relaxed whitespace-pre-wrap">
                    {message.content}
                  </div>
                </div>
              </div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex gap-4">
                <div className="w-10 flex-shrink-0">
                  <div className="w-10 h-10 bg-gradient-to-br from-[#F27125] to-[#d96420] rounded-lg flex items-center justify-center shadow-sm">
                    <Brain className="w-5 h-5 text-white" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-3 mb-1">
                    <span className="font-bold text-[15px] text-gray-900">AI Mentor</span>
                  </div>
                  <div className="flex gap-1 py-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Message Input */}
      <div className="px-6 pb-8 pt-3">
        <div className="border-2 border-gray-300 rounded-lg overflow-hidden focus-within:border-[#F27125] focus-within:shadow-md transition bg-white">
          <div className="px-4 py-3">
            <textarea
              ref={textareaRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me anything about your project..."
              className="w-full resize-none focus:outline-none text-[15px]"
              rows={1}
              disabled={isTyping}
              style={{ minHeight: '24px', maxHeight: '200px' }}
            />
          </div>
          
          {/* Toolbar */}
          <div className="flex items-center justify-between px-3 py-2 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center gap-1">
              <Sparkles className="w-4 h-4 text-[#F27125]" />
              <span className="text-xs text-gray-600 font-medium">AI-powered responses</span>
            </div>
            
            <button
              onClick={() => handleSendMessage(inputValue)}
              disabled={!inputValue.trim() || isTyping}
              className="flex items-center gap-2 px-4 py-1.5 bg-[#F27125] hover:bg-[#d96420] text-white rounded-lg transition disabled:opacity-40 disabled:cursor-not-allowed font-medium text-sm"
              title="Send"
            >
              {isTyping ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Thinking...</span>
                </>
              ) : (
                <>
                  <span>Send</span>
                  <Send className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
        <p className="text-xs text-gray-500 text-center mt-2">
          AI Mentor can make mistakes. Consider checking important information.
        </p>
      </div>
    </div>
  );
}
