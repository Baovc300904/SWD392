import { Bold, Italic, Code, Sparkles, Send } from 'lucide-react';
import { useState } from 'react';

export function MessageInput({ channel }) {
  const [message, setMessage] = useState('');
  const [isPublic, setIsPublic] = useState(true);

  const handleSend = () => {
    if (message.trim()) {
      console.log('Sending message:', message);
      setMessage('');
    }
  };

  return (
    <div className="border-t border-gray-200 p-4 bg-white">
      <div className="max-w-4xl mx-auto">
        {/* Toolbar */}
        <div className="flex items-center gap-2 mb-2">
          <div className="flex items-center gap-1">
            <button className="p-2 hover:bg-gray-100 rounded transition" title="Bold">
              <Bold className="w-4 h-4 text-gray-600" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded transition" title="Italic">
              <Italic className="w-4 h-4 text-gray-600" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded transition" title="Code Block">
              <Code className="w-4 h-4 text-gray-600" />
            </button>
          </div>

          <div className="h-5 w-px bg-gray-300 mx-1" />

          <button className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded transition">
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-medium">AI Suggest</span>
          </button>

          <div className="ml-auto flex items-center gap-2">
            <div className="flex items-center gap-2 bg-gray-100 rounded-full p-1">
              <button
                onClick={() => setIsPublic(true)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition ${
                  isPublic
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Public
              </button>
              <button
                onClick={() => setIsPublic(false)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition ${
                  !isPublic
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Private
              </button>
            </div>
          </div>
        </div>

        {/* Input Area */}
        <div className="flex items-end gap-2">
          <div className="flex-1 bg-gray-50 border border-gray-200 rounded-lg focus-within:border-[#0054a6] focus-within:ring-2 focus-within:ring-[#0054a6]/20 transition">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={`Message ${channel}`}
              className="w-full bg-transparent px-4 py-3 resize-none outline-none text-sm"
              rows={3}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
            />
          </div>

          <button
            onClick={handleSend}
            disabled={!message.trim()}
            className="bg-[#F27125] hover:bg-[#d96420] disabled:bg-gray-300 disabled:cursor-not-allowed text-white p-3 rounded-lg transition flex-shrink-0"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-gray-500 mt-2">
          <kbd className="px-1.5 py-0.5 bg-gray-100 border border-gray-300 rounded text-xs">
            Enter
          </kbd>{' '}
          to send,{' '}
          <kbd className="px-1.5 py-0.5 bg-gray-100 border border-gray-300 rounded text-xs">
            Shift + Enter
          </kbd>{' '}
          for new line
        </p>
      </div>
    </div>
  );
}


