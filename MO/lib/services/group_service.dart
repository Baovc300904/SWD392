import 'api_client.dart';

class GroupService {
  GroupService._();

  static final GroupService instance = GroupService._();

  Future<List<Map<String, dynamic>>> getAll({
    int? classId,
    int? topicId,
    String? status,
    String? search,
  }) async {
    final query = <String, String>{
      if (classId != null) 'classId': '$classId',
      if (topicId != null) 'topicId': '$topicId',
      if (status != null && status.isNotEmpty) 'status': status,
      if (search != null && search.isNotEmpty) 'search': search,
    };

    final response = await ApiClient.instance.get('/groups', query: query);
    final data = response['data'] as List<dynamic>? ?? <dynamic>[];
    return data.cast<Map<String, dynamic>>();
  }

  Future<Map<String, dynamic>> getById(int id) async {
    final response = await ApiClient.instance.get('/groups/$id');
    return response['data'] as Map<String, dynamic>? ?? <String, dynamic>{};
  }

  Future<Map<String, dynamic>> create({
    required String groupName,
    required int classId,
    required int topicId,
    String? description,
  }) {
    return ApiClient.instance.post(
      '/groups',
      body: <String, dynamic>{
        'groupName': groupName,
        'classId': classId,
        'topicId': topicId,
        'description': description,
      },
    );
  }

  Future<Map<String, dynamic>> update(int id, Map<String, dynamic> payload) {
    return ApiClient.instance.put('/groups/$id', body: payload);
  }

  Future<Map<String, dynamic>> confirmGroup(int id) {
    return ApiClient.instance.put('/groups/$id/confirm');
  }

  Future<Map<String, dynamic>> deleteGroup(int id) {
    return ApiClient.instance.delete('/groups/$id');
  }

  Future<List<Map<String, dynamic>>> getMembers(int groupId) async {
    final response = await ApiClient.instance.get('/groups/$groupId/members');
    final data = response['data'] as List<dynamic>? ?? <dynamic>[];
    return data.cast<Map<String, dynamic>>();
  }

  Future<Map<String, dynamic>> addMember({
    required int groupId,
    required int userId,
    String role = 'MEMBER',
  }) {
    return ApiClient.instance.post(
      '/groups/$groupId/members',
      body: <String, dynamic>{
        'userId': userId,
        'role': role,
      },
    );
  }

  Future<Map<String, dynamic>> removeMember({
    required int groupId,
    required int memberId,
  }) {
    return ApiClient.instance.delete('/groups/$groupId/members/$memberId');
  }
}
