import 'package:flutter/material.dart';

import '../../models/topic_item.dart';
import '../../services/answer_service.dart';
import '../../services/question_service.dart';
import '../../services/topic_service.dart';
import '../../widgets/ui_kit.dart';
import '../create_question_screen.dart';
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
    NavigationDestination(icon: Icon(Icons.add_box_outlined), label: 'Ask'),
    NavigationDestination(icon: Icon(Icons.question_answer_outlined), label: 'Q&A'),
    NavigationDestination(icon: Icon(Icons.topic_outlined), label: 'Topic Repo'),
    NavigationDestination(icon: Icon(Icons.person_outline), label: 'Account'),
  ];

  static const _titles = <String>[
    'Student Dashboard',
    'Create Question Ticket',
    'Q&A Forum',
    'Approved Topic Repository',
    'Account',
  ];

  @override
  Widget build(BuildContext context) {
    final pages = <Widget>[
      const _StudentDashboardPage(),
      const CreateQuestionScreen(),
      const QuestionManagementScreen(),
      const _StudentTopicSelectionPage(),
      const ProfileScreen(),
    ];

    return Scaffold(
      appBar: _index == 4 ? null : AppBar(title: Text(_titles[_index])),
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
  int _openTopics = 0;
  int _waitingQuestions = 0;
  int _resolvedQuestions = 0;

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
        QuestionService.instance.getAll(),
        AnswerService.instance.getPublicAnswers(),
      ]);

      final topics = result[0] as List<TopicItem>;
      final questions = result[1] as List<dynamic>;
      final _ = result[2] as List<dynamic>;

      if (!mounted) return;
      setState(() {
        _openTopics = topics.length;
        _waitingQuestions = questions.where((q) => q.status == 'WAITING_LECTURER').length;
        _resolvedQuestions = questions.where((q) => q.status == 'RESOLVED').length;
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
    if (_loading) return const Center(child: CircularProgressIndicator());
    if (_error != null) return Center(child: Text(_error!, style: const TextStyle(color: Colors.red)));

    return RefreshIndicator(
      onRefresh: _load,
      child: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          const DashboardHero(
            title: 'Student Workspace',
            subtitle: 'Track approved topics, ask questions, and follow ticket status in one place.',
            icon: Icons.school_outlined,
          ),
          const SizedBox(height: 14),
          Wrap(
            spacing: 10,
            runSpacing: 10,
            children: [
              _CountCard(label: 'Open Topics', value: _openTopics, icon: Icons.topic_outlined),
              _CountCard(label: 'WAITING_LECTURER', value: _waitingQuestions, icon: Icons.schedule_outlined),
              _CountCard(label: 'Resolved Tickets', value: _resolvedQuestions, icon: Icons.verified_outlined),
            ],
          ),
        ],
      ),
    );
  }
}

class _StudentTopicSelectionPage extends StatefulWidget {
  const _StudentTopicSelectionPage();

  @override
  State<_StudentTopicSelectionPage> createState() => _StudentTopicSelectionPageState();
}

class _StudentTopicSelectionPageState extends State<_StudentTopicSelectionPage> {
  final _searchController = TextEditingController();

  bool _loading = true;
  String? _error;
  List<TopicItem> _topics = const [];
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
      final topics = await TopicService.instance.getAll(
        status: 'APPROVED',
        search: (_searchQuery ?? '').trim().isEmpty ? null : (_searchQuery ?? '').trim(),
      );
      if (!mounted) return;
      setState(() => _topics = topics);
    } catch (e) {
      if (!mounted) return;
      setState(() => _error = '$e');
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  Future<void> _viewTopicDetail(TopicItem topic) async {
    try {
      final detail = await TopicService.instance.getById(topic.id);
      if (!mounted) return;
      await showDialog<void>(
        context: context,
        builder: (context) {
          return AlertDialog(
            title: Text(detail.title),
            content: SingleChildScrollView(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text('Status: ${detail.status.toUpperCase()}'),
                  const SizedBox(height: 8),
                  Text(detail.description.isEmpty ? '(No description)' : detail.description),
                  const SizedBox(height: 8),
                  Text('Topic ID: ${detail.id}'),
                  if (detail.createdAt != null)
                    Text('Created: ${detail.createdAt}'),
                ],
              ),
            ),
            actions: [
              TextButton(
                onPressed: () => Navigator.of(context).pop(),
                child: const Text('Close'),
              ),
            ],
          );
        },
      );
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
        const SizedBox(height: 8),
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 12),
          child: Row(
            children: [
              OutlinedButton.icon(
                onPressed: _load,
                icon: const Icon(Icons.refresh),
                label: const Text('Reload'),
              ),
            ],
          ),
        ),
        const SizedBox(height: 8),
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 12),
          child: TextField(
            controller: _searchController,
            onChanged: (value) => setState(() => _searchQuery = value),
            onSubmitted: (_) => _load(),
            decoration: InputDecoration(
              hintText: 'Search topics...',
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
        const Padding(
          padding: EdgeInsets.fromLTRB(12, 4, 12, 8),
          child: Align(
            alignment: Alignment.centerLeft,
            child: Text(
              'Approved Topic Repository (View Only)',
              style: TextStyle(fontWeight: FontWeight.w700),
            ),
          ),
        ),
        Expanded(
          child: RefreshIndicator(
            onRefresh: _load,
            child: _topics.isEmpty
                ? ListView(
                    children: const [
                      SizedBox(height: 120),
                      Center(child: Text('Khong co topic de hien thi voi bo loc hien tai.')),
                    ],
                  )
                : ListView.builder(
                    itemCount: _topics.length,
                    itemBuilder: (_, i) {
                      final topic = _topics[i];
                      return Card(
                        margin: const EdgeInsets.symmetric(horizontal: 12, vertical: 5),
                        child: ListTile(
                          title: Text(topic.title),
                          subtitle: Text('Status: ${topic.status.toUpperCase()}\n${topic.description}'),
                          isThreeLine: true,
                          trailing: OutlinedButton(
                            onPressed: () => _viewTopicDetail(topic),
                            child: const Text('Detail'),
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
