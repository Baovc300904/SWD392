import 'package:flutter/widgets.dart';

import 'app.dart';
import 'services/notification_service.dart';
import 'state/app_session.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await AppSession.instance.hydrate();
  await NotificationService.instance.initialize();

  if (AppSession.instance.isAuthenticated) {
    await NotificationService.instance.startQuestionPolling();
  }

  runApp(const MobileApp());
}
