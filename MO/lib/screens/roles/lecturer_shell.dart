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
import '../../services/user_service.dart';
import '../../state/app_session.dart';
import '../../widgets/ui_kit.dart';
import '../login_screen.dart';
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
    NavigationDestination(icon: Icon(Icons.lightbulb_outline), label: 'De tai'),
    NavigationDestination(icon: Icon(Icons.quiz_outlined), label: 'Hoi dap'),
    NavigationDestination(icon: Icon(Icons.assignment_turned_in_outlined), label: 'Cham diem'),
    NavigationDestination(icon: Icon(Icons.person_outline), label: 'Ho so'),
  ];

  static const _titles = <String>[
    'Lecturer Workspace',
    'Quan ly De tai',
    'Quan ly Hoi dap',
    'Submission & Cham diem',
    'Ho so Giang vien',
  ];

  Future<void> _backToLogin() async {
    final ok = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Back to Login'),
        content: const Text('Ban co chac muon dang xuat va quay lai man hinh dang nhap?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(false),
            child: const Text('Huy'),
          ),
          FilledButton(
            onPressed: () => Navigator.of(context).pop(true),
            child: const Text('Dang xuat'),
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
      const _LecturerTopicPage(),
      const _LecturerQAPage(),
      const _LecturerSubmissionPage(),
      const _LecturerProfilePage(),
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

  Future<void> _confirmGroup(Map<String, dynamic> group) async {
    final id = int.tryParse(group['id']?.toString() ?? '') ?? 0;
    if (id == 0) return;

    try {
      await GroupService.instance.confirmGroup(id);
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Da chot nhom thanh cong.')),
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
            subtitle: 'Lecturer can theo doi bai nop, de tai, hoi dap va chot nhom ngay tai day.',
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
          const SizedBox(height: 10),
          SectionCard(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  '.SE1701',
                  style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w800),
                ),
                const SizedBox(height: 4),
                Text('${activeGroups.length} nhom dang hoat dong'),
                const SizedBox(height: 8),
                if (activeGroups.isEmpty)
                  const Text('Chua co nhom nao can chot.')
                else
                  ...activeGroups.take(3).map((group) {
                    final topic = group['topic'] as Map<String, dynamic>? ?? <String, dynamic>{};
                    final groupName = _readText(group['groupName']);
                    final topicTitle = _readText(topic['title']);
                    final status = _readText(group['groupStatus'] ?? group['status']);

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
                          Text('Trang thai: $status'),
                          const SizedBox(height: 8),
                          FilledButton.icon(
                            onPressed: () => _confirmGroup(group),
                            icon: const Icon(Icons.check_circle_outline),
                            label: const Text('Chot nhom'),
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
                  'Nop bai gan day (5 nhom)',
                  style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w800),
                ),
              ),
              TextButton.icon(
                onPressed: () => setState(() => _showAll = !_showAll),
                icon: Icon(_showAll ? Icons.expand_less : Icons.expand_more),
                label: Text(_showAll ? 'Thu gon' : 'Xem tat ca'),
              ),
            ],
          ),
          const SizedBox(height: 8),
          if (firstFive.isEmpty)
            const Text('Chua co bai nop nao.')
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
          Text('Loai bai nop: $submissionType'),
          const SizedBox(height: 2),
          Text('Nguoi nop: $submittedBy'),
          const SizedBox(height: 2),
          Text('Thoi gian: $submittedAt'),
          const SizedBox(height: 8),
          OutlinedButton.icon(
            onPressed: () {},
            icon: const Icon(Icons.visibility_outlined),
            label: const Text('Xem chi tiet'),
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
        const SnackBar(content: Text('Vui long nhap day du tieu de va mo ta de tai.')),
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
        const SnackBar(content: Text('Tao de tai thanh cong.')),
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
          TextButton(onPressed: () => Navigator.of(context).pop(), child: const Text('Dong')),
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
        title: const Text('Sua de tai'),
        content: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TextField(controller: titleController, decoration: const InputDecoration(labelText: 'Tieu de')),
              const SizedBox(height: 8),
              TextField(
                controller: descController,
                minLines: 2,
                maxLines: 6,
                decoration: const InputDecoration(labelText: 'Mo ta'),
              ),
            ],
          ),
        ),
        actions: [
          TextButton(onPressed: () => Navigator.of(context).pop(false), child: const Text('Huy')),
          FilledButton(onPressed: () => Navigator.of(context).pop(true), child: const Text('Luu')),
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
        title: const Text('Xoa de tai'),
        content: Text('Ban co chac muon xoa "${topic.title}"?'),
        actions: [
          TextButton(onPressed: () => Navigator.of(context).pop(false), child: const Text('Huy')),
          FilledButton(onPressed: () => Navigator.of(context).pop(true), child: const Text('Xoa')),
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
                  '.Quan ly De tai',
                  style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w800),
                ),
                const SizedBox(height: 4),
                const Text('Quan ly de tai va theo doi trang thai duyet'),
                const SizedBox(height: 10),
                TextField(controller: _titleController, decoration: const InputDecoration(labelText: 'Tieu de de tai')),
                const SizedBox(height: 8),
                TextField(
                  controller: _descriptionController,
                  minLines: 2,
                  maxLines: 5,
                  decoration: const InputDecoration(labelText: 'Mo ta'),
                ),
                const SizedBox(height: 8),
                TextField(controller: _syllabusController, decoration: const InputDecoration(labelText: 'Syllabus URL (tuy chon)')),
                const SizedBox(height: 10),
                FilledButton.icon(
                  onPressed: _creating ? null : _createTopic,
                  icon: const Icon(Icons.add_circle_outline),
                  label: Text(_creating ? 'Dang tao...' : 'Tao de tai'),
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
                    hintText: 'Tim kiem theo tieu de hoac mo ta...',
                  ),
                ),
              ),
              const SizedBox(width: 8),
              DropdownButton<String>(
                value: _statusFilter,
                items: const [
                  DropdownMenuItem(value: 'ALL', child: Text('Tat ca trang thai')),
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
            const SectionCard(child: Text('Khong tim thay de tai nao.'))
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
                      PopupMenuItem(value: 'view', child: Text('Xem chi tiet')),
                      PopupMenuItem(value: 'edit', child: Text('Sua')),
                      PopupMenuItem(value: 'delete', child: Text('Xoa')),
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
        const SnackBar(content: Text('Da escalate len truong bo mon.')),
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
            '.Quan ly Hoi dap',
            style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w800),
          ),
          const SizedBox(height: 4),
          const Text('Tra loi cau hoi cua sinh vien'),
          const SizedBox(height: 10),
          TextField(
            controller: _searchController,
            decoration: const InputDecoration(
              prefixIcon: Icon(Icons.search),
              hintText: 'Tim kiem cau hoi...',
            ),
          ),
          const SizedBox(height: 8),
          DropdownButton<String>(
            value: _statusFilter,
            items: const [
              DropdownMenuItem(value: 'ALL', child: Text('Tat ca')),
              DropdownMenuItem(value: 'UNANSWERED', child: Text('Chua tra loi')),
              DropdownMenuItem(value: 'ANSWERED', child: Text('Da tra loi')),
              DropdownMenuItem(value: 'ESCALATED', child: Text('Escalated')),
            ],
            onChanged: (value) {
              if (value == null) return;
              setState(() => _statusFilter = value);
            },
          ),
          const SizedBox(height: 8),
          if (_filteredQuestions.isEmpty)
            const SectionCard(child: Text('Khong tim thay cau hoi nao.'))
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
                      Text('Nguoi hoi: ${_readText(question.askerName)}'),
                      const SizedBox(height: 4),
                      Text('Trang thai: $status'),
                      const SizedBox(height: 8),
                      Wrap(
                        spacing: 8,
                        runSpacing: 8,
                        children: [
                          OutlinedButton.icon(
                            onPressed: () => _generateAiDraftAndReply(question),
                            icon: const Icon(Icons.auto_awesome_outlined),
                            label: const Text('Tao nhap AI'),
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
                            label: const Text('Tra loi'),
                          ),
                          TextButton(
                            onPressed: () async {
                              await Navigator.of(context).push(
                                MaterialPageRoute(builder: (_) => QuestionDetailScreen(questionId: question.id)),
                              );
                              if (!mounted) return;
                              await _load();
                            },
                            child: const Text('Xem chi tiet'),
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
        const SnackBar(content: Text('Vui long nhap noi dung tra loi.')),
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
        const SnackBar(content: Text('Da gui cau tra loi.')),
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
          title: const Text('Sua cau tra loi'),
          content: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                TextField(
                  controller: controller,
                  minLines: 3,
                  maxLines: 8,
                  decoration: const InputDecoration(hintText: 'Noi dung tra loi'),
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
            TextButton(onPressed: () => Navigator.of(context).pop(false), child: const Text('Huy')),
            FilledButton(onPressed: () => Navigator.of(context).pop(true), child: const Text('Luu')),
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
        title: const Text('Xoa cau tra loi'),
        content: const Text('Ban co chac muon xoa cau tra loi nay?'),
        actions: [
          TextButton(onPressed: () => Navigator.of(context).pop(false), child: const Text('Huy')),
          FilledButton(onPressed: () => Navigator.of(context).pop(true), child: const Text('Xoa')),
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
            title: Text('Tra loi #${widget.question.id}'),
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
                'Cau tra loi cua toi',
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
                          PopupMenuItem(value: 'edit', child: Text('Sua')),
                          PopupMenuItem(value: 'delete', child: Text('Xoa')),
                        ],
                      ),
                    ),
                  );
                }),
              if (_answers.where(_isMyAnswer).isEmpty)
                const SectionCard(child: Text('Ban chua co cau tra loi nao cho ticket nay.')),
              const SizedBox(height: 10),
              TextField(
                controller: _answerController,
                minLines: 3,
                maxLines: 8,
                decoration: const InputDecoration(hintText: 'Nhap cau tra loi...'),
              ),
              const SizedBox(height: 6),
              SwitchListTile(
                contentPadding: EdgeInsets.zero,
                value: _isPublic,
                onChanged: (value) => setState(() => _isPublic = value),
                title: const Text('Public (hien cho tat ca)'),
              ),
              const SizedBox(height: 6),
              FilledButton.icon(
                onPressed: _sending ? null : _sendAnswer,
                icon: const Icon(Icons.send_outlined),
                label: Text(_sending ? 'Dang gui...' : 'Gui cau tra loi'),
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
        title: Text('Cham Submission #$id'),
        content: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TextField(
                controller: gradeController,
                keyboardType: const TextInputType.numberWithOptions(decimal: true),
                decoration: const InputDecoration(labelText: 'Diem (0-10)'),
              ),
              const SizedBox(height: 8),
              TextField(
                controller: feedbackController,
                minLines: 2,
                maxLines: 6,
                decoration: const InputDecoration(labelText: 'Nhan xet'),
              ),
            ],
          ),
        ),
        actions: [
          TextButton(onPressed: () => Navigator.of(context).pop(false), child: const Text('Huy')),
          FilledButton(onPressed: () => Navigator.of(context).pop(true), child: const Text('Luu')),
        ],
      ),
    );

    if (ok != true) return;

    final grade = double.tryParse(gradeController.text.trim());
    if (grade == null || grade < 0 || grade > 10) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Diem khong hop le.')),
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
            'Submission & Cham diem',
            style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w800),
          ),
          const SizedBox(height: 4),
          const Text('Giang vien xem bai nop theo lop phu trach va nhap diem truc tiep.'),
          const SizedBox(height: 10),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: [
              OutlinedButton.icon(
                onPressed: _load,
                icon: const Icon(Icons.refresh),
                label: const Text('Lam moi'),
              ),
              DropdownButton<int?>(
                value: _classIdFilter,
                items: [
                  const DropdownMenuItem<int?>(value: null, child: Text('Tat ca lop')),
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
            const SectionCard(child: Text('Chua co bai nop nao trong bo loc hien tai.'))
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
                      Text(grade == null ? 'Chua cham' : 'Diem: $grade'),
                      const SizedBox(height: 8),
                      FilledButton.icon(
                        onPressed: () => _grade(item),
                        icon: const Icon(Icons.edit_outlined),
                        label: Text(grade == null ? 'Cham bai' : 'Cap nhat diem'),
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

class _LecturerProfilePage extends StatefulWidget {
  const _LecturerProfilePage();

  @override
  State<_LecturerProfilePage> createState() => _LecturerProfilePageState();
}

class _LecturerProfilePageState extends State<_LecturerProfilePage> {
  bool _loading = true;
  String? _error;

  Map<String, dynamic> _user = const <String, dynamic>{};
  List<Map<String, dynamic>> _classes = const <Map<String, dynamic>>[];
  List<TopicItem> _topics = const <TopicItem>[];
  List<QuestionItem> _questions = const <QuestionItem>[];
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
        UserService.instance.getCurrentUser(),
        ClassService.instance.getAll(lecturerId: _lecturerId),
        TopicService.instance.getAll(),
        QuestionService.instance.getAll(),
        SubmissionService.instance.getAll(),
      ]);

      if (!mounted) return;
      setState(() {
        _user = results[0] as Map<String, dynamic>;
        _classes = results[1] as List<Map<String, dynamic>>;
        _topics = results[2] as List<TopicItem>;
        _questions = results[3] as List<QuestionItem>;
        _submissions = results[4] as List<Map<String, dynamic>>;
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

    final pendingTopics = _topics.where((item) => item.status.toUpperCase() == 'PENDING').length;
    final waitingQuestions = _questions.where((item) {
      final status = item.status.toUpperCase();
      return status == 'WAITING_LECTURER' || status == 'WAITING';
    }).length;
    final needGrading = _submissions
        .where((item) => _readText(item['status']).toUpperCase() == 'SUBMITTED')
        .length;

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
                  'Profile',
                  style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w800),
                ),
                const SizedBox(height: 6),
                Text('Ho ten: ${_readText(_user['fullName'] ?? AppSession.instance.session?.fullName)}'),
                Text('Email: ${_readText(_user['email'] ?? AppSession.instance.session?.email)}'),
                Text('Role: ${_readText(_user['role'] ?? AppSession.instance.session?.role)}'),
              ],
            ),
          ),
          const SizedBox(height: 10),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: [
              StatCard(label: 'Lop phu trach', value: _classes.length, icon: Icons.class_outlined),
              StatCard(label: 'De tai cho duyet', value: pendingTopics, icon: Icons.pending_outlined),
              StatCard(label: 'Hoi dap cho xu ly', value: waitingQuestions, icon: Icons.question_answer_outlined),
              StatCard(label: 'Bai can cham', value: needGrading, icon: Icons.rate_review_outlined),
            ],
          ),
          const SizedBox(height: 10),
          SectionCard(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Danh sach lop',
                  style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w800),
                ),
                const SizedBox(height: 8),
                if (_classes.isEmpty)
                  const Text('Chua co lop phu trach.')
                else
                  ..._classes.map((item) => ListTile(
                        contentPadding: EdgeInsets.zero,
                        leading: const Icon(Icons.class_outlined),
                        title: Text(_readText(item['className'])),
                        subtitle: Text('ID: ${_readText(item['id'])}'),
                      )),
              ],
            ),
          ),
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
  if (diff.inMinutes < 1) return 'Vua xong';
  if (diff.inMinutes < 60) return '${diff.inMinutes} phut truoc';
  if (diff.inHours < 24) return '${diff.inHours} gio truoc';
  return '${diff.inDays} ngay truoc';
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
