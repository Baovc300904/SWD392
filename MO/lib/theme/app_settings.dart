import 'package:flutter/material.dart';

/// App-level settings stored in memory.
///
/// This keeps the sample app simple (no persistence).
sealed class AppSettings {
  static final ValueNotifier<ThemeMode> themeMode = ValueNotifier(ThemeMode.light);
}
