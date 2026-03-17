import '../models/auth_session.dart';
import 'api_client.dart';

class AuthService {
  AuthService._();

  static final AuthService instance = AuthService._();

  Future<AuthSession> login({required String email, required String password}) async {
    final data = await ApiClient.instance.post(
      '/auth/login',
      auth: false,
      body: <String, dynamic>{'email': email, 'password': password},
    );
    return AuthSession.fromApi(data);
  }

  Future<Map<String, dynamic>> register({
    required String studentCode,
    required String fullName,
    required String email,
    required String password,
    required String confirmPassword,
  }) {
    return ApiClient.instance.post(
      '/auth/register',
      auth: false,
      body: <String, dynamic>{
        'studentCode': studentCode,
        'name': fullName,
        'fullName': fullName,
        'email': email,
        'password': password,
        'confirmPassword': confirmPassword,
      },
    );
  }

  Future<AuthSession> adminLecturerLogin({
    required String email,
    required String password,
    required String role,
  }) async {
    final data = await ApiClient.instance.post(
      '/auth/admin-lecturer-login',
      auth: false,
      body: <String, dynamic>{
        'email': email,
        'password': password,
        'role': role,
      },
    );
    return AuthSession.fromApi(data);
  }

  Future<Map<String, dynamic>> refreshToken(String refreshToken) {
    return ApiClient.instance.post(
      '/auth/refresh',
      auth: false,
      body: <String, dynamic>{'refreshToken': refreshToken},
    );
  }

  Future<void> logout(String refreshToken) async {
    await ApiClient.instance.post(
      '/auth/logout',
      auth: false,
      body: <String, dynamic>{'refreshToken': refreshToken},
    );
  }

  Future<Map<String, dynamic>> forgotPassword(String email) {
    return ApiClient.instance.post(
      '/auth/forgot-password',
      auth: false,
      body: <String, dynamic>{'email': email},
    );
  }

  Future<Map<String, dynamic>> resetPassword({
    required String email,
    required String otp,
    required String newPassword,
  }) {
    return ApiClient.instance.post(
      '/auth/reset-password',
      auth: false,
      body: <String, dynamic>{
        'email': email,
        'otp': otp,
        'newPassword': newPassword,
      },
    );
  }

  Future<Map<String, dynamic>> verifyOtp({required String email, required String otp}) {
    return ApiClient.instance.post(
      '/auth/verify-otp',
      auth: false,
      body: <String, dynamic>{'email': email, 'otp': otp},
    );
  }

  Future<Map<String, dynamic>> resendOtp(String email) {
    return ApiClient.instance.post(
      '/auth/resend-otp',
      auth: false,
      body: <String, dynamic>{'email': email},
    );
  }

  Future<Map<String, dynamic>> heartbeat() {
    return ApiClient.instance.post('/auth/heartbeat');
  }
}
