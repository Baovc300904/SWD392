import 'package:flutter/material.dart';

import '../../services/class_service.dart';
import '../../services/group_service.dart';
import '../../services/question_service.dart';
import '../../services/semester_service.dart';
import '../../services/topic_service.dart';
import '../../services/user_service.dart';
import '../../widgets/ui_kit.dart';
import '../profile_screen.dart';

class ManagerShell extends StatefulWidget {
  const ManagerShell({super.key});

  @override
  State<ManagerShell> createState() => _ManagerShellState();
}

class _ManagerShellState extends State<ManagerShell> {
  int _index = 0;

  Widget _buildBottomNav(BuildContext context) {
    final width = MediaQuery.sizeOf(context).width;
    final labelBehavior = width < 420
        ? NavigationDestinationLabelBehavior.alwaysHide
        : (width < 520
            ? NavigationDestinationLabelBehavior.onlyShowSelected
            : NavigationDestinationLabelBehavior.onlyShowSelected);

    return NavigationBar(
      height: width < 420 ? 60 : null,
      labelBehavior: labelBehavior,
      selectedIndex: _index,
      destinations: _tabs,
      onDestinationSelected: (value) => setState(() => _index = value),
    );
  }

  static const _tabs = <NavigationDestination>[
    NavigationDestination(icon: Icon(Icons.dashboard_outlined), label: 'Dashboard'),
    NavigationDestination(icon: Icon(Icons.groups_outlined), label: 'Users'),
    NavigationDestination(icon: Icon(Icons.group_work_outlined), label: 'Groups'),
    NavigationDestination(icon: Icon(Icons.calendar_month_outlined), label: 'Semesters'),
    NavigationDestination(icon: Icon(Icons.class_outlined), label: 'Classes'),
    NavigationDestination(icon: Icon(Icons.approval_outlined), label: 'Topics'),
    NavigationDestination(icon: Icon(Icons.person_outline), label: 'Account'),
  ];

  static const _titles = <String>[
    'Manager Dashboard',
    'User Management',
    'Group Management',
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
      const _ManagerGroupsPage(),
      const _ManagerSemestersPage(),
      const _ManagerClassesPage(),
      const _ManagerTopicApprovalsPage(),
      const ProfileScreen(),
    ];

