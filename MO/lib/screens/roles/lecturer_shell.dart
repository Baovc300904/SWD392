import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

import '../../models/question_item.dart';
import '../../models/topic_item.dart';
import '../../services/answer_service.dart';
import '../../services/class_service.dart';
import '../../services/group_service.dart';
import '../../services/question_service.dart';
import '../../services/submission_service.dart';
import '../../services/topic_service.dart';
import '../../state/app_session.dart';

class LecturerShell extends StatefulWidget {
  const LecturerShell({super.key});

  @override
  State<LecturerShell> createState() => _LecturerShellState();
}

class _LecturerShellState extends State<LecturerShell> {
  int _index = 0;

  final List<Widget> _pages = const <Widget>[
    _LecturerDashboardPage(),
    _LecturerClassesGroupsPage(),
    _LecturerTopicManagementPage(),
    _LecturerQAManagementPage(),
    _LecturerSubmissionGradingPage(),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Lecturer Workspace'),
      ),
      body: _pages[_index],
      bottomNavigationBar: NavigationBar(
        selectedIndex: _index,
        onDestinationSelected: (int value) {
          setState(() => _index = value);
        },
        destinations: const <NavigationDestination>[
          NavigationDestination(
            icon: Icon(Icons.dashboard_outlined),
            selectedIcon: Icon(Icons.dashboard),
            label: 'Dashboard',
          ),
          NavigationDestination(
            icon: Icon(Icons.groups_outlined),
            selectedIcon: Icon(Icons.groups),
            label: 'Classes',
          ),
          NavigationDestination(
            icon: Icon(Icons.topic_outlined),
            selectedIcon: Icon(Icons.topic),
            label: 'Topics',
          ),
          NavigationDestination(
            icon: Icon(Icons.question_answer_outlined),
            selectedIcon: Icon(Icons.question_answer),
            label: 'Q&A',
          ),
          NavigationDestination(
            icon: Icon(Icons.assignment_turned_in_outlined),
            selectedIcon: Icon(Icons.assignment_turned_in),
            label: 'Grading',
          ),
        ],
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
  int _pendingTopics = 0;
  int _unanswered = 0;
  int _escalated = 0;
  int _groups = 0;
  List<Map<String, dynamic>> _recentSubmissions = <Map<String, dynamic>>[];

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() => _loading = true);

    try {
      final int? lecturerId = AppSession.instance.session?.userId;
      final List<TopicItem> topics = await TopicService.instance.getAll(
        status: 'PENDING',
      );
      final List<QuestionItem> questions = await QuestionService.instance.getAll();
      final List<Map<String, dynamic>> groups = await GroupService.instance.getAll();
      final List<Map<String, dynamic>> classes = await ClassService.instance.getAll(
        lecturerId: lecturerId,
      );
      final List<Map<String, dynamic>> submissions =
          await SubmissionService.instance.getAll();

      final Set<int> classIds = classes
          .map((Map<String, dynamic> e) => _asInt(e['id']))
          .whereType<int>()
          .toSet();

      final List<Map<String, dynamic>> filtered = submissions.where((Map<String, dynamic> s) {
        final Map<String, dynamic> group = _asMap(s['group']);
        final int? classId = _asInt(group['classId']) ??
            _asInt(_asMap(group['class'])['id']);
        return classIds.isEmpty || (classId != null && classIds.contains(classId));
      }).toList();

      filtered.sort((Map<String, dynamic> a, Map<String, dynamic> b) {
        final DateTime ad = _parseDateTime(a['submittedAt']);
        final DateTime bd = _parseDateTime(b['submittedAt']);
        return bd.compareTo(ad);
      });

      final Set<int> seenGroups = <int>{};
      final List<Map<String, dynamic>> recent = <Map<String, dynamic>>[];
      for (final Map<String, dynamic> item in filtered) {
        final int? groupId = _asInt(item['groupId']) ?? _asInt(_asMap(item['group'])['id']);
        if (groupId == null || seenGroups.contains(groupId)) {
          continue;
        }
        seenGroups.add(groupId);
        recent.add(item);
        if (recent.length >= 5) {
          break;
        }
      }

      final int pendingCount = topics
          .where((TopicItem t) =>
              t.status.toUpperCase() == 'PENDING' || t.status.toUpperCase() == 'WAITING')
          .length;

      setState(() {
        _pendingTopics = pendingCount;
        _unanswered = questions
            .where((QuestionItem q) => q.status.toUpperCase() == 'WAITING_LECTURER')
            .length;
        _escalated = questions
            .where((QuestionItem q) =>
                q.status.toUpperCase() == 'ESCALATED_TO_MANAGER')
            .length;
        _groups = groups.length;
        _recentSubmissions = recent;
        _loading = false;
      });
    } catch (_) {
      setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) {
      return const Center(child: CircularProgressIndicator());
    }

