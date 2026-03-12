import '../models/question_item.dart';
import 'api_client.dart';

class QuestionService {
  QuestionService._();

  static final QuestionService instance = QuestionService._();

  Future<List<QuestionItem>> getAll({String? status, int? groupId, String? search}) async {
    final query = <String, String>{};
    if (status != null && status.isNotEmpty) query['status'] = status;
    if (groupId != null) query['groupId'] = '$groupId';
    if (search != null && search.isNotEmpty) query['search'] = search;

    final response = await ApiClient.instance.get('/questions', query: query);
    final data = response['data'] as List<dynamic>? ?? <dynamic>[];
    return data
        .whereType<Map<String, dynamic>>()
        .map(QuestionItem.fromJson)
        .toList(growable: false);
  }

  Future<QuestionItem> getById(int id) async {
    final response = await ApiClient.instance.get('/questions/$id');
    final map = response['data'] as Map<String, dynamic>? ?? <String, dynamic>{};
    return QuestionItem.fromJson(map);
  }

  Future<Map<String, dynamic>> create({
    required String title,
    required String content,
    required int groupId,
    required int askedBy,
  }) {
    return ApiClient.instance.post(
      '/questions',
      body: <String, dynamic>{
        'title': title,
        'content': content,
        'groupId': groupId,
        'askedBy': askedBy,
      },
    );
  }

  Future<Map<String, dynamic>> escalate(int id) {
    return ApiClient.instance.put('/questions/$id/escalate');
  }

  Future<Map<String, dynamic>> resolve(int id) {
    return ApiClient.instance.put('/questions/$id/resolve');
  }

  Future<Map<String, dynamic>> deleteQuestion(int id) {
    return ApiClient.instance.delete('/questions/$id');
  }

  Future<Map<String, dynamic>> getAiSuggestion(int id) {
    return ApiClient.instance.get('/questions/$id/ai-suggestion');
  }

  Future<Map<String, dynamic>> generateAiSuggestion(int id) {
    return ApiClient.instance.post('/questions/$id/ai-suggestion');
  }
}

