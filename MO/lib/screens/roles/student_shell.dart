import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

import '../../models/topic_item.dart';
import '../../services/class_service.dart';
import '../../services/group_service.dart';
import '../../services/submission_service.dart';
import '../../services/task_service.dart';
import '../../services/topic_service.dart';
import '../../widgets/ui_kit.dart';
import '../profile_screen.dart';
import '../question_management_screen.dart';

class StudentShell extends StatefulWidget {
  const StudentShell({super.key});

  @override
  State<StudentShell> createState() => _StudentShellState();
}

class _StudentShellState extends State<StudentShell> {
  int _index = 0;

  Widget _buildBottomNav(BuildContext context) {
    final width = MediaQuery.sizeOf(context).width;
    final labelBehavior = width < 420
        ? NavigationDestinationLabelBehavior.alwaysHide
        : NavigationDestinationLabelBehavior.onlyShowSelected;

    return NavigationBar(
      height: width < 420 ? 60 : null,
      labelBehavior: labelBehavior,
      selectedIndex: _index,
      destinations: _tabs,
      onDestinationSelected: (v) => setState(() => _index = v),
    );
  }

  static const _tabs = <NavigationDestination>[
    NavigationDestination(icon: Icon(Icons.dashboard_outlined), label: 'Dashboard'),
    NavigationDestination(icon: Icon(Icons.topic_outlined), label: 'Topic'),
    NavigationDestination(icon: Icon(Icons.checklist_outlined), label: 'Tasks'),
    NavigationDestination(icon: Icon(Icons.question_answer_outlined), label: 'Q&A'),
    NavigationDestination(icon: Icon(Icons.assignment_outlined), label: 'Submissions'),
    NavigationDestination(icon: Icon(Icons.person_outline), label: 'Account'),
  ];

  static const _titles = <String>[
    'Student Dashboard',
    'Group Topic',
    'Task Board',
    'Q&A',
    'Group Submissions',
    'Account',
  ];

  @override
  Widget build(BuildContext context) {
    final pages = <Widget>[
      const _StudentDashboardPage(),
      const _StudentTopicSelectionPage(),
      const _StudentGroupTaskPage(),
      const QuestionManagementScreen(
        showCreateButton: true,
        title: 'Q&A',
        subtitle: 'Ask questions and share knowledge',
      ),
      const _StudentSubmissionPage(),
      const ProfileScreen(),
    ];

    return Scaffold(
      appBar: _index == 5 ? null : AppBar(title: Text(_titles[_index])),
      body: IndexedStack(index: _index, children: pages),
      bottomNavigationBar: _buildBottomNav(context),
    );
  }
}

class _StudentDashboardPage extends StatefulWidget {
  const _StudentDashboardPage();

  @override
  State<_StudentDashboardPage> createState() => _StudentDashboardPageState();
}