    return Scaffold(
      appBar: _index == 6 ? null : AppBar(title: Text(_titles[_index])),
      body: IndexedStack(index: _index, children: pages),
      bottomNavigationBar: _buildBottomNav(context),
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
  int _groups = 0;
  int _topics = 0;
  int _questions = 0;
  String _activeSemesterLabel = '-';
  int _waiting = 0;
  int _resolved = 0;
  int _escalated = 0;

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
        GroupService.instance.getAll(),
        TopicService.instance.getAll(),
        QuestionService.instance.getAll(),
      ]);

      Map<String, dynamic> activeSemester = <String, dynamic>{};
      try {
        activeSemester = await SemesterService.instance.getActive();
      } catch (_) {
        // Keep dashboard usable when there is no active semester or endpoint fails.
      }
      if (!mounted) return;
      setState(() {
        _users = (r[0] as List).length;
        _semesters = (r[1] as List).length;
        _classes = (r[2] as List).length;
        _groups = (r[3] as List).length;
        _topics = (r[4] as List).length;
        _questions = (r[5] as List).length;
        _activeSemesterLabel = activeSemester['name']?.toString() ??
            activeSemester['semesterName']?.toString() ??
            'None';
        final questions = r[5] as List<dynamic>;
        _waiting = questions.where((q) => q.status == 'WAITING_LECTURER').length;
        _resolved = questions.where((q) => q.status == 'RESOLVED').length;
        _escalated = questions.where((q) => q.status == 'ESCALATED_TO_MANAGER').length;
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
          const DashboardHero(
            title: 'Manager Control Center',
            subtitle: 'Review core resources, monitor Q&A queues, and approve or reject topic proposals.',
            icon: Icons.admin_panel_settings_outlined,
          ),
          const SizedBox(height: 14),
          Wrap(
            spacing: 10,
            runSpacing: 10,
            children: [
              _CountCard(label: 'Users', value: _users, icon: Icons.groups_outlined),
              _CountCard(label: 'Semesters', value: _semesters, icon: Icons.calendar_month_outlined),
              _CountCard(label: 'Classes', value: _classes, icon: Icons.class_outlined),
              _CountCard(label: 'Groups', value: _groups, icon: Icons.group_work_outlined),
              _CountCard(label: 'Topics', value: _topics, icon: Icons.topic_outlined),
              _CountCard(label: 'Questions', value: _questions, icon: Icons.quiz_outlined),
              _CountCard(label: 'WAITING', value: _waiting, icon: Icons.schedule_outlined),
              _CountCard(label: 'RESOLVED', value: _resolved, icon: Icons.task_alt_outlined),
              _CountCard(label: 'ESCALATED', value: _escalated, icon: Icons.trending_up_outlined),
            ],
          ),
          const SizedBox(height: 12),
          SectionCard(
            child: Row(
              children: [
                const Icon(Icons.event_available_outlined),
                const SizedBox(width: 10),
                Expanded(
                  child: Text(
                    'Active semester: $_activeSemesterLabel',
                    style: Theme.of(context).textTheme.titleMedium,
                  ),
                ),
              ],
            ),
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
  final TextEditingController _searchController = TextEditingController();
  String? _searchQuery;

  @override
  void initState() {
    super.initState();
    _searchQuery ??= '';
    _load();
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
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

  Future<void> _createUser() async {
    final fullNameController = TextEditingController();
    final emailController = TextEditingController();
    final studentCodeController = TextEditingController();
    final passwordController = TextEditingController();
    final confirmPasswordController = TextEditingController();
    String selectedRole = 'student';

    final shouldCreate = await showDialog<bool>(
      context: context,
      builder: (context) {
        return StatefulBuilder(
          builder: (context, setStateDialog) {
            return AlertDialog(
              title: const Text('New User'),
              content: SingleChildScrollView(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    TextField(
                      controller: fullNameController,
                      decoration: const InputDecoration(labelText: 'Full Name'),
                    ),
                    const SizedBox(height: 8),
                    TextField(
                      controller: emailController,
                      decoration: const InputDecoration(labelText: 'Email'),
                    ),
                    const SizedBox(height: 8),
                    TextField(
                      controller: studentCodeController,
                      decoration: const InputDecoration(labelText: 'Student Code (optional)'),
                    ),
                    const SizedBox(height: 8),
                    TextField(
                      controller: passwordController,
                      obscureText: true,
                      decoration: const InputDecoration(labelText: 'Password'),
                    ),
                    const SizedBox(height: 8),
                    TextField(
                      controller: confirmPasswordController,
                      obscureText: true,
                      decoration: const InputDecoration(labelText: 'Confirm Password'),
                    ),
                    const SizedBox(height: 8),
                    DropdownButtonFormField<String>(
                      initialValue: selectedRole,
                      items: const [
                        DropdownMenuItem(value: 'student', child: Text('student')),
                        DropdownMenuItem(value: 'lecturer', child: Text('lecturer')),
                        DropdownMenuItem(value: 'manager', child: Text('manager')),
                      ],
                      onChanged: (value) {
                        if (value == null) return;
                        setStateDialog(() => selectedRole = value);
                      },
                      decoration: const InputDecoration(labelText: 'Role'),
                    ),
                  ],
                ),
              ),
              actions: [
                TextButton(
                  onPressed: () => Navigator.of(context).pop(false),
                  child: const Text('Cancel'),
                ),
                FilledButton(
                  onPressed: () => Navigator.of(context).pop(true),
                  child: const Text('Create'),
                ),
              ],
            );
          },
        );
      },
    );

    if (shouldCreate != true) return;

    final password = passwordController.text;
    final confirmPassword = confirmPasswordController.text;
    if (password != confirmPassword) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Password and confirm password do not match.')),
      );
      return;
    }
    if (password.length < 6) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Password must be at least 6 characters.')),
      );
      return;
    }

    try {
      final studentCode = studentCodeController.text.trim();
      await UserService.instance.createUser(
        studentCode: studentCode,
        fullName: fullNameController.text.trim(),
        email: emailController.text.trim(),
        password: password,
        role: selectedRole,
      );
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('User created successfully.')),
      );
      await _load();
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('$e')));
    }
  }

  Future<void> _editUser(Map<String, dynamic> user) async {
    final id = int.tryParse(user['id']?.toString() ?? '') ?? 0;
    if (id == 0) return;

    Map<String, dynamic> detail = user;
    try {
      detail = await UserService.instance.getUserById(id);
    } catch (_) {
      // Fall back to list item data if detail endpoint fails.
    }
    if (!mounted) return;

    final fullNameController = TextEditingController(
      text: detail['fullName']?.toString() ?? '',
    );
    final emailController = TextEditingController(
      text: detail['email']?.toString() ?? '',
    );
    final studentCodeController = TextEditingController(
      text: detail['studentCode']?.toString() ?? '',
    );

    String selectedRole = (detail['role']?.toString() ?? 'student').toLowerCase();
    if (!<String>['student', 'lecturer', 'manager'].contains(selectedRole)) {
      selectedRole = 'student';
    }

    final shouldSave = await showDialog<bool>(
      context: context,
      builder: (context) {
        return StatefulBuilder(
          builder: (context, setStateDialog) {
            return AlertDialog(
              title: const Text('Edit User'),
              content: SingleChildScrollView(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    TextField(
                      controller: fullNameController,
                      decoration: const InputDecoration(labelText: 'User Info (Full Name)'),
                    ),
                    const SizedBox(height: 8),
                    TextField(
                      controller: emailController,
                      decoration: const InputDecoration(labelText: 'Email'),
                    ),
                    const SizedBox(height: 8),
                    TextField(
                      controller: studentCodeController,
                      decoration: const InputDecoration(labelText: 'Student Code (SExxxxxx)'),
                    ),
                    const SizedBox(height: 8),
                    DropdownButtonFormField<String>(
                      initialValue: selectedRole,
                      items: const [
                        DropdownMenuItem(value: 'student', child: Text('student')),
                        DropdownMenuItem(value: 'lecturer', child: Text('lecturer')),
                        DropdownMenuItem(value: 'manager', child: Text('manager')),
                      ],
                      onChanged: (value) {
                        if (value == null) return;
                        setStateDialog(() => selectedRole = value);
                      },
                      decoration: const InputDecoration(labelText: 'Role'),
                    ),
                  ],
                ),
              ),
              actions: [
                TextButton(
                  onPressed: () => Navigator.of(context).pop(false),
                  child: const Text('Cancel'),
                ),
                FilledButton(
                  onPressed: () => Navigator.of(context).pop(true),
                  child: const Text('Save'),
                ),
              ],
            );
          },
        );
      },
    );

    if (shouldSave != true) return;

    try {
      final originalRole = (detail['role']?.toString() ?? '').toLowerCase();

      await UserService.instance.updateUser(id, <String, dynamic>{
        'fullName': fullNameController.text.trim(),
        'email': emailController.text.trim(),
        'studentCode': studentCodeController.text.trim(),
      });

      if (selectedRole != originalRole) {
        await UserService.instance.updateUserRole(id, selectedRole);
      }

      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('User updated successfully.')),
      );
      await _load();
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('$e')));
    }
  }

  List<Map<String, dynamic>> get _filteredUsers {
    final query = (_searchQuery ?? '').trim().toLowerCase();
    if (query.isEmpty) return _items;

    return _items.where((user) {
      final fullName = user['fullName']?.toString().toLowerCase() ?? '';
      final email = user['email']?.toString().toLowerCase() ?? '';
      final studentCode = user['studentCode']?.toString().toLowerCase() ?? '';
      final role = user['role']?.toString().toLowerCase() ?? '';
      final status = user['status']?.toString().toLowerCase() ?? '';
      return fullName.contains(query) ||
          email.contains(query) ||
          studentCode.contains(query) ||
          role.contains(query) ||
          status.contains(query);
    }).toList(growable: false);
  }

  Widget _smallChip(String text) {
    return Chip(
      label: Text(text, style: const TextStyle(fontSize: 12)),
      visualDensity: VisualDensity.compact,
      materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
    );
  }

  Widget _buildUserCard(Map<String, dynamic> user) {
    final id = int.tryParse(user['id']?.toString() ?? '') ?? 0;
    final role = user['role']?.toString() ?? '-';
    final status = user['status']?.toString() ?? ((user['isOnline'] == true) ? 'Online' : 'Offline');
    final studentCode = user['studentCode']?.toString() ?? '-';
    final fullName = user['fullName']?.toString() ?? 'Unknown';
    final email = user['email']?.toString() ?? '-';

    return Card(
      margin: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      child: Padding(
        padding: const EdgeInsets.fromLTRB(12, 10, 8, 10),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(fullName, style: const TextStyle(fontWeight: FontWeight.w700)),
                  const SizedBox(height: 2),
                  Text(email, style: const TextStyle(fontSize: 12, color: Colors.black54)),
                  const SizedBox(height: 8),
                  Wrap(
                    spacing: 8,
                    runSpacing: 6,
                    children: [
                      _smallChip('Code: $studentCode'),
                      _smallChip('Role: $role'),
                      _smallChip('Status: $status'),
                    ],
                  ),
                ],
              ),
            ),
            PopupMenuButton<String>(
              tooltip: 'Actions',
              enabled: id != 0,
              onSelected: (value) {
                if (id == 0) return;
                if (value == 'edit') _editUser(user);
                if (value == 'delete') _delete(id);
              },
              itemBuilder: (context) => const [
                PopupMenuItem(value: 'edit', child: Text('Edit')),
                PopupMenuItem(value: 'delete', child: Text('Delete')),
              ],
            ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) return const Center(child: CircularProgressIndicator());
    if (_error != null) return Center(child: Text(_error!, style: const TextStyle(color: Colors.red)));

    final isNarrow = MediaQuery.sizeOf(context).width < 700;

    return RefreshIndicator(
      onRefresh: _load,
      child: ListView(
        children: [
          const SizedBox(height: 8),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 12),
            child: Wrap(
              spacing: 8,
              runSpacing: 8,
              children: [
                OutlinedButton.icon(
                  onPressed: _load,
                  icon: const Icon(Icons.refresh),
                  label: const Text('Refresh'),
                ),
                FilledButton.icon(
                  onPressed: _createUser,
                  icon: const Icon(Icons.person_add_alt_1_outlined),
                  label: const Text('New User'),
                ),
              ],
            ),
          ),
          const SizedBox(height: 8),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 12),
            child: const Text(
              'Users',
              style: TextStyle(fontWeight: FontWeight.w700),
            ),
          ),
          const SizedBox(height: 8),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 12),
            child: TextField(
              controller: _searchController,
              onChanged: (value) => setState(() => _searchQuery = value),
              decoration: InputDecoration(
                prefixIcon: const Icon(Icons.search),
                hintText: 'Search users...',
                suffixIcon: (_searchQuery ?? '').isEmpty
                    ? null
                    : IconButton(
                        onPressed: () {
                          _searchController.clear();
                          setState(() => _searchQuery = '');
                        },
                        icon: const Icon(Icons.clear),
                      ),
              ),
            ),
          ),
          const SizedBox(height: 8),
          if (isNarrow)
            ListView.builder(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: _filteredUsers.length,
              itemBuilder: (_, i) => _buildUserCard(_filteredUsers[i]),
            )
          else
            SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              child: DataTable(
                columns: const [
                  DataColumn(label: Text('User Info')),
                  DataColumn(label: Text('Student Code')),
                  DataColumn(label: Text('Role')),
                  DataColumn(label: Text('Status')),
                  DataColumn(label: Text('Actions')),
                ],
                rows: _filteredUsers.map((user) {
                  final id = int.tryParse(user['id']?.toString() ?? '') ?? 0;
                  final role = user['role']?.toString() ?? '-';
                  final status = user['status']?.toString() ??
                      ((user['isOnline'] == true) ? 'Online' : 'Offline');
                  final studentCode = user['studentCode']?.toString() ?? '-';
                  final fullName = user['fullName']?.toString() ?? 'Unknown';
                  final email = user['email']?.toString() ?? '-';

                  return DataRow(cells: [
                    DataCell(
                      SizedBox(
                        width: 220,
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Text(fullName, style: const TextStyle(fontWeight: FontWeight.w700)),
                            Text(email, style: const TextStyle(fontSize: 12)),
                          ],
                        ),
                      ),
                    ),
                    DataCell(Text(studentCode)),
                    DataCell(Text(role)),
                    DataCell(Text(status)),
                    DataCell(
                      Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          IconButton(
                            tooltip: 'Edit',
                            onPressed: id == 0 ? null : () => _editUser(user),
                            icon: const Icon(Icons.edit_outlined),
                          ),
                          IconButton(
                            tooltip: 'Delete',
                            onPressed: id == 0 ? null : () => _delete(id),
                            icon: const Icon(Icons.delete_outline, color: Colors.red),
                          ),
                        ],
                      ),
                    ),
                  ]);
                }).toList(growable: false),
              ),
            ),
        ],
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
  final TextEditingController _searchController = TextEditingController();
  String? _searchQuery;
  String? _statusFilter;

  static const List<String> _statusOptions = <String>[
    'All Status',
    'Active',
    'Upcoming',
    'Completed',
    'Inactive',
  ];

  @override
  void initState() {
    super.initState();
    _searchQuery ??= '';
    _statusFilter ??= 'All Status';
    _load();
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  Future<void> _load() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final data = await SemesterService.instance.getAll(
        status: (_statusFilter ?? 'All Status') == 'All Status' ? null : _statusFilter,
        search: (_searchQuery ?? '').trim().isEmpty ? null : (_searchQuery ?? '').trim(),
      );
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

    final nameController = TextEditingController(
      text: 'Semester ${now.year}-${now.month.toString().padLeft(2, '0')}',
    );
    final startController = TextEditingController(text: start.toIso8601String().split('T').first);
    final endController = TextEditingController(text: end.toIso8601String().split('T').first);
    String selectedStatus = 'Upcoming';

    final shouldCreate = await showDialog<bool>(
      context: context,
      builder: (context) {
        return StatefulBuilder(
          builder: (context, setStateDialog) {
            return AlertDialog(
              title: const Text('New Semester'),
              content: SingleChildScrollView(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    TextField(
                      controller: nameController,
                      decoration: const InputDecoration(labelText: 'Semester'),
                    ),
                    const SizedBox(height: 8),
                    TextField(
                      controller: startController,
                      decoration: const InputDecoration(labelText: 'Start Date (YYYY-MM-DD)'),
                    ),
                    const SizedBox(height: 8),
                    TextField(
                      controller: endController,
                      decoration: const InputDecoration(labelText: 'End Date (YYYY-MM-DD)'),
                    ),
                    const SizedBox(height: 8),
                    DropdownButtonFormField<String>(
                      initialValue: selectedStatus,
                      items: _statusOptions
                          .where((s) => s != 'All Status')
                          .map((s) => DropdownMenuItem(value: s, child: Text(s)))
                          .toList(growable: false),
                      onChanged: (value) {
                        if (value == null) return;
                        setStateDialog(() => selectedStatus = value);
                      },
                      decoration: const InputDecoration(labelText: 'Status'),
                    ),
                  ],
                ),
              ),
              actions: [
                TextButton(
                  onPressed: () => Navigator.of(context).pop(false),
                  child: const Text('Cancel'),
                ),
                FilledButton(
                  onPressed: () => Navigator.of(context).pop(true),
                  child: const Text('Create'),
                ),
              ],
            );
          },
        );
      },
    );

    if (shouldCreate != true) return;

    try {
      await SemesterService.instance.create(
        name: nameController.text.trim(),
        startDate: startController.text.trim(),
        endDate: endController.text.trim(),
        status: selectedStatus,
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

  Future<void> _editSemester(Map<String, dynamic> semester) async {
    final id = int.tryParse(semester['id']?.toString() ?? '') ?? 0;
    if (id == 0) return;

    Map<String, dynamic> detail = semester;
    try {
      detail = await SemesterService.instance.getById(id);
    } catch (_) {
      // Fall back to list item data if detail endpoint fails.
    }
    if (!mounted) return;

    final nameController = TextEditingController(text: detail['name']?.toString() ?? '');
    final startController = TextEditingController(
      text: (detail['startDate']?.toString() ?? '').split('T').first,
    );
    final endController = TextEditingController(
      text: (detail['endDate']?.toString() ?? '').split('T').first,
    );

    String selectedStatus = detail['status']?.toString() ?? 'Upcoming';
    if (!_statusOptions.contains(selectedStatus)) selectedStatus = 'Upcoming';

    final shouldSave = await showDialog<bool>(
      context: context,
      builder: (context) {
        return StatefulBuilder(
          builder: (context, setStateDialog) {
            return AlertDialog(
              title: const Text('Edit Semester'),
              content: SingleChildScrollView(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    TextField(
                      controller: nameController,
                      decoration: const InputDecoration(labelText: 'Semester'),
                    ),
                    const SizedBox(height: 8),
                    TextField(
                      controller: startController,
                      decoration: const InputDecoration(labelText: 'Start Date (YYYY-MM-DD)'),
                    ),
                    const SizedBox(height: 8),
                    TextField(
                      controller: endController,
                      decoration: const InputDecoration(labelText: 'End Date (YYYY-MM-DD)'),
                    ),
                    const SizedBox(height: 8),
                    DropdownButtonFormField<String>(
                      initialValue: selectedStatus,
                      items: _statusOptions
                          .where((s) => s != 'All Status')
                          .map((s) => DropdownMenuItem(value: s, child: Text(s)))
                          .toList(growable: false),
                      onChanged: (value) {
                        if (value == null) return;
                        setStateDialog(() => selectedStatus = value);
                      },
                      decoration: const InputDecoration(labelText: 'Status'),
                    ),
                  ],
                ),
              ),
              actions: [
                TextButton(
                  onPressed: () => Navigator.of(context).pop(false),
                  child: const Text('Cancel'),
                ),
                FilledButton(
                  onPressed: () => Navigator.of(context).pop(true),
                  child: const Text('Save'),
                ),
              ],
            );
          },
        );
      },
    );

    if (shouldSave != true) return;

    try {
      await SemesterService.instance.update(id, <String, dynamic>{
        'name': nameController.text.trim(),
        'startDate': startController.text.trim(),
        'endDate': endController.text.trim(),
        'status': selectedStatus,
      });
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Semester updated successfully.')),
      );
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

    final isNarrow = MediaQuery.sizeOf(context).width < 700;

    Widget buildSemesterCard(Map<String, dynamic> semester) {
      final id = int.tryParse(semester['id']?.toString() ?? '') ?? 0;
      final name = semester['name']?.toString() ?? '-';
      final startDate = (semester['startDate']?.toString() ?? '-').split('T').first;
      final endDate = (semester['endDate']?.toString() ?? '-').split('T').first;
      final status = semester['status']?.toString() ?? '-';

      return Card(
        margin: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
        child: ListTile(
          title: Text(name, style: const TextStyle(fontWeight: FontWeight.w700)),
          subtitle: Padding(
            padding: const EdgeInsets.only(top: 6),
            child: Wrap(
              spacing: 8,
              runSpacing: 6,
              children: [
                Chip(
                  label: Text('$startDate → $endDate', style: const TextStyle(fontSize: 12)),
                  visualDensity: VisualDensity.compact,
                  materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
                ),
                Chip(
                  label: Text('Status: $status', style: const TextStyle(fontSize: 12)),
                  visualDensity: VisualDensity.compact,
                  materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
                ),
              ],
            ),
          ),
          trailing: PopupMenuButton<String>(
            tooltip: 'Actions',
            enabled: id != 0,
            onSelected: (value) {
              if (id == 0) return;
              if (value == 'edit') _editSemester(semester);
              if (value == 'delete') _delete(id);
            },
            itemBuilder: (context) => const [
              PopupMenuItem(value: 'edit', child: Text('Edit')),
              PopupMenuItem(value: 'delete', child: Text('Delete')),
            ],
          ),
        ),
      );
    }

    return Column(
      children: [
        Padding(
          padding: const EdgeInsets.fromLTRB(12, 12, 12, 8),
          child: Wrap(
            spacing: 8,
            runSpacing: 8,
            children: [
              OutlinedButton.icon(
                onPressed: _load,
                icon: const Icon(Icons.refresh),
                label: const Text('Refresh'),
              ),
              FilledButton.icon(
                onPressed: _create,
                icon: const Icon(Icons.add),
                label: const Text('New Semester'),
              ),
            ],
          ),
        ),
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 12),
          child: TextField(
            controller: _searchController,
            onChanged: (value) => setState(() => _searchQuery = value),
            onSubmitted: (_) => _load(),
            decoration: InputDecoration(
              hintText: 'Search semesters...',
              prefixIcon: const Icon(Icons.search),
              suffixIcon: (_searchQuery ?? '').isEmpty
                  ? null
                  : IconButton(
                      onPressed: () {
                        _searchController.clear();
                        setState(() => _searchQuery = '');
                        _load();
                      },
                      icon: const Icon(Icons.clear),
                    ),
            ),
          ),
        ),
        const SizedBox(height: 8),
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 12),
          child: Align(
            alignment: Alignment.centerLeft,
            child: DropdownButton<String>(
              value: _statusFilter ?? 'All Status',
              items: _statusOptions
                  .map((status) => DropdownMenuItem(value: status, child: Text(status)))
                  .toList(growable: false),
              onChanged: (value) {
                if (value == null) return;
                setState(() => _statusFilter = value);
                _load();
              },
            ),
          ),
        ),
        Expanded(
          child: RefreshIndicator(
            onRefresh: _load,
            child: isNarrow
                ? ListView.builder(
                    itemCount: _items.length,
                    itemBuilder: (_, i) => buildSemesterCard(_items[i]),
                  )
                : ListView(
                    children: [
                      SingleChildScrollView(
                        scrollDirection: Axis.horizontal,
                        child: DataTable(
                          columns: const [
                            DataColumn(label: Text('Semester')),
                            DataColumn(label: Text('Start Date')),
                            DataColumn(label: Text('End Date')),
                            DataColumn(label: Text('Status')),
                            DataColumn(label: Text('Actions')),
                          ],
                          rows: _items.map((semester) {
                            final id = int.tryParse(semester['id']?.toString() ?? '') ?? 0;
                            final name = semester['name']?.toString() ?? '-';
                            final startDate = (semester['startDate']?.toString() ?? '-').split('T').first;
                            final endDate = (semester['endDate']?.toString() ?? '-').split('T').first;
                            final status = semester['status']?.toString() ?? '-';

                            return DataRow(cells: [
                              DataCell(Text(name)),
                              DataCell(Text(startDate)),
                              DataCell(Text(endDate)),
                              DataCell(Text(status)),
                              DataCell(
                                Row(
                                  mainAxisSize: MainAxisSize.min,
                                  children: [
                                    IconButton(
                                      tooltip: 'Edit',
                                      onPressed: id == 0 ? null : () => _editSemester(semester),
                                      icon: const Icon(Icons.edit_outlined),
                                    ),
                                    IconButton(
                                      tooltip: 'Delete',
                                      onPressed: id == 0 ? null : () => _delete(id),
                                      icon: const Icon(Icons.delete_outline, color: Colors.red),
                                    ),
                                  ],
                                ),
                              ),
                            ]);
                          }).toList(growable: false),
                        ),
                      ),
                    ],
                  ),
          ),
        ),
      ],
    );
  }
}

