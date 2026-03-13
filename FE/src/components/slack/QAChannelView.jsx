import { useEffect, useMemo, useState } from 'react';
import {
  Hash,
  Star,
  Info,
  MessageSquare,
  Search,
  SlidersHorizontal,
  Loader2,
  Plus,
} from 'lucide-react';
import questionService from '../../services/question.service';
import authService from '../../services/auth.service';

export function QAChannelView({ groupId }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [newQuestionTitle, setNewQuestionTitle] = useState('');
  const [newQuestion, setNewQuestion] = useState('');
  const [posting, setPosting] = useState(false);

  const currentUser = authService.getCurrentUser();
  const currentUserId = currentUser?.userId || currentUser?.id;
  const currentRole = String(currentUser?.role || '').toLowerCase();

  const loadQuestions = async () => {
    try {
      setLoading(true);
      const filters = groupId ? { groupId } : {};
      const response = await questionService.getAllQuestions(filters);
      const list = Array.isArray(response?.data) ? response.data : Array.isArray(response) ? response : [];
      setQuestions(list);
    } catch (error) {
      console.error('Failed to load Q&A questions:', error);
      setQuestions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQuestions();
  }, [groupId]);

  const filteredQuestions = useMemo(() => {
    return questions.filter((q) => {
      const keyword = searchTerm.toLowerCase();
      const matchesSearch =
        (q.title || '').toLowerCase().includes(keyword)
        || (q.content || '').toLowerCase().includes(keyword)
        || (q.asker?.fullName || '').toLowerCase().includes(keyword);

      const matchesStatus =
        statusFilter === 'ALL'
        || (statusFilter === 'RESOLVED' && q.status === 'RESOLVED')
        || (statusFilter === 'PENDING' && q.status !== 'RESOLVED');

      return matchesSearch && matchesStatus;
    });
  }, [questions, searchTerm, statusFilter]);

  const canViewAnswer = (answer, question) => {
    if (!answer) return false;
    if (answer.isPublic) return true;
    if (!currentUserId) return false;
    const answererId = answer.answeredBy || answer.answerer?.id;
    const askerId = question?.askedBy || question?.asker?.id;
    if (Number(answererId) === Number(currentUserId)) return true;
    if (Number(askerId) === Number(currentUserId)) return true;
    if (currentRole === 'lecturer' || currentRole === 'manager') return true;
    return false;
  };

  const getVisibleAnswers = (question) => (Array.isArray(question?.answers) ? question.answers : []).filter((answer) => canViewAnswer(answer, question));

  const handleCreateQuestion = async () => {
    const title = newQuestionTitle.trim();
    const content = newQuestion.trim();
    if (!title || !content) return;
    if (!groupId) {
      alert('Không xác định được group hiện tại để tạo câu hỏi.');
      return;
    }

    try {
      setPosting(true);
      await questionService.createQuestion({
        title: title.slice(0, 120),
        content,
        groupId,
        askedBy: currentUser?.userId || currentUser?.id,
      });
      setNewQuestionTitle('');
      setNewQuestion('');
      await loadQuestions();
    } catch (error) {
      alert(error?.message || 'Không thể tạo câu hỏi');
    } finally {
      setPosting(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-screen bg-gray-50">
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white shadow-sm">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <Hash className="w-5 h-5 text-[#F27125]" />
          <h1 className="font-bold text-lg text-gray-900">q&a-support</h1>
          <button className="p-1.5 hover:bg-gray-100 rounded-lg transition">
            <Star className="w-5 h-5 text-gray-400 hover:text-[#F27125] transition" />
          </button>
        </div>
        <button className="p-2 hover:bg-gray-100 rounded-lg transition">
          <Info className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      <div className="px-6 py-4 bg-white border-b border-gray-200 space-y-3">
        <div className="flex items-center gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search questions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-[#F27125] focus:ring-2 focus:ring-[#F27125]/20 transition"
            />
          </div>
          <div className="flex items-center gap-2 px-3 py-2.5 bg-white border-2 border-gray-300 rounded-lg">
            <SlidersHorizontal className="w-4 h-4 text-gray-500" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-sm font-medium text-gray-700 bg-transparent outline-none"
            >
              <option value="ALL">All</option>
              <option value="PENDING">Pending</option>
              <option value="RESOLVED">Resolved</option>
            </select>
          </div>
        </div>

        {!groupId && (
          <div className="px-3 py-2 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
            Chưa có group để tạo câu hỏi. Vui lòng chọn đúng nhóm trước khi đăng câu hỏi.
          </div>
        )}

        <div className="space-y-2">
          <input
            value={newQuestionTitle}
            onChange={(e) => setNewQuestionTitle(e.target.value)}
            placeholder="Tiêu đề câu hỏi..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            disabled={!groupId || posting}
          />
          <div className="flex gap-2">
            <textarea
            value={newQuestion}
            onChange={(e) => setNewQuestion(e.target.value)}
              placeholder="Mô tả chi tiết câu hỏi của bạn..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none"
              rows={2}
              disabled={!groupId || posting}
            />
            <button
              onClick={handleCreateQuestion}
              disabled={posting || !groupId || !newQuestionTitle.trim() || !newQuestion.trim()}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-[#F27125] text-white rounded-lg text-sm font-semibold disabled:opacity-60 self-end"
            >
              <Plus className="w-4 h-4" />
              {posting ? 'Đang tạo...' : 'Tạo câu hỏi'}
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-6">
        {loading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="w-7 h-7 text-[#F27125] animate-spin" />
          </div>
        ) : filteredQuestions.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <MessageSquare className="w-10 h-10 mx-auto mb-2 text-gray-300" />
            Chưa có câu hỏi nào.
          </div>
        ) : (
          <div className="space-y-4">
            {filteredQuestions.map((q) => (
              <div
                key={q.id}
                className="bg-white border border-gray-200 rounded-lg p-6 hover:border-[#F27125] hover:shadow-md transition"
              >
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div>
                    <h3 className="font-bold text-gray-900">{q.title}</h3>
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">{q.content}</p>
                  </div>
                  <div className={`px-3 py-1 rounded-lg text-xs font-bold ${q.status === 'RESOLVED' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                    {q.status === 'RESOLVED' ? 'Resolved' : q.status || 'WAITING'}
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div>
                    {q.asker?.fullName || 'Unknown'} • {new Date(q.createdAt).toLocaleString()}
                  </div>
                  <div className="font-medium">{getVisibleAnswers(q).length} answers</div>
                </div>

                {getVisibleAnswers(q).length > 0 && (
                  <div className="mt-3 border-t border-gray-100 pt-3 space-y-2">
                    {getVisibleAnswers(q).map((answer) => (
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
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