class _StudentDashboardPageState extends State<_StudentDashboardPage> {
  bool _loading = true;
  String? _error;
  Map<String, dynamic>? _group;

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
      final groups = await GroupService.instance.getAll();
      if (!mounted) return;
      setState(() {
        _group = groups.isEmpty ? null : groups.first;
      });
    } catch (e) {
      if (!mounted) return;
      setState(() => _error = '$e');
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;
    if (_loading) return const Center(child: CircularProgressIndicator());
    if (_error != null) return Center(child: Text(_error!, style: const TextStyle(color: Colors.red)));

    final group = _group;
    final members = group?['members'] as List<dynamic>? ?? <dynamic>[];
    final memberCount = members.length;
    final onlineCount = members.where((m) => (m as Map<String, dynamic>)['isOnline'] == true).length;
    final topic = group?['topic'] as Map<String, dynamic>? ?? <String, dynamic>{};
    final classInfo = group?['class'] as Map<String, dynamic>? ?? <String, dynamic>{};
    final createdAt = DateTime.tryParse(group?['createdAt']?.toString() ?? '');

    return RefreshIndicator(
      onRefresh: _load,
      child: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          DashboardHero(
            title: _safe(topic['title']?.toString() ?? 'Student Dashboard'),
            subtitle: 'Topic • Trạng thái: ${_safe(topic['status']?.toString().toUpperCase() ?? 'N/A')}\n${_safe(classInfo['className']?.toString() ?? 'N/A')} • Tạo ngày ${_formatDate(createdAt)}',
            icon: Icons.school_outlined,
          ),
          const SizedBox(height: 14),
          Wrap(
            spacing: 10,
            runSpacing: 10,
            children: [
              _CountCard(label: 'Thành viên', value: memberCount, icon: Icons.groups_2_outlined),
              _CountCard(label: 'Đang online', value: onlineCount, icon: Icons.circle_outlined),
            ],
          ),
          const SizedBox(height: 12),
          SectionCard(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Thông tin nhóm',
                  style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w900),
                ),
                const SizedBox(height: 10),
                _kv('Tên nhóm', _safe(group?['groupName']?.toString() ?? 'Chưa có nhóm')),
                _kv('Topic', _safe(topic['title']?.toString() ?? 'Chưa đăng ký')),
                _kv('Lớp', _safe(classInfo['className']?.toString() ?? 'N/A')),
                _kv('Tạo lúc', _formatDate(createdAt)),
              ],
            ),
          ),
          const SizedBox(height: 12),
          SectionCard(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Thành viên nhóm',
                  style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w900),
                ),
                const SizedBox(height: 10),
                if (members.isEmpty)
                  Text(
                    'Nhóm chưa có thành viên.',
                    style: TextStyle(color: colorScheme.onSurfaceVariant),
                  )
                else
                  ...members.map((raw) {
                    final member = raw as Map<String, dynamic>;
                    final fullName = _safe(member['fullName']?.toString() ?? 'Student');
                    final email = member['email']?.toString() ?? '';
                    final isOnline = member['isOnline'] == true;
                    final initial = fullName.trim().isEmpty ? 'S' : fullName.trim().substring(0, 1).toUpperCase();
                    return Container(
                      margin: const EdgeInsets.only(bottom: 10),
                      padding: const EdgeInsets.all(10),
                      decoration: BoxDecoration(
                        color: colorScheme.surfaceContainerHighest.withValues(alpha: 0.35),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Row(
                        children: [
                          CircleAvatar(
                            radius: 18,
                            child: Text(initial),
                          ),
                          const SizedBox(width: 10),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(fullName, style: const TextStyle(fontWeight: FontWeight.w700)),
                                Text(email, style: TextStyle(color: colorScheme.onSurfaceVariant)),
                              ],
                            ),
                          ),
                          Chip(
                            label: Text(isOnline ? 'Online' : 'Offline'),
                            backgroundColor: isOnline
                                ? Colors.green.withValues(alpha: 0.14)
                                : colorScheme.surfaceContainerHighest,
                            side: BorderSide.none,
                          ),
                        ],
                      ),
                    );
                  }),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _kv(String key, String value) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 6),
      child: Row(
        children: [
          SizedBox(
            width: 86,
            child: Text(
              key,
              style: const TextStyle(fontWeight: FontWeight.w700),
            ),
          ),
          Expanded(child: Text(value)),
        ],
      ),
    );
  }

  String _formatDate(DateTime? dt) {
    if (dt == null) return 'N/A';
    return DateFormat('d/M/yyyy').format(dt);
  }
}

class _StudentTopicSelectionPage extends StatefulWidget {
  const _StudentTopicSelectionPage();

  @override
  State<_StudentTopicSelectionPage> createState() => _StudentTopicSelectionPageState();
}

class _StudentTopicSelectionPageState extends State<_StudentTopicSelectionPage> {
  bool _loading = true;
  String? _error;
  List<TopicItem> _topics = const <TopicItem>[];
  List<Map<String, dynamic>> _groups = const <Map<String, dynamic>>[];
  List<Map<String, dynamic>> _classes = const <Map<String, dynamic>>[];
  int? _activeGroupId;

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
      final result = await Future.wait<dynamic>([
        TopicService.instance.getAll(status: 'APPROVED'),
        GroupService.instance.getAll(),
        ClassService.instance.getAll(),
      ]);

