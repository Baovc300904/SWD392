import 'package:flutter/material.dart';

import '../../services/answer_service.dart';
import '../../services/question_service.dart';
import '../../services/topic_service.dart';
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

  static const _tabs = <NavigationDestination>[
    NavigationDestination(icon: Icon(Icons.dashboard_outlined), label: 'Dashboard'),
    NavigationDestination(icon: Icon(Icons.add_box_outlined), label: 'Ask'),
    NavigationDestination(icon: Icon(Icons.question_answer_outlined), label: 'Q&A'),
    NavigationDestination(icon: Icon(Icons.topic_outlined), label: 'Topics'),
    NavigationDestination(icon: Icon(Icons.person_outline), label: 'Account'),
  ];

  static const _titles = <String>[
    'Student Dashboard',
    'Create Question',
    'Q&A Forum',
    'Topics',
    'Account',
  ];

  @override
  Widget build(BuildContext context) {
    final pages = <Widget>[
      const _StudentDashboardPage(),
      const CreateQuestionScreen(),
      const QuestionManagementScreen(),
      const _StudentTopicsPage(),
      const ProfileScreen(),
    ];

    return Scaffold(
      appBar: _index == 4 ? null : AppBar(title: Text(_titles[_index])),
      body: IndexedStack(index: _index, children: pages),
      bottomNavigationBar: NavigationBar(
        selectedIndex: _index,
        destinations: _tabs,
        onDestinationSelected: (v) => setState(() => _index = v),
      ),
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
  int _topics = 0;
  int _questions = 0;
  int _publicAnswers = 0;

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
        TopicService.instance.getAll(),
        QuestionService.instance.getAll(),
        AnswerService.instance.getPublicAnswers(),
      ]);
      if (!mounted) return;
      setState(() {
        _topics = (result[0] as List).length;
        _questions = (result[1] as List).length;
        _publicAnswers = (result[2] as List).length;
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
          const Text('Student workspace summary synced with backend resources.'),
          const SizedBox(height: 12),
          Wrap(
            spacing: 10,
            runSpacing: 10,
            children: [
              _CountCard(label: 'Topics', value: _topics),
              _CountCard(label: 'Questions', value: _questions),
              _CountCard(label: 'Public Answers', value: _publicAnswers),
            ],
          ),
        ],
      ),
    );
  }
}

class _StudentTopicsPage extends StatefulWidget {
  const _StudentTopicsPage();

  @override
  State<_StudentTopicsPage> createState() => _StudentTopicsPageState();
}

class _StudentTopicsPageState extends State<_StudentTopicsPage> {
  bool _loading = true;
  String? _error;
  List<dynamic> _topics = const [];

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
      setState(() => _topics = topics);
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
      child: ListView.builder(
        itemCount: _topics.length,
        itemBuilder: (_, i) {
          final topic = _topics[i];
          return Card(
            child: ListTile(
              title: Text(topic.title),
              subtitle: Text('Status: ${topic.status}\n${topic.description}'),
              isThreeLine: true,
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
