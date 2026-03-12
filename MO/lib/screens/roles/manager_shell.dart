import 'package:flutter/material.dart';

import '../../services/class_service.dart';
import '../../services/question_service.dart';
import '../../services/semester_service.dart';
import '../../services/topic_service.dart';
import '../../services/user_service.dart';
import '../profile_screen.dart';

class ManagerShell extends StatefulWidget {
  const ManagerShell({super.key});

  @override
  State<ManagerShell> createState() => _ManagerShellState();
}

class _ManagerShellState extends State<ManagerShell> {
  int _index = 0;

  static const _tabs = <NavigationDestination>[
    NavigationDestination(icon: Icon(Icons.dashboard_outlined), label: 'Dashboard'),
    NavigationDestination(icon: Icon(Icons.groups_outlined), label: 'Users'),
    NavigationDestination(icon: Icon(Icons.calendar_month_outlined), label: 'Semesters'),
    NavigationDestination(icon: Icon(Icons.class_outlined), label: 'Classes'),
    NavigationDestination(icon: Icon(Icons.approval_outlined), label: 'Topics'),
    NavigationDestination(icon: Icon(Icons.person_outline), label: 'Account'),
  ];

  static const _titles = <String>[
    'Manager Dashboard',
    'User Management',
    'Semester Management',
    'Class Management',
    'Topic Approvals',
    'Account',
  ];

  @override
  Widget build(BuildContext context) {
    final pages = <Widget>[
      const _ManagerDashboardPage(),
      const _ManagerUsersPage(),
      const _ManagerSemestersPage(),
      const _ManagerClassesPage(),
      const _ManagerTopicApprovalsPage(),
      const ProfileScreen(),
    ];

    return Scaffold(
      appBar: _index == 5 ? null : AppBar(title: Text(_titles[_index])),
      body: IndexedStack(index: _index, children: pages),
      bottomNavigationBar: NavigationBar(
        selectedIndex: _index,
        destinations: _tabs,
        onDestinationSelected: (value) => setState(() => _index = value),
      ),
    );
  }
}

class _ManagerDashboardPage extends StatefulWidget {
  const _ManagerDashboardPage();

  @override
  State<_ManagerDashboardPage> createState() => _ManagerDashboardPageState();
}

class _ManagerDashboardPageState extends State<_ManagerDashboardPage> {
  bool _loading = true;
  String? _error;
  int _users = 0;
  int _semesters = 0;
  int _classes = 0;
  int _topics = 0;
  int _questions = 0;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() {
      _loading = true;
      _error = null;
    });

    try {
      final r = await Future.wait<dynamic>([
        UserService.instance.getAllUsers(),
        SemesterService.instance.getAll(),
        ClassService.instance.getAll(),
        TopicService.instance.getAll(),
        QuestionService.instance.getAll(),
      ]);
      if (!mounted) return;
      setState(() {
        _users = (r[0] as List).length;
        _semesters = (r[1] as List).length;
        _classes = (r[2] as List).length;
        _topics = (r[3] as List).length;
        _questions = (r[4] as List).length;
      });
    } catch (e) {
      if (!mounted) return;
      setState(() => _error = e.toString().replaceFirst('Exception: ', ''));
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) return const Center(child: CircularProgressIndicator());
    if (_error != null) return Center(child: Text(_error!, style: const TextStyle(color: Colors.red)));

    return RefreshIndicator(
      onRefresh: _load,
      child: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          const Text('Admin/Manager overview from BE resources.', style: TextStyle(color: Color(0xFF6B7280))),
          const SizedBox(height: 12),
          Wrap(
            spacing: 10,
            runSpacing: 10,
            children: [
              _CountCard(label: 'Users', value: _users),
              _CountCard(label: 'Semesters', value: _semesters),
              _CountCard(label: 'Classes', value: _classes),
              _CountCard(label: 'Topics', value: _topics),
              _CountCard(label: 'Questions', value: _questions),
            ],
          ),
        ],
      ),
    );
  }
}

