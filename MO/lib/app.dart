import 'package:flutter/material.dart';

import 'screens/home_screen.dart';
import 'navigation/root_scaffold.dart';
import 'navigation/app_navigator.dart';
import 'state/app_session.dart';
import 'theme/app_settings.dart';
import 'theme/app_theme.dart';

class MobileApp extends StatelessWidget {
  const MobileApp({super.key});

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: Listenable.merge(<Listenable>[
        AppSettings.themeMode,
        AppSession.instance,
      ]),
      builder: (context, _) {
        return MaterialApp(
          title: 'SWD392 Mobile',
          debugShowCheckedModeBanner: false,
          navigatorKey: AppNavigator.key,
          theme: AppTheme.light,
          darkTheme: AppTheme.dark,
          themeMode: AppSettings.themeMode.value,
          home: AppSession.instance.isAuthenticated
              ? const RootScaffold()
              : const HomeScreen(),
        );
      },
    );
  }
}
