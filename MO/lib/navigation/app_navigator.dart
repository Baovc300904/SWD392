import 'package:flutter/widgets.dart';

sealed class AppNavigator {
  static final GlobalKey<NavigatorState> key = GlobalKey<NavigatorState>();

  static NavigatorState? get state => key.currentState;
}
