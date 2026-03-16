import { useEffect, useState } from 'react';
import { Search, Plus, MessageSquare, ThumbsUp, Pin } from 'lucide-react';
import questionService from '../../services/question.service';
import authService from '../../services/auth.service';

export function QAForumView({ groupId }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [threads, setThreads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [newQuestion, setNewQuestion] = useState('');

  const currentUser = authService.getCurrentUser();
  const currentUserId = currentUser?.userId || currentUser?.id;
  const currentRole = String(currentUser?.role || '').toLowerCase();

  const getAvatarSrc = (thread) =>
    thread?.asker?.avatarURL || thread?.asker?.avatarUrl || thread?.asker?.avatar_url || '';

  const getInitials = (name) => String(name || 'U')
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  useEffect(() => {
    loadQuestions();
  }, [groupId]);

  const loadQuestions = async () => {
    try {
      setLoading(true);
      const response = await questionService.getAllQuestions(groupId ? { groupId } : {});
      const questions = Array.isArray(response?.data) ? response.data : Array.isArray(response) ? response : [];
      setThreads(questions);
    } catch (error) {
      console.error('Failed to load questions:', error);
      setThreads([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateQuestion = async () => {
    const content = newQuestion.trim();
    if (!content) return;
    if (!groupId) {
      alert('Không xác định được nhóm hiện tại để tạo câu hỏi.');
      return;
    }

    try {
      setPosting(true);
      await questionService.createQuestion({
        title: content.slice(0, 80),
        content,
        groupId
      });
      setNewQuestion('');
      loadQuestions();
    } catch (error) {
      alert(error?.message || 'Không thể tạo câu hỏi');
    } finally {
      setPosting(false);
    }
  };

  const filteredThreads = threads.filter(
    (thread) =>
      (thread.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (thread.content || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const canViewAnswer = (answer, thread) => {
    if (!answer) return false;
    if (answer.isPublic) return true;
    if (!currentUserId) return false;
    const answererId = answer.answeredBy || answer.answerer?.id;
    const askerId = thread?.askedBy || thread?.asker?.id;
    if (Number(answererId) === Number(currentUserId)) return true;
    if (Number(askerId) === Number(currentUserId)) return true;
    if (currentRole === 'lecturer' || currentRole === 'manager') return true;
    return false;
  };

  const visibleAnswers = (thread) => (Array.isArray(thread?.answers) ? thread.answers : []).filter((answer) => canViewAnswer(answer, thread));

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
          {loading && (
            <div className="text-center py-8 text-sm text-gray-500">Đang tải câu hỏi...</div>
          )}
          {filteredThreads.map((thread) => (
            <div
              key={thread.id}
              className="bg-white border border-gray-200 rounded-lg p-4 hover:border-gray-300 hover:shadow-sm cursor-pointer transition"
            >
              <div className="flex gap-3">
                {/* Avatar */}
                {getAvatarSrc(thread) ? (
                  <img
                    src={getAvatarSrc(thread)}
                    alt={thread.asker?.fullName || 'User'}
                    className="w-10 h-10 rounded object-cover flex-shrink-0"
                  />
                ) : (
                  <div className="w-10 h-10 rounded flex-shrink-0 bg-[#F27125]/10 text-[#F27125] font-semibold text-xs flex items-center justify-center">
                    {getInitials(thread.asker?.fullName || thread.asker?.name)}
                  </div>
                )}

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

                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{thread.content}</p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1.5">
                        <MessageSquare className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">{visibleAnswers(thread).length} replies</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <ThumbsUp className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">{thread.status === 'RESOLVED' ? 1 : 0}</span>
                      </div>
                      <span className="text-sm text-gray-500">{new Date(thread.createdAt).toLocaleString()}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">
                        {thread.status || 'WAITING_LECTURER'}
                      </span>
                    </div>
                  </div>

                  {visibleAnswers(thread).length > 0 && (
                    <div className="mt-3 border-t border-gray-100 pt-3 space-y-2">
                      {visibleAnswers(thread).map((answer) => (
                        <div key={answer.id} className="bg-gray-50 rounded-lg px-3 py-2">
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <span className="text-xs font-semibold text-gray-700">{answer.answerer?.fullName || 'Lecturer'}</span>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full ${answer.isPublic ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                              {answer.isPublic ? 'Public' : 'Private'}
                            </span>
                          </div>
                          <p className="text-sm text-gray-700 whitespace-pre-wrap">{answer.content}</p>
                        </div>
                      ))}
                    </div>
                  )}
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
              value={newQuestion}
              onChange={(e) => setNewQuestion(e.target.value)}
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
              <button
                onClick={handleCreateQuestion}
                disabled={posting}
                className="bg-[#F27125] hover:bg-[#d96420] text-white px-4 py-1.5 rounded text-sm font-medium transition disabled:opacity-60"
              >
                {posting ? 'Posting...' : 'Post'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


