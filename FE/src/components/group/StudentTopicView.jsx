import { useEffect, useMemo, useState } from 'react';
import {
  BookOpen,
  CheckCircle2,
  Loader2,
  RefreshCw,
  AlertCircle,
  Link2,
  Sparkles
} from 'lucide-react';
import { toast } from 'sonner';
import topicService from '../../services/topic.service';
import groupService from '../../services/group.service';

const toArray = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
};

export function StudentTopicView({ groupId }) {
  const [group, setGroup] = useState(null);
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submittingId, setSubmittingId] = useState(null);

  const loadData = async () => {
    if (!groupId) {
      setGroup(null);
      setTopics([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const [groupData, topicsData] = await Promise.all([
        groupService.getGroupById(groupId),
        topicService.getAllTopics({ status: 'APPROVED' })
      ]);

      setGroup(groupData);
      setTopics(toArray(topicsData));
    } catch (error) {
      console.error('Failed to load topic data:', error);
      toast.error(error?.message || 'Không thể tải danh sách đề tài');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [groupId]);

  const selectedTopicId = group?.topic?.id || group?.topicId;
  const selectedTopic = useMemo(
    () => topics.find((topic) => Number(topic.id) === Number(selectedTopicId)) || group?.topic || null,
    [topics, selectedTopicId, group]
  );

  const handleRegisterTopic = async (topicId) => {
    try {
      setSubmittingId(topicId);
      await topicService.registerTopicForGroup(topicId, groupId);
      toast.success('Đăng ký đề tài thành công');
      await loadData();
    } catch (error) {
      console.error('Failed to register topic:', error);
      toast.error(error?.message || 'Không thể đăng ký đề tài');
    } finally {
      setSubmittingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <Loader2 className="w-8 h-8 text-[#F27125] animate-spin mb-3" />
        <p className="text-gray-500 text-sm">Đang tải đề tài...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Đề tài của nhóm</h2>
          <p className="text-gray-500 text-sm mt-1">Sinh viên chỉ được chọn từ danh sách đề tài đã được duyệt.</p>
        </div>
        <button
          onClick={loadData}
          className="inline-flex items-center gap-2 px-3 py-2 text-sm text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg"
        >
          <RefreshCw className="w-4 h-4" /> Làm mới
        </button>
      </div>

      {selectedTopic ? (
        <div className="rounded-2xl border border-green-200 bg-green-50 p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-green-100 text-green-700 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 flex-wrap mb-2">
                <h3 className="text-xl font-bold text-gray-900">{selectedTopic.title}</h3>
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white text-green-700 border border-green-200">
                  APPROVED
                </span>
              </div>
              <p className="text-sm text-gray-700 leading-relaxed">{selectedTopic.description || 'Không có mô tả.'}</p>
              {selectedTopic.descriptionFile && (
                <a
                  href={selectedTopic.descriptionFile}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 mt-4 text-sm text-blue-600 hover:underline"
                >
                  <Link2 className="w-4 h-4" /> Xem file mô tả
                </a>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center">
          <Sparkles className="w-14 h-14 text-[#F27125] mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-800">Nhóm chưa đăng ký đề tài</h3>
          <p className="text-sm text-gray-500 mt-2">Hãy chọn một đề tài đã được giảng viên và manager duyệt ở danh sách bên dưới.</p>
        </div>
      )}

      <div className="space-y-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-gray-700 uppercase tracking-wide">
          <BookOpen className="w-4 h-4 text-[#F27125]" />
          Danh sách đề tài đã duyệt
        </div>

        {topics.length === 0 ? (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 flex items-start gap-3 text-amber-800">
            <AlertCircle className="w-5 h-5 mt-0.5" />
            <div>
              <div className="font-semibold">Chưa có đề tài được duyệt</div>
              <p className="text-sm mt-1">Hiện chưa có đề tài nào sẵn sàng để nhóm đăng ký.</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {topics.map((topic) => {
              const isSelected = Number(topic.id) === Number(selectedTopicId);
              return (
                <div key={topic.id} className={`rounded-2xl border p-5 transition ${isSelected ? 'border-green-300 bg-green-50' : 'border-gray-200 bg-white hover:shadow-sm'}`}>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <h4 className="font-bold text-gray-900 leading-snug">{topic.title}</h4>
                      <p className="text-xs text-gray-500 mt-1">Đề xuất bởi {topic.proposer?.fullName || 'Lecturer'}</p>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-green-100 text-green-700">
                      APPROVED
                    </span>
                  </div>

                  <p className="text-sm text-gray-600 leading-relaxed min-h-[72px]">{topic.description || 'Không có mô tả.'}</p>

                  <div className="mt-4 flex items-center justify-between gap-3">
                    {topic.descriptionFile ? (
                      <a
                        href={topic.descriptionFile}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-600 hover:underline inline-flex items-center gap-1.5"
                      >
                        <Link2 className="w-3.5 h-3.5" /> File mô tả
                      </a>
                    ) : <span />}

                    {isSelected ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold bg-green-600 text-white">
                        <CheckCircle2 className="w-4 h-4" /> Đã đăng ký
                      </span>
                    ) : (
                      <button
                        onClick={() => handleRegisterTopic(topic.id)}
                        disabled={Boolean(selectedTopicId) || submittingId === topic.id}
                        className="px-4 py-2 rounded-lg text-sm font-semibold bg-[#F27125] hover:bg-[#d96420] text-white disabled:opacity-60"
                      >
                        {submittingId === topic.id ? 'Đang đăng ký...' : 'Chọn đề tài'}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
