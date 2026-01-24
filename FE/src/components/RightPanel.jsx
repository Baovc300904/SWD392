import { Sparkles, Check, X } from 'lucide-react';

export function RightPanel({ selectedMessage }) {
  if (!selectedMessage) {
    return (
      <div className="w-80 border-l border-gray-200 bg-gray-50 flex items-center justify-center p-6">
        <div className="text-center">
          <Sparkles className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-sm text-gray-600">
            Select a message to see AI-generated suggestions
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-80 border-l border-gray-200 bg-white flex flex-col">
      {/* Header */}
      <div className="border-b border-gray-200 p-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-600" />
          <h2 className="font-semibold text-gray-900">AI Assistant & Drafts</h2>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* AI Suggestion Card */}
        <div className="bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="bg-purple-600 p-1.5 rounded">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-semibold text-gray-900">
              Suggested Answer
            </span>
            <span className="text-xs text-purple-600 bg-purple-100 px-2 py-0.5 rounded-full ml-auto">
              Based on syllabus
            </span>
          </div>

          <div className="bg-white rounded-lg p-3 mb-3 text-sm text-gray-700 leading-relaxed border border-purple-100">
            <p className="mb-2">
              For JWT authentication in Spring Boot, I recommend the following approach:
            </p>
            <ol className="list-decimal list-inside space-y-1 text-sm">
              <li>Add Spring Security and JWT dependencies to your pom.xml</li>
              <li>Create a JwtTokenProvider class to handle token generation and validation</li>
              <li>Implement a custom filter to intercept requests and validate tokens</li>
              <li>Configure SecurityConfig to use your JWT filter</li>
            </ol>
            <p className="mt-2">
              Refer to Week 5 lecture materials (Spring Security module) for detailed implementation examples.
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <button className="flex-1 flex items-center justify-center gap-2 bg-[#0054a6] hover:bg-[#003d7a] text-white px-4 py-2 rounded-lg transition font-medium text-sm">
              <Check className="w-4 h-4" />
              Insert to Reply
            </button>
            <button className="px-4 py-2 bg-white hover:bg-gray-100 border border-gray-300 rounded-lg transition text-sm text-gray-700">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="text-xs font-semibold text-blue-900 mb-2">
            Related Resources
          </h3>
          <ul className="space-y-1.5">
            <li className="text-xs text-blue-700 hover:underline cursor-pointer">
              📄 Week 5: Spring Security Guide
            </li>
            <li className="text-xs text-blue-700 hover:underline cursor-pointer">
              📄 JWT Best Practices Documentation
            </li>
            <li className="text-xs text-blue-700 hover:underline cursor-pointer">
              🎥 Video Tutorial: Authentication Flow
            </li>
          </ul>
        </div>

        {/* Draft History */}
        <div className="mt-4">
          <h3 className="text-xs font-semibold text-gray-700 mb-2 uppercase">
            Previous Drafts
          </h3>
          <div className="space-y-2">
            <div className="p-2 bg-gray-50 rounded border border-gray-200 cursor-pointer hover:bg-gray-100 transition">
              <p className="text-xs text-gray-600 truncate">
                Draft from 2 hours ago...
              </p>
            </div>
            <div className="p-2 bg-gray-50 rounded border border-gray-200 cursor-pointer hover:bg-gray-100 transition">
              <p className="text-xs text-gray-600 truncate">
                Draft from yesterday...
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


