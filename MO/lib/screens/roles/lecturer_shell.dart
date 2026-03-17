import 'dart:convert';

import 'package:flutter/material.dart';

import '../../models/question_item.dart';
import '../../models/topic_item.dart';
import '../../services/answer_service.dart';
import '../../services/auth_service.dart';
import '../../services/class_service.dart';
import '../../services/group_service.dart';
import '../../services/notification_service.dart';
import '../../services/question_service.dart';
import '../../services/submission_service.dart';
import '../../services/topic_service.dart';
import '../../state/app_session.dart';
import '../../widgets/ui_kit.dart';
import '../login_screen.dart';
import '../profile_screen.dart';
import '../question_detail_screen.dart';

class LecturerShell extends StatefulWidget {
  const LecturerShell({super.key});

  @override
  State<LecturerShell> createState() => _LecturerShellState();
}

class _LecturerShellState extends State<LecturerShell> {
  int _index = 0;

  static const _tabs = <NavigationDestination>[
    NavigationDestination(icon: Icon(Icons.dashboard_outlined), label: 'Dashboard'),
    NavigationDestination(icon: Icon(Icons.class_outlined), label: 'Classes'),
    NavigationDestination(icon: Icon(Icons.lightbulb_outline), label: 'Topics'),
    NavigationDestination(icon: Icon(Icons.quiz_outlined), label: 'Q&A'),
    NavigationDestination(icon: Icon(Icons.assignment_turned_in_outlined), label: 'Grading'),
    NavigationDestination(icon: Icon(Icons.person_outline), label: 'Account'),
  ];

  static const _titles = <String>[
    'Lecturer Workspace',
    'Classes Managed',
    'Topic Management',
    'Q&A Management',
    'Submission & Grading',
    'Account',
  ];

  Future<void> _backToLogin() async {
    final ok = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Back to Login'),
        content: const Text('Are you sure you want to sign out and return to login?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(false),
            child: const Text('Cancel'),
          ),
          FilledButton(
            onPressed: () => Navigator.of(context).pop(true),
            child: const Text('Sign out'),
          ),
        ],
      ),
    );

    if (ok != true || !mounted) return;

    final refreshToken = AppSession.instance.session?.refreshToken;
    if (refreshToken != null && refreshToken.isNotEmpty) {
      try {
        await AuthService.instance.logout(refreshToken);
      } catch (_) {
        // Keep local logout resilient even when network logout fails.
      }
    }

    await NotificationService.instance.onLogout();
    await AppSession.instance.clear();
    if (!mounted) return;

    await Navigator.of(context).pushAndRemoveUntil(
      MaterialPageRoute(builder: (_) => const LoginScreen()),
      (route) => false,
    );
  }

  @override
  Widget build(BuildContext context) {
    final pages = <Widget>[
      const _LecturerDashboardPage(),
      const _LecturerClassesPage(),
      const _LecturerTopicPage(),
      const _LecturerQAPage(),
      const _LecturerSubmissionPage(),
      const ProfileScreen(),
    ];

    return Scaffold(
      appBar: AppBar(
        title: Text(_titles[_index]),
        actions: [
          IconButton(
            onPressed: _backToLogin,
            tooltip: 'Back to Login',
            icon: const Icon(Icons.logout_outlined),
          ),
        ],
      ),
      body: IndexedStack(index: _index, children: pages),
      bottomNavigationBar: NavigationBar(
        selectedIndex: _index,
        destinations: _tabs,
        onDestinationSelected: (value) => setState(() => _index = value),
      ),
    );
  }
}

class _LecturerDashboardPage extends StatefulWidget {
  const _LecturerDashboardPage();

  @override
  State<_LecturerDashboardPage> createState() => _LecturerDashboardPageState();
}

class _LecturerDashboardPageState extends State<_LecturerDashboardPage> {
  bool _loading = true;
  String? _error;

  List<TopicItem> _topics = const <TopicItem>[];
  List<QuestionItem> _questions = const <QuestionItem>[];
  List<Map<String, dynamic>> _groups = const <Map<String, dynamic>>[];
  List<Map<String, dynamic>> _submissions = const <Map<String, dynamic>>[];

  int get _lecturerId => AppSession.instance.session?.userId ?? 0;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    if (!mounted) return;
    setState(() {
      _loading = true;
      _error = null;
    });