    return RefreshIndicator(
      onRefresh: _load,
      child: ListView(
        physics: const AlwaysScrollableScrollPhysics(),
        padding: const EdgeInsets.all(16),
        children: <Widget>[
          const Text(
            'Dashboard',
            style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 12),
          Wrap(
            spacing: 12,
            runSpacing: 12,
            children: <Widget>[
              _StatCard(title: 'Pending Topic Approvals', value: '$_pendingTopics'),
              _StatCard(title: 'Unanswered Questions', value: '$_unanswered'),
              _StatCard(title: 'Escalated Questions', value: '$_escalated'),
              _StatCard(title: 'Total Active Groups', value: '$_groups'),
            ],
          ),
          const SizedBox(height: 16),
          Card(
            child: Padding(
              padding: const EdgeInsets.all(12),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: <Widget>[
                  const Text(
                    'Recent Submissions (5 groups)',
                    style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700),
                  ),
                  const SizedBox(height: 12),
                  if (_recentSubmissions.isEmpty)
                    const Text(
                      'No submissions found for your groups yet.',
                      style: TextStyle(color: Colors.black54),
                    )
                  else
                    SingleChildScrollView(
                      scrollDirection: Axis.horizontal,
                      child: DataTable(
                        columns: const <DataColumn>[
                          DataColumn(label: Text('Class')),
                          DataColumn(label: Text('Group Name')),
                          DataColumn(label: Text('Submission Date')),
                          DataColumn(label: Text('Status')),
                        ],
                        rows: _recentSubmissions.map((Map<String, dynamic> item) {
                          final Map<String, dynamic> group = _asMap(item['group']);
                          final Map<String, dynamic> classMap =
                              _asMap(group['class']);
                          final String className = _safeText(
                            classMap['name'],
                            fallback: 'Class ${_safeText(group['classId'])}',
                          );
                          final String groupName =
                              _safeText(group['name'], fallback: 'Group');
                          final String date = DateFormat('dd/MM/yyyy').format(
                            _parseDateTime(item['submittedAt']),
                          );
                          final String status =
                              _safeText(item['status'], fallback: 'UNKNOWN');
                          return DataRow(
                            cells: <DataCell>[
                              DataCell(Text(className)),
                              DataCell(Text(groupName)),
                              DataCell(Text(date)),
                              DataCell(_statusChip(status)),
                            ],
                          );
                        }).toList(),
                      ),
                    ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _LecturerClassesGroupsPage extends StatefulWidget {
  const _LecturerClassesGroupsPage();

  @override
  State<_LecturerClassesGroupsPage> createState() =>
      _LecturerClassesGroupsPageState();
}

class _LecturerClassesGroupsPageState extends State<_LecturerClassesGroupsPage> {
  bool _loading = true;
  List<Map<String, dynamic>> _classes = <Map<String, dynamic>>[];
  List<Map<String, dynamic>> _groups = <Map<String, dynamic>>[];

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() => _loading = true);

    try {
      final int? lecturerId = AppSession.instance.session?.userId;
      final List<Map<String, dynamic>> classes = await ClassService.instance.getAll(
        lecturerId: lecturerId,
      );
      final List<Map<String, dynamic>> groups = await GroupService.instance.getAll();

      setState(() {
        _classes = classes;
        _groups = groups;
        _loading = false;
      });
    } catch (_) {
      setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) {
      return const Center(child: CircularProgressIndicator());
    }

    if (_classes.isEmpty) {
      return RefreshIndicator(
        onRefresh: _load,
        child: ListView(
          physics: const AlwaysScrollableScrollPhysics(),
          padding: const EdgeInsets.all(16),
          children: const <Widget>[
            Text(
              'Classes & Groups',
              style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold),
            ),
            SizedBox(height: 12),
            Text('No classes assigned to this lecturer yet.'),
          ],
        ),
      );
    }

    return RefreshIndicator(
      onRefresh: _load,
      child: ListView.builder(
        padding: const EdgeInsets.all(16),
        itemCount: _classes.length,
        itemBuilder: (BuildContext context, int index) {
          final Map<String, dynamic> item = _classes[index];
          final int? classId = _asInt(item['id']);
          final List<Map<String, dynamic>> classGroups = _groups.where((Map<String, dynamic> g) {
            final int? gid = _asInt(g['classId']);
            return classId != null && gid == classId;
          }).toList();

          return Card(
            margin: const EdgeInsets.only(bottom: 12),
            child: Padding(
              padding: const EdgeInsets.all(12),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: <Widget>[
                  Text(
                    _safeText(item['name'], fallback: 'Class'),
                    style: const TextStyle(
                      fontWeight: FontWeight.w700,
                      fontSize: 16,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text('Total Groups: ${classGroups.length}'),
                  const SizedBox(height: 8),
                  if (classGroups.isEmpty)
                    const Text('No groups created for this class.')
                  else
                    ...classGroups.map((Map<String, dynamic> g) {
                      final int members = _resolveMemberCount(g);
                      final String topicName =
                          _safeText(_asMap(g['topic'])['name'], fallback: 'No topic');
                      return Container(
                        margin: const EdgeInsets.only(bottom: 8),
                        padding: const EdgeInsets.all(10),
                        decoration: BoxDecoration(
                          border: Border.all(color: Colors.grey.shade300),
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: Row(
                          children: <Widget>[
                            const Icon(Icons.group, size: 20),
                            const SizedBox(width: 8),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: <Widget>[
                                  Text(
                                    _safeText(g['name'], fallback: 'Group'),
                                    style: const TextStyle(
                                      fontWeight: FontWeight.w600,
                                    ),
                                  ),
                                  Text('Topic: $topicName'),
                                ],
                              ),
                            ),
                            Text('$members members'),
                          ],
                        ),
                      );
                    }),
                ],
              ),
            ),
          );
        },
      ),
    );
  }
}

class _LecturerTopicManagementPage extends StatefulWidget {
  const _LecturerTopicManagementPage();

  @override
  State<_LecturerTopicManagementPage> createState() =>
      _LecturerTopicManagementPageState();
}

class _LecturerTopicManagementPageState extends State<_LecturerTopicManagementPage> {
  bool _loading = true;
  final TextEditingController _search = TextEditingController();
  String _status = 'ALL';
  List<TopicItem> _topics = <TopicItem>[];

  @override
  void initState() {
    super.initState();
    _load();
  }

  @override
  void dispose() {
    _search.dispose();
    super.dispose();
  }

  Future<void> _load() async {
    setState(() => _loading = true);

    try {
      final List<TopicItem> topics = await TopicService.instance.getAll();
      setState(() {
        _topics = topics;
        _loading = false;
      });
    } catch (_) {
      setState(() => _loading = false);
    }
  }

  Future<void> _createTopic() async {
    final TextEditingController nameCtrl = TextEditingController();
    final TextEditingController descCtrl = TextEditingController();

    final bool? created = await showDialog<bool>(
      context: context,
      builder: (BuildContext context) {
        return AlertDialog(
          title: const Text('Create Topic'),
          content: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: <Widget>[
                TextField(
                  controller: nameCtrl,
                  decoration: const InputDecoration(labelText: 'Topic Name'),
                ),
                const SizedBox(height: 8),
                TextField(
                  controller: descCtrl,
                  maxLines: 3,
                  decoration: const InputDecoration(labelText: 'Description'),
                ),
              ],
            ),
          ),
          actions: <Widget>[
            TextButton(
              onPressed: () => Navigator.pop(context, false),
              child: const Text('Cancel'),
            ),
            FilledButton(
              onPressed: () async {
                final String name = nameCtrl.text.trim();
                if (name.isEmpty) {
                  return;
                }
                try {
                  await TopicService.instance.create(
                    title: name,
                    description: descCtrl.text.trim(),
                    proposerId: AppSession.instance.session?.userId ?? 1,
                    maxGroups: 10,
                  );
                  if (!context.mounted) {
                    return;
                  }
                  Navigator.pop(context, true);
                } catch (_) {
                  if (!context.mounted) {
                    return;
                  }
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Failed to create topic.')),
                  );
                }
              },
              child: const Text('Create'),
            ),
          ],
        );
      },
    );

    nameCtrl.dispose();
    descCtrl.dispose();

    if (created == true) {
      await _load();
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) {
      return const Center(child: CircularProgressIndicator());
    }

    final String keyword = _search.text.trim().toLowerCase();
    final List<TopicItem> visible = _topics.where((TopicItem item) {
      final String status = item.status.toUpperCase();
      final bool statusMatch = _status == 'ALL' || status == _status;
      final bool searchMatch = keyword.isEmpty ||
          item.title.toLowerCase().contains(keyword) ||
          item.description.toLowerCase().contains(keyword);
      return statusMatch && searchMatch;
    }).toList();

    return RefreshIndicator(
      onRefresh: _load,
      child: ListView(
        physics: const AlwaysScrollableScrollPhysics(),
        padding: const EdgeInsets.all(16),
        children: <Widget>[
          Row(
            children: <Widget>[
              const Expanded(
                child: Text(
                  'Topic Management',
                  style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold),
                ),
              ),
              FilledButton.icon(
                onPressed: _createTopic,
                icon: const Icon(Icons.add),
                label: const Text('Create Topic'),
              ),
            ],
          ),
          const SizedBox(height: 12),
          TextField(
            controller: _search,
            decoration: const InputDecoration(
              prefixIcon: Icon(Icons.search),
              hintText: 'Search by topic name',
            ),
            onChanged: (_) => setState(() {}),
          ),
          const SizedBox(height: 8),
          DropdownButtonFormField<String>(
            initialValue: _status,
            decoration: const InputDecoration(labelText: 'Filter by status'),
            items: const <String>['ALL', 'PENDING', 'APPROVED', 'REJECTED', 'WAITING']
                .map(
                  (String e) => DropdownMenuItem<String>(
                    value: e,
                    child: Text(e),
                  ),
                )
                .toList(),
            onChanged: (String? value) {
              if (value == null) {
                return;
              }
              setState(() => _status = value);
            },
          ),
          const SizedBox(height: 12),
          if (visible.isEmpty)
            const Card(
              child: Padding(
                padding: EdgeInsets.all(12),
                child: Text('No topics found.'),
              ),
            )
          else
            SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              child: DataTable(
                columns: const <DataColumn>[
                  DataColumn(label: Text('ID')),
                  DataColumn(label: Text('Topic Name')),
                  DataColumn(label: Text('Status')),
                  DataColumn(label: Text('Created By')),
                ],
                rows: visible.map((TopicItem item) {
                  return DataRow(
                    cells: <DataCell>[
                      DataCell(Text('${item.id}')),
                      DataCell(
                        SizedBox(
                          width: 240,
                          child: Text(item.title, overflow: TextOverflow.ellipsis),
                        ),
                      ),
                      DataCell(_statusChip(item.status)),
                      DataCell(
                        Text(_safeText(AppSession.instance.session?.fullName, fallback: 'Lecturer')),
                      ),
                    ],
                  );
                }).toList(),
              ),
            ),
        ],
      ),
    );
  }
}

