import 'api_client.dart';

class UserService {
  UserService._();

  static final UserService instance = UserService._();

  Future<List<Map<String, dynamic>>> getAllUsers() async {
    final response = await ApiClient.instance.get('/users');
    final data = response['data'] as List<dynamic>? ?? <dynamic>[];
    return data.cast<Map<String, dynamic>>();
  }

  Future<Map<String, dynamic>> getCurrentUser() async {
    final response = await ApiClient.instance.get('/users/me');
    return response['data'] as Map<String, dynamic>? ?? <String, dynamic>{};
  }

  Future<Map<String, dynamic>> getUserById(int id) async {
    final response = await ApiClient.instance.get('/users/$id');
    return response['data'] as Map<String, dynamic>? ?? <String, dynamic>{};
  }

  Future<Map<String, dynamic>> createUser({
    required String studentCode,
    required String fullName,
    required String email,
    required String password,
    required String role,
  }) {
    return ApiClient.instance.post(
      '/users',
      body: <String, dynamic>{
        'studentCode': studentCode,
        'name': fullName,
        'fullName': fullName,
        'email': email,
        'password': password,
        'role': role,
      },
    );
  }

  Future<Map<String, dynamic>> updateUser(int id, Map<String, dynamic> payload) {
    return ApiClient.instance.put('/users/$id', body: payload);
  }

  Future<Map<String, dynamic>> updateUserRole(int id, String role) {
    return ApiClient.instance.patch(
      '/users/$id/role',
      body: <String, dynamic>{'role': role},
    );
  }

  Future<Map<String, dynamic>> deleteUser(int id) {
    return ApiClient.instance.delete('/users/$id');
  }

  Future<Map<String, dynamic>> updateMyFcmToken(String token) {
    return ApiClient.instance.post(
      '/users/me/fcm-token',
      body: <String, dynamic>{'token': token},
    );
  }

  Future<Map<String, dynamic>> clearMyFcmToken() {
    return ApiClient.instance.delete('/users/me/fcm-token');
  }
}