    try {
      final results = await Future.wait<dynamic>([
        ClassService.instance.getAll(lecturerId: _lecturerId),
        TopicService.instance.getAll(),
        QuestionService.instance.getAll(),
        GroupService.instance.getAll(),
        SubmissionService.instance.getAll(),
      ]);

      final classes = results[0] as List<Map<String, dynamic>>;
      final classIds = classes
          .map((item) => int.tryParse(item['id']?.toString() ?? ''))
          .whereType<int>()
          .toSet();

      final submissions = (results[4] as List<Map<String, dynamic>>).where((item) {
        final group = item['group'] as Map<String, dynamic>? ?? <String, dynamic>{};
        final classMap = group['class'] as Map<String, dynamic>? ?? <String, dynamic>{};
        final classId = int.tryParse(classMap['id']?.toString() ?? '') ??
            int.tryParse(group['classId']?.toString() ?? '');
        if (classIds.isEmpty) return true;
        return classId != null && classIds.contains(classId);
      }).toList(growable: false);

      if (!mounted) return;
      setState(() {
        _topics = results[1] as List<TopicItem>;
        _questions = results[2] as List<QuestionItem>;
        _groups = results[3] as List<Map<String, dynamic>>;
        _submissions = submissions;
      });
    } catch (e) {
      if (!mounted) return;
      setState(() => _error = e.toString().replaceFirst('Exception: ', ''));
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  String _normalizedQuestionStatus(String raw) {
    final status = raw.toUpperCase();
    if (status == 'WAITING') return 'WAITING_LECTURER';
    if (status == 'ESCALATED') return 'ESCALATED_TO_MANAGER';
    if (status == 'ANSWERED') return 'RESOLVED';
    return status;
  }

  bool _isActiveGroup(Map<String, dynamic> group) {
    final status = (group['groupStatus'] ?? group['status'] ?? '').toString().toUpperCase();
    return status == 'FORMING' || status == 'ACTIVE' || status == 'PENDING' || status == 'WAITING';
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) return const Center(child: CircularProgressIndicator());
    if (_error != null) return Center(child: Text(_error!, style: const TextStyle(color: Colors.red)));

    final pendingTopics = _topics.where((item) => item.status.toUpperCase() == 'PENDING').length;
    final unansweredQuestions = _questions
        .where((item) => _normalizedQuestionStatus(item.status) == 'WAITING_LECTURER')
        .length;
    final escalatedQuestions = _questions
        .where((item) => _normalizedQuestionStatus(item.status) == 'ESCALATED_TO_MANAGER')
        .length;
    final activeGroups = _groups.where(_isActiveGroup).toList(growable: false);

    final recentSubmissions = [..._submissions]
      ..sort((a, b) {
        final left = _parseDate(a['submittedAt'] ?? a['createdAt'])?.millisecondsSinceEpoch ?? 0;
        final right = _parseDate(b['submittedAt'] ?? b['createdAt'])?.millisecondsSinceEpoch ?? 0;
        return right.compareTo(left);
      });

    return RefreshIndicator(
      onRefresh: _load,
      child: ListView(
        physics: const AlwaysScrollableScrollPhysics(),
        padding: const EdgeInsets.all(12),
        children: [
          DashboardHero(
            title: 'Dashboard',
            subtitle: 'Track submissions, topics, Q&A tickets, and teaching progress in one place.',
            icon: Icons.school_outlined,
          ),
          const SizedBox(height: 10),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: [
              StatCard(
                label: 'Pending Topic Approvals',
                value: pendingTopics,
                icon: Icons.pending_actions_outlined,
              ),
              StatCard(
                label: 'Unanswered Questions',
                value: unansweredQuestions,
                icon: Icons.help_outline,
              ),
              StatCard(
                label: 'Escalated Questions',
                value: escalatedQuestions,
                icon: Icons.north_outlined,
              ),
              StatCard(
                label: 'Total Active Groups',
                value: activeGroups.length,
                icon: Icons.groups_outlined,
              ),
            ],
          ),
          const SizedBox(height: 10),
          _RecentSubmissionSection(submissions: recentSubmissions),
        ],
      ),
    );
  }
}

class _RecentSubmissionSection extends StatefulWidget {
  const _RecentSubmissionSection({required this.submissions});

  final List<Map<String, dynamic>> submissions;

  @override
  State<_RecentSubmissionSection> createState() => _RecentSubmissionSectionState();
}

class _RecentSubmissionSectionState extends State<_RecentSubmissionSection> {
  bool _showAll = false;

  @override
  Widget build(BuildContext context) {
    final firstFive = widget.submissions.take(5).toList(growable: false);

    return SectionCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Expanded(
                child: Text(
                  'Recent Submissions (5 groups)',
                  style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w800),
                ),
              ),
              TextButton.icon(
                onPressed: () => setState(() => _showAll = !_showAll),
                icon: Icon(_showAll ? Icons.expand_less : Icons.expand_more),
                label: Text(_showAll ? 'Collapse' : 'View all'),
              ),
            ],
          ),
          const SizedBox(height: 8),
          if (firstFive.isEmpty)
            const Text('No submissions yet.')
          else
            ...firstFive.map((item) => _SubmissionRow(item: item)),
          if (_showAll && widget.submissions.length > 5) ...[
            const Divider(height: 18),
            ...widget.submissions.skip(5).map((item) => _SubmissionRow(item: item)),
          ],
        ],
      ),
    );
  }
}

class _LecturerClassesPage extends StatefulWidget {
  const _LecturerClassesPage();

  @override
  State<_LecturerClassesPage> createState() => _LecturerClassesPageState();
}

class _LecturerClassesPageState extends State<_LecturerClassesPage> {
  bool _loading = true;
  String? _error;
  List<Map<String, dynamic>> _classes = const <Map<String, dynamic>>[];
  List<Map<String, dynamic>> _groups = const <Map<String, dynamic>>[];
  int? _classFilterId;

  int get _lecturerId => AppSession.instance.session?.userId ?? 0;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    if (!mounted) return;
    setState(() {
      _loading = true;
      _error = null;
    });

