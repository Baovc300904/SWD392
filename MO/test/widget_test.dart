// This is a basic Flutter widget test.
//
// To perform an interaction with a widget in your test, use the WidgetTester
// utility in the flutter_test package. For example, you can send tap and scroll
// gestures. You can also use WidgetTester to find child widgets in the widget
// tree, read text, and verify that the values of widget properties are correct.

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:mobile_app/app.dart';

void main() {
  testWidgets('Footer menu switches tabs', (WidgetTester tester) async {
    await tester.pumpWidget(const MobileApp());

    // App starts at Login.
    expect(find.text('SWP Hub'), findsOneWidget);

    // Sign in and go to RootScaffold.
    await tester.enterText(
      find.byType(TextFormField).at(0),
      'admin@fpt.edu.vn',
    );
    await tester.enterText(find.byType(TextFormField).at(1), '1');
    await tester.tap(find.text('Sign In'));
    await tester.pumpAndSettle();

    // Default tab.
    expect(find.text('Home'), findsWidgets);

    // Switch to Account tab.
    await tester.tap(find.text('Account'));
    await tester.pumpAndSettle();

    expect(find.text('Nguyen Van A'), findsOneWidget);
  });
}
