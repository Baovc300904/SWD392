import 'dart:convert';
import 'dart:io';

import 'package:http/http.dart' as http;

import '../config/app_config.dart';
import '../models/auth_session.dart';
import '../state/app_session.dart';

class ApiClient {
  ApiClient._();

  static final ApiClient instance = ApiClient._();
  String? _activeBaseUrl;

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
    final headers = <String, String>{'Content-Type': 'application/json'};
    final token = AppSession.instance.session?.accessToken;
    if (auth && token != null && token.isNotEmpty) {
      headers['Authorization'] = 'Bearer $token';
    }

    final payload = body == null ? null : jsonEncode(body);

    http.Response? response;
    Object? lastNetworkError;
    for (final baseUrl in _candidateBaseUrls()) {
      final uri = _buildUri(baseUrl, path, query: query);
      try {
        response = await _sendRequest(
          method,
          uri,
          headers: headers,
          payload: payload,
        );
        _activeBaseUrl = baseUrl;
        break;
      } on SocketException catch (e) {
        lastNetworkError = e;
        continue;
      } on HttpException catch (e) {
        lastNetworkError = e;
        continue;
      } on http.ClientException catch (e) {
        lastNetworkError = e;
        continue;
      }
    }

    if (response == null) {
      if (lastNetworkError != null) {
        throw Exception('Unable to connect to backend: $lastNetworkError');
      }
      throw Exception('Unable to connect to backend.');
    }

    final text = utf8.decode(response.bodyBytes);
    final map = text.isEmpty
        ? <String, dynamic>{}
        : (jsonDecode(text) as Map<String, dynamic>);
    final normalizedMap = _normalizeResponseMap(map);

    final messageText = normalizedMap['message']?.toString().toLowerCase() ?? '';
    final is401 = response.statusCode == 401;
    final is403TokenError =
      response.statusCode == 403 &&
      (messageText.contains('token') ||
        messageText.contains('expired') ||
        messageText.contains('authentication'));

    if ((is401 || is403TokenError) &&
      auth &&
      retryOnAuthError &&
      !path.contains('/auth/refresh')) {
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

      // Refresh token is invalid/stale: clear local session to stop auth-error loops.
      await AppSession.instance.clear();
      throw Exception('Session expired. Please login again.');
    }

    if (response.statusCode >= 400) {
      throw Exception(
        normalizedMap['message']?.toString() ??
            'API error ${response.statusCode}',
      );
    }

    return normalizedMap;
  }

  Future<bool> _tryRefreshToken() async {
    final current = AppSession.instance.session;
    if (current == null || current.refreshToken.isEmpty) return false;

    for (final baseUrl in _candidateBaseUrls()) {
      final refreshUri = _buildUri(baseUrl, '/auth/refresh');

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

        if (response.statusCode >= 400) {
          continue;
        }

        final text = utf8.decode(response.bodyBytes);
        final map = text.isEmpty
            ? <String, dynamic>{}
            : (jsonDecode(text) as Map<String, dynamic>);
        final normalizedMap = _normalizeResponseMap(map);
        final data =
            normalizedMap['data'] as Map<String, dynamic>? ?? <String, dynamic>{};

        final nextAccessToken = data['accessToken']?.toString() ?? '';
        if (nextAccessToken.isEmpty) {
          continue;
        }

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
        _activeBaseUrl = baseUrl;
        return true;
      } catch (_) {
        continue;
      }
    }

    return false;
  }

  Uri _buildUri(String baseUrl, String path, {Map<String, String>? query}) {
    final base = Uri.parse(baseUrl);
    final requestPath = path.startsWith('/') ? path.substring(1) : path;
    return Uri(
      scheme: base.scheme,
      host: base.host,
      port: base.hasPort ? base.port : null,
      path: '${base.path.replaceFirst(RegExp(r'/$'), '')}/$requestPath',
      queryParameters: query,
    );
  }

  List<String> _candidateBaseUrls() {
    final candidates = <String>[];
    if (_activeBaseUrl != null && _activeBaseUrl!.isNotEmpty) {
      candidates.add(_activeBaseUrl!);
    }
    for (final baseUrl in AppConfig.apiBaseUrls) {
      if (!candidates.contains(baseUrl)) {
        candidates.add(baseUrl);
      }
    }
    return candidates;
  }

  Future<http.Response> _sendRequest(
    String method,
    Uri uri, {
    required Map<String, String> headers,
    required String? payload,
  }) {
    switch (method) {
      case 'GET':
        return http.get(uri, headers: headers).timeout(AppConfig.requestTimeout);
      case 'POST':
        return http
            .post(uri, headers: headers, body: payload)
            .timeout(AppConfig.requestTimeout);
      case 'PUT':
        return http
            .put(uri, headers: headers, body: payload)
            .timeout(AppConfig.requestTimeout);
      case 'PATCH':
        return http
            .patch(uri, headers: headers, body: payload)
            .timeout(AppConfig.requestTimeout);
      case 'DELETE':
        return http
            .delete(uri, headers: headers, body: payload)
            .timeout(AppConfig.requestTimeout);
      default:
        throw Exception('Unsupported HTTP method: $method');
    }
  }

  Map<String, dynamic> _normalizeResponseMap(Map<String, dynamic> map) {
    final normalized = _normalizeDynamic(map);
    return normalized is Map<String, dynamic> ? normalized : map;
  }

  dynamic _normalizeDynamic(dynamic value) {
    if (value is Map<String, dynamic>) {
      return value.map((key, dynamic v) => MapEntry(key, _normalizeDynamic(v)));
    }

    if (value is List<dynamic>) {
      return value.map(_normalizeDynamic).toList(growable: false);
    }

    if (value is String) {
      return _repairMojibake(value);
    }

    return value;
  }

  String _repairMojibake(String value) {
    if (value.isEmpty) return value;

    const suspiciousMarkers = ['Ã', 'Â', 'Ä', 'áº', 'á»', 'Æ', 'Ð', 'Ñ'];
    final looksBroken = suspiciousMarkers.any(value.contains);
    if (!looksBroken) return value;

    try {
      return utf8.decode(latin1.encode(value));
    } catch (_) {
      return value;
    }
  }
}