    try {
      final results = await Future.wait<dynamic>([
        ClassService.instance.getAll(lecturerId: _lecturerId),
        GroupService.instance.getAll(),
      ]);

      final classes = results[0] as List<Map<String, dynamic>>;
      final classIds = classes
          .map((item) => int.tryParse(item['id']?.toString() ?? ''))
          .whereType<int>()
          .toSet();

      final groups = (results[1] as List<Map<String, dynamic>>).where((item) {
        final classMap = item['class'] as Map<String, dynamic>? ?? <String, dynamic>{};
        final classId = int.tryParse(classMap['id']?.toString() ?? '') ?? int.tryParse(item['classId']?.toString() ?? '');
        if (classIds.isEmpty) return true;
        return classId != null && classIds.contains(classId);
      }).toList(growable: false);

      if (!mounted) return;
      setState(() {
        _classes = classes;
        _groups = groups;
      });
    } catch (e) {
      if (!mounted) return;
      setState(() => _error = e.toString().replaceFirst('Exception: ', ''));
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  bool _isActiveGroup(Map<String, dynamic> group) {
    final status = (group['groupStatus'] ?? group['status'] ?? '').toString().toUpperCase();
    return status == 'FORMING' || status == 'ACTIVE' || status == 'PENDING' || status == 'WAITING';
  }

  bool _isConfirmedGroup(Map<String, dynamic> group) {
    final status = (group['groupStatus'] ?? group['status'] ?? '').toString().toUpperCase();
    return status == 'CONFIRMED';
  }

  Future<void> _confirmGroup(Map<String, dynamic> group) async {
    final id = int.tryParse(group['id']?.toString() ?? '') ?? 0;
    if (id == 0) return;

    try {
      await GroupService.instance.confirmGroup(id);
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Group confirmed successfully.')),
      );
      await _load();
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('$e')));
    }
  }

  List<Map<String, dynamic>> _groupsByClass(int classId) {
    return _groups.where((item) {
      final classMap = item['class'] as Map<String, dynamic>? ?? <String, dynamic>{};
      final id = int.tryParse(classMap['id']?.toString() ?? '') ?? int.tryParse(item['classId']?.toString() ?? '');
      return id == classId;
    }).toList(growable: false);
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) return const Center(child: CircularProgressIndicator());
    if (_error != null) return Center(child: Text(_error!, style: const TextStyle(color: Colors.red)));

    final visibleClasses = _classFilterId == null
        ? _classes
        : _classes.where((item) => int.tryParse(item['id']?.toString() ?? '') == _classFilterId).toList(growable: false);

    return RefreshIndicator(
      onRefresh: _load,
      child: ListView(
        physics: const AlwaysScrollableScrollPhysics(),
        padding: const EdgeInsets.all(12),
        children: [
          Text(
            'Classes Managed',
            style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w800),
          ),
          const SizedBox(height: 4),
          const Text('List of classes and student groups under this lecturer.'),
          const SizedBox(height: 10),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: [
              OutlinedButton.icon(
                onPressed: _load,
                icon: const Icon(Icons.refresh),
                label: const Text('Refresh'),
              ),
              DropdownButton<int?>(
                value: _classFilterId,
                items: [
                  const DropdownMenuItem<int?>(value: null, child: Text('All classes')),
                  ..._classes.map((item) {
                    final id = int.tryParse(item['id']?.toString() ?? '');
                    return DropdownMenuItem<int?>(value: id, child: Text(_readText(item['className'])));
                  }),
                ],
                onChanged: (value) => setState(() => _classFilterId = value),
              ),
            ],
          ),
          const SizedBox(height: 10),
          if (visibleClasses.isEmpty)
            const SectionCard(child: Text('No classes available.'))
          else
            ...visibleClasses.map((classItem) {
              final classId = int.tryParse(classItem['id']?.toString() ?? '') ?? 0;
              final className = _readText(classItem['className']);
              final classGroups = _groupsByClass(classId);
              final activeCount = classGroups.where(_isActiveGroup).length;

              return SectionCard(
                margin: const EdgeInsets.only(bottom: 10),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(className, style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 16)),
                    const SizedBox(height: 4),
                    Text('$activeCount active group${activeCount == 1 ? '' : 's'}'),
                    const SizedBox(height: 8),
                    if (classGroups.isEmpty)
                      const Text('No groups in this class yet.')
                    else
                      ...classGroups.map((group) {
                        final topic = group['topic'] as Map<String, dynamic>? ?? <String, dynamic>{};
                        final groupName = _readText(group['groupName']);
                        final topicTitle = _readText(topic['title']);
                        final status = _readText(group['groupStatus'] ?? group['status']).toUpperCase();
                        final memberCount = (group['members'] as List<dynamic>? ?? <dynamic>[]).length;
                        final confirmed = _isConfirmedGroup(group);

                        return Container(
                          margin: const EdgeInsets.only(bottom: 8),
                          padding: const EdgeInsets.all(10),
                          decoration: BoxDecoration(
                            borderRadius: BorderRadius.circular(10),
                            border: Border.all(color: Theme.of(context).colorScheme.outlineVariant),
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(groupName, style: const TextStyle(fontWeight: FontWeight.w700)),
                              const SizedBox(height: 2),
                              Text(topicTitle),
                              const SizedBox(height: 2),
                              Text(confirmed ? 'Confirmed group' : 'Status: $status'),
                              const SizedBox(height: 2),
                              Text('Members: $memberCount'),
                              const SizedBox(height: 8),
                              if (confirmed)
                                const Chip(label: Text('Confirmed'))
                              else
                                FilledButton.icon(
                                  onPressed: () => _confirmGroup(group),
                                  icon: const Icon(Icons.check_circle_outline),
                                  label: const Text('Confirm Group'),
                                ),
                            ],
                          ),
                        );
                      }),
                  ],
                ),
              );
            }),
        ],
      ),
    );
  }
}

class _SubmissionRow extends StatelessWidget {
  const _SubmissionRow({required this.item});

  final Map<String, dynamic> item;

