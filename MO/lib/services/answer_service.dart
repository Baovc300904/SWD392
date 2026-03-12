import 'api_client.dart';

class AnswerService {
  AnswerService._();

  static final AnswerService instance = AnswerService._();

  Future<List<Map<String, dynamic>>> getByQuestion(int questionId, {bool? isPublic}) async {
    final query = <String, String>{};
    if (isPublic != null) query['isPublic'] = '$isPublic';

    final response = await ApiClient.instance.get(
      '/questions/$questionId/answers',
      query: query,
      auth: false,
    );
    final data = response['data'] as List<dynamic>? ?? <dynamic>[];
    return data.cast<Map<String, dynamic>>();
  }

  Future<Map<String, dynamic>> create({
    required int questionId,
    required int answeredBy,
    required String content,
    bool isPublic = false,
    bool markAsResolved = false,
  }) {
    return ApiClient.instance.post(
      '/questions/$questionId/answers',
      auth: false,
      body: <String, dynamic>{
        'answeredBy': answeredBy,
        'content': content,
        'isPublic': isPublic,
        'markAsResolved': markAsResolved,
      },
    );
  }

  Future<Map<String, dynamic>> update(int id, {String? content, bool? isPublic}) {
    return ApiClient.instance.put(
      '/answers/$id',
      auth: false,
      body: <String, dynamic>{
        if (content != null) 'content': content,
        if (isPublic != null) 'isPublic': isPublic,
      },
    );
  }

  Future<Map<String, dynamic>> toggleVisibility(int id) {
    return ApiClient.instance.put('/answers/$id/toggle-visibility', auth: false);
  }

  Future<Map<String, dynamic>> deleteAnswer(int id) {
    return ApiClient.instance.delete('/answers/$id', auth: false);
  }

  Future<List<Map<String, dynamic>>> getPublicAnswers() async {
    final response = await ApiClient.instance.get('/answers/public', auth: false);
    final data = response['data'] as List<dynamic>? ?? <dynamic>[];
    return data.cast<Map<String, dynamic>>();
  }
}