class _ManagerGroupsPage extends StatefulWidget {
  const _ManagerGroupsPage();

  @override
  State<_ManagerGroupsPage> createState() => _ManagerGroupsPageState();
}

class _ManagerGroupsPageState extends State<_ManagerGroupsPage> {
  bool _loading = true;
  String? _error;
  List<Map<String, dynamic>> _groups = const [];
  List<Map<String, dynamic>> _classes = const [];
  List<Map<String, dynamic>> _topics = const [];
  List<Map<String, dynamic>> _students = const [];

  final TextEditingController _searchController = TextEditingController();
  String? _searchQuery;
  String? _statusFilter;

  static const List<String> _statusOptions = <String>[
    'All Status',
    'Forming',
    'Active',
    'Completed',
    'Inactive',
  ];

  @override
  void initState() {
    super.initState();
    _searchQuery ??= '';
    _statusFilter ??= 'All Status';
    _load();
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  Future<void> _load() async {
    setState(() {
      _loading = true;
      _error = null;
    });

    try {
      final result = await Future.wait<dynamic>([
        GroupService.instance.getAll(
          status: (_statusFilter ?? 'All Status') == 'All Status' ? null : _statusFilter,
          search: (_searchQuery ?? '').trim().isEmpty ? null : (_searchQuery ?? '').trim(),
        ),
        ClassService.instance.getAll(),
        TopicService.instance.getAll(),
        UserService.instance.getAllUsers(),
      ]);

      final users = (result[3] as List<Map<String, dynamic>>)
          .where((u) => (u['role']?.toString().toLowerCase() ?? '') == 'student')
          .toList(growable: false);

      if (!mounted) return;
      setState(() {
        _groups = result[0] as List<Map<String, dynamic>>;
        _classes = result[1] as List<Map<String, dynamic>>;
        _topics = (result[2] as List<dynamic>)
            .map((item) {
              if (item is Map<String, dynamic>) return item;
              return <String, dynamic>{
                'id': item.id,
                'title': item.title,
                'status': item.status,
              };
            })
            .toList(growable: false);
        _students = users;
      });
    } catch (e) {
      if (!mounted) return;
      setState(() => _error = e.toString().replaceFirst('Exception: ', ''));
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  String _classNameOf(Map<String, dynamic> group) {
    final nested = group['class'];
    if (nested is Map<String, dynamic>) {
      final name = nested['className']?.toString();
      if (name != null && name.trim().isNotEmpty) return name;
    }

    final id = int.tryParse(group['classId']?.toString() ?? '');
    if (id == null) return '-';
    final found = _classes.where((c) => int.tryParse(c['id']?.toString() ?? '') == id);
    if (found.isEmpty) return 'Class #$id';
    return found.first['className']?.toString() ?? 'Class #$id';
  }

  String _topicTitleOf(Map<String, dynamic> group) {
    final nested = group['topic'];
    if (nested is Map<String, dynamic>) {
      final title = nested['title']?.toString();
      if (title != null && title.trim().isNotEmpty) return title;
    }

    final id = int.tryParse(group['topicId']?.toString() ?? '');
    if (id == null) return '-';
    final found = _topics.where((t) => int.tryParse(t['id']?.toString() ?? '') == id);
    if (found.isEmpty) return 'Topic #$id';
    return found.first['title']?.toString() ?? 'Topic #$id';
  }

  int _memberCount(Map<String, dynamic> group) {
    final members = group['members'];
    if (members is List) return members.length;
    return 0;
  }

  Future<void> _createGroup() async {
    final nameController = TextEditingController();
    final descriptionController = TextEditingController();
    final maxMembersController = TextEditingController(text: '5');
    int? selectedClassId;
    int? selectedTopicId;

    final shouldCreate = await showDialog<bool>(
      context: context,
      builder: (context) {
        return StatefulBuilder(
          builder: (context, setStateDialog) {
            return AlertDialog(
              title: const Text('New Group'),
              content: SingleChildScrollView(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    TextField(
                      controller: nameController,
                      decoration: const InputDecoration(labelText: 'Group Name'),
                    ),
                    const SizedBox(height: 8),
                    DropdownButtonFormField<int>(
                      initialValue: selectedClassId,
                      hint: const Text('Select class'),
                      items: _classes
                          .map((c) => DropdownMenuItem<int>(
                                value: int.tryParse(c['id']?.toString() ?? ''),
                                child: Text(c['className']?.toString() ?? 'Class'),
                              ))
                          .where((item) => item.value != null)
                          .cast<DropdownMenuItem<int>>()
                          .toList(growable: false),
                      onChanged: (value) => setStateDialog(() => selectedClassId = value),
                      decoration: const InputDecoration(labelText: 'Class'),
                    ),
                    const SizedBox(height: 8),
                    DropdownButtonFormField<int>(
                      initialValue: selectedTopicId,
                      hint: const Text('Select topic'),
                      items: _topics
                          .map((t) => DropdownMenuItem<int>(
                                value: int.tryParse(t['id']?.toString() ?? ''),
                                child: Text(t['title']?.toString() ?? 'Topic'),
                              ))
                          .where((item) => item.value != null)
                          .cast<DropdownMenuItem<int>>()
                          .toList(growable: false),
                      onChanged: (value) => setStateDialog(() => selectedTopicId = value),
                      decoration: const InputDecoration(labelText: 'Topic'),
                    ),
                    const SizedBox(height: 8),
                    TextField(
                      controller: maxMembersController,
                      keyboardType: TextInputType.number,
                      decoration: const InputDecoration(labelText: 'Max Members'),
                    ),
                    const SizedBox(height: 8),
                    TextField(
                      controller: descriptionController,
                      minLines: 2,
                      maxLines: 4,
                      decoration: const InputDecoration(labelText: 'Description'),
                    ),
                  ],
                ),
              ),
              actions: [
                TextButton(
                  onPressed: () => Navigator.of(context).pop(false),
                  child: const Text('Cancel'),
                ),
                FilledButton(
                  onPressed: () => Navigator.of(context).pop(true),
                  child: const Text('Create'),
                ),
              ],
            );
          },
        );
      },
    );

    if (shouldCreate != true) return;
    if (nameController.text.trim().isEmpty || selectedClassId == null || selectedTopicId == null) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please enter group name, class and topic.')),
      );
      return;
    }