  @override
  Widget build(BuildContext context) {
    final group = item['group'] as Map<String, dynamic>? ?? <String, dynamic>{};
    final classMap = group['class'] as Map<String, dynamic>? ?? <String, dynamic>{};
    final submitter = item['submitter'] as Map<String, dynamic>? ??
        item['student'] as Map<String, dynamic>? ??
        <String, dynamic>{};
    final groupName = _readText(group['groupName']);
    final className = _readText(classMap['className']);
    final submissionType = _readText(item['milestoneName'] ?? item['title'] ?? 'Submission');
    final submittedBy = _readText(submitter['fullName']);
    final submittedAt = _formatAgo(_parseDate(item['submittedAt'] ?? item['createdAt']));

    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      padding: const EdgeInsets.all(10),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: Theme.of(context).colorScheme.outlineVariant),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('$groupName - $className', style: const TextStyle(fontWeight: FontWeight.w700)),
          const SizedBox(height: 2),
          Text('Submission type: $submissionType'),
          const SizedBox(height: 2),
          Text('Submitted by: $submittedBy'),
          const SizedBox(height: 2),
          Text('Time: $submittedAt'),
          const SizedBox(height: 8),
          OutlinedButton.icon(
            onPressed: () {},
            icon: const Icon(Icons.visibility_outlined),
            label: const Text('View details'),
          ),
        ],
      ),
    );
  }
}

class _LecturerTopicPage extends StatefulWidget {
  const _LecturerTopicPage();

  @override
  State<_LecturerTopicPage> createState() => _LecturerTopicPageState();
}

class _LecturerTopicPageState extends State<_LecturerTopicPage> {
  final _titleController = TextEditingController();
  final _descriptionController = TextEditingController();
  final _syllabusController = TextEditingController();
  final _searchController = TextEditingController();

  bool _loading = true;
  bool _creating = false;
  String? _error;

  List<TopicItem> _topics = const <TopicItem>[];
  String _statusFilter = 'ALL';

  int get _lecturerId => AppSession.instance.session?.userId ?? 0;

  @override
  void initState() {
    super.initState();
    _load();
    _searchController.addListener(() => setState(() {}));
  }

  @override
  void dispose() {
    _titleController.dispose();
    _descriptionController.dispose();
    _syllabusController.dispose();
    _searchController.dispose();
    super.dispose();
  }

