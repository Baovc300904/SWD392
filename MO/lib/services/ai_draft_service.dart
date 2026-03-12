import 'question_service.dart';

class AiDraftService {
  AiDraftService._();

  static final AiDraftService instance = AiDraftService._();

  Future<String> buildSmartDraft({
    required int questionId,
    required String questionTitle,
    required String questionContent,
    String? topicTitle,
    String? syllabus,
  }) async {
    try {
      final response = await QuestionService.instance.generateAiSuggestion(questionId);
      final data = response['data'];
      if (data is Map<String, dynamic>) {
        final content = data['content']?.toString();
        if (content != null && content.trim().isNotEmpty) return content;
      }
      final text = response['message']?.toString();
      if (text != null && text.trim().isNotEmpty) return text;
    } catch (_) {
      // Fallback draft when BE AI endpoint is unavailable.
    }

    final topic = (topicTitle == null || topicTitle.isEmpty)
        ? 'de tai hien tai'
        : topicTitle;
    final syllabusPart = (syllabus == null || syllabus.isEmpty)
        ? ''
        : '\n- Tham chieu syllabus: $syllabus';

    return '''
Chao ban, giang vien da tiep nhan cau hoi "$questionTitle".

Tom tat van de:
- Noi dung chinh: ${questionContent.trim()}
- Ngu canh: nhom dang lam $topic$syllabusPart

Huong xu ly de xuat:
1. Xac nhan yeu cau/loi hien tai va buoc tai hien.
2. Chia nho bai toan theo module (API, database, frontend/mobile).
3. Kiem tra dieu kien dau vao, luong du lieu va expected output.
4. Ap dung giai phap theo uu tien: fix root cause truoc, toi uu sau.

Neu ban gui them screenshot/log loi, minh se phan tich chi tiet hon va dua patch cu the.
''';
  }
}
