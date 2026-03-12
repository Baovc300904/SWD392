import '../models/topic_item.dart';
import 'api_client.dart';

class TopicService {
  TopicService._();

  static final TopicService instance = TopicService._();

  Future<List<TopicItem>> getAll({String? status, String? search}) async {
    final query = <String, String>{};
    if (status != null && status.isNotEmpty) query['status'] = status;
    if (search != null && search.isNotEmpty) query['search'] = search;

    final response = await ApiClient.instance.get('/topics', query: query);
    final data = response['data'] as List<dynamic>? ?? <dynamic>[];
    return data
        .whereType<Map<String, dynamic>>()
        .map(TopicItem.fromJson)
        .toList(growable: false);
  }

  Future<TopicItem> getById(int id) async {
    final response = await ApiClient.instance.get('/topics/$id');
    final map = response['data'] as Map<String, dynamic>? ?? <String, dynamic>{};
    return TopicItem.fromJson(map);
  }

  Future<Map<String, dynamic>> create({
    required int createdBy,
    required String title,
    required String description,
    required int maxGroups,
  }) {
    return ApiClient.instance.post(
      '/topics',
      body: <String, dynamic>{
        'createdBy': createdBy,
        'title': title,
        'description': description,
        'maxGroups': maxGroups,
      },
    );
  }

  Future<Map<String, dynamic>> update(int id, Map<String, dynamic> payload) {
    return ApiClient.instance.put('/topics/$id', body: payload);
  }

  Future<Map<String, dynamic>> deleteTopic(int id) {
    return ApiClient.instance.delete('/topics/$id');
  }

  Future<Map<String, dynamic>> approve(int id) {
    return ApiClient.instance.put('/topics/$id/approve');
  }

  Future<Map<String, dynamic>> reject(int id) {
    return ApiClient.instance.put('/topics/$id/reject');
  }
}
