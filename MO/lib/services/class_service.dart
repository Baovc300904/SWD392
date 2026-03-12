import 'api_client.dart';

class ClassService {
  ClassService._();

  static final ClassService instance = ClassService._();

  Future<List<Map<String, dynamic>>> getAll() async {
    final response = await ApiClient.instance.get('/classes');
    final data = response['data'] as List<dynamic>? ?? <dynamic>[];
    return data.cast<Map<String, dynamic>>();
  }

  Future<Map<String, dynamic>> getById(int id) async {
    final response = await ApiClient.instance.get('/classes/$id');
    return response['data'] as Map<String, dynamic>? ?? <String, dynamic>{};
  }

  Future<Map<String, dynamic>> create({
    required String className,
    required String semesterId,
    String? description,
    String status = 'Active',
  }) {
    return ApiClient.instance.post(
      '/classes',
      body: <String, dynamic>{
        'className': className,
        'semesterId': semesterId,
        'description': description,
        'status': status,
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
