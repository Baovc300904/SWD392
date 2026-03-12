import 'api_client.dart';

class SemesterService {
  SemesterService._();

  static final SemesterService instance = SemesterService._();

  Future<List<Map<String, dynamic>>> getAll({String? status, String? search}) async {
    final query = <String, String>{};
    if (status != null && status.isNotEmpty) query['status'] = status;
    if (search != null && search.isNotEmpty) query['search'] = search;

    final response = await ApiClient.instance.get('/semesters', query: query);
    final data = response['data'] as List<dynamic>? ?? <dynamic>[];
    return data.cast<Map<String, dynamic>>();
  }

  Future<Map<String, dynamic>> getActive() async {
    final response = await ApiClient.instance.get('/semesters/active');
    return response['data'] as Map<String, dynamic>? ?? <String, dynamic>{};
  }

  Future<Map<String, dynamic>> getById(int id) async {
    final response = await ApiClient.instance.get('/semesters/$id');
    return response['data'] as Map<String, dynamic>? ?? <String, dynamic>{};
  }

  Future<Map<String, dynamic>> create({
    required String name,
    required String startDate,
    required String endDate,
    required String status,
  }) {
    return ApiClient.instance.post(
      '/semesters',
      body: <String, dynamic>{
        'name': name,
        'startDate': startDate,
        'endDate': endDate,
        'status': status,
      },
    );
  }

  Future<Map<String, dynamic>> update(int id, Map<String, dynamic> payload) {
    return ApiClient.instance.put('/semesters/$id', body: payload);
  }

  Future<Map<String, dynamic>> deleteSemester(int id) {
    return ApiClient.instance.delete('/semesters/$id');
  }
}
