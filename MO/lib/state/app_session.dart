import 'dart:convert';

import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../models/auth_session.dart';

class AppSession extends ChangeNotifier {
  AppSession._();

  static final AppSession instance = AppSession._();
  static const _sessionKey = 'mobile_auth_session';

  AuthSession? _session;

  AuthSession? get session => _session;
  bool get isAuthenticated => _session != null && _session!.accessToken.isNotEmpty;

  Future<void> hydrate() async {
    final prefs = await SharedPreferences.getInstance();
    final raw = prefs.getString(_sessionKey);
    if (raw == null || raw.isEmpty) return;

    final map = jsonDecode(raw) as Map<String, dynamic>;
    _session = AuthSession.fromJson(map);
    notifyListeners();
  }

  Future<void> setSession(AuthSession value) async {
    _session = value;
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_sessionKey, jsonEncode(value.toJson()));
    notifyListeners();
  }

  Future<void> clear() async {
    _session = null;
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_sessionKey);
    notifyListeners();
  }
}