      if (!mounted) return;
      final groups = result[1] as List<Map<String, dynamic>>;
      setState(() {
        _topics = result[0] as List<TopicItem>;
        _groups = groups;
        _classes = result[2] as List<Map<String, dynamic>>;
        _activeGroupId ??= groups.isEmpty ? null : int.tryParse(groups.first['id']?.toString() ?? '');
      });
    } catch (e) {
      if (!mounted) return;
      setState(() => _error = '$e');
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  Future<void> _chooseTopic(TopicItem topic) async {
    final groupId = _activeGroupId;
    if (groupId == null) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Ban can tao nhom truoc khi chon de tai.')),
      );
      return;
    }

    try {
      await GroupService.instance.update(groupId, <String, dynamic>{
        'topicId': topic.id,
      });
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Da dang ky de tai cho nhom thanh cong.')),
      );
      await _load();
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('$e')));
    }
  }

  Future<void> _createGroupDialog() async {
    final nameController = TextEditingController();
    int? classId;
    int? topicId = _topics.isNotEmpty ? _topics.first.id : null;

    final shouldCreate = await showDialog<bool>(
      context: context,
      builder: (context) {
        return StatefulBuilder(
          builder: (context, setDialogState) {
            return AlertDialog(
              title: const Text('Tao nhom moi'),
              content: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  TextField(
                    controller: nameController,
                    decoration: const InputDecoration(labelText: 'Ten nhom'),
                  ),
                  const SizedBox(height: 8),
                  DropdownButtonFormField<int>(
                    initialValue: classId,
                    hint: const Text('Chon lop'),
                    items: _classes
                        .map(
                          (c) => DropdownMenuItem<int>(
                            value: int.tryParse(c['id']?.toString() ?? ''),
                            child: Text(_safe(c['className']?.toString() ?? 'Class')),
                          ),
                        )
                        .where((item) => item.value != null)
                        .cast<DropdownMenuItem<int>>()
                        .toList(growable: false),
                    onChanged: (value) => setDialogState(() => classId = value),
                  ),
                  const SizedBox(height: 8),
                  DropdownButtonFormField<int>(
                    initialValue: topicId,
                    hint: const Text('Chon de tai duyet'),
                    items: _topics
                        .map(
                          (t) => DropdownMenuItem<int>(
                            value: t.id,
                            child: Text(_safe(t.title)),
                          ),
                        )
                        .toList(growable: false),
                    onChanged: (value) => setDialogState(() => topicId = value),
                  ),
                ],
              ),
              actions: [
                TextButton(
                  onPressed: () => Navigator.of(context).pop(false),
                  child: const Text('Huy'),
                ),
                FilledButton(
                  onPressed: () => Navigator.of(context).pop(true),
                  child: const Text('Tao nhom'),
                ),
              ],
            );
          },
        );
      },
    );

    if (shouldCreate != true) return;
    if (nameController.text.trim().isEmpty || classId == null || topicId == null) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Vui long nhap du thong tin nhom, lop, de tai.')),
      );
      return;
    }

    try {
      await GroupService.instance.create(
        groupName: nameController.text.trim(),
        classId: classId!,
        topicId: topicId!,
      );
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Tao nhom thanh cong.')),
      );
      await _load();
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(e.toString().replaceFirst('Exception: ', ''))),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;
    if (_loading) return const Center(child: CircularProgressIndicator());
    if (_error != null) return Center(child: Text(_error!, style: const TextStyle(color: Colors.red)));

    Map<String, dynamic>? group;
    for (final item in _groups) {
      if (int.tryParse(item['id']?.toString() ?? '') == _activeGroupId) {
        group = item;
        break;
      }
    }
    final registeredTopicId = int.tryParse((group?['topic'] as Map<String, dynamic>?)?['id']?.toString() ?? '');

    return RefreshIndicator(
      onRefresh: _load,
      child: ListView(
        padding: const EdgeInsets.all(12),
        children: [
          SectionCard(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Đề tài của nhóm',
                  style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w900),
                ),
                const SizedBox(height: 6),
                Text(
                  'Sinh viên chỉ được chọn từ danh sách đề tài đã được duyệt.',
                  style: TextStyle(color: colorScheme.onSurfaceVariant),
                ),
                const SizedBox(height: 10),
                Wrap(
                  spacing: 8,
                  children: [
                    OutlinedButton.icon(
                      onPressed: _load,
                      icon: const Icon(Icons.refresh),
                      label: const Text('Làm mới'),
                    ),
                    if (_groups.isEmpty)
                      FilledButton.icon(
                        onPressed: _createGroupDialog,
                        icon: const Icon(Icons.group_add_outlined),
                        label: const Text('Tạo nhóm'),
                      ),
                  ],
                ),
                const SizedBox(height: 10),
                if (_groups.isEmpty)
                  const Text('Bạn chưa có nhóm. Hãy tạo nhóm trước khi chọn đề tài.')
                else
                  DropdownButtonFormField<int>(
                    initialValue: _activeGroupId,
                    items: _groups
                        .map(
                          (g) => DropdownMenuItem<int>(
                            value: int.tryParse(g['id']?.toString() ?? ''),
                            child: Text(_safe(g['groupName']?.toString() ?? 'Group')),
                          ),
                        )
                        .where((item) => item.value != null)
                        .cast<DropdownMenuItem<int>>()
                        .toList(growable: false),
                    onChanged: (value) => setState(() => _activeGroupId = value),
                    decoration: const InputDecoration(
                      labelText: 'Nhóm',
                      isDense: true,
                    ),
                  ),
              ],
            ),
          ),
          const SizedBox(height: 12),
          Text(
            'Danh sách đề tài đã duyệt',
            style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w900),
          ),
          const SizedBox(height: 8),
          if (_topics.isEmpty)
            const SectionCard(child: Text('Chưa có đề tài APPROVED.'))
          else
            ..._topics.map((topic) {
              final selected = registeredTopicId != null && topic.id == registeredTopicId;
              return Card(
                margin: const EdgeInsets.only(bottom: 10),
                child: Padding(
                  padding: const EdgeInsets.all(12),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        _safe(topic.title),
                        style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 16),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        'APPROVED',
                        style: TextStyle(
                          color: Colors.green.shade700,
                          fontWeight: FontWeight.w800,
                        ),
                      ),
                      const SizedBox(height: 6),
                      Text(_safe(topic.description)),
                      const SizedBox(height: 10),
                      Wrap(
                        spacing: 8,
                        children: [
                          if (selected)
                            Chip(
                              label: const Text('Đã đăng ký'),
                              side: BorderSide.none,
                              backgroundColor: Colors.green.withValues(alpha: 0.15),
                            ),
                          FilledButton.tonal(
                            onPressed: _groups.isEmpty || selected ? null : () => _chooseTopic(topic),
                            child: Text(selected ? 'Đã chọn đề tài' : 'Chọn đề tài'),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              );
            }),
        ],
      ),
    );
  }
}

