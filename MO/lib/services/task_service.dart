import 'api_client.dart';

class TaskService {
  TaskService._();

  static final TaskService instance = TaskService._();

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

    final response = await ApiClient.instance.get('/tasks', query: query);
    final data = response['data'] as List<dynamic>? ?? <dynamic>[];
    return data.whereType<Map<String, dynamic>>().toList(growable: false);
  }

  Future<Map<String, dynamic>> create({
    required int groupId,
    required String title,
    String? description,
    int? assigneeId,
    String status = 'TODO',
    String priority = 'MEDIUM',
  }) {
    return ApiClient.instance.post(
      '/tasks',
      body: <String, dynamic>{
        'groupId': groupId,
        'title': title,
        'description': description,
        'assigneeId': assigneeId,
        'status': status,
        'priority': priority,
      },
    );
  }

  Future<Map<String, dynamic>> update(int id, Map<String, dynamic> payload) {
    return ApiClient.instance.put('/tasks/$id', body: payload);
  }

  Future<Map<String, dynamic>> deleteTask(int id) {
    return ApiClient.instance.delete('/tasks/$id');
  }
}
