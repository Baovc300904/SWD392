import 'dart:async';
import 'dart:convert';

import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:flutter/material.dart';

import '../navigation/app_navigator.dart';
import '../screens/question_detail_screen.dart';
import '../state/app_session.dart';
import 'user_service.dart';
import 'question_service.dart';

@pragma('vm:entry-point')
Future<void> firebaseMessagingBackgroundHandler(RemoteMessage message) async {
  WidgetsFlutterBinding.ensureInitialized();
}

class NotificationService {
  NotificationService._();

  static final NotificationService instance = NotificationService._();

  final FlutterLocalNotificationsPlugin _plugin =
      FlutterLocalNotificationsPlugin();
  Timer? _pollTimer;
  int _lastKnownQuestionCount = 0;
  bool _pushInitialized = false;

  Future<void> initialize() async {
    const android = AndroidInitializationSettings('@mipmap/ic_launcher');
    const settings = InitializationSettings(
      android: android,
      iOS: DarwinInitializationSettings(),
    );

    await _plugin.initialize(
      settings,
      onDidReceiveNotificationResponse: (response) {
        final payload = response.payload;
        if (payload == null || payload.isEmpty) return;
        try {
          final map = jsonDecode(payload) as Map<String, dynamic>;
          _handleNavigation(map);
        } catch (_) {
          // ignore invalid payload
        }
      },
    );

    await _initializePush();
  }

  Future<void> _initializePush() async {
    if (_pushInitialized) return;
    _pushInitialized = true;

    try {
      FirebaseMessaging.onBackgroundMessage(firebaseMessagingBackgroundHandler);
final messaging = FirebaseMessaging.instance;

await messaging.requestPermission(
  alert: true,
  badge: true,
  sound: true,
);

final token = await messaging.getToken();
print("FCM TOKEN = $token");

      FirebaseMessaging.onMessage.listen((RemoteMessage message) async {
  print("PUSH RECEIVED");

  final title = message.notification?.title ?? 'SWD392';
  final body = message.notification?.body ?? 'You have a new update.';

  final data = <String, dynamic>{
    ...message.data,
    if (message.messageId != null) 'messageId': message.messageId!,
  };

  await showLocal(
    title: title,
    body: body,
    payload: jsonEncode(data),
  );
});

      FirebaseMessaging.onMessageOpenedApp.listen((RemoteMessage message) {
        _handleNavigation(message.data);
      });

      final initialMessage = await messaging.getInitialMessage();
      if (initialMessage != null) {
        _handleNavigation(initialMessage.data);
      }

      // Token registration (best-effort).
      await _registerCurrentToken();
      messaging.onTokenRefresh.listen((token) async {
        await _registerToken(token);
      });
    } catch (_) {
      // If Firebase isn't configured yet, keep the app functional.
    }
  }

  Future<void> onLogin() async {
    await startQuestionPolling();
    await _registerCurrentToken();
  }

  Future<void> onLogout() async {
    try {
      await UserService.instance.clearMyFcmToken();
    } catch (_) {
      // Ignore network issues.
    }
    await stop();
  }

  Future<void> _registerCurrentToken() async {
    if (!AppSession.instance.isAuthenticated) return;
    try {
      final token = await FirebaseMessaging.instance.getToken();
      await _registerToken(token);
    } catch (_) {
      // ignore
    }
  }

  Future<void> _registerToken(String? token) async {
    if (!AppSession.instance.isAuthenticated) return;
    if (token == null || token.trim().isEmpty) return;
    try {
      await UserService.instance.updateMyFcmToken(token.trim());
    } catch (_) {
      // ignore
    }
  }

  Future<void> startQuestionPolling() async {
    await _refreshQuestionCount(showIfIncreased: false);
    _pollTimer?.cancel();
    _pollTimer = Timer.periodic(const Duration(seconds: 30), (_) async {
      await _refreshQuestionCount(showIfIncreased: true);
    });
  }

  Future<void> stop() async {
    _pollTimer?.cancel();
    _pollTimer = null;
  }

  Future<void> _refreshQuestionCount({required bool showIfIncreased}) async {
    try {
      final questions = await QuestionService.instance.getAll();
      final newCount = questions.length;
      if (showIfIncreased && newCount > _lastKnownQuestionCount) {
        final diff = newCount - _lastKnownQuestionCount;
        await showLocal(
          title: 'SWD392 Update',
          body: 'Co $diff cau hoi moi vua duoc tao.',
        );
      }
      _lastKnownQuestionCount = newCount;
    } catch (_) {
      // Keep polling even when backend is temporarily unavailable.
    }
  }

  Future<void> showLocal({required String title, required String body, String? payload}) async {
    const details = NotificationDetails(
      android: AndroidNotificationDetails(
        'swd392_channel',
        'SWD392 Notifications',
        channelDescription: 'General notifications for mobile app',
        importance: Importance.high,
        priority: Priority.high,
      ),
      iOS: DarwinNotificationDetails(),
    );

    await _plugin.show(
      DateTime.now().millisecondsSinceEpoch % 100000,
      title,
      body,
      details,
      payload: payload,
    );
  }

  void _handleNavigation(Map<String, dynamic> data) {
    if (!AppSession.instance.isAuthenticated) return;

    final type = (data['type'] ?? data['screen'] ?? '').toString().toLowerCase();
    final questionIdRaw = data['questionId'] ?? data['question_id'] ?? data['qid'];
    final questionId = int.tryParse(questionIdRaw?.toString() ?? '');

    if (type == 'question' && questionId != null && questionId > 0) {
      final nav = AppNavigator.state;
      if (nav == null) return;
      nav.push(
        MaterialPageRoute<void>(
          builder: (_) => QuestionDetailScreen(questionId: questionId),
        ),
      );
    }
  }
}
