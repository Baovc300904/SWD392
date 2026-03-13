import 'dart:async';

import '../state/app_session.dart';
import 'auth_service.dart';

class SessionPresenceService {
  SessionPresenceService._();

  static final SessionPresenceService instance = SessionPresenceService._();

  Timer? _timer;

  void start() {
    stop();
    _sendHeartbeat();
    _timer = Timer.periodic(const Duration(seconds: 60), (_) => _sendHeartbeat());
  }

  void stop() {
    _timer?.cancel();
    _timer = null;
  }

  Future<void> _sendHeartbeat() async {
    if (!AppSession.instance.isAuthenticated) return;
    try {
      await AuthService.instance.heartbeat();
    } catch (_) {
      // Keep heartbeat non-blocking for app flow.
    }
  }
}