  Future<void> _load() async {
    if (!mounted) return;
    setState(() {
      _loading = true;
      _error = null;
    });

    try {
      final topics = await TopicService.instance.getAll();
      if (!mounted) return;
      setState(() => _topics = topics);
    } catch (e) {
      if (!mounted) return;
      setState(() => _error = e.toString().replaceFirst('Exception: ', ''));
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  Future<void> _createTopic() async {
    final title = _titleController.text.trim();
    final description = _descriptionController.text.trim();

    if (title.isEmpty || description.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please enter both title and description.')),
      );
      return;
    }

    setState(() => _creating = true);
    try {
      await TopicService.instance.create(
        proposerId: _lecturerId,
        title: title,
        description: description,
        syllabusUrl: _syllabusController.text.trim().isEmpty ? null : _syllabusController.text.trim(),
        maxGroups: 5,
      );

      _titleController.clear();
      _descriptionController.clear();
      _syllabusController.clear();

      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Topic created successfully.')),
      );
      await _load();
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('$e')));
    } finally {
      if (mounted) setState(() => _creating = false);
    }
  }

  Future<void> _showTopicDetail(TopicItem topic) async {
    await showDialog<void>(
      context: context,
      builder: (context) => AlertDialog(
        title: Text('#${topic.id} ${topic.title}'),
        content: SingleChildScrollView(
          child: Text(topic.description),
        ),
        actions: [
          TextButton(onPressed: () => Navigator.of(context).pop(), child: const Text('Close')),
        ],
      ),
    );
  }

  Future<void> _editTopic(TopicItem topic) async {
    final titleController = TextEditingController(text: topic.title);
    final descController = TextEditingController(text: topic.description);

    final ok = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Edit topic'),
        content: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TextField(controller: titleController, decoration: const InputDecoration(labelText: 'Title')),
              const SizedBox(height: 8),
              TextField(
                controller: descController,
                minLines: 2,
                maxLines: 6,
                decoration: const InputDecoration(labelText: 'Description'),
              ),
            ],
          ),
        ),
        actions: [
          TextButton(onPressed: () => Navigator.of(context).pop(false), child: const Text('Cancel')),
          FilledButton(onPressed: () => Navigator.of(context).pop(true), child: const Text('Save')),
        ],
      ),
    );

    if (ok != true) return;

    try {
      await TopicService.instance.update(topic.id, <String, dynamic>{
        'title': titleController.text.trim(),
        'description': descController.text.trim(),
      });
      await _load();
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('$e')));
    }
  }

  Future<void> _deleteTopic(TopicItem topic) async {
    final ok = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Delete topic'),
        content: Text('Are you sure you want to delete "${topic.title}"?'),
        actions: [
          TextButton(onPressed: () => Navigator.of(context).pop(false), child: const Text('Cancel')),
          FilledButton(onPressed: () => Navigator.of(context).pop(true), child: const Text('Delete')),
        ],
      ),
    );

    if (ok != true) return;

    try {
      await TopicService.instance.deleteTopic(topic.id);
      await _load();
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('$e')));
    }
  }

  List<TopicItem> get _filteredTopics {
    final search = _searchController.text.trim().toLowerCase();
    return _topics.where((topic) {
      final statusOk = _statusFilter == 'ALL' || topic.status.toUpperCase() == _statusFilter;
      final searchOk = search.isEmpty ||
          topic.title.toLowerCase().contains(search) ||
          topic.description.toLowerCase().contains(search);
      return statusOk && searchOk;
    }).toList(growable: false);
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) return const Center(child: CircularProgressIndicator());
    if (_error != null) return Center(child: Text(_error!, style: const TextStyle(color: Colors.red)));

    return RefreshIndicator(
      onRefresh: _load,
      child: ListView(
        physics: const AlwaysScrollableScrollPhysics(),
        padding: const EdgeInsets.all(12),
        children: [
          SectionCard(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Topic Management',
                  style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w800),
                ),
                const SizedBox(height: 4),
                const Text('Manage topics and track approval status.'),
                const SizedBox(height: 10),
                TextField(controller: _titleController, decoration: const InputDecoration(labelText: 'Topic title')),
                const SizedBox(height: 8),
                TextField(
                  controller: _descriptionController,
                  minLines: 2,
                  maxLines: 5,
                  decoration: const InputDecoration(labelText: 'Description'),
                ),
                const SizedBox(height: 8),
                TextField(controller: _syllabusController, decoration: const InputDecoration(labelText: 'Syllabus URL (optional)')),
                const SizedBox(height: 10),
                FilledButton.icon(
                  onPressed: _creating ? null : _createTopic,
                  icon: const Icon(Icons.add_circle_outline),
                  label: Text(_creating ? 'Creating...' : 'Create topic'),
                ),
              ],
            ),
          ),
          const SizedBox(height: 10),
          Row(
            children: [
              Expanded(
                child: TextField(
                  controller: _searchController,
                  decoration: const InputDecoration(
                    prefixIcon: Icon(Icons.search),
                    hintText: 'Search by title or description...',
                  ),
                ),
              ),
              const SizedBox(width: 8),
              DropdownButton<String>(
                value: _statusFilter,
                items: const [
                  DropdownMenuItem(value: 'ALL', child: Text('All statuses')),
                  DropdownMenuItem(value: 'PENDING', child: Text('PENDING')),
                  DropdownMenuItem(value: 'APPROVED', child: Text('APPROVED')),
                  DropdownMenuItem(value: 'REJECTED', child: Text('REJECTED')),
                ],
                onChanged: (value) {
                  if (value == null) return;
                  setState(() => _statusFilter = value);
                },
              ),
            ],
          ),
          const SizedBox(height: 10),
          if (_filteredTopics.isEmpty)
            const SectionCard(child: Text('No topics found.'))
          else
            ..._filteredTopics.map((topic) {
              return Card(
                child: ListTile(
                  title: Text('#${topic.id} ${topic.title}'),
                  subtitle: Text(topic.description, maxLines: 2, overflow: TextOverflow.ellipsis),
                  trailing: PopupMenuButton<String>(
                    onSelected: (value) {
                      if (value == 'view') _showTopicDetail(topic);
                      if (value == 'edit') _editTopic(topic);
                      if (value == 'delete') _deleteTopic(topic);
                    },
                    itemBuilder: (context) => const [
                      PopupMenuItem(value: 'view', child: Text('View details')),
                      PopupMenuItem(value: 'edit', child: Text('Edit')),
                      PopupMenuItem(value: 'delete', child: Text('Delete')),
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

class _LecturerQAPage extends StatefulWidget {
  const _LecturerQAPage();

  @override
  State<_LecturerQAPage> createState() => _LecturerQAPageState();
}

class _LecturerQAPageState extends State<_LecturerQAPage> {
  bool _loading = true;
  String? _error;

  final _searchController = TextEditingController();
  String _statusFilter = 'ALL';
  List<QuestionItem> _questions = const <QuestionItem>[];

  @override
  void initState() {
    super.initState();
    _load();
    _searchController.addListener(() => setState(() {}));
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  String _normalizedStatus(String raw) {
    final status = raw.toUpperCase();
    if (status == 'WAITING') return 'WAITING_LECTURER';
    if (status == 'ESCALATED') return 'ESCALATED_TO_MANAGER';
    if (status == 'ANSWERED') return 'RESOLVED';
    return status;
  }

  Future<void> _load() async {
    if (!mounted) return;
    setState(() {
      _loading = true;
      _error = null;
    });

    try {
      final data = await QuestionService.instance.getAll();
      if (!mounted) return;
      setState(() => _questions = data);
    } catch (e) {
      if (!mounted) return;
      setState(() => _error = e.toString().replaceFirst('Exception: ', ''));
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  List<QuestionItem> get _filteredQuestions {
    final search = _searchController.text.trim().toLowerCase();
    return _questions.where((item) {
      final normalized = _normalizedStatus(item.status);
      final statusOk = _statusFilter == 'ALL' ||
          (_statusFilter == 'UNANSWERED' && normalized == 'WAITING_LECTURER') ||
          (_statusFilter == 'ANSWERED' && normalized == 'RESOLVED') ||
          (_statusFilter == 'ESCALATED' && normalized == 'ESCALATED_TO_MANAGER');
      final searchOk = search.isEmpty ||
          item.title.toLowerCase().contains(search) ||
          item.content.toLowerCase().contains(search);
      return statusOk && searchOk;
    }).toList(growable: false);
  }

  Future<void> _escalateQuestion(QuestionItem question) async {
    try {
      await QuestionService.instance.escalate(question.id);
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Question escalated to department head.')),
      );
      await _load();
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('$e')));
    }
  }

  Future<void> _openReplyComposer(QuestionItem question, {String initialDraft = ''}) async {
    await showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      useSafeArea: true,
      builder: (_) => _ReplyComposerSheet(question: question, initialDraft: initialDraft),
    );

    if (!mounted) return;
    await _load();
  }

  Future<void> _generateAiDraftAndReply(QuestionItem question) async {
    try {
      final response = await QuestionService.instance.generateAiSuggestion(question.id);
      final data = response['data'] as Map<String, dynamic>? ?? <String, dynamic>{};
      final draft = _readText(data['draft'] ?? response['draft']);
      if (!mounted) return;
      await _openReplyComposer(question, initialDraft: draft);
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
      child: ListView(
        physics: const AlwaysScrollableScrollPhysics(),
        padding: const EdgeInsets.all(12),
        children: [
          Text(
            'Q&A Management',
            style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w800),
          ),
          const SizedBox(height: 4),
          const Text('Reply to student questions.'),
          const SizedBox(height: 10),
          TextField(
            controller: _searchController,
            decoration: const InputDecoration(
              prefixIcon: Icon(Icons.search),
              hintText: 'Search questions...',
            ),
          ),
          const SizedBox(height: 8),
          DropdownButton<String>(
            value: _statusFilter,
            items: const [
              DropdownMenuItem(value: 'ALL', child: Text('All')),
              DropdownMenuItem(value: 'UNANSWERED', child: Text('Unanswered')),
              DropdownMenuItem(value: 'ANSWERED', child: Text('Answered')),
              DropdownMenuItem(value: 'ESCALATED', child: Text('Escalated')),
            ],
            onChanged: (value) {
              if (value == null) return;
              setState(() => _statusFilter = value);
            },
          ),
          const SizedBox(height: 8),
          if (_filteredQuestions.isEmpty)
            const SectionCard(child: Text('No questions found.'))
          else
            ..._filteredQuestions.map((question) {
              final status = _normalizedStatus(question.status);
              return Card(
                child: Padding(
                  padding: const EdgeInsets.all(12),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('#${question.id} ${_readText(question.title)}', style: const TextStyle(fontWeight: FontWeight.w700)),
                      const SizedBox(height: 4),
                      Text(_readText(question.content), maxLines: 2, overflow: TextOverflow.ellipsis),
                      const SizedBox(height: 4),
                      Text('Asked by: ${_readText(question.askerName)}'),
                      const SizedBox(height: 4),
                      Text('Status: $status'),
                      const SizedBox(height: 8),
                      Wrap(
                        spacing: 8,
                        runSpacing: 8,
                        children: [
                          OutlinedButton.icon(
                            onPressed: () => _generateAiDraftAndReply(question),
                            icon: const Icon(Icons.auto_awesome_outlined),
                            label: const Text('Create AI draft'),
                          ),
                          if (status == 'WAITING_LECTURER')
                            OutlinedButton.icon(
                              onPressed: () => _escalateQuestion(question),
                              icon: const Icon(Icons.north_outlined),
                              label: const Text('Escalate'),
                            ),
                          FilledButton.icon(
                            onPressed: () => _openReplyComposer(question),
                            icon: const Icon(Icons.reply_outlined),
                            label: const Text('Reply'),
                          ),
                          TextButton(
                            onPressed: () async {
                              await Navigator.of(context).push(
                                MaterialPageRoute(builder: (_) => QuestionDetailScreen(questionId: question.id)),
                              );
                              if (!mounted) return;
                              await _load();
                            },
                            child: const Text('View details'),
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

class _ReplyComposerSheet extends StatefulWidget {
  const _ReplyComposerSheet({required this.question, required this.initialDraft});

  final QuestionItem question;
  final String initialDraft;

  @override
  State<_ReplyComposerSheet> createState() => _ReplyComposerSheetState();
}

class _ReplyComposerSheetState extends State<_ReplyComposerSheet> {
  late final TextEditingController _answerController;

  bool _sending = false;
  bool _loadingAnswers = true;
  bool _isPublic = false;
  String? _error;
  List<Map<String, dynamic>> _answers = const <Map<String, dynamic>>[];

  int get _userId => AppSession.instance.session?.userId ?? 0;

  @override
  void initState() {
    super.initState();
    _answerController = TextEditingController(text: widget.initialDraft);
    _loadAnswers();
  }

  @override
  void dispose() {
    _answerController.dispose();
    super.dispose();
  }

  bool _isMyAnswer(Map<String, dynamic> answer) {
    final answeredBy = int.tryParse(answer['answeredBy']?.toString() ?? '') ?? 0;
    if (answeredBy == _userId) return true;

    final answerer = answer['answerer'] as Map<String, dynamic>? ?? <String, dynamic>{};
    final answererId = int.tryParse(answerer['id']?.toString() ?? '') ?? 0;
    return answererId == _userId;
  }

  Future<void> _loadAnswers() async {
    if (!mounted) return;
    setState(() {
      _loadingAnswers = true;
      _error = null;
    });

    try {
      final data = await AnswerService.instance.getByQuestion(widget.question.id);
      if (!mounted) return;
      setState(() => _answers = data);
    } catch (e) {
      if (!mounted) return;
      setState(() => _error = e.toString().replaceFirst('Exception: ', ''));
    } finally {
      if (mounted) setState(() => _loadingAnswers = false);
    }
  }

  Future<void> _sendAnswer() async {
    final content = _answerController.text.trim();
    if (content.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please enter answer content.')),
      );
      return;
    }

    setState(() => _sending = true);
    try {
      await AnswerService.instance.create(
        questionId: widget.question.id,
        answeredBy: _userId,
        content: content,
        isPublic: _isPublic,
        markAsResolved: true,
      );
      _answerController.clear();
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Answer sent successfully.')),
      );
      await _loadAnswers();
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('$e')));
    } finally {
      if (mounted) setState(() => _sending = false);
    }
  }

  Future<void> _editAnswer(Map<String, dynamic> answer) async {
    final id = int.tryParse(answer['id']?.toString() ?? '') ?? 0;
    if (id == 0) return;

    final controller = TextEditingController(text: _readText(answer['content']));
    var isPublic = answer['isPublic'] == true;

    final ok = await showDialog<bool>(
      context: context,
      builder: (context) => StatefulBuilder(
        builder: (context, setDialogState) => AlertDialog(
          title: const Text('Edit answer'),
          content: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                TextField(
                  controller: controller,
                  minLines: 3,
                  maxLines: 8,
                  decoration: const InputDecoration(hintText: 'Answer content'),
                ),
                const SizedBox(height: 8),
                SwitchListTile(
                  contentPadding: EdgeInsets.zero,
                  title: const Text('Public'),
                  value: isPublic,
                  onChanged: (value) => setDialogState(() => isPublic = value),
                ),
              ],
            ),
          ),
          actions: [
            TextButton(onPressed: () => Navigator.of(context).pop(false), child: const Text('Cancel')),
            FilledButton(onPressed: () => Navigator.of(context).pop(true), child: const Text('Save')),
          ],
        ),
      ),
    );

    if (ok != true) return;

    try {
      await AnswerService.instance.update(id, content: controller.text.trim(), isPublic: isPublic);
      await _loadAnswers();
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('$e')));
    }
  }

  Future<void> _deleteAnswer(Map<String, dynamic> answer) async {
    final id = int.tryParse(answer['id']?.toString() ?? '') ?? 0;
    if (id == 0) return;

    final ok = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Delete answer'),
        content: const Text('Are you sure you want to delete this answer?'),
        actions: [
          TextButton(onPressed: () => Navigator.of(context).pop(false), child: const Text('Cancel')),
          FilledButton(onPressed: () => Navigator.of(context).pop(true), child: const Text('Delete')),
        ],
      ),
    );

    if (ok != true) return;

    try {
      await AnswerService.instance.deleteAnswer(id);
      await _loadAnswers();
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('$e')));
    }
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.only(bottom: MediaQuery.of(context).viewInsets.bottom),
      child: SizedBox(
        height: MediaQuery.of(context).size.height * 0.9,
        child: Scaffold(
          appBar: AppBar(
            automaticallyImplyLeading: false,
            title: Text('Reply #${widget.question.id}'),
            actions: [
              IconButton(
                onPressed: () => Navigator.of(context).pop(),
                icon: const Icon(Icons.close),
              ),
            ],
          ),
          body: ListView(
            padding: const EdgeInsets.all(12),
            children: [
              SectionCard(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(widget.question.title, style: const TextStyle(fontWeight: FontWeight.w700)),
                    const SizedBox(height: 4),
                    Text(widget.question.content),
                  ],
                ),
              ),
              const SizedBox(height: 10),
              Text(
                'My answers',
                style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w800),
              ),
              const SizedBox(height: 6),
              if (_loadingAnswers)
                const Center(child: Padding(padding: EdgeInsets.all(12), child: CircularProgressIndicator()))
              else if (_error != null)
                Text(_error!, style: const TextStyle(color: Colors.red))
              else
                ..._answers.where(_isMyAnswer).map((answer) {
                  final isPublic = answer['isPublic'] == true;
                  return Card(
                    child: ListTile(
                      title: Text(_readText(answer['content'])),
                      subtitle: Text(isPublic ? 'Public' : 'Private'),
                      trailing: PopupMenuButton<String>(
                        onSelected: (value) {
                          if (value == 'edit') _editAnswer(answer);
                          if (value == 'delete') _deleteAnswer(answer);
                        },
                        itemBuilder: (context) => const [
                          PopupMenuItem(value: 'edit', child: Text('Edit')),
                          PopupMenuItem(value: 'delete', child: Text('Delete')),
                        ],
                      ),
                    ),
                  );
                }),
              if (_answers.where(_isMyAnswer).isEmpty)
                const SectionCard(child: Text('You have no answers for this ticket yet.')),
              const SizedBox(height: 10),
              TextField(
                controller: _answerController,
                minLines: 3,
                maxLines: 8,
                decoration: const InputDecoration(hintText: 'Type your answer...'),
              ),
              const SizedBox(height: 6),
              SwitchListTile(
                contentPadding: EdgeInsets.zero,
                value: _isPublic,
                onChanged: (value) => setState(() => _isPublic = value),
                title: const Text('Public (visible to everyone)'),
              ),
              const SizedBox(height: 6),
              FilledButton.icon(
                onPressed: _sending ? null : _sendAnswer,
                icon: const Icon(Icons.send_outlined),
                label: Text(_sending ? 'Sending...' : 'Send answer'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _LecturerSubmissionPage extends StatefulWidget {
  const _LecturerSubmissionPage();

  @override
  State<_LecturerSubmissionPage> createState() => _LecturerSubmissionPageState();
}

class _LecturerSubmissionPageState extends State<_LecturerSubmissionPage> {
  bool _loading = true;
  String? _error;

  List<Map<String, dynamic>> _classes = const <Map<String, dynamic>>[];
  List<Map<String, dynamic>> _submissions = const <Map<String, dynamic>>[];
  int? _classIdFilter;

  int get _lecturerId => AppSession.instance.session?.userId ?? 0;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    if (!mounted) return;
    setState(() {
      _loading = true;
      _error = null;
    });

    try {
      final results = await Future.wait<dynamic>([
        ClassService.instance.getAll(lecturerId: _lecturerId),
        SubmissionService.instance.getAll(),
      ]);

      final classes = results[0] as List<Map<String, dynamic>>;
      final classIds = classes
          .map((item) => int.tryParse(item['id']?.toString() ?? ''))
          .whereType<int>()
          .toSet();

      final submissions = (results[1] as List<Map<String, dynamic>>).where((item) {
        final group = item['group'] as Map<String, dynamic>? ?? <String, dynamic>{};
        final classMap = group['class'] as Map<String, dynamic>? ?? <String, dynamic>{};
        final classId = int.tryParse(classMap['id']?.toString() ?? '') ??
            int.tryParse(group['classId']?.toString() ?? '');
        if (classIds.isEmpty) return true;
        return classId != null && classIds.contains(classId);
      }).toList(growable: false);

      if (!mounted) return;
      setState(() {
        _classes = classes;
        _submissions = submissions;
      });
    } catch (e) {
      if (!mounted) return;
      setState(() => _error = e.toString().replaceFirst('Exception: ', ''));
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  List<Map<String, dynamic>> get _filtered {
    if (_classIdFilter == null) return _submissions;
    return _submissions.where((item) {
      final group = item['group'] as Map<String, dynamic>? ?? <String, dynamic>{};
      final classMap = group['class'] as Map<String, dynamic>? ?? <String, dynamic>{};
      final classId = int.tryParse(classMap['id']?.toString() ?? '') ??
          int.tryParse(group['classId']?.toString() ?? '');
      return classId == _classIdFilter;
    }).toList(growable: false);
  }

  Future<void> _grade(Map<String, dynamic> submission) async {
    final id = int.tryParse(submission['id']?.toString() ?? '') ?? 0;
    if (id == 0) return;

    final gradeController = TextEditingController(text: submission['grade']?.toString() ?? '');
    final feedbackController = TextEditingController(text: _readText(submission['feedback']));

    final ok = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: Text('Grade Submission #$id'),
        content: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TextField(
                controller: gradeController,
                keyboardType: const TextInputType.numberWithOptions(decimal: true),
                decoration: const InputDecoration(labelText: 'Score (0-10)'),
              ),
              const SizedBox(height: 8),
              TextField(
                controller: feedbackController,
                minLines: 2,
                maxLines: 6,
                decoration: const InputDecoration(labelText: 'Feedback'),
              ),
            ],
          ),
        ),
        actions: [
          TextButton(onPressed: () => Navigator.of(context).pop(false), child: const Text('Cancel')),
          FilledButton(onPressed: () => Navigator.of(context).pop(true), child: const Text('Save')),
        ],
      ),
    );

    if (ok != true) return;

    final grade = double.tryParse(gradeController.text.trim());
    if (grade == null || grade < 0 || grade > 10) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Invalid score.')),
      );
      return;
    }

    try {
      await SubmissionService.instance.grade(
        id: id,
        grade: grade,
        feedback: feedbackController.text.trim(),
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

    return RefreshIndicator(
      onRefresh: _load,
      child: ListView(
        physics: const AlwaysScrollableScrollPhysics(),
        padding: const EdgeInsets.all(12),
        children: [
          Text(
            'Submission & Grading',
            style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w800),
          ),
          const SizedBox(height: 4),
          const Text('Review class submissions and enter grades directly.'),
          const SizedBox(height: 10),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: [
              OutlinedButton.icon(
                onPressed: _load,
                icon: const Icon(Icons.refresh),
                label: const Text('Refresh'),
              ),
              DropdownButton<int?>(
                value: _classIdFilter,
                items: [
                  const DropdownMenuItem<int?>(value: null, child: Text('All classes')),
                  ..._classes.map((item) {
                    final id = int.tryParse(item['id']?.toString() ?? '');
                    return DropdownMenuItem<int?>(value: id, child: Text(_readText(item['className'])));
                  }),
                ],
                onChanged: (value) => setState(() => _classIdFilter = value),
              ),
            ],
          ),
          const SizedBox(height: 10),
          if (_filtered.isEmpty)
            const SectionCard(child: Text('No submissions for this filter.'))
          else
            ..._filtered.map((item) {
              final id = int.tryParse(item['id']?.toString() ?? '') ?? 0;
              final status = _readText(item['status']).toUpperCase();
              final group = item['group'] as Map<String, dynamic>? ?? <String, dynamic>{};
              final classMap = group['class'] as Map<String, dynamic>? ?? <String, dynamic>{};
              final groupName = _readText(group['groupName']);
              final className = _readText(classMap['className']);
              final fileUrl = _readText(item['fileUrl'] ?? item['filePath']);
              final grade = item['grade'];

              return Card(
                child: Padding(
                  padding: const EdgeInsets.all(12),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('Submission #$id', style: const TextStyle(fontWeight: FontWeight.w700)),
                      const SizedBox(height: 4),
                      Text(status),
                      const SizedBox(height: 4),
                      Text('$groupName - $className'),
                      const SizedBox(height: 4),
                      Text(fileUrl),
                      const SizedBox(height: 4),
                      Text(grade == null ? 'Not graded yet' : 'Score: $grade'),
                      const SizedBox(height: 8),
                      FilledButton.icon(
                        onPressed: () => _grade(item),
                        icon: const Icon(Icons.edit_outlined),
                        label: Text(grade == null ? 'Grade' : 'Update grade'),
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

DateTime? _parseDate(dynamic value) {
  if (value == null) return null;
  return DateTime.tryParse(value.toString());
}

String _formatAgo(DateTime? time) {
  if (time == null) return 'N/A';
  final diff = DateTime.now().difference(time);
  if (diff.inMinutes < 1) return 'Just now';
  if (diff.inMinutes < 60) return '${diff.inMinutes} minutes ago';
  if (diff.inHours < 24) return '${diff.inHours} hours ago';
  return '${diff.inDays} days ago';
}

String _readText(Object? value) {
  final text = (value ?? '').toString().trim();
  if (text.isEmpty) return '-';

  const suspicious = ['Ã', 'Â', 'Ä', 'áº', 'á»', 'Æ', 'Ð', 'Ñ'];
  final looksBroken = suspicious.any(text.contains);
  if (!looksBroken) return text;

  try {
    return utf8.decode(latin1.encode(text));
  } catch (_) {
    return text;
  }
}
