import 'api_client.dart';

class SubmissionService {
  SubmissionService._();

  static final SubmissionService instance = SubmissionService._();

  Future<List<Map<String, dynamic>>> getAll({
    int? groupId,
    String? status,
    String? search,
  }) async {
    final query = <String, String>{
      if (groupId != null) 'groupId': '$groupId',
      if (status != null && status.isNotEmpty) 'status': status,
      if (search != null && search.isNotEmpty) 'search': search,
    };

    final response = await ApiClient.instance.get('/submissions', query: query);
    final data = response['data'] as List<dynamic>? ?? <dynamic>[];
    return data.whereType<Map<String, dynamic>>().toList(growable: false);
  }

  Future<Map<String, dynamic>> create({
    required int groupId,
    String? milestoneName,
    String? fileUrl,
    String? filePath,
    String? notes,
  }) {
    return ApiClient.instance.post(
      '/submissions',
      body: <String, dynamic>{
        'groupId': groupId,
        if (milestoneName != null && milestoneName.isNotEmpty)
          'milestoneName': milestoneName,
        if (fileUrl != null && fileUrl.isNotEmpty) 'fileUrl': fileUrl,
        if (filePath != null && filePath.isNotEmpty) 'filePath': filePath,
        if (notes != null && notes.isNotEmpty) 'notes': notes,
      },
    );
  }

  Future<Map<String, dynamic>> update(
    int id, {
    String? milestoneName,
    String? fileUrl,
    String? filePath,
    String? notes,
  }) {
    return ApiClient.instance.put(
      '/submissions/$id',
      body: <String, dynamic>{
        if (milestoneName != null) 'milestoneName': milestoneName,
        if (fileUrl != null) 'fileUrl': fileUrl,
        if (filePath != null) 'filePath': filePath,
        if (notes != null) 'notes': notes,
      },
    );
  }

  Future<Map<String, dynamic>> deleteSubmission(int id) {
    return ApiClient.instance.delete('/submissions/$id');
  }

  Future<Map<String, dynamic>> grade({
    required int id,
    required double grade,
    String? feedback,
  }) {
    return ApiClient.instance.put(
      '/submissions/$id/grade',
      body: <String, dynamic>{
        'grade': grade,
        if (feedback != null && feedback.isNotEmpty) 'feedback': feedback,
      },
    );
  }
}
