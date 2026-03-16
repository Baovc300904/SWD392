import { useEffect, useMemo, useRef, useState } from 'react';
import authService from '../services/auth.service';
import questionService from '../services/question.service';
import topicService from '../services/topic.service';
import classService from '../services/class.service';
import { submissionService } from '../services/app.service';

const POLL_INTERVAL = 60_000;

const toArray = (payload) => {
  if (Array.isArray(payload?.data?.data)) return payload.data.data;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload)) return payload;
  return [];
};

const normalizeStatus = (status) => String(status || '').toUpperCase();

const notifyBrowser = (item) => {
  if (typeof window === 'undefined' || !('Notification' in window)) return;
  if (window.Notification.permission !== 'granted') return;
  try {
    const notification = new window.Notification(item.title, { body: item.body });
    setTimeout(() => notification.close(), 5000);
  } catch {
    // Ignore browser notification failures.
  }
};

export function usePortalNotifications(role) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const previousCountsRef = useRef({});
  const initializedRef = useRef(false);

  const fetchNotifications = async () => {
    const currentUser = authService.getCurrentUser();
    const userId = currentUser?.userId || currentUser?.id;

    if (!currentUser?.token || !userId || !['lecturer', 'manager'].includes(role)) {
      setNotifications([]);
      setLoading(false);
      return;
    }

    try {
      const nextNotifications = [];

      if (role === 'lecturer') {
        const [questionsRes, topicsRes, classesRes, submissionsRes] = await Promise.all([
          questionService.getAllQuestions({ lecturerId: userId }),
          topicService.getAllTopics({ lecturerId: userId }),
          classService.getAllClasses({ lecturerId: userId }),
          submissionService.getAllSubmissions({ limit: 100 })
        ]);

        const questions = toArray(questionsRes);
        const topics = toArray(topicsRes);
        const classes = toArray(classesRes);
        const allowedClassIds = new Set(classes.map((item) => Number(item.id)));
        const submissions = toArray(submissionsRes).filter((item) =>
          allowedClassIds.has(Number(item.group?.class?.id || item.group?.classId))
        );

        const unansweredCount = questions.filter((item) => normalizeStatus(item.status) === 'WAITING_LECTURER').length;
        const escalatedCount = questions.filter((item) => normalizeStatus(item.status) === 'ESCALATED_TO_MANAGER').length;
        const pendingTopicsCount = topics.filter((item) => normalizeStatus(item.status) === 'PENDING').length;
        const ungradedCount = submissions.filter((item) => normalizeStatus(item.status) !== 'GRADED').length;

        if (unansweredCount > 0) {
          nextNotifications.push({
            id: 'lecturer-unanswered',
            title: 'Câu hỏi chưa trả lời',
            body: `Bạn còn ${unansweredCount} câu hỏi đang chờ phản hồi.`,
            count: unansweredCount,
            targetView: 'qa',
            targetFilter: 'UNANSWERED'
          });
        }

        if (escalatedCount > 0) {
          nextNotifications.push({
            id: 'lecturer-escalated',
            title: 'Câu hỏi đã escalate',
            body: `${escalatedCount} câu hỏi đã được chuyển cấp cần theo dõi.`,
            count: escalatedCount,
            targetView: 'qa',
            targetFilter: 'ESCALATED'
          });
        }

        if (pendingTopicsCount > 0) {
          nextNotifications.push({
            id: 'lecturer-topics',
            title: 'Đề tài đang chờ duyệt',
            body: `${pendingTopicsCount} đề tài của giảng viên vẫn đang ở trạng thái chờ duyệt.`,
            count: pendingTopicsCount,
            targetView: 'topics',
            targetFilter: 'PENDING'
          });
        }

        if (ungradedCount > 0) {
          nextNotifications.push({
            id: 'lecturer-submissions',
            title: 'Submission chưa chấm',
            body: `${ungradedCount} submission đang chờ chấm điểm.`,
            count: ungradedCount,
            targetView: 'submissions',
            targetFilter: 'PENDING'
          });
        }
      }

      if (role === 'manager') {
        const [questionsRes, topicsRes, submissionsRes] = await Promise.all([
          questionService.getAllQuestions(),
          topicService.getAllTopics(),
          submissionService.getAllSubmissions({ limit: 100 })
        ]);

        const questions = toArray(questionsRes);
        const topics = toArray(topicsRes);
        const submissions = toArray(submissionsRes);

        const escalatedCount = questions.filter((item) => normalizeStatus(item.status) === 'ESCALATED_TO_MANAGER').length;
        const pendingTopicsCount = topics.filter((item) => normalizeStatus(item.status) === 'PENDING').length;
        const ungradedCount = submissions.filter((item) => normalizeStatus(item.status) !== 'GRADED').length;

        if (pendingTopicsCount > 0) {
          nextNotifications.push({
            id: 'manager-topics',
            title: 'Topic chờ duyệt',
            body: `Hiện có ${pendingTopicsCount} topic cần manager xử lý.`,
            count: pendingTopicsCount,
            targetView: 'topics',
            targetFilter: 'PENDING'
          });
        }

        if (escalatedCount > 0) {
          nextNotifications.push({
            id: 'manager-escalated',
            title: 'Q&A cần xử lý',
            body: `${escalatedCount} câu hỏi escalated đang chờ manager.`,
            count: escalatedCount,
            targetView: 'qa',
            targetFilter: 'ESCALATED_TO_MANAGER'
          });
        }

        if (ungradedCount > 0) {
          nextNotifications.push({
            id: 'manager-submissions',
            title: 'Submission chưa chấm',
            body: `${ungradedCount} submission chưa được chấm hoặc cập nhật lại.`,
            count: ungradedCount,
            targetView: 'submissions',
            targetFilter: 'PENDING'
          });
        }
      }

      if (initializedRef.current) {
        nextNotifications.forEach((item) => {
          const prev = previousCountsRef.current[item.id] || 0;
          if (item.count > prev) {
            notifyBrowser(item);
          }
        });
      }

      previousCountsRef.current = nextNotifications.reduce((accumulator, item) => {
        accumulator[item.id] = item.count;
        return accumulator;
      }, {});

      initializedRef.current = true;
      setNotifications(nextNotifications);
    } catch (error) {
      console.error('Failed to fetch portal notifications:', error);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window && window.Notification.permission === 'default') {
      window.Notification.requestPermission().catch(() => {});
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
    const intervalId = setInterval(fetchNotifications, POLL_INTERVAL);
    return () => clearInterval(intervalId);
  }, [role]);

  const unreadCount = useMemo(() => notifications.length, [notifications]);

  return {
    notifications,
    unreadCount,
    loading,
    refreshNotifications: fetchNotifications
  };
}