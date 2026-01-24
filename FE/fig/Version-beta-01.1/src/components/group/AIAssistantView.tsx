import { useState } from 'react';
import { Send, Sparkles } from 'lucide-react';

export function AIAssistantView() {
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([]);
  const [input, setInput] = useState('');

  const suggestions = [
    { icon: '📚', text: 'Summarize syllabus', category: 'Documentation' },
    { icon: '🐛', text: 'Find React bugs', category: 'Debugging' },
    { icon: '💡', text: 'Suggest architecture', category: 'Design' },
    { icon: '✅', text: 'Review my code', category: 'Code Review' },
    { icon: '🎨', text: 'UI best practices', category: 'Design' },
    { icon: '🔒', text: 'Security checklist', category: 'Security' },
  ];

  const handleSendMessage = () => {
    if (!input.trim()) return;

    const userMessage = input;
    setMessages([...messages, { role: 'user', content: userMessage }]);
    setInput('');

    // Simulate AI response
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `I understand you're asking about "${userMessage}". Based on your course syllabus and best practices, here's what I recommend...`,
        },
      ]);
    }, 1000);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
  };

  return (
    <div className="flex-1 flex flex-col h-screen bg-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-[#F27125] to-[#d96420] rounded-lg flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900"># 🤖 ai-assistant</h1>
            <p className="text-sm text-gray-600">Your intelligent project companion</p>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto">
        {messages.length === 0 ? (
          /* Empty State */
          <div className="h-full flex flex-col items-center justify-center p-6">
            <div className="w-20 h-20 bg-gradient-to-br from-[#F27125] to-[#d96420] rounded-2xl flex items-center justify-center mb-6 shadow-lg">
              <Sparkles className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">AI Support</h2>
            <p className="text-gray-600 text-center mb-8 max-w-md">
              Get instant help with your project. Ask questions about your syllabus, code, or best practices.
            </p>

            {/* Suggestion Chips */}
            <div className="grid grid-cols-2 gap-3 max-w-2xl w-full">
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(suggestion.text)}
                  className="flex items-center gap-3 p-4 bg-white border border-gray-200 rounded-xl hover:border-[#F27125] hover:shadow-md transition text-left"
                >
                  <span className="text-2xl">{suggestion.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 text-sm">{suggestion.text}</div>
                    <div className="text-xs text-gray-500">{suggestion.category}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* Chat Messages */
          <div className="max-w-3xl mx-auto p-6 space-y-6">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
              >
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    message.role === 'user'
                      ? 'bg-[#0054a6]'
                      : 'bg-gradient-to-br from-[#F27125] to-[#d96420]'
                  }`}
                >
                  {message.role === 'user' ? (
                    <span className="text-white font-semibold text-sm">U</span>
                  ) : (
                    <Sparkles className="w-4 h-4 text-white" />
                  )}
                </div>
                <div
                  className={`flex-1 px-4 py-3 rounded-lg ${
                    message.role === 'user'
                      ? 'bg-[#0054a6] text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <p className="text-sm leading-relaxed">{message.content}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-200 p-4 bg-white">
        <div className="max-w-3xl mx-auto flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Ask anything about your project..."
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F27125] focus:border-transparent"
          />
          <button
            onClick={handleSendMessage}
            disabled={!input.trim()}
            className="flex items-center gap-2 bg-[#F27125] hover:bg-[#d96420] text-white px-6 py-3 rounded-lg font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4" />
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
