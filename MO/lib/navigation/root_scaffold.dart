import 'package:flutter/material.dart';

import '../services/session_presence_service.dart';
import '../state/app_session.dart';
import '../screens/roles/lecturer_shell.dart';
import '../screens/roles/manager_shell.dart';
import '../screens/roles/student_shell.dart';

class RootScaffold extends StatefulWidget {
  const RootScaffold({super.key});

  @override
  State<RootScaffold> createState() => _RootScaffoldState();
}

class _RootScaffoldState extends State<RootScaffold> {
  @override
  void initState() {
    super.initState();
    SessionPresenceService.instance.start();
  }

  @override
  void dispose() {
    SessionPresenceService.instance.stop();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final role = AppSession.instance.session?.normalizedRole;

    if (role == 'manager') return const ManagerShell();
    if (role == 'lecturer') return const LecturerShell();
    return const StudentShell();
  }
}
