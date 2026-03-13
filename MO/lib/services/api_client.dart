import 'dart:convert';

import 'package:http/http.dart' as http;

import '../config/app_config.dart';
import '../models/auth_session.dart';
import '../state/app_session.dart';

class ApiClient {
  ApiClient._();

  static final ApiClient instance = ApiClient._();

  Future<Map<String, dynamic>> get(
    String path, {
    Map<String, String>? query,
    bool auth = true,
  }) {
    return _request('GET', path, query: query, auth: auth);
  }

  Future<Map<String, dynamic>> post(
    String path, {
    Object? body,
    bool auth = true,
  }) {
    return _request('POST', path, body: body, auth: auth);
  }

  Future<Map<String, dynamic>> put(
    String path, {
    Object? body,
    bool auth = true,
  }) {
    return _request('PUT', path, body: body, auth: auth);
  }

  Future<Map<String, dynamic>> patch(
    String path, {
    Object? body,
    bool auth = true,
  }) {
    return _request('PATCH', path, body: body, auth: auth);
  }

  Future<Map<String, dynamic>> delete(
    String path, {
    Object? body,
    bool auth = true,
  }) {
    return _request('DELETE', path, body: body, auth: auth);
  }

  Future<Map<String, dynamic>> _request(
    String method,
    String path, {
    Map<String, String>? query,
    Object? body,
    required bool auth,
    bool retryOnAuthError = true,
  }) async {
    final base = Uri.parse(AppConfig.apiBaseUrl);
    final requestPath = path.startsWith('/') ? path.substring(1) : path;
    final uri = Uri(
      scheme: base.scheme,
      host: base.host,
      port: base.hasPort ? base.port : null,
      path: '${base.path.replaceFirst(RegExp(r'/$'), '')}/$requestPath',
      queryParameters: query,
    );

    final headers = <String, String>{'Content-Type': 'application/json'};
    final token = AppSession.instance.session?.accessToken;
    if (auth && token != null && token.isNotEmpty) {
      headers['Authorization'] = 'Bearer $token';
    }

    late http.Response response;
    final payload = body == null ? null : jsonEncode(body);

    switch (method) {
      case 'GET':
        response = await http.get(uri, headers: headers).timeout(AppConfig.requestTimeout);
      case 'POST':
        response = await http.post(uri, headers: headers, body: payload).timeout(AppConfig.requestTimeout);
      case 'PUT':
        response = await http.put(uri, headers: headers, body: payload).timeout(AppConfig.requestTimeout);
      case 'PATCH':
        response = await http.patch(uri, headers: headers, body: payload).timeout(AppConfig.requestTimeout);
      case 'DELETE':
        response = await http.delete(uri, headers: headers, body: payload).timeout(AppConfig.requestTimeout);
      default:
        throw Exception('Unsupported HTTP method: $method');
    }

    final text = response.body;
    final map = text.isEmpty
        ? <String, dynamic>{}
        : (jsonDecode(text) as Map<String, dynamic>);

    if (response.statusCode == 401 && auth && retryOnAuthError && !path.contains('/auth/refresh')) {
      final refreshed = await _tryRefreshToken();
      if (refreshed) {
        return _request(
          method,
          path,
          query: query,
          body: body,
          auth: auth,
          retryOnAuthError: false,
        );
      }
    }

    if (response.statusCode >= 400) {
      throw Exception(map['message']?.toString() ?? 'API error ${response.statusCode}');
    }

    return map;
  }

  Future<bool> _tryRefreshToken() async {
    final current = AppSession.instance.session;
    if (current == null || current.refreshToken.isEmpty) return false;

    final base = Uri.parse(AppConfig.apiBaseUrl);
    final refreshUri = Uri(
      scheme: base.scheme,
      host: base.host,
      port: base.hasPort ? base.port : null,
      path: '${base.path.replaceFirst(RegExp(r'/$'), '')}/auth/refresh',
    );

    try {
      final response = await http
          .post(
            refreshUri,
            headers: const <String, String>{'Content-Type': 'application/json'},
            body: jsonEncode(<String, dynamic>{
              'refreshToken': current.refreshToken,
            }),
          )
          .timeout(AppConfig.requestTimeout);

      if (response.statusCode >= 400) return false;

      final text = response.body;
      final map = text.isEmpty
          ? <String, dynamic>{}
          : (jsonDecode(text) as Map<String, dynamic>);
      final data = map['data'] as Map<String, dynamic>? ?? <String, dynamic>{};

      final nextAccessToken = data['accessToken']?.toString() ?? '';
      if (nextAccessToken.isEmpty) return false;

      final user = data['user'] as Map<String, dynamic>? ?? <String, dynamic>{};
      final nextSession = AuthSession(
        accessToken: nextAccessToken,
        refreshToken: data['refreshToken']?.toString() ?? current.refreshToken,
        userId: int.tryParse(user['id']?.toString() ?? '') ?? current.userId,
        fullName: user['fullName']?.toString() ?? current.fullName,
        email: user['email']?.toString() ?? current.email,
        role: user['role']?.toString() ?? current.role,
      );

      await AppSession.instance.setSession(nextSession);
      return true;
    } catch (_) {
      return false;
    }
  }
}
