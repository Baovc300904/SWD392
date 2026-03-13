import 'package:flutter/material.dart';

import '../../models/topic_item.dart';
import '../../services/question_service.dart';
import '../../services/topic_service.dart';
import '../../state/app_session.dart';
import '../../widgets/ui_kit.dart';
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
    NavigationDestination(icon: Icon(Icons.lightbulb_outline), label: 'Proposals'),
    NavigationDestination(icon: Icon(Icons.quiz_outlined), label: 'Q&A'),
    NavigationDestination(icon: Icon(Icons.person_outline), label: 'Account'),
  ];

  static const _titles = <String>[
    'Lecturer Dashboard',
    'Topic Proposals',
    'Hierarchical Q&A',
    'Account',
  ];

  @override
  Widget build(BuildContext context) {
    final pages = <Widget>[
      const _LecturerDashboardPage(),
      const _LecturerProposalPage(),
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
  int _pendingTopics = 0;
  int _approvedTopics = 0;
  int _waitingQuestions = 0;
  int _escalatedQuestions = 0;

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

      final topics = result[0] as List<TopicItem>;
      final questions = result[1] as List<dynamic>;

      if (!mounted) return;
      setState(() {
        _pendingTopics = topics.where((t) => t.status.toUpperCase() == 'PENDING').length;
        _approvedTopics = topics.where((t) => t.status.toUpperCase() == 'APPROVED').length;
        _waitingQuestions = questions.where((q) => q.status == 'WAITING_LECTURER').length;
        _escalatedQuestions = questions.where((q) => q.status == 'ESCALATED_TO_MANAGER').length;
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
            title: 'Lecturer Workspace',
            subtitle: 'Propose topics, answer waiting tickets, and escalate edge cases to manager.',
            icon: Icons.psychology_alt_outlined,
          ),
          const SizedBox(height: 14),
          Wrap(
            spacing: 10,
            runSpacing: 10,
            children: [
              _CountCard(label: 'Topics Pending', value: _pendingTopics, icon: Icons.pending_actions_outlined),
              _CountCard(label: 'Topics Approved', value: _approvedTopics, icon: Icons.task_alt_outlined),
              _CountCard(label: 'WAITING_LECTURER', value: _waitingQuestions, icon: Icons.schedule_outlined),
              _CountCard(label: 'Escalated', value: _escalatedQuestions, icon: Icons.trending_up_outlined),
            ],
          ),
        ],
      ),
    );
  }
}

class _LecturerProposalPage extends StatefulWidget {
  const _LecturerProposalPage();

  @override
  State<_LecturerProposalPage> createState() => _LecturerProposalPageState();
}

class _LecturerProposalPageState extends State<_LecturerProposalPage> {
  final _titleController = TextEditingController();
  final _descController = TextEditingController();
  final _syllabusController = TextEditingController();

  bool _loading = true;
  String? _error;
  List<TopicItem> _topics = const [];

  @override
  void initState() {
    super.initState();
    _load();
  }

  @override
  void dispose() {
    _titleController.dispose();
    _descController.dispose();
    _syllabusController.dispose();
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

  Future<void> _createTopicProposal() async {
    final title = _titleController.text.trim();
    final desc = _descController.text.trim();
    if (title.isEmpty || desc.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Vui long nhap day du tieu de va mo ta.')),
      );
      return;
    }

    try {
      await TopicService.instance.create(
        proposerId: AppSession.instance.session?.userId ?? 0,
        title: title,
        description: desc,
        syllabusUrl: _syllabusController.text.trim().isEmpty
            ? null
            : _syllabusController.text.trim(),
        maxGroups: 5,
      );

      _titleController.clear();
      _descController.clear();
      _syllabusController.clear();

      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Da gui de xuat topic (PENDING).')),
      );
      await _load();
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('$e')));
    }
  }

  Color _statusColor(String status) {
    switch (status.toUpperCase()) {
      case 'APPROVED':
        return const Color(0xFF166534);
      case 'REJECTED':
        return const Color(0xFFB91C1C);
      default:
        return const Color(0xFF92400E);
    }
  }

  InputDecoration _compactDecoration(String labelText) {
    return InputDecoration(
      border: const OutlineInputBorder(),
      labelText: labelText,
      isDense: true,
      contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
    );
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) return const Center(child: CircularProgressIndicator());
    if (_error != null) return Center(child: Text(_error!, style: const TextStyle(color: Colors.red)));

    return Column(
      children: [
        const SizedBox(height: 8),
        SectionCard(
          margin: const EdgeInsets.fromLTRB(12, 4, 12, 8),
          child: Column(
            children: [
              TextField(
                controller: _titleController,
                style: const TextStyle(fontSize: 14),
                decoration: _compactDecoration('Ten de tai'),
              ),
              const SizedBox(height: 6),
              TextField(
                controller: _descController,
                style: const TextStyle(fontSize: 14),
                decoration: _compactDecoration('Mo ta chi tiet (Cong nghe, muc tieu)'),
                minLines: 2,
                maxLines: 4,
              ),
              const SizedBox(height: 6),
              TextField(
                controller: _syllabusController,
                style: const TextStyle(fontSize: 14),
                decoration: _compactDecoration('Syllabus file link'),
              ),
              const SizedBox(height: 6),
              Align(
                alignment: Alignment.centerRight,
                child: FilledButton.icon(
                  onPressed: _createTopicProposal,
                  style: FilledButton.styleFrom(
                    visualDensity: VisualDensity.compact,
                    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                  ),
                  icon: const Icon(Icons.send_outlined),
                  label: const Text('Gui de xuat moi'),
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
                  margin: const EdgeInsets.symmetric(horizontal: 12, vertical: 5),
                  child: ListTile(
                    title: Text(topic.title),
                    subtitle: Text(topic.description),
                    trailing: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                      decoration: BoxDecoration(
                        color: _statusColor(topic.status).withValues(alpha: 0.15),
                        borderRadius: BorderRadius.circular(999),
                      ),
                      child: Text(
                        topic.status.toUpperCase(),
                        style: TextStyle(
                          color: _statusColor(topic.status),
                          fontWeight: FontWeight.w700,
                        ),
                      ),
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
              trailing: const Icon(Icons.chevron_right),
              onTap: () async {
                await Navigator.of(context).push(
                  MaterialPageRoute(
                    builder: (_) => QuestionDetailScreen(questionId: question.id),
                  ),
                );
                if (!mounted) return;
                await _load();
              },
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