class _StudentGroupTaskPage extends StatefulWidget {
  const _StudentGroupTaskPage();

  @override
  State<_StudentGroupTaskPage> createState() => _StudentGroupTaskPageState();
}

class _StudentGroupTaskPageState extends State<_StudentGroupTaskPage> {
  bool _loading = true;
  String? _error;
  List<Map<String, dynamic>> _myGroups = const <Map<String, dynamic>>[];
  List<Map<String, dynamic>> _tasks = const <Map<String, dynamic>>[];

  int? _selectedGroupId;

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
      final groups = await GroupService.instance.getAll();
      final selected = _selectedGroupId ??
          (groups.isEmpty ? null : int.tryParse(groups.first['id']?.toString() ?? ''));
      final tasks = selected == null
          ? const <Map<String, dynamic>>[]
          : await TaskService.instance.getAll(groupId: selected);

      if (!mounted) return;
      setState(() {
        _myGroups = groups;
        _selectedGroupId = selected;
        _tasks = tasks;
      });
    } catch (e) {
      if (!mounted) return;
      setState(() => _error = e.toString().replaceFirst('Exception: ', ''));
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  Future<void> _addTask() async {
    final groupId = _selectedGroupId;
    if (groupId == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Choose a group first.')),
      );
      return;
    }

    final titleController = TextEditingController();
    final descController = TextEditingController();
    String status = 'TODO';
    String priority = 'MEDIUM';

    final shouldCreate = await showDialog<bool>(
      context: context,
      builder: (context) {
        return StatefulBuilder(
          builder: (context, setDialogState) {
            return AlertDialog(
              title: const Text('New Internal Task'),
              content: SingleChildScrollView(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    TextField(
                      controller: titleController,
                      decoration: const InputDecoration(labelText: 'Task title'),
                    ),
                    const SizedBox(height: 8),
                    TextField(
                      controller: descController,
                      minLines: 2,
                      maxLines: 4,
                      decoration: const InputDecoration(labelText: 'Description'),
                    ),
                    const SizedBox(height: 8),
                    DropdownButtonFormField<String>(
                      initialValue: status,
                      items: const [
                        DropdownMenuItem(value: 'TODO', child: Text('TODO')),
                        DropdownMenuItem(value: 'IN_PROGRESS', child: Text('IN_PROGRESS')),
                        DropdownMenuItem(value: 'DONE', child: Text('DONE')),
                      ],
                      onChanged: (value) => setDialogState(() => status = value ?? 'TODO'),
                      decoration: const InputDecoration(labelText: 'Status'),
                    ),
                    const SizedBox(height: 8),
                    DropdownButtonFormField<String>(
                      initialValue: priority,
                      items: const [
                        DropdownMenuItem(value: 'LOW', child: Text('LOW')),
                        DropdownMenuItem(value: 'MEDIUM', child: Text('MEDIUM')),
                        DropdownMenuItem(value: 'HIGH', child: Text('HIGH')),
                      ],
                      onChanged: (value) => setDialogState(() => priority = value ?? 'MEDIUM'),
                      decoration: const InputDecoration(labelText: 'Priority'),
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
    if (titleController.text.trim().isEmpty) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Task title is required.')),
      );
      return;
    }

    try {
      await TaskService.instance.create(
        groupId: groupId,
        title: titleController.text.trim(),
        description: descController.text.trim().isEmpty ? null : descController.text.trim(),
        status: status,
        priority: priority,
      );
      if (!mounted) return;
      await _refreshTasks();
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(e.toString().replaceFirst('Exception: ', ''))),
      );
    }
  }

  Future<void> _refreshTasks() async {
    final groupId = _selectedGroupId;
    if (groupId == null) {
      setState(() => _tasks = const <Map<String, dynamic>>[]);
      return;
    }

    try {
      final tasks = await TaskService.instance.getAll(groupId: groupId);
      if (!mounted) return;
      setState(() => _tasks = tasks);
    } catch (_) {
      // Keep existing data if refresh fails.
    }
  }

  Future<void> _moveTaskStatus(Map<String, dynamic> task, String nextStatus) async {
    final id = int.tryParse(task['id']?.toString() ?? '') ?? 0;
    if (id == 0) return;

    try {
      await TaskService.instance.update(id, <String, dynamic>{'status': nextStatus});
      if (!mounted) return;
      await _refreshTasks();
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(e.toString().replaceFirst('Exception: ', ''))),
      );
    }
  }

  Future<void> _deleteTask(Map<String, dynamic> task) async {
    final id = int.tryParse(task['id']?.toString() ?? '') ?? 0;
    if (id == 0) return;

    try {
      await TaskService.instance.deleteTask(id);
      if (!mounted) return;
      await _refreshTasks();
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(e.toString().replaceFirst('Exception: ', ''))),
      );
    }
  }

  String _taskStatus(Map<String, dynamic> task) {
    final value = task['status']?.toString().toUpperCase() ?? 'TODO';
    if (value == 'REVIEW') return 'IN_PROGRESS';
    return value;
  }

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;

    if (_loading) return const Center(child: CircularProgressIndicator());
    if (_error != null) return Center(child: Text(_error!, style: const TextStyle(color: Colors.red)));

    return RefreshIndicator(
      onRefresh: _load,
      child: ListView(
        padding: const EdgeInsets.all(12),
        children: [
          SectionCard(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Tạo task',
                  style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w900),
                ),
                const SizedBox(height: 8),
                Text(
                  'Board task nội bộ của nhóm để phân công và theo dõi tiến độ.',
                  style: TextStyle(color: colorScheme.onSurfaceVariant),
                ),
                const SizedBox(height: 10),
                Wrap(
                  spacing: 8,
                  runSpacing: 8,
                  children: [
                    OutlinedButton.icon(
                      onPressed: _load,
                      icon: const Icon(Icons.refresh),
                      label: const Text('Làm mới'),
                    ),
                  ],
                ),
                const SizedBox(height: 10),
                if (_myGroups.isEmpty)
                  const Text('Bạn chưa có nhóm. Vui lòng tạo nhóm tại tab Topic trước.')
                else
                  DropdownButtonFormField<int>(
                    initialValue: _selectedGroupId,
                    items: _myGroups
                        .map(
                          (group) => DropdownMenuItem<int>(
                            value: int.tryParse(group['id']?.toString() ?? ''),
                            child: Text(
                              '${group['groupName']} • Topic: ${(group['topic'] as Map<String, dynamic>?)?['title'] ?? 'N/A'}',
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                        )
                        .where((item) => item.value != null)
                        .cast<DropdownMenuItem<int>>()
                        .toList(growable: false),
                    onChanged: (value) async {
                      setState(() => _selectedGroupId = value);
                      await _refreshTasks();
                    },
                    decoration: const InputDecoration(
                      labelText: 'Nhóm làm việc',
                      isDense: true,
                    ),
                  ),
              ],
            ),
          ),
          const SizedBox(height: 12),
          SectionCard(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Expanded(
                      child: Text(
                        'Task Board',
                        style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w900),
                      ),
                    ),
                    FilledButton.icon(
                      onPressed: _selectedGroupId == null ? null : _addTask,
                      icon: const Icon(Icons.add_task),
                      label: const Text('Tạo task'),
                    ),
                  ],
                ),
                const SizedBox(height: 6),
                Text(
                  'Chưa có task nào? Hãy tạo task đầu tiên để bắt đầu phân công.',
                  style: TextStyle(color: colorScheme.onSurfaceVariant),
                ),
                const SizedBox(height: 10),
                if (_selectedGroupId == null)
                  const Text('Vui lòng chọn nhóm để quản lý task.')
                else if (_tasks.isEmpty)
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(22),
                    decoration: BoxDecoration(
                      color: colorScheme.surfaceContainerHighest.withValues(alpha: 0.35),
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: colorScheme.outlineVariant),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.center,
                      children: [
                        Container(
                          width: 64,
                          height: 64,
                          decoration: BoxDecoration(
                            color: colorScheme.surface,
                            borderRadius: BorderRadius.circular(16),
                          ),
                          child: Icon(
                            Icons.assignment_turned_in_outlined,
                            color: colorScheme.primary,
                            size: 34,
                          ),
                        ),
                        const SizedBox(height: 14),
                        const Text(
                          'Chưa có task nào',
                          style: TextStyle(fontWeight: FontWeight.w800, fontSize: 26),
                          textAlign: TextAlign.center,
                        ),
                        const SizedBox(height: 4),
                        Text(
                          'Nhóm của bạn chưa tạo công việc nào trên board. Hãy tạo task đầu tiên để bắt đầu phân công và theo dõi tiến độ.',
                          style: TextStyle(color: colorScheme.onSurfaceVariant, fontSize: 18),
                          textAlign: TextAlign.center,
                        ),
                        const SizedBox(height: 10),
                        FilledButton.icon(
                          onPressed: _addTask,
                          icon: const Icon(Icons.add_task),
                          label: const Text('Tạo task đầu tiên'),
                        ),
                      ],
                    ),
                  )
                else
                  ..._tasks.map(
                    (task) {
                      final status = _taskStatus(task);
                      final taskId = int.tryParse(task['id']?.toString() ?? '') ?? 0;
                      return Card(
                        child: ListTile(
                          title: Text(task['title']?.toString() ?? 'Task #$taskId'),
                          subtitle: Text(
                            'Status: $status • Priority: ${(task['priority'] ?? 'MEDIUM').toString().toUpperCase()}',
                          ),
                          trailing: PopupMenuButton<String>(
                            onSelected: (value) {
                              if (value == 'todo') _moveTaskStatus(task, 'TODO');
                              if (value == 'doing') _moveTaskStatus(task, 'IN_PROGRESS');
                              if (value == 'done') _moveTaskStatus(task, 'DONE');
                              if (value == 'delete') _deleteTask(task);
                            },
                            itemBuilder: (context) => const [
                              PopupMenuItem(value: 'todo', child: Text('Move to TODO')),
                              PopupMenuItem(value: 'doing', child: Text('Move to IN_PROGRESS')),
                              PopupMenuItem(value: 'done', child: Text('Move to DONE')),
                              PopupMenuItem(value: 'delete', child: Text('Delete')),
                            ],
                          ),
                        ),
                      );
                    },
                  ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _StudentSubmissionPage extends StatefulWidget {
  const _StudentSubmissionPage();

  @override
  State<_StudentSubmissionPage> createState() => _StudentSubmissionPageState();
}

class _StudentSubmissionPageState extends State<_StudentSubmissionPage> {
  bool _loading = true;
  String? _error;
  List<Map<String, dynamic>> _groups = const <Map<String, dynamic>>[];
  List<Map<String, dynamic>> _submissions = const <Map<String, dynamic>>[];
  int? _activeGroupId;

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
      final groups = await GroupService.instance.getAll();
      final selected = _activeGroupId ??
          (groups.isEmpty ? null : int.tryParse(groups.first['id']?.toString() ?? ''));
      final submissions = selected == null
          ? const <Map<String, dynamic>>[]
          : await SubmissionService.instance.getAll(groupId: selected);

      if (!mounted) return;
      setState(() {
        _groups = groups;
        _activeGroupId = selected;
        _submissions = submissions;
      });
    } catch (e) {
      if (!mounted) return;
      setState(() => _error = e.toString().replaceFirst('Exception: ', ''));
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  Future<void> _refreshSubmissions() async {
    final groupId = _activeGroupId;
    if (groupId == null) {
      if (!mounted) return;
      setState(() => _submissions = const <Map<String, dynamic>>[]);
      return;
    }

    final submissions = await SubmissionService.instance.getAll(groupId: groupId);
    if (!mounted) return;
    setState(() => _submissions = submissions);
  }

  Future<void> _createOrEditSubmission({Map<String, dynamic>? current}) async {
    final groupId = _activeGroupId;
    if (groupId == null) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Vui lòng chọn nhóm trước khi nộp bài.')),
      );
      return;
    }

    final milestoneController = TextEditingController(
      text: current?['milestoneName']?.toString() ?? '',
    );
    final fileUrlController = TextEditingController(
      text: current?['fileUrl']?.toString() ?? current?['filePath']?.toString() ?? '',
    );
    final notesController = TextEditingController(
      text: current?['notes']?.toString() ?? '',
    );

    final ok = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: Text(current == null ? 'Nộp bài mới' : 'Cập nhật bài nộp'),
        content: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TextField(
                controller: milestoneController,
                decoration: const InputDecoration(
                  labelText: 'Milestone name',
                  hintText: 'Ví dụ: Milestone 1',
                ),
              ),
              const SizedBox(height: 8),
              TextField(
                controller: fileUrlController,
                decoration: const InputDecoration(
                  labelText: 'File URL',
                  hintText: 'https://drive.google.com/...',
                ),
              ),
              const SizedBox(height: 8),
              TextField(
                controller: notesController,
                minLines: 2,
                maxLines: 4,
                decoration: const InputDecoration(
                  labelText: 'Notes',
                  hintText: 'Mô tả ngắn gọn nội dung bài nộp',
                ),
              ),
            ],
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(false),
            child: const Text('Hủy'),
          ),
          FilledButton(
            onPressed: () => Navigator.of(context).pop(true),
            child: Text(current == null ? 'Nộp bài' : 'Lưu'),
          ),
        ],
      ),
    );

    if (ok != true) return;
    if (fileUrlController.text.trim().isEmpty) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Bạn cần nhập link file nộp.')),
      );
      return;
    }

    try {
      if (current == null) {
        await SubmissionService.instance.create(
          groupId: groupId,
          milestoneName: milestoneController.text.trim(),
          fileUrl: fileUrlController.text.trim(),
          notes: notesController.text.trim(),
        );
      } else {
        final id = int.tryParse(current['id']?.toString() ?? '') ?? 0;
        if (id == 0) return;
        await SubmissionService.instance.update(
          id,
          milestoneName: milestoneController.text.trim(),
          fileUrl: fileUrlController.text.trim(),
          notes: notesController.text.trim(),
        );
      }
      if (!mounted) return;
      await _refreshSubmissions();
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(e.toString().replaceFirst('Exception: ', ''))),
      );
    }
  }

  Future<void> _deleteSubmission(Map<String, dynamic> item) async {
    final id = int.tryParse(item['id']?.toString() ?? '') ?? 0;
    if (id == 0) return;

    final ok = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Xóa bài nộp'),
        content: const Text('Bạn chắc chắn muốn xóa bài nộp này?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(false),
            child: const Text('Hủy'),
          ),
          FilledButton(
            onPressed: () => Navigator.of(context).pop(true),
            child: const Text('Xóa'),
          ),
        ],
      ),
    );

    if (ok != true) return;

    try {
      await SubmissionService.instance.deleteSubmission(id);
      if (!mounted) return;
      await _refreshSubmissions();
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(e.toString().replaceFirst('Exception: ', ''))),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;

    if (_loading) return const Center(child: CircularProgressIndicator());
    if (_error != null) return Center(child: Text(_error!, style: const TextStyle(color: Colors.red)));

    return RefreshIndicator(
      onRefresh: _load,
      child: ListView(
        padding: const EdgeInsets.all(12),
        children: [
          SectionCard(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Bài nộp của nhóm',
                  style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w900),
                ),
                const SizedBox(height: 6),
                Text(
                  'Nhóm có thể nộp, cập nhật hoặc xóa bài trước khi giảng viên chấm điểm.',
                  style: TextStyle(color: colorScheme.onSurfaceVariant),
                ),
                const SizedBox(height: 10),
                Wrap(
                  spacing: 8,
                  runSpacing: 8,
                  children: [
                    OutlinedButton.icon(
                      onPressed: _load,
                      icon: const Icon(Icons.refresh),
                      label: const Text('Làm mới'),
                    ),
                    FilledButton.icon(
                      onPressed: _activeGroupId == null ? null : () => _createOrEditSubmission(),
                      icon: const Icon(Icons.upload_file),
                      label: const Text('Nộp bài mới'),
                    ),
                  ],
                ),
                const SizedBox(height: 10),
                if (_groups.isEmpty)
                  const Text('Bạn chưa có nhóm, nên chưa thể nộp bài.')
                else
                  DropdownButtonFormField<int>(
                    initialValue: _activeGroupId,
                    items: _groups
                        .map(
                          (g) => DropdownMenuItem<int>(
                            value: int.tryParse(g['id']?.toString() ?? ''),
                            child: Text(_safe(g['groupName']?.toString() ?? 'Group')),
                          ),
                        )
                        .where((item) => item.value != null)
                        .cast<DropdownMenuItem<int>>()
                        .toList(growable: false),
                    onChanged: (value) async {
                      setState(() => _activeGroupId = value);
                      await _refreshSubmissions();
                    },
                    decoration: const InputDecoration(
                      labelText: 'Nhóm',
                      isDense: true,
                    ),
                  ),
              ],
            ),
          ),
          const SizedBox(height: 12),
          if (_submissions.isEmpty)
            SectionCard(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.center,
                children: [
                  Icon(
                    Icons.description_outlined,
                    size: 52,
                    color: colorScheme.outline,
                  ),
                  const SizedBox(height: 12),
                  Text(
                    'Chưa có bài nộp nào',
                    style: Theme.of(context).textTheme.titleSmall?.copyWith(fontWeight: FontWeight.w800),
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: 6),
                  Text(
                    'Bắt đầu bằng cách nộp milestone đầu tiên của nhóm.',
                    style: TextStyle(color: colorScheme.onSurfaceVariant),
                    textAlign: TextAlign.center,
                  ),
                ],
              ),
            )
          else
            ..._submissions.map((item) {
              final status = item['status']?.toString().toUpperCase() ?? 'SUBMITTED';
              final graded = status == 'GRADED';
              final submittedAt = DateTime.tryParse(item['submittedAt']?.toString() ?? '');
              return Card(
                margin: const EdgeInsets.only(bottom: 10),
                child: Padding(
                  padding: const EdgeInsets.all(12),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Expanded(
                            child: Text(
                              _safe(item['milestoneName']?.toString() ?? 'Milestone'),
                              style: const TextStyle(fontWeight: FontWeight.w800),
                            ),
                          ),
                          Chip(
                            label: Text(status),
                            side: BorderSide.none,
                            backgroundColor: graded
                                ? Colors.blue.withValues(alpha: 0.18)
                                : Colors.orange.withValues(alpha: 0.18),
                          ),
                        ],
                      ),
                      const SizedBox(height: 6),
                      Text('Nộp lúc: ${submittedAt == null ? 'N/A' : DateFormat('d/M/yyyy HH:mm').format(submittedAt)}'),
                      const SizedBox(height: 6),
                      Text('File: ${item['fileUrl'] ?? item['filePath'] ?? 'N/A'}'),
                      if ((item['notes']?.toString() ?? '').isNotEmpty) ...[
                        const SizedBox(height: 4),
                        Text('Ghi chú: ${item['notes']}'),
                      ],
                      if (graded) ...[
                        const SizedBox(height: 4),
                        Text('Điểm: ${item['grade'] ?? 'N/A'}'),
                        Text('Feedback: ${item['feedback'] ?? 'N/A'}'),
                      ],
                      const SizedBox(height: 10),
                      if (!graded)
                        Wrap(
                          spacing: 8,
                          children: [
                            OutlinedButton(
                              onPressed: () => _createOrEditSubmission(current: item),
                              child: const Text('Cập nhật'),
                            ),
                            OutlinedButton(
                              onPressed: () => _deleteSubmission(item),
                              child: const Text('Xóa'),
                            ),
                          ],
                        ),
                    ],
                  ),
                ),
              );
            }),
        ],
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

String _safe(String value) {
  if (value.isEmpty) return value;

  const suspiciousMarkers = ['Ã', 'Â', 'Ä', 'áº', 'á»', 'Æ', 'Ð', 'Ñ'];
  final looksBroken = suspiciousMarkers.any(value.contains);
  if (!looksBroken) return value;

  try {
    return utf8.decode(latin1.encode(value));
  } catch (_) {
    return value;
  }
}
