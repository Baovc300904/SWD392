import 'api_client.dart';

class ClassService {
  ClassService._();

  static final ClassService instance = ClassService._();

  Future<List<Map<String, dynamic>>> getAll({String? search, int? lecturerId}) async {
    final query = <String, String>{
      if (search != null && search.isNotEmpty) 'search': search,
      if (lecturerId != null) 'lecturerId': '$lecturerId',
    };
    final response = await ApiClient.instance.get('/classes', query: query);
    final data = response['data'] as List<dynamic>? ?? <dynamic>[];
    return data.cast<Map<String, dynamic>>();
  }

  Future<Map<String, dynamic>> getById(int id) async {
    final response = await ApiClient.instance.get('/classes/$id');
    return response['data'] as Map<String, dynamic>? ?? <String, dynamic>{};
  }

  Future<Map<String, dynamic>> create({
    required String className,
    required int lecturerId,
    int? semesterId,
  }) {
    return ApiClient.instance.post(
      '/classes',
      body: <String, dynamic>{
        'className': className,
        'lecturerId': lecturerId,
        'semesterId': semesterId,
      },
    );
  }

  Future<Map<String, dynamic>> update(int id, Map<String, dynamic> payload) {
    return ApiClient.instance.put('/classes/$id', body: payload);
  }

  Future<Map<String, dynamic>> deleteClass(int id) {
    return ApiClient.instance.delete('/classes/$id');
  }
}
