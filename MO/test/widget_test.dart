// This is a basic Flutter widget test.
//
// To perform an interaction with a widget in your test, use the WidgetTester
// utility in the flutter_test package. For example, you can send tap and scroll
// gestures. You can also use WidgetTester to find child widgets in the widget
// tree, read text, and verify that the values of widget properties are correct.

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:mobile_app/navigation/root_scaffold.dart';

void main() {
  testWidgets('Footer menu switches tabs', (WidgetTester tester) async {
    await tester.pumpWidget(
      const MaterialApp(
        home: RootScaffold(),
      ),
    );

    // Default tab.
    expect(find.text('Dashboard'), findsWidgets);

    // Switch to Q&A tab.
    await tester.tap(find.text('Q&A'));
    await tester.pumpAndSettle();
    expect(find.text('Management Flow'), findsOneWidget);

    // Switch to Account tab.
    await tester.tap(find.text('Account'));
    await tester.pumpAndSettle();

    expect(find.text('Nguyen Van A'), findsOneWidget);
  });
}