class _ManagerUsersPage extends StatefulWidget {
  const _ManagerUsersPage();

  @override
  State<_ManagerUsersPage> createState() => _ManagerUsersPageState();
}

class _ManagerUsersPageState extends State<_ManagerUsersPage> {
  bool _loading = true;
  String? _error;
  List<Map<String, dynamic>> _items = const [];

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final data = await UserService.instance.getAllUsers();
      if (!mounted) return;
      setState(() => _items = data);
    } catch (e) {
      if (!mounted) return;
      setState(() => _error = e.toString().replaceFirst('Exception: ', ''));
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  Future<void> _delete(int id) async {
    try {
      await UserService.instance.deleteUser(id);
      await _load();
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('$e')));
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) return const Center(child: CircularProgressIndicator());
    if (_error != null) return Center(child: Text(_error!, style: const TextStyle(color: Colors.red)));

    return RefreshIndicator(
      onRefresh: _load,
      child: ListView.builder(
        itemCount: _items.length,
        itemBuilder: (_, i) {
          final user = _items[i];
          final id = int.tryParse(user['id']?.toString() ?? '') ?? 0;
          return Card(
            child: ListTile(
              title: Text(user['fullName']?.toString() ?? 'Unknown'),
              subtitle: Text('${user['email'] ?? ''} - ${user['role'] ?? ''}'),
              trailing: IconButton(
                onPressed: id == 0 ? null : () => _delete(id),
                icon: const Icon(Icons.delete_outline, color: Colors.red),
              ),
            ),
          );
        },
      ),
    );
  }
}

class _ManagerSemestersPage extends StatefulWidget {
  const _ManagerSemestersPage();

  @override
  State<_ManagerSemestersPage> createState() => _ManagerSemestersPageState();
}

class _ManagerSemestersPageState extends State<_ManagerSemestersPage> {
  bool _loading = true;
  String? _error;
  List<Map<String, dynamic>> _items = const [];

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final data = await SemesterService.instance.getAll();
      if (!mounted) return;
      setState(() => _items = data);
    } catch (e) {
      if (!mounted) return;
      setState(() => _error = e.toString().replaceFirst('Exception: ', ''));
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  Future<void> _create() async {
    final now = DateTime.now();
    final start = DateTime(now.year, now.month, 1);
    final end = DateTime(now.year, now.month + 4, 1);
    try {
      await SemesterService.instance.create(
        name: 'Semester ${now.year}-${now.month.toString().padLeft(2, '0')}',
        startDate: start.toIso8601String(),
        endDate: end.toIso8601String(),
        status: 'Upcoming',
      );
      await _load();
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('$e')));
    }
  }

  Future<void> _delete(int id) async {
    try {
      await SemesterService.instance.deleteSemester(id);
      await _load();
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('$e')));
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) return const Center(child: CircularProgressIndicator());
    if (_error != null) return Center(child: Text(_error!, style: const TextStyle(color: Colors.red)));

    return Column(
      children: [
        Padding(
          padding: const EdgeInsets.all(12),
          child: Align(
            alignment: Alignment.centerRight,
            child: FilledButton.icon(
              onPressed: _create,
              icon: const Icon(Icons.add),
              label: const Text('Quick Create'),
            ),
          ),
        ),
        Expanded(
          child: RefreshIndicator(
            onRefresh: _load,
            child: ListView.builder(
              itemCount: _items.length,
              itemBuilder: (_, i) {
                final semester = _items[i];
                final id = int.tryParse(semester['id']?.toString() ?? '') ?? 0;
                return Card(
                  child: ListTile(
                    title: Text(semester['name']?.toString() ?? 'Unknown'),
                    subtitle: Text('Status: ${semester['status'] ?? ''}'),
                    trailing: IconButton(
                      onPressed: id == 0 ? null : () => _delete(id),
                      icon: const Icon(Icons.delete_outline, color: Colors.red),
                    ),
                  ),
                );
              },
            ),
          ),
        ),
      ],
    );
  }
}

