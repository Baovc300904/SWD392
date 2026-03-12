import 'package:flutter/material.dart';

import '../../services/answer_service.dart';
import '../../services/question_service.dart';
import '../../services/topic_service.dart';
import '../../state/app_session.dart';
import '../profile_screen.dart';

class LecturerShell extends StatefulWidget {
  const LecturerShell({super.key});

  @override
  State<LecturerShell> createState() => _LecturerShellState();
}

class _LecturerShellState extends State<LecturerShell> {
  int _index = 0;

  static const _tabs = <NavigationDestination>[
    NavigationDestination(icon: Icon(Icons.dashboard_outlined), label: 'Dashboard'),
    NavigationDestination(icon: Icon(Icons.topic_outlined), label: 'Topics'),
    NavigationDestination(icon: Icon(Icons.quiz_outlined), label: 'Q&A'),
    NavigationDestination(icon: Icon(Icons.person_outline), label: 'Account'),
  ];

  static const _titles = <String>[
    'Lecturer Dashboard',
    'Topic Management',
    'Q&A Management',
    'Account',
  ];

  @override
  Widget build(BuildContext context) {
    final pages = <Widget>[
      const _LecturerDashboardPage(),
      const _LecturerTopicsPage(),
      const _LecturerQAPage(),
      const ProfileScreen(),
    ];

    return Scaffold(
      appBar: _index == 3 ? null : AppBar(title: Text(_titles[_index])),
      body: IndexedStack(index: _index, children: pages),
      bottomNavigationBar: NavigationBar(
        selectedIndex: _index,
        destinations: _tabs,
        onDestinationSelected: (v) => setState(() => _index = v),
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
      final result = await Future.wait<dynamic>([
        TopicService.instance.getAll(),
        QuestionService.instance.getAll(),
      ]);
      if (!mounted) return;
      setState(() {
        _topics = (result[0] as List).length;
        _questions = (result[1] as List).length;
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
          const Text('Lecturer summary based on topic and Q&A resources.'),
          const SizedBox(height: 12),
          Wrap(
            spacing: 10,
            runSpacing: 10,
            children: [
              _CountCard(label: 'Topics', value: _topics),
              _CountCard(label: 'Questions', value: _questions),
            ],
          ),
        ],
      ),
    );
  }
}

class _LecturerTopicsPage extends StatefulWidget {
  const _LecturerTopicsPage();

  @override
  State<_LecturerTopicsPage> createState() => _LecturerTopicsPageState();
}

class _LecturerTopicsPageState extends State<_LecturerTopicsPage> {
  final _titleController = TextEditingController();
  final _descController = TextEditingController();

  bool _loading = true;
  String? _error;
  List<dynamic> _topics = const [];

  @override
  void initState() {
    super.initState();
    _load();
  }

  @override
  void dispose() {
    _titleController.dispose();
    _descController.dispose();
    super.dispose();
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

  Future<void> _createTopic() async {
    final title = _titleController.text.trim();
    if (title.isEmpty) return;

    try {
      await TopicService.instance.create(
        createdBy: AppSession.instance.session?.userId ?? 0,
        title: title,
        description: _descController.text.trim(),
        maxGroups: 5,
      );
      _titleController.clear();
      _descController.clear();
      await _load();
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('$e')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) return const Center(child: CircularProgressIndicator());
    if (_error != null) return Center(child: Text(_error!, style: const TextStyle(color: Colors.red)));

    return Column(
      children: [
        Padding(
          padding: const EdgeInsets.fromLTRB(12, 12, 12, 8),
          child: Column(
            children: [
              TextField(
                controller: _titleController,
                decoration: const InputDecoration(
                  border: OutlineInputBorder(),
                  labelText: 'Topic title',
                ),
              ),
              const SizedBox(height: 8),
              TextField(
                controller: _descController,
                decoration: const InputDecoration(
                  border: OutlineInputBorder(),
                  labelText: 'Description',
                ),
                minLines: 2,
                maxLines: 3,
              ),
              const SizedBox(height: 8),
              Align(
                alignment: Alignment.centerRight,
                child: FilledButton.icon(
                  onPressed: _createTopic,
                  icon: const Icon(Icons.add),
                  label: const Text('Create Topic'),
                ),
              ),
            ],
          ),
        ),
        Expanded(
          child: RefreshIndicator(
            onRefresh: _load,
            child: ListView.builder(
              itemCount: _topics.length,
              itemBuilder: (_, i) {
                final topic = _topics[i];
                return Card(
                  child: ListTile(
                    title: Text(topic.title),
                    subtitle: Text('Status: ${topic.status}'),
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

class _LecturerQAPage extends StatefulWidget {
  const _LecturerQAPage();

  @override
  State<_LecturerQAPage> createState() => _LecturerQAPageState();
}

class _LecturerQAPageState extends State<_LecturerQAPage> {
  bool _loading = true;
  String? _error;
  List<dynamic> _questions = const [];

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
      final questions = await QuestionService.instance.getAll();
      if (!mounted) return;
      setState(() => _questions = questions);
    } catch (e) {
      if (!mounted) return;
      setState(() => _error = '$e');
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  Future<void> _resolve(int id) async {
    await QuestionService.instance.resolve(id);
    await _load();
  }

  Future<void> _escalate(int id) async {
    await QuestionService.instance.escalate(id);
    await _load();
  }

  Future<void> _quickAnswer(int questionId) async {
    final userId = AppSession.instance.session?.userId ?? 0;
    await AnswerService.instance.create(
      questionId: questionId,
      answeredBy: userId,
      content: 'Da tiep nhan va dang xu ly cau hoi nay.',
      isPublic: true,
      markAsResolved: false,
    );
    await _load();
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) return const Center(child: CircularProgressIndicator());
    if (_error != null) return Center(child: Text(_error!, style: const TextStyle(color: Colors.red)));

    return RefreshIndicator(
      onRefresh: _load,
      child: ListView.builder(
        itemCount: _questions.length,
        itemBuilder: (_, i) {
          final question = _questions[i];
          return Card(
            child: ListTile(
              title: Text(question.title),
              subtitle: Text(question.status),
              trailing: Wrap(
                spacing: 4,
                children: [
                  IconButton(
                    tooltip: 'Answer',
                    onPressed: () => _quickAnswer(question.id),
                    icon: const Icon(Icons.reply_outlined, color: Colors.blue),
                  ),
                  IconButton(
                    tooltip: 'Resolve',
                    onPressed: () => _resolve(question.id),
                    icon: const Icon(Icons.check_circle_outline, color: Colors.green),
                  ),
                  IconButton(
                    tooltip: 'Escalate',
                    onPressed: () => _escalate(question.id),
                    icon: const Icon(Icons.north_outlined, color: Colors.orange),
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
