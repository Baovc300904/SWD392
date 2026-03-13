import 'package:flutter/widgets.dart';
import 'package:firebase_core/firebase_core.dart';

import 'app.dart';
import 'services/notification_service.dart';
import 'state/app_session.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // FCM requires Firebase to be initialized. This will read platform config
  // (google-services.json / GoogleService-Info.plist) when present.
  try {
    await Firebase.initializeApp();
  } catch (_) {
    // Allow running without Firebase config; push notifications will be disabled.
  }

  await AppSession.instance.hydrate();
  await NotificationService.instance.initialize();

  if (AppSession.instance.isAuthenticated) {
    await NotificationService.instance.onLogin();
  }

  runApp(const MobileApp());
}
