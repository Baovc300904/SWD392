import { useState, useEffect } from 'react';
import { Search, Filter, ChevronDown, AlertTriangle, MessageSquare, Send, Sparkles } from 'lucide-react';
import questionService from '../../services/question.service';
import authService from '../../services/auth.service';

/**
 * Q&A Tickets Management View
 * Display and manage student questions
 */
export function QAManagementView({ initialStatusFilter = 'ALL' }) {
  const currentUser = authService.getCurrentUser();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [answer, setAnswer] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [escalatingId, setEscalatingId] = useState(null);
  const [aiLoadingId, setAiLoadingId] = useState(null);

  useEffect(() => {
    loadQuestions();
  }, []);

  useEffect(() => {
    setStatusFilter(initialStatusFilter || 'ALL');
  }, [initialStatusFilter]);

  const loadQuestions = async () => {
    try {
      setLoading(true);
      const response = await questionService.getAllQuestions({ lecturerId: currentUser?.userId || currentUser?.id });
      setQuestions(Array.isArray(response?.data) ? response.data : Array.isArray(response) ? response : []);
    } catch (error) {
      console.error('Failed to load questions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSubmit = async (questionId) => {
    if (!answer.trim()) {
      alert('Vui lòng nhập câu trả lời');
      return;
    }

    try {
      setSubmitting(true);
      await questionService.answerQuestion(questionId, {
        content: answer,
        isPublic,
        markAsResolved: true
      });
      setAnswer('');
      setIsPublic(false);
      setSelectedQuestion(null);
      loadQuestions();
    } catch (error) {
      console.error('Failed to submit answer:', error);
      alert('Lỗi khi gửi câu trả lời: ' + (error.message || 'Unknown error'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleEscalate = async (questionId) => {
    try {
      setEscalatingId(questionId);
      await questionService.escalateQuestion(questionId);
      loadQuestions();
    } catch (error) {
      alert('Lỗi khi chuyển cấp câu hỏi: ' + (error.message || 'Unknown error'));
    } finally {
      setEscalatingId(null);
    }
  };

  const handleAskAI = async (questionId) => {
    const selected = questions.find((item) => item.id === questionId);

    try {
      setAiLoadingId(questionId);
      const response = await questionService.askAI(questionId);
      const aiText = response?.data?.draft || response?.draft || '';
      if (!aiText) {
        alert('AI không tạo được bản nháp.');
        return;
      }
      setAnswer(aiText);
      setSelectedQuestion(selected || null);
    } catch (error) {
      alert('Không thể tạo bản nháp AI: ' + (error?.message || 'Unknown error'));
    } finally {
      setAiLoadingId(null);
    }
  };

  const filteredQuestions = questions.filter(question => {
    const matchesSearch =
      question.content?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      question.title?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || 
                         (statusFilter === 'UNANSWERED' && question.status === 'WAITING_LECTURER') ||
                         (statusFilter === 'ANSWERED' && question.status === 'RESOLVED') ||
                         (statusFilter === 'ESCALATED' && question.status === 'ESCALATED_TO_MANAGER');
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (question) => {
    if (question.status === 'ESCALATED_TO_MANAGER') {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200">
          <AlertTriangle className="w-3 h-3" />
          ESCALATED
        </span>
      );
    }
    if (question.status === 'WAITING_LECTURER') {
      return (
        <span className="inline-flex px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 border border-gray-300">
          WAITING
        </span>
      );
    }
    return (
      <span className="inline-flex px-3 py-1 rounded-full text-xs font-semibold bg-green-50 text-green-700 border border-green-200">
        ANSWERED
      </span>
    );
  };

  return (
    <div className="flex-1 bg-[#F3F4F6] overflow-auto">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-6">
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-gray-900">Quản lý Hỏi đáp</h1>
          <p className="text-sm text-gray-600 mt-1">Trả lời câu hỏi của sinh viên</p>
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm câu hỏi..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
            />
          </div>

          {/* Filter */}
          <div className="relative">
            <button
              onClick={() => setShowFilterDropdown(!showFilterDropdown)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Filter className="w-4 h-4" />
              <span className="text-sm font-medium">
                {statusFilter === 'ALL' ? 'Tất cả' : 
                 statusFilter === 'ESCALATED' ? 'Escalated' :
                 statusFilter === 'UNANSWERED' ? 'Chưa trả lời' : 'Đã trả lời'}
              </span>
              <ChevronDown className="w-4 h-4" />
            </button>
            
            {showFilterDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                {[
                  { value: 'ALL', label: 'Tất cả' },
                  { value: 'UNANSWERED', label: 'Chưa trả lời' },
                  { value: 'ANSWERED', label: 'Đã trả lời' }
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      setStatusFilter(option.value);
                      setShowFilterDropdown(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 transition-colors"
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="px-8 py-6">
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Tiêu đề</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Người hỏi</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Trạng thái</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                      Đang tải...
                    </td>
                  </tr>
                ) : filteredQuestions.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                      Không tìm thấy câu hỏi nào
                    </td>
                  </tr>
                ) : (
                  filteredQuestions.map((question) => (
                    <tr key={question.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900 font-mono">
                        #{question.id}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{question.title}</div>
                        <div className="text-sm text-gray-500 truncate max-w-md">
                          {question.content}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {question.asker?.fullName || 'N/A'}
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(question)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleAskAI(question.id)}
                            disabled={aiLoadingId === question.id}
                            className="flex items-center gap-1 px-3 py-2 border border-indigo-200 text-indigo-700 hover:bg-indigo-50 text-xs font-medium rounded-lg transition-colors"
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                              {aiLoadingId === question.id ? 'Đang tạo nháp' : 'Tạo nháp AI'}
                          </button>
                          {question.status === 'WAITING_LECTURER' && (
                            <button
                              onClick={() => handleEscalate(question.id)}
                              disabled={escalatingId === question.id}
                              className="flex items-center gap-1 px-3 py-2 border border-red-200 text-red-700 hover:bg-red-50 text-xs font-medium rounded-lg transition-colors"
                            >
                              <AlertTriangle className="w-3.5 h-3.5" />
                              {escalatingId === question.id ? 'Đang chuyển' : 'Escalate'}
                            </button>
                          )}
                          <button
                            onClick={() => {
                              setSelectedQuestion(question);
                              setAnswer('');
                            }}
                            className="flex items-center gap-2 px-4 py-2 bg-[#F27125] hover:bg-[#d96420] text-white text-sm font-medium rounded-lg transition-colors shadow-md"
                          >
                            <MessageSquare className="w-4 h-4" />
                            Trả lời
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Answer Modal */}
      {selectedQuestion && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-900">Trả lời câu hỏi #{selectedQuestion.id}</h3>
            </div>
            
            <div className="p-6">
              <div className="mb-4">
                <label className="text-sm font-semibold text-gray-700 mb-2 block">Câu hỏi:</label>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-gray-900">{selectedQuestion.content}</p>
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700 mb-2 block">Câu trả lời của bạn:</label>
                <textarea
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  placeholder="Nhập câu trả lời..."
                  rows="6"
                  className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                />
                <label className="mt-3 inline-flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={isPublic}
                    onChange={(e) => setIsPublic(e.target.checked)}
                  />
                  Public (mọi sinh viên đều xem được)
                </label>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex items-center justify-end gap-3">
              <button
                onClick={() => {
                  setSelectedQuestion(null);
                  setAnswer('');
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={() => handleAnswerSubmit(selectedQuestion.id)}
                disabled={submitting}
                className="flex items-center gap-2 px-4 py-2 bg-[#F27125] hover:bg-[#d96420] text-white rounded-lg transition-colors shadow-md"
              >
                <Send className="w-4 h-4" />
                {submitting ? 'Đang gửi...' : 'Gửi câu trả lời'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
