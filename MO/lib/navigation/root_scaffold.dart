import 'package:flutter/material.dart';

import '../state/app_session.dart';
import '../screens/roles/lecturer_shell.dart';
import '../screens/roles/manager_shell.dart';
import '../screens/roles/student_shell.dart';

class RootScaffold extends StatelessWidget {
  const RootScaffold({super.key});

  @override
  Widget build(BuildContext context) {
    final role = AppSession.instance.session?.normalizedRole;

    if (role == 'manager') return const ManagerShell();
    if (role == 'lecturer') return const LecturerShell();
    return const StudentShell();
  }
}