    final maxMembers = int.tryParse(maxMembersController.text.trim());

    try {
      await GroupService.instance.create(
        groupName: nameController.text.trim(),
        classId: selectedClassId!,
        topicId: selectedTopicId!,
        description: descriptionController.text.trim().isEmpty ? null : descriptionController.text.trim(),
      );

      final created = await GroupService.instance.getAll(search: nameController.text.trim());
      final createdGroup = created.isNotEmpty ? created.first : null;
      final createdId = int.tryParse(createdGroup?['id']?.toString() ?? '');

      if (createdId != null && maxMembers != null && maxMembers > 0) {
        await GroupService.instance.update(createdId, <String, dynamic>{'maxMembers': maxMembers});
      }

      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Group created successfully.')),
      );
      await _load();
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('$e')));
    }
  }

  Future<void> _editGroup(Map<String, dynamic> group) async {
    final id = int.tryParse(group['id']?.toString() ?? '') ?? 0;
    if (id == 0) return;

    final nameController = TextEditingController(text: group['groupName']?.toString() ?? '');
    final descriptionController = TextEditingController(text: group['description']?.toString() ?? '');
    final maxMembersController = TextEditingController(text: group['maxMembers']?.toString() ?? '5');
    String selectedStatus = group['status']?.toString() ?? 'Forming';
    if (!_statusOptions.contains(selectedStatus)) selectedStatus = 'Forming';

    final shouldSave = await showDialog<bool>(
      context: context,
      builder: (context) {
        return StatefulBuilder(
          builder: (context, setStateDialog) {
            return AlertDialog(
              title: const Text('Edit Group'),
              content: SingleChildScrollView(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    TextField(
                      controller: nameController,
                      decoration: const InputDecoration(labelText: 'Group Name'),
                    ),
                    const SizedBox(height: 8),
                    TextField(
                      controller: maxMembersController,
                      keyboardType: TextInputType.number,
                      decoration: const InputDecoration(labelText: 'Max Members'),
                    ),
                    const SizedBox(height: 8),
                    DropdownButtonFormField<String>(
                      initialValue: selectedStatus,
                      items: _statusOptions
                          .where((s) => s != 'All Status')
                          .map((s) => DropdownMenuItem(value: s, child: Text(s)))
                          .toList(growable: false),
                      onChanged: (value) {
                        if (value == null) return;
                        setStateDialog(() => selectedStatus = value);
                      },
                      decoration: const InputDecoration(labelText: 'Status'),
                    ),
                    const SizedBox(height: 8),
                    TextField(
                      controller: descriptionController,
                      minLines: 2,
                      maxLines: 4,
                      decoration: const InputDecoration(labelText: 'Description'),
                    ),
                  ],
                ),
              ),
              actions: [
                TextButton(
                  onPressed: () => Navigator.of(context).pop(false),
                  child: const Text('Cancel'),
                ),
                FilledButton(
                  onPressed: () => Navigator.of(context).pop(true),
                  child: const Text('Save'),
                ),
              ],
            );
          },
        );
      },
    );

    if (shouldSave != true) return;

    try {
      await GroupService.instance.update(id, <String, dynamic>{
        'groupName': nameController.text.trim(),
        'description': descriptionController.text.trim(),
        'maxMembers': int.tryParse(maxMembersController.text.trim()) ?? 5,
        'status': selectedStatus,
      });
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Group updated successfully.')),
      );
      await _load();
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('$e')));
    }
  }

  Future<void> _deleteGroup(int id) async {
    try {
      await GroupService.instance.deleteGroup(id);
      await _load();
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('$e')));
    }
  }

  Future<void> _manageMembers(Map<String, dynamic> group) async {
    final groupId = int.tryParse(group['id']?.toString() ?? '') ?? 0;
    if (groupId == 0) return;
    final messenger = ScaffoldMessenger.of(context);

    final members = await GroupService.instance.getMembers(groupId);
    if (!mounted) return;

    await showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      builder: (context) {
        return StatefulBuilder(
          builder: (context, setSheetState) {
            Future<void> addMember() async {
              int? selectedStudentId;
              String selectedRole = 'Member';
              final shouldAdd = await showDialog<bool>(
                context: context,
                builder: (context) {
                  return StatefulBuilder(
                    builder: (context, setDialogState) {
                      return AlertDialog(
                        title: const Text('Add Member'),
                        content: Column(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            DropdownButtonFormField<int>(
                              initialValue: selectedStudentId,
                              hint: const Text('Select student'),
                              items: _students
                                  .map((u) => DropdownMenuItem<int>(
                                        value: int.tryParse(u['id']?.toString() ?? ''),
                                        child: Text(
                                          '${u['fullName'] ?? 'Unknown'} (${u['studentCode'] ?? '-'})',
                                        ),
                                      ))
                                  .where((item) => item.value != null)
                                  .cast<DropdownMenuItem<int>>()
                                  .toList(growable: false),
                              onChanged: (value) => setDialogState(() => selectedStudentId = value),
                              decoration: const InputDecoration(labelText: 'Student'),
                            ),
                            const SizedBox(height: 8),
                            DropdownButtonFormField<String>(
                              initialValue: selectedRole,
                              items: const [
                                DropdownMenuItem(value: 'Leader', child: Text('Leader')),
                                DropdownMenuItem(value: 'Member', child: Text('Member')),
                              ],
                              onChanged: (value) {
                                if (value == null) return;
                                setDialogState(() => selectedRole = value);
                              },
                              decoration: const InputDecoration(labelText: 'Role'),
                            ),
                          ],
                        ),
                        actions: [
                          TextButton(
                            onPressed: () => Navigator.of(context).pop(false),
                            child: const Text('Cancel'),
                          ),
                          FilledButton(
                            onPressed: () => Navigator.of(context).pop(true),
                            child: const Text('Add'),
                          ),
                        ],
                      );
                    },
                  );
                },
              );

              if (shouldAdd != true || selectedStudentId == null) return;

              try {
                await GroupService.instance.addMember(
                  groupId: groupId,
                  userId: selectedStudentId!,
                  role: selectedRole,
                );
                final refreshed = await GroupService.instance.getMembers(groupId);
                setSheetState(() {
                  members
                    ..clear()
                    ..addAll(refreshed);
                });
              } catch (e) {
                messenger.showSnackBar(SnackBar(content: Text('$e')));
              }
            }

            Future<void> removeMember(Map<String, dynamic> member) async {
              final memberId = int.tryParse(
                    member['id']?.toString() ?? member['studentId']?.toString() ?? '',
                  ) ??
                  0;
              if (memberId == 0) return;
              try {
                await GroupService.instance.removeMember(groupId: groupId, memberId: memberId);
                final refreshed = await GroupService.instance.getMembers(groupId);
                setSheetState(() {
                  members
                    ..clear()
                    ..addAll(refreshed);
                });
              } catch (e) {
                messenger.showSnackBar(SnackBar(content: Text('$e')));
              }
            }

            return SafeArea(
              child: Padding(
                padding: EdgeInsets.only(
                  left: 16,
                  right: 16,
                  top: 12,
                  bottom: MediaQuery.of(context).viewInsets.bottom + 16,
                ),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Row(
                      children: [
                        Expanded(
                          child: Text(
                            'Members: ${group['groupName'] ?? 'Group'}',
                            style: Theme.of(context).textTheme.titleMedium?.copyWith(
                                  fontWeight: FontWeight.w700,
                                ),
                          ),
                        ),
                        IconButton(
                          tooltip: 'Add Member',
                          onPressed: addMember,
                          icon: const Icon(Icons.person_add_alt_1_outlined),
                        ),
                      ],
                    ),
                    const SizedBox(height: 8),
                    if (members.isEmpty)
                      const Padding(
                        padding: EdgeInsets.symmetric(vertical: 12),
                        child: Text('No members in this group yet.'),
                      )
                    else
                      ConstrainedBox(
                        constraints: const BoxConstraints(maxHeight: 360),
                        child: ListView.builder(
                          shrinkWrap: true,
                          itemCount: members.length,
                          itemBuilder: (_, i) {
                            final member = members[i];
                            final student = member['student'];
                            final name = student is Map<String, dynamic>
                                ? (student['fullName']?.toString() ?? 'Unknown')
                                : 'Unknown';
                            final email = student is Map<String, dynamic>
                                ? (student['email']?.toString() ?? '-')
                                : '-';
                            final role = member['role']?.toString() ?? 'Member';
                            return Card(
                              margin: const EdgeInsets.symmetric(vertical: 4),
                              child: ListTile(
                                title: Text(name),
                                subtitle: Text('$email • Role: $role'),
                                trailing: IconButton(
                                  tooltip: 'Remove',
                                  onPressed: () => removeMember(member),
                                  icon: const Icon(Icons.remove_circle_outline, color: Colors.red),
                                ),
                              ),
                            );
                          },
                        ),
                      ),
                  ],
                ),
              ),
            );
          },
        );
      },
    );

    await _load();
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) return const Center(child: CircularProgressIndicator());
    if (_error != null) return Center(child: Text(_error!, style: const TextStyle(color: Colors.red)));

    final isNarrow = MediaQuery.sizeOf(context).width < 780;

    Widget buildGroupCard(Map<String, dynamic> group) {
      final id = int.tryParse(group['id']?.toString() ?? '') ?? 0;
      final name = group['groupName']?.toString() ?? 'Unnamed Group';
      final className = _classNameOf(group);
      final topic = _topicTitleOf(group);
      final status = group['status']?.toString() ?? 'Forming';
      final maxMembers = int.tryParse(group['maxMembers']?.toString() ?? '') ?? 5;
      final members = _memberCount(group);

      return Card(
        margin: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
        child: Padding(
          padding: const EdgeInsets.fromLTRB(12, 10, 8, 10),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(name, style: const TextStyle(fontWeight: FontWeight.w700)),
                    const SizedBox(height: 6),
                    Text('Class: $className', style: const TextStyle(fontSize: 12, color: Colors.black54)),
                    Text('Topic: $topic', style: const TextStyle(fontSize: 12, color: Colors.black54)),
                    const SizedBox(height: 8),
                    Wrap(
                      spacing: 8,
                      runSpacing: 6,
                      children: [
                        Chip(
                          label: Text('Members: $members/$maxMembers', style: const TextStyle(fontSize: 12)),
                          visualDensity: VisualDensity.compact,
                          materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
                        ),
                        Chip(
                          label: Text('Status: $status', style: const TextStyle(fontSize: 12)),
                          visualDensity: VisualDensity.compact,
                          materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
                        ),
                      ],
                    ),
                  ],
                ),
              ),
              PopupMenuButton<String>(
                tooltip: 'Actions',
                enabled: id != 0,
                onSelected: (value) {
                  if (id == 0) return;
                  if (value == 'members') _manageMembers(group);
                  if (value == 'edit') _editGroup(group);
                  if (value == 'delete') _deleteGroup(id);
                },
                itemBuilder: (context) => const [
                  PopupMenuItem(value: 'members', child: Text('Manage Members')),
                  PopupMenuItem(value: 'edit', child: Text('Edit')),
                  PopupMenuItem(value: 'delete', child: Text('Delete')),
                ],
              ),
            ],
          ),
        ),
      );
    }

    return RefreshIndicator(
      onRefresh: _load,
      child: ListView(
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(12, 12, 12, 8),
            child: Wrap(
              spacing: 8,
              runSpacing: 8,
              children: [
                OutlinedButton.icon(
                  onPressed: _load,
                  icon: const Icon(Icons.refresh),
                  label: const Text('Refresh'),
                ),
                FilledButton.icon(
                  onPressed: _createGroup,
                  icon: const Icon(Icons.add),
                  label: const Text('New Group'),
                ),
              ],
            ),
          ),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 12),
            child: TextField(
              controller: _searchController,
              onChanged: (value) => setState(() => _searchQuery = value),
              onSubmitted: (_) => _load(),
              decoration: InputDecoration(
                hintText: 'Search groups...',
                prefixIcon: const Icon(Icons.search),
                suffixIcon: (_searchQuery ?? '').isEmpty
                    ? null
                    : IconButton(
                        onPressed: () {
                          _searchController.clear();
                          setState(() => _searchQuery = '');
                          _load();
                        },
                        icon: const Icon(Icons.clear),
                      ),
              ),
            ),
          ),
          const SizedBox(height: 8),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 12),
            child: Align(
              alignment: Alignment.centerLeft,
              child: DropdownButton<String>(
                value: _statusFilter ?? 'All Status',
                items: _statusOptions
                    .map((value) => DropdownMenuItem(value: value, child: Text(value)))
                    .toList(growable: false),
                onChanged: (value) {
                  if (value == null) return;
                  setState(() => _statusFilter = value);
                  _load();
                },
              ),
            ),
          ),
          const SizedBox(height: 8),
          if (isNarrow)
            ListView.builder(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: _groups.length,
              itemBuilder: (_, i) => buildGroupCard(_groups[i]),
            )
          else
            SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              child: DataTable(
                columns: const [
                  DataColumn(label: Text('Group')),
                  DataColumn(label: Text('Class')),
                  DataColumn(label: Text('Topic')),
                  DataColumn(label: Text('Members')),
                  DataColumn(label: Text('Status')),
                  DataColumn(label: Text('Actions')),
                ],
                rows: _groups.map((group) {
                  final id = int.tryParse(group['id']?.toString() ?? '') ?? 0;
                  return DataRow(cells: [
                    DataCell(Text(group['groupName']?.toString() ?? 'Unnamed Group')),
                    DataCell(Text(_classNameOf(group))),
                    DataCell(Text(_topicTitleOf(group))),
                    DataCell(Text('${_memberCount(group)}/${group['maxMembers'] ?? 5}')),
                    DataCell(Text(group['status']?.toString() ?? 'Forming')),
                    DataCell(
                      Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          IconButton(
                            tooltip: 'Members',
                            onPressed: id == 0 ? null : () => _manageMembers(group),
                            icon: const Icon(Icons.group_add_outlined),
                          ),
                          IconButton(
                            tooltip: 'Edit',
                            onPressed: id == 0 ? null : () => _editGroup(group),
                            icon: const Icon(Icons.edit_outlined),
                          ),
                          IconButton(
                            tooltip: 'Delete',
                            onPressed: id == 0 ? null : () => _deleteGroup(id),
                            icon: const Icon(Icons.delete_outline, color: Colors.red),
                          ),
                        ],
                      ),
                    ),
                  ]);
                }).toList(growable: false),
              ),
            ),
          const SizedBox(height: 12),
        ],
      ),
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
  List<Map<String, dynamic>> _lecturers = const [];
  Map<int, String> _semesterNames = const {};
  final TextEditingController _searchController = TextEditingController();
  String? _searchQuery;
  String? _semesterFilter;
  String? _statusFilter;

  static const List<String> _statusOptions = <String>[
    'All Status',
    'Active',
    'Inactive',
  ];

  @override
  void initState() {
    super.initState();
    _searchQuery ??= '';
    _semesterFilter ??= 'All Semesters';
    _statusFilter ??= 'All Status';
    _load();
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  Future<void> _load() async {
    setState(() {
      _loading = true;
      _error = null;
    });

    try {
      final result = await Future.wait<dynamic>([
        ClassService.instance.getAll(
          search: (_searchQuery ?? '').trim().isEmpty ? null : (_searchQuery ?? '').trim(),
        ),
        SemesterService.instance.getAll(),
        UserService.instance.getAllUsers(),
      ]);

      final classes = result[0] as List<Map<String, dynamic>>;
      final semesters = result[1] as List<Map<String, dynamic>>;
      final users = result[2] as List<Map<String, dynamic>>;
      final lecturers = users
          .where((u) => (u['role']?.toString().toLowerCase() ?? '') == 'lecturer')
          .toList(growable: false);

      final semesterNames = <int, String>{
        for (final s in semesters)
          if (int.tryParse(s['id']?.toString() ?? '') != null)
            int.parse(s['id'].toString()): (s['name']?.toString() ?? 'Unknown Semester'),
      };

      if (!mounted) return;
      setState(() {
        _items = classes;
        _lecturers = lecturers;
        _semesterNames = semesterNames;
      });
    } catch (e) {
      if (!mounted) return;
      setState(() => _error = e.toString().replaceFirst('Exception: ', ''));
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  List<String> get _semesterOptions {
    final options = <String>['All Semesters'];
    options.addAll(_semesterNames.values.toSet().toList(growable: false));
    return options;
  }

  String _resolveSemesterName(Map<String, dynamic> item) {
    final semester = item['semester'];
    if (semester is Map<String, dynamic>) {
      return semester['name']?.toString() ?? 'Unknown Semester';
    }
    final semesterId = int.tryParse(item['semesterId']?.toString() ?? '');
    if (semesterId == null) return '-';
    return _semesterNames[semesterId] ?? 'Semester #$semesterId';
  }

  String _resolveLecturerName(Map<String, dynamic> item) {
    final lecturer = item['lecturer'];
    if (lecturer is Map<String, dynamic>) {
      return lecturer['fullName']?.toString() ?? 'Unknown Lecturer';
    }

    final lecturerId = int.tryParse(item['lecturerId']?.toString() ?? '');
    if (lecturerId == null) return '-';
    final found = _lecturers.firstWhere(
      (u) => int.tryParse(u['id']?.toString() ?? '') == lecturerId,
      orElse: () => <String, dynamic>{},
    );
    if (found.isEmpty) return 'Lecturer #$lecturerId';
    return found['fullName']?.toString() ?? 'Lecturer #$lecturerId';
  }

  int _resolveMemberCount(Map<String, dynamic> item) {
    final groups = item['groups'];
    if (groups is List) return groups.length;
    return 0;
  }

  String _resolveStatus(Map<String, dynamic> item) {
    final explicit = item['status']?.toString();
    if (explicit != null && explicit.trim().isNotEmpty) return explicit;
    return _resolveMemberCount(item) > 0 ? 'Active' : 'Inactive';
  }

  List<Map<String, dynamic>> get _filteredClasses {
    final query = (_searchQuery ?? '').trim().toLowerCase();
    return _items.where((item) {
      final className = item['className']?.toString().toLowerCase() ?? '';
      final semesterName = _resolveSemesterName(item).toLowerCase();
      final lecturerName = _resolveLecturerName(item).toLowerCase();
      final status = _resolveStatus(item).toLowerCase();

      final passSearch = query.isEmpty ||
          className.contains(query) ||
          semesterName.contains(query) ||
          lecturerName.contains(query) ||
          status.contains(query);

      final passSemester = (_semesterFilter ?? 'All Semesters') == 'All Semesters' ||
          semesterName == (_semesterFilter ?? '').toLowerCase();

      final passStatus = (_statusFilter ?? 'All Status') == 'All Status' ||
          status == (_statusFilter ?? '').toLowerCase();

      return passSearch && passSemester && passStatus;
    }).toList(growable: false);
  }

  Future<void> _createClass() async {
    final classNameController = TextEditingController();
    int? selectedLecturerId;
    int? selectedSemesterId;

    final shouldCreate = await showDialog<bool>(
      context: context,
      builder: (context) {
        return StatefulBuilder(
          builder: (context, setStateDialog) {
            return AlertDialog(
              title: const Text('New Class'),
              content: SingleChildScrollView(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    TextField(
                      controller: classNameController,
                      decoration: const InputDecoration(labelText: 'Class'),
                    ),
                    const SizedBox(height: 8),
                    DropdownButtonFormField<int>(
                      initialValue: selectedSemesterId,
                      hint: const Text('Select Semester (optional)'),
                      items: _semesterNames.entries
                          .map((e) => DropdownMenuItem<int>(
                                value: e.key,
                                child: Text(e.value),
                              ))
                          .toList(growable: false),
                      onChanged: (value) => setStateDialog(() => selectedSemesterId = value),
                      decoration: const InputDecoration(labelText: 'Semester'),
                    ),
                    const SizedBox(height: 8),
                    DropdownButtonFormField<int>(
                      initialValue: selectedLecturerId,
                      hint: const Text('Select Lecturer'),
                      items: _lecturers
                          .map((u) => DropdownMenuItem<int>(
                                value: int.tryParse(u['id']?.toString() ?? ''),
                                child: Text(u['fullName']?.toString() ?? 'Unknown Lecturer'),
                              ))
                          .where((item) => item.value != null)
                          .cast<DropdownMenuItem<int>>()
                          .toList(growable: false),
                      onChanged: (value) => setStateDialog(() => selectedLecturerId = value),
                      decoration: const InputDecoration(labelText: 'Lecturer'),
                    ),
                  ],
                ),
              ),
              actions: [
                TextButton(
                  onPressed: () => Navigator.of(context).pop(false),
                  child: const Text('Cancel'),
                ),
                FilledButton(
                  onPressed: () => Navigator.of(context).pop(true),
                  child: const Text('Create'),
                ),
              ],
            );
          },
        );
      },
    );

    if (shouldCreate != true) return;
    if (classNameController.text.trim().isEmpty || selectedLecturerId == null) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please enter class name and choose lecturer.')),
      );
      return;
    }

    try {
      await ClassService.instance.create(
        className: classNameController.text.trim(),
        lecturerId: selectedLecturerId!,
        semesterId: selectedSemesterId,
      );
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Class created successfully.')),
      );
      await _load();
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('$e')));
    }
  }

  Future<void> _editClass(Map<String, dynamic> item) async {
    final id = int.tryParse(item['id']?.toString() ?? '') ?? 0;
    if (id == 0) return;

    Map<String, dynamic> detail = item;
    try {
      detail = await ClassService.instance.getById(id);
    } catch (_) {
      // Fall back to list item data if detail endpoint fails.
    }
    if (!mounted) return;

    final classNameController = TextEditingController(
      text: detail['className']?.toString() ?? '',
    );
    int? selectedSemesterId = int.tryParse(detail['semesterId']?.toString() ?? '');
    int? selectedLecturerId = int.tryParse(detail['lecturerId']?.toString() ?? '');

    final shouldSave = await showDialog<bool>(
      context: context,
      builder: (context) {
        return StatefulBuilder(
          builder: (context, setStateDialog) {
            return AlertDialog(
              title: const Text('Edit Class'),
              content: SingleChildScrollView(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    TextField(
                      controller: classNameController,
                      decoration: const InputDecoration(labelText: 'Class'),
                    ),
                    const SizedBox(height: 8),
                    DropdownButtonFormField<int>(
                      initialValue: selectedSemesterId,
                      hint: const Text('Select Semester (optional)'),
                      items: _semesterNames.entries
                          .map((e) => DropdownMenuItem<int>(
                                value: e.key,
                                child: Text(e.value),
                              ))
                          .toList(growable: false),
                      onChanged: (value) => setStateDialog(() => selectedSemesterId = value),
                      decoration: const InputDecoration(labelText: 'Semester'),
                    ),
                    const SizedBox(height: 8),
                    DropdownButtonFormField<int>(
                      initialValue: selectedLecturerId,
                      hint: const Text('Select Lecturer'),
                      items: _lecturers
                          .map((u) => DropdownMenuItem<int>(
                                value: int.tryParse(u['id']?.toString() ?? ''),
                                child: Text(u['fullName']?.toString() ?? 'Unknown Lecturer'),
                              ))
                          .where((item) => item.value != null)
                          .cast<DropdownMenuItem<int>>()
                          .toList(growable: false),
                      onChanged: (value) => setStateDialog(() => selectedLecturerId = value),
                      decoration: const InputDecoration(labelText: 'Lecturer'),
                    ),
                  ],
                ),
              ),
              actions: [
                TextButton(
                  onPressed: () => Navigator.of(context).pop(false),
                  child: const Text('Cancel'),
                ),
                FilledButton(
                  onPressed: () => Navigator.of(context).pop(true),
                  child: const Text('Save'),
                ),
              ],
            );
          },
        );
      },
    );

    if (shouldSave != true) return;

    try {
      await ClassService.instance.update(id, <String, dynamic>{
        'className': classNameController.text.trim(),
        'semesterId': selectedSemesterId,
        'lecturerId': selectedLecturerId,
      });
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Class updated successfully.')),
      );
      await _load();
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('$e')));
    }
  }

  Future<void> _deleteClass(int id) async {
    try {
      await ClassService.instance.deleteClass(id);
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

    final isNarrow = MediaQuery.sizeOf(context).width < 700;

    Widget buildClassCard(Map<String, dynamic> item) {
      final id = int.tryParse(item['id']?.toString() ?? '') ?? 0;
      final className = item['className']?.toString() ?? 'Unknown Class';
      final semesterName = _resolveSemesterName(item);
      final lecturerName = _resolveLecturerName(item);
      final members = _resolveMemberCount(item);
      final status = _resolveStatus(item);

      return Card(
        margin: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
        child: Padding(
          padding: const EdgeInsets.fromLTRB(12, 10, 8, 10),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(className, style: const TextStyle(fontWeight: FontWeight.w700)),
                    const SizedBox(height: 6),
                    Text('Semester: $semesterName', style: const TextStyle(fontSize: 12, color: Colors.black54)),
                    Text('Lecturer: $lecturerName', style: const TextStyle(fontSize: 12, color: Colors.black54)),
                    const SizedBox(height: 8),
                    Wrap(
                      spacing: 8,
                      runSpacing: 6,
                      children: [
                        Chip(
                          label: Text('Members: $members', style: const TextStyle(fontSize: 12)),
                          visualDensity: VisualDensity.compact,
                          materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
                        ),
                        Chip(
                          label: Text('Status: $status', style: const TextStyle(fontSize: 12)),
                          visualDensity: VisualDensity.compact,
                          materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
                        ),
                      ],
                    ),
                  ],
                ),
              ),
              PopupMenuButton<String>(
                tooltip: 'Actions',
                enabled: id != 0,
                onSelected: (value) {
                  if (id == 0) return;
                  if (value == 'edit') _editClass(item);
                  if (value == 'delete') _deleteClass(id);
                },
                itemBuilder: (context) => const [
                  PopupMenuItem(value: 'edit', child: Text('Edit')),
                  PopupMenuItem(value: 'delete', child: Text('Delete')),
                ],
              ),
            ],
          ),
        ),
      );
    }

    return RefreshIndicator(
      onRefresh: _load,
      child: ListView(
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(12, 12, 12, 8),
            child: Wrap(
              spacing: 8,
              runSpacing: 8,
              children: [
                OutlinedButton.icon(
                  onPressed: _load,
                  icon: const Icon(Icons.refresh),
                  label: const Text('Refresh'),
                ),
                FilledButton.icon(
                  onPressed: _createClass,
                  icon: const Icon(Icons.add),
                  label: const Text('New Class'),
                ),
              ],
            ),
          ),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 12),
            child: TextField(
              controller: _searchController,
              onChanged: (value) => setState(() => _searchQuery = value),
              onSubmitted: (_) => _load(),
              decoration: InputDecoration(
                hintText: 'Search classes...',
                prefixIcon: const Icon(Icons.search),
                suffixIcon: (_searchQuery ?? '').isEmpty
                    ? null
                    : IconButton(
                        onPressed: () {
                          _searchController.clear();
                          setState(() => _searchQuery = '');
                          _load();
                        },
                        icon: const Icon(Icons.clear),
                      ),
              ),
            ),
          ),
          const SizedBox(height: 8),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 12),
            child: Wrap(
              spacing: 16,
              runSpacing: 8,
              crossAxisAlignment: WrapCrossAlignment.center,
              children: [
                DropdownButton<String>(
                  value: _semesterFilter ?? 'All Semesters',
                  items: _semesterOptions
                      .map((value) => DropdownMenuItem(value: value, child: Text(value)))
                      .toList(growable: false),
                  onChanged: (value) => setState(() => _semesterFilter = value),
                ),
                DropdownButton<String>(
                  value: _statusFilter ?? 'All Status',
                  items: _statusOptions
                      .map((value) => DropdownMenuItem(value: value, child: Text(value)))
                      .toList(growable: false),
                  onChanged: (value) => setState(() => _statusFilter = value),
                ),
              ],
            ),
          ),
          const SizedBox(height: 8),
          if (isNarrow)
            ListView.builder(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: _filteredClasses.length,
              itemBuilder: (_, i) => buildClassCard(_filteredClasses[i]),
            )
          else
            SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              child: DataTable(
                columns: const [
                  DataColumn(label: Text('Class')),
                  DataColumn(label: Text('Semester')),
                  DataColumn(label: Text('Lecturer')),
                  DataColumn(label: Text('Members')),
                  DataColumn(label: Text('Status')),
                  DataColumn(label: Text('Actions')),
                ],
                rows: _filteredClasses.map((item) {
                  final id = int.tryParse(item['id']?.toString() ?? '') ?? 0;
                  final className = item['className']?.toString() ?? 'Unknown Class';
                  final semesterName = _resolveSemesterName(item);
                  final lecturerName = _resolveLecturerName(item);
                  final members = _resolveMemberCount(item);
                  final status = _resolveStatus(item);

                  return DataRow(cells: [
                    DataCell(Text(className)),
                    DataCell(Text(semesterName)),
                    DataCell(Text(lecturerName)),
                    DataCell(Text('$members')),
                    DataCell(Text(status)),
                    DataCell(
                      Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          IconButton(
                            tooltip: 'Edit',
                            onPressed: id == 0 ? null : () => _editClass(item),
                            icon: const Icon(Icons.edit_outlined),
                          ),
                          IconButton(
                            tooltip: 'Delete',
                            onPressed: id == 0 ? null : () => _deleteClass(id),
                            icon: const Icon(Icons.delete_outline, color: Colors.red),
                          ),
                        ],
                      ),
                    ),
                  ]);
                }).toList(growable: false),
              ),
            ),
        ],
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
    final messenger = ScaffoldMessenger.of(context);
    final reasonController = TextEditingController();
    final confirm = await showDialog<bool>(
      context: context,
      builder: (context) {
        return AlertDialog(
          title: const Text('Reject Topic'),
          content: TextField(
            controller: reasonController,
            minLines: 2,
            maxLines: 4,
            decoration: const InputDecoration(
              border: OutlineInputBorder(),
              labelText: 'Rejection reason',
            ),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(context).pop(false),
              child: const Text('Cancel'),
            ),
            FilledButton(
              onPressed: () => Navigator.of(context).pop(true),
              child: const Text('Reject'),
            ),
          ],
        );
      },
    );

    if (confirm != true) return;
    await TopicService.instance.reject(id, reason: reasonController.text.trim());
    if (!mounted) return;
    await _load();
    messenger.showSnackBar(
      const SnackBar(content: Text('Topic rejected and lecturer notified.')),
    );
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
  const _CountCard({required this.label, required this.value, required this.icon});

  final String label;
  final int value;
  final IconData icon;

  @override
  Widget build(BuildContext context) {
    return StatCard(label: label, value: value, icon: icon);
  }
}