class _ManagerTopicApprovalsPage extends StatefulWidget {
  const _ManagerTopicApprovalsPage();

  @override
  State<_ManagerTopicApprovalsPage> createState() => _ManagerTopicApprovalsPageState();
}

class _ManagerClassesPage extends StatefulWidget {
  const _ManagerClassesPage();

  @override
  State<_ManagerClassesPage> createState() => _ManagerClassesPageState();
}

class _ManagerClassesPageState extends State<_ManagerClassesPage> {
  bool _loading = true;
  String? _error;
  List<Map<String, dynamic>> _items = const [];

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() {
      _loading = true;
      _error = null;
    });

    try {
      final classes = await ClassService.instance.getAll();
      if (!mounted) return;
      setState(() => _items = classes);
    } catch (e) {
      if (!mounted) return;
      setState(() => _error = e.toString().replaceFirst('Exception: ', ''));
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) return const Center(child: CircularProgressIndicator());
    if (_error != null) return Center(child: Text(_error!, style: const TextStyle(color: Colors.red)));

    return RefreshIndicator(
      onRefresh: _load,
      child: _items.isEmpty
          ? ListView(
              children: const [
                SizedBox(height: 120),
                Center(child: Text('Chua co class nao.')),
              ],
            )
          : ListView.builder(
              itemCount: _items.length,
              itemBuilder: (_, i) {
                final item = _items[i];
                final className = item['className']?.toString() ?? item['name']?.toString() ?? 'Unknown Class';
                final code = item['classCode']?.toString() ?? item['id']?.toString() ?? '-';
                final status = item['status']?.toString() ?? 'Unknown';

                return Card(
                  child: ListTile(
                    leading: const Icon(Icons.class_outlined),
                    title: Text(className),
                    subtitle: Text('Code: $code - Status: $status'),
                  ),
                );
              },
            ),
    );
  }
}

class _ManagerTopicApprovalsPageState extends State<_ManagerTopicApprovalsPage> {
  bool _loading = true;
  String? _error;
  List<dynamic> _items = const [];

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() {
      _loading = true;
      _error = null;
    });

    try {
      final topics = await TopicService.instance.getAll();
      if (!mounted) return;
      setState(() => _items = topics);
    } catch (e) {
      if (!mounted) return;
      setState(() => _error = e.toString().replaceFirst('Exception: ', ''));
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  Future<void> _approve(int id) async {
    await TopicService.instance.approve(id);
    await _load();
  }

  Future<void> _reject(int id) async {
    await TopicService.instance.reject(id);
    await _load();
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) return const Center(child: CircularProgressIndicator());
    if (_error != null) return Center(child: Text(_error!, style: const TextStyle(color: Colors.red)));

    return RefreshIndicator(
      onRefresh: _load,
      child: ListView.builder(
        itemCount: _items.length,
        itemBuilder: (_, i) {
          final topic = _items[i];
          return Card(
            child: ListTile(
              title: Text(topic.title),
              subtitle: Text('Status: ${topic.status}'),
              trailing: Wrap(
                spacing: 4,
                children: [
                  IconButton(
                    onPressed: () => _approve(topic.id),
                    icon: const Icon(Icons.check_circle_outline, color: Colors.green),
                  ),
                  IconButton(
                    onPressed: () => _reject(topic.id),
                    icon: const Icon(Icons.cancel_outlined, color: Colors.red),
                  ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }
}

class _CountCard extends StatelessWidget {
  const _CountCard({required this.label, required this.value});

  final String label;
  final int value;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 160,
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: const Color(0xFFE5E7EB)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(label, style: const TextStyle(color: Color(0xFF6B7280))),
          const SizedBox(height: 6),
          Text('$value', style: const TextStyle(fontSize: 24, fontWeight: FontWeight.w900)),
        ],
      ),
    );
  }
}
