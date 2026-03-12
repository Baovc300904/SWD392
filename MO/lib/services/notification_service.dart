import 'dart:async';

import 'package:flutter_local_notifications/flutter_local_notifications.dart';

import 'question_service.dart';

class NotificationService {
  NotificationService._();

  static final NotificationService instance = NotificationService._();

  final FlutterLocalNotificationsPlugin _plugin =
      FlutterLocalNotificationsPlugin();
  Timer? _pollTimer;
  int _lastKnownQuestionCount = 0;

  Future<void> initialize() async {
    const android = AndroidInitializationSettings('@mipmap/ic_launcher');
    const settings = InitializationSettings(android: android, iOS: DarwinInitializationSettings());

    await _plugin.initialize(settings);
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

  Future<void> showLocal({required String title, required String body}) async {
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

    await _plugin.show(DateTime.now().millisecondsSinceEpoch % 100000, title, body, details);
  }
}