class _LecturerQAManagementPage extends StatefulWidget {
  const _LecturerQAManagementPage();

  @override
  State<_LecturerQAManagementPage> createState() =>
      _LecturerQAManagementPageState();
}

class _LecturerQAManagementPageState extends State<_LecturerQAManagementPage> {
  bool _loading = true;
  final TextEditingController _search = TextEditingController();
  String _status = 'ALL';
  List<QuestionItem> _questions = <QuestionItem>[];

  @override
  void initState() {
    super.initState();
    _load();
  }

  @override
  void dispose() {
    _search.dispose();
    super.dispose();
  }

  Future<void> _load() async {
    setState(() => _loading = true);

    try {
      final List<QuestionItem> items = await QuestionService.instance.getAll();
      setState(() {
        _questions = items;
        _loading = false;
      });
    } catch (_) {
      setState(() => _loading = false);
    }
  }

  Future<void> _askAi(QuestionItem item) async {
    try {
      final Map<String, dynamic> response =
          await QuestionService.instance.generateAiSuggestion(item.id);
      final dynamic data = response['data'];
      final String suggestion = _safeText(
        (data is Map<String, dynamic>) ? data['suggestion'] : null,
        fallback: _safeText(response['message'], fallback: 'No AI suggestion available.'),
      );
      if (!mounted) {
        return;
      }
      await showDialog<void>(
        context: context,
        builder: (BuildContext context) {
          return AlertDialog(
            title: const Text('AI Suggestion'),
            content: SingleChildScrollView(child: Text(suggestion)),
            actions: <Widget>[
              TextButton(
                onPressed: () => Navigator.pop(context),
                child: const Text('Close'),
              ),
            ],
          );
        },
      );
    } catch (_) {
      if (!mounted) {
        return;
      }
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Unable to generate AI suggestion.')),
      );
    }
  }

  Future<void> _openReply(QuestionItem item) async {
    await showDialog<void>(
      context: context,
      builder: (BuildContext context) {
        final TextEditingController ctrl = TextEditingController();
        return AlertDialog(
          title: Text('Reply to #${item.id}'),
          content: TextField(
            controller: ctrl,
            maxLines: 5,
            decoration: const InputDecoration(
              hintText: 'Enter your response',
            ),
          ),
          actions: <Widget>[
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('Cancel'),
            ),
            FilledButton(
              onPressed: () async {
                final String content = ctrl.text.trim();
                if (content.isEmpty) {
                  return;
                }
                try {
                  await AnswerService.instance.create(
                    questionId: item.id,
                    answeredBy: AppSession.instance.session?.userId ?? 1,
                    content: content,
                    isPublic: true,
                    markAsResolved: true,
                  );
                  if (!context.mounted) {
                    return;
                  }
                  Navigator.pop(context);
                  await _load();
                } catch (_) {
                  if (!context.mounted) {
                    return;
                  }
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Failed to submit reply.')),
                  );
                }
              },
              child: const Text('Send Reply'),
            ),
          ],
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) {
      return const Center(child: CircularProgressIndicator());
    }

    final String keyword = _search.text.trim().toLowerCase();
    final List<QuestionItem> visible = _questions.where((QuestionItem item) {
      final String mapped = _qaStatus(item.status);
      final bool statusMatch = _status == 'ALL' || mapped == _status;
      final bool searchMatch = keyword.isEmpty ||
          item.title.toLowerCase().contains(keyword) ||
          item.content.toLowerCase().contains(keyword);
      return statusMatch && searchMatch;
    }).toList();

    return RefreshIndicator(
      onRefresh: _load,
      child: ListView(
        physics: const AlwaysScrollableScrollPhysics(),
        padding: const EdgeInsets.all(16),
        children: <Widget>[
          const Text(
            'Q&A Management',
            style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 12),
          TextField(
            controller: _search,
            decoration: const InputDecoration(
              prefixIcon: Icon(Icons.search),
              hintText: 'Search by question title',
            ),
            onChanged: (_) => setState(() {}),
          ),
          const SizedBox(height: 8),
          DropdownButtonFormField<String>(
            initialValue: _status,
            decoration: const InputDecoration(labelText: 'Filter by status'),
            items: const <String>[
              'ALL',
              'WAITING_LECTURER',
              'ESCALATED_TO_MANAGER',
              'ANSWERED',
            ]
                .map(
                  (String e) => DropdownMenuItem<String>(
                    value: e,
                    child: Text(e),
                  ),
                )
                .toList(),
            onChanged: (String? value) {
              if (value == null) {
                return;
              }
              setState(() => _status = value);
            },
          ),
          const SizedBox(height: 12),
          if (visible.isEmpty)
            const Card(
              child: Padding(
                padding: EdgeInsets.all(12),
                child: Text('No unanswered or escalated questions at the moment.'),
              ),
            )
          else
            ...visible.map((QuestionItem item) {
              return Card(
                margin: const EdgeInsets.only(bottom: 10),
                child: Padding(
                  padding: const EdgeInsets.all(12),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: <Widget>[
                      Row(
                        children: <Widget>[
                          Text(
                            '#${item.id}',
                            style: const TextStyle(fontWeight: FontWeight.w700),
                          ),
                          const SizedBox(width: 8),
                          Expanded(
                            child: Text(
                              item.title,
                              style: const TextStyle(fontWeight: FontWeight.w700),
                            ),
                          ),
                          _statusChip(_qaStatus(item.status)),
                        ],
                      ),
                      const SizedBox(height: 6),
                      Text(item.content),
                      const SizedBox(height: 8),
                      Wrap(
                        spacing: 8,
                        children: <Widget>[
                          OutlinedButton.icon(
                            onPressed: () => _askAi(item),
                            icon: const Icon(Icons.auto_awesome),
                            label: const Text('Ask AI'),
                          ),
                          FilledButton.icon(
                            onPressed: () => _openReply(item),
                            icon: const Icon(Icons.reply),
                            label: const Text('Reply'),
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

class _LecturerSubmissionGradingPage extends StatefulWidget {
  const _LecturerSubmissionGradingPage();

  @override
  State<_LecturerSubmissionGradingPage> createState() =>
      _LecturerSubmissionGradingPageState();
}

class _LecturerSubmissionGradingPageState
    extends State<_LecturerSubmissionGradingPage> {
  bool _loading = true;
  String _selectedClass = 'ALL';
  List<Map<String, dynamic>> _classes = <Map<String, dynamic>>[];
  List<Map<String, dynamic>> _submissions = <Map<String, dynamic>>[];

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() => _loading = true);

    try {
      final int? lecturerId = AppSession.instance.session?.userId;
      final List<Map<String, dynamic>> classes = await ClassService.instance.getAll(
        lecturerId: lecturerId,
      );
      final List<Map<String, dynamic>> submissions =
          await SubmissionService.instance.getAll();

      final Set<int> classIds = classes
          .map((Map<String, dynamic> e) => _asInt(e['id']))
          .whereType<int>()
          .toSet();

      final List<Map<String, dynamic>> visible = submissions.where((Map<String, dynamic> s) {
        final Map<String, dynamic> group = _asMap(s['group']);
        final int? classId = _asInt(group['classId']) ??
            _asInt(_asMap(group['class'])['id']);
        return classIds.isEmpty || (classId != null && classIds.contains(classId));
      }).toList();

      visible.sort((Map<String, dynamic> a, Map<String, dynamic> b) {
        final DateTime ad = _parseDateTime(a['submittedAt']);
        final DateTime bd = _parseDateTime(b['submittedAt']);
        return bd.compareTo(ad);
      });

      setState(() {
        _classes = classes;
        _submissions = visible;
        _loading = false;
      });
    } catch (_) {
      setState(() => _loading = false);
    }
  }

  Future<void> _grade(Map<String, dynamic> submission) async {
    final TextEditingController gradeCtrl = TextEditingController(
      text: _safeText(submission['grade'], fallback: ''),
    );
    final TextEditingController feedbackCtrl = TextEditingController(
      text: _safeText(submission['feedback'], fallback: ''),
    );

    await showDialog<void>(
      context: context,
      builder: (BuildContext context) {
        return AlertDialog(
          title: const Text('Grade Submission'),
          content: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: <Widget>[
                TextField(
                  controller: gradeCtrl,
                  keyboardType:
                      const TextInputType.numberWithOptions(decimal: true),
                  decoration: const InputDecoration(labelText: 'Grade (0-10)'),
                ),
                const SizedBox(height: 8),
                TextField(
                  controller: feedbackCtrl,
                  maxLines: 4,
                  decoration: const InputDecoration(labelText: 'Feedback'),
                ),
              ],
            ),
          ),
          actions: <Widget>[
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('Cancel'),
            ),
            FilledButton(
              onPressed: () async {
                final int? id = _asInt(submission['id']);
                final double? grade = double.tryParse(gradeCtrl.text.trim());
                if (id == null || grade == null) {
                  return;
                }
                try {
                  await SubmissionService.instance.grade(
                    id: id,
                    grade: grade,
                    feedback: feedbackCtrl.text.trim(),
                  );
                  if (!context.mounted) {
                    return;
                  }
                  Navigator.pop(context);
                  await _load();
                } catch (_) {
                  if (!context.mounted) {
                    return;
                  }
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Failed to submit grade.')),
                  );
                }
              },
              child: const Text('Submit Grade'),
            ),
          ],
        );
      },
    );

    gradeCtrl.dispose();
    feedbackCtrl.dispose();
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) {
      return const Center(child: CircularProgressIndicator());
    }

    final List<String> classOptions = <String>[
      'ALL',
      ..._classes.map((Map<String, dynamic> item) => _safeText(item['id'])),
    ];

    final List<Map<String, dynamic>> visible = _submissions.where((Map<String, dynamic> s) {
      if (_selectedClass == 'ALL') {
        return true;
      }
      final Map<String, dynamic> group = _asMap(s['group']);
      final String classId = _safeText(group['classId'], fallback: '');
      return classId == _selectedClass;
    }).toList();

    return RefreshIndicator(
      onRefresh: _load,
      child: ListView(
        physics: const AlwaysScrollableScrollPhysics(),
        padding: const EdgeInsets.all(16),
        children: <Widget>[
          const Text(
            'Submission & Grading',
            style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 8),
          DropdownButtonFormField<String>(
            initialValue: _selectedClass,
            decoration: const InputDecoration(labelText: 'Filter by class'),
            items: classOptions.map((String id) {
              if (id == 'ALL') {
                return const DropdownMenuItem<String>(
                  value: 'ALL',
                  child: Text('All Classes'),
                );
              }
              final Map<String, dynamic> classMap = _classes.firstWhere(
                (Map<String, dynamic> item) => _safeText(item['id']) == id,
                orElse: () => <String, dynamic>{},
              );
              final String className = _safeText(
                classMap['name'],
                fallback: 'Class $id',
              );
              return DropdownMenuItem<String>(
                value: id,
                child: Text(className),
              );
            }).toList(),
            onChanged: (String? value) {
              if (value == null) {
                return;
              }
              setState(() => _selectedClass = value);
            },
          ),
          const SizedBox(height: 12),
          if (visible.isEmpty)
            const Card(
              child: Padding(
                padding: EdgeInsets.all(12),
                child: Text('No submissions available for grading in this class.'),
              ),
            )
          else
            ...visible.map((Map<String, dynamic> item) {
              final Map<String, dynamic> group = _asMap(item['group']);
              final Map<String, dynamic> classMap = _asMap(group['class']);
              final String className =
                  _safeText(classMap['name'], fallback: 'Class ${_safeText(group['classId'])}');
              final String groupName = _safeText(group['name'], fallback: 'Group');
              final String submissionLink =
                  _safeText(item['submissionLink'], fallback: 'No link');
              final String status = _safeText(item['status'], fallback: 'UNKNOWN');
              final String submittedDate =
                  DateFormat('dd/MM/yyyy HH:mm').format(_parseDateTime(item['submittedAt']));

              return Card(
                margin: const EdgeInsets.only(bottom: 10),
                child: Padding(
                  padding: const EdgeInsets.all(12),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: <Widget>[
                      Row(
                        children: <Widget>[
                          Expanded(
                            child: Text(
                              '$className - $groupName',
                              style: const TextStyle(
                                fontWeight: FontWeight.w700,
                                fontSize: 15,
                              ),
                            ),
                          ),
                          _statusChip(status),
                        ],
                      ),
                      const SizedBox(height: 6),
                      Text('Submitted: $submittedDate'),
                      const SizedBox(height: 4),
                      Text('Link: $submissionLink'),
                      if (item['grade'] != null) ...<Widget>[
                        const SizedBox(height: 4),
                        Text('Grade: ${item['grade']}'),
                      ],
                      if (_safeText(item['feedback'], fallback: '').isNotEmpty) ...<Widget>[
                        const SizedBox(height: 4),
                        Text('Feedback: ${_safeText(item['feedback'])}'),
                      ],
                      const SizedBox(height: 8),
                      Align(
                        alignment: Alignment.centerRight,
                        child: FilledButton.icon(
                          onPressed: () => _grade(item),
                          icon: const Icon(Icons.grading),
                          label: const Text('Grade'),
                        ),
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

class _StatCard extends StatelessWidget {
  final String title;
  final String value;

  const _StatCard({required this.title, required this.value});

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: 165,
      child: Card(
        child: Padding(
          padding: const EdgeInsets.all(12),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: <Widget>[
              Text(
                title,
                style: const TextStyle(fontSize: 12, color: Colors.black54),
              ),
              const SizedBox(height: 6),
              Text(
                value,
                style: const TextStyle(
                  fontSize: 22,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

Widget _statusChip(String status) {
  final String upper = status.toUpperCase();
  Color background = Colors.grey.shade200;
  Color foreground = Colors.grey.shade800;

  if (upper == 'PENDING' || upper == 'WAITING' || upper == 'WAITING_LECTURER') {
    background = Colors.orange.shade100;
    foreground = Colors.orange.shade900;
  } else if (upper == 'APPROVED' || upper == 'GRADED' || upper == 'ANSWERED') {
    background = Colors.green.shade100;
    foreground = Colors.green.shade900;
  } else if (upper == 'REJECTED') {
    background = Colors.red.shade100;
    foreground = Colors.red.shade900;
  } else if (upper == 'ESCALATED_TO_MANAGER') {
    background = Colors.deepPurple.shade100;
    foreground = Colors.deepPurple.shade900;
  }

  return Container(
    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
    decoration: BoxDecoration(
      color: background,
      borderRadius: BorderRadius.circular(999),
    ),
    child: Text(
      status,
      style: TextStyle(
        color: foreground,
        fontSize: 12,
        fontWeight: FontWeight.w700,
      ),
    ),
  );
}

String _qaStatus(String raw) {
  final String upper = raw.toUpperCase();
  if (upper == 'RESOLVED') {
    return 'ANSWERED';
  }
  return upper;
}

Map<String, dynamic> _asMap(dynamic value) {
  if (value is Map<String, dynamic>) {
    return value;
  }
  if (value is Map) {
    return value.map((dynamic k, dynamic v) => MapEntry('$k', v));
  }
  return <String, dynamic>{};
}

String _safeText(dynamic value, {String fallback = 'N/A'}) {
  if (value == null) {
    return fallback;
  }
  final String text = '$value'.trim();
  if (text.isEmpty || text.toLowerCase() == 'null') {
    return fallback;
  }
  return text;
}

int? _asInt(dynamic value) {
  if (value is int) {
    return value;
  }
  if (value is num) {
    return value.toInt();
  }
  if (value is String) {
    return int.tryParse(value);
  }
  return null;
}

DateTime _parseDateTime(dynamic value) {
  if (value is DateTime) {
    return value;
  }
  if (value is String) {
    return DateTime.tryParse(value)?.toLocal() ?? DateTime(1970);
  }
  return DateTime(1970);
}

int _resolveMemberCount(Map<String, dynamic> group) {
  final dynamic direct = group['membersCount'];
  if (direct is int) {
    return direct;
  }
  if (direct is num) {
    return direct.toInt();
  }
  final dynamic members = group['members'];
  if (members is List) {
    return members.length;
  }
  return 0;
}
