import 'package:flutter/foundation.dart';

sealed class AppConfig {
  static List<String> get apiBaseUrls {
    const fromEnv = String.fromEnvironment('API_BASE_URL', defaultValue: '');
    if (fromEnv.isNotEmpty) {
      final values = fromEnv
          .split(',')
          .map((item) => item.trim())
          .where((item) => item.isNotEmpty)
          .toList(growable: false);
      if (values.isNotEmpty) return values;
    }

    // Web/Desktop use localhost, Android emulator uses 10.0.2.2.
    // Keep 3001 as a fallback because backend may auto-increment port when 3000 is in use.
    if (!kIsWeb && defaultTargetPlatform == TargetPlatform.android) {
      return const <String>[
        'http://10.0.2.2:3000/api',
        'http://10.0.2.2:3001/api',
      ];
    }
    return const <String>[
      'http://localhost:3000/api',
      'http://localhost:3001/api',
    ];
  }

  static String get apiBaseUrl => apiBaseUrls.first;

  static const Duration requestTimeout = Duration(seconds: 20);
}
