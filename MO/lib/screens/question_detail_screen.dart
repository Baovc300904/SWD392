import 'package:flutter/material.dart';

import '../models/question_item.dart';
import '../services/ai_draft_service.dart';
import '../services/answer_service.dart';
import '../services/question_service.dart';
import '../state/app_session.dart';

class QuestionDetailScreen extends StatefulWidget {
  const QuestionDetailScreen({super.key, required this.questionId});

  final int questionId;

  @override
  State<QuestionDetailScreen> createState() => _QuestionDetailScreenState();
}

class _QuestionDetailScreenState extends State<QuestionDetailScreen> {
  bool _loading = true;
  bool _sending = false;
  String? _error;
  QuestionItem? _question;
  List<Map<String, dynamic>> _answers = const <Map<String, dynamic>>[];
  final TextEditingController _answerController = TextEditingController();
  bool _isPublic = true;

  String get _role => AppSession.instance.session?.normalizedRole ?? 'student';
  bool get _canModerate => _role == 'lecturer' || _role == 'manager';

  @override
  void initState() {
    super.initState();
    _load();
  }

  @override
  void dispose() {
    _answerController.dispose();
    super.dispose();
  }

  Future<void> _load() async {
    setState(() {
      _loading = true;
      _error = null;
    });

    try {
      final questionFuture = QuestionService.instance.getById(widget.questionId);
      final answersFuture = AnswerService.instance.getByQuestion(widget.questionId);
      final results = await Future.wait<dynamic>([questionFuture, answersFuture]);

      if (!mounted) return;
      setState(() {
        _question = results[0] as QuestionItem;
        _answers = results[1] as List<Map<String, dynamic>>;
      });
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _error = e.toString().replaceFirst('Exception: ', '');
      });
    } finally {
      if (mounted) {
        setState(() {
          _loading = false;
        });
      }
    }
  }

  Future<void> _resolve() async {
    try {
      await QuestionService.instance.resolve(widget.questionId);
      await _load();
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('$e')));
    }
  }

  Future<void> _escalate() async {
    try {
      await QuestionService.instance.escalate(widget.questionId);
      await _load();
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('$e')));
    }
  }

  Future<void> _generateAiDraft() async {
    final q = _question;
    if (q == null) return;

    try {
      final draft = await AiDraftService.instance.buildSmartDraft(
        questionId: q.id,
        questionTitle: q.title,
        questionContent: q.content,
      );
      if (!mounted) return;
      setState(() {
        _answerController.text = draft.trim();
      });
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('AI smart draft da duoc tao.')), 
      );
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('$e')));
    }
  }

  Future<void> _addAnswer() async {
    final content = _answerController.text.trim();
    if (content.isEmpty) return;

    final userId = AppSession.instance.session?.userId ?? 1;

    setState(() => _sending = true);
    try {
      await AnswerService.instance.create(
        questionId: widget.questionId,
        answeredBy: userId,
        content: content,
        isPublic: _isPublic,
        markAsResolved: true,
      );
      _answerController.clear();
      await _load();
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('$e')));
    } finally {
      if (mounted) setState(() => _sending = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('Question #${widget.questionId}')),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : _error != null
              ? Center(child: Text(_error!, style: const TextStyle(color: Colors.red)))
              : _question == null
                  ? const Center(child: Text('Question not found'))
                  : ListView(
                      padding: const EdgeInsets.all(16),
                      children: [
                        Text(
                          _question!.title,
                          style: Theme.of(context).textTheme.titleLarge?.copyWith(
                                fontWeight: FontWeight.w900,
                              ),
                        ),
                        const SizedBox(height: 8),
                        Text(_question!.content),
                        const SizedBox(height: 10),
                        Row(
                          children: [
                            Chip(label: Text(_question!.status)),
                            const Spacer(),
                            if (_canModerate)
                              TextButton.icon(
                                onPressed: _escalate,
                                icon: const Icon(Icons.north_outlined),
                                label: const Text('Escalate'),
                              ),
                            if (_canModerate)
                              FilledButton(
                                onPressed: _resolve,
                                child: const Text('Resolve'),
                              ),
                          ],
                        ),
                        const SizedBox(height: 16),
                        const Text(
                          'Answer Thread',
                          style: TextStyle(fontWeight: FontWeight.w800, fontSize: 16),
                        ),
                        const SizedBox(height: 8),
                        if (_answers.isEmpty)
                          const Text('Chua co answer nao.')
                        else
                          ..._answers.map(
                            (answer) => Card(
                              child: ListTile(
                                title: Text(answer['content']?.toString() ?? ''),
                                subtitle: Text(
                                  'Visibility: ${answer['isPublic'] == true ? 'Public' : 'Private'}',
                                ),
                              ),
                            ),
                          ),
                        if (_canModerate) ...[
                          const SizedBox(height: 14),
                          TextField(
                            controller: _answerController,
                            minLines: 4,
                            maxLines: 8,
                            decoration: const InputDecoration(
                              border: OutlineInputBorder(),
                              hintText: 'Nhap noi dung tra loi...',
                            ),
                          ),
                          const SizedBox(height: 8),
                          SwitchListTile(
                            contentPadding: EdgeInsets.zero,
                            title: const Text('Public answer to Knowledge Library'),
                            subtitle: const Text('Tat: Private cho nhom hoi'),
                            value: _isPublic,
                            onChanged: (value) => setState(() => _isPublic = value),
                          ),
                          const SizedBox(height: 6),
                          Row(
                            children: [
                              OutlinedButton.icon(
                                onPressed: _generateAiDraft,
                                icon: const Icon(Icons.auto_awesome_outlined),
                                label: const Text('Smart Draft'),
                              ),
                              const SizedBox(width: 8),
                              FilledButton.icon(
                                onPressed: _sending ? null : _addAnswer,
                                icon: const Icon(Icons.send_outlined),
                                label: const Text('Send Answer'),
                              ),
                            ],
                          ),
                        ],
                      ],
                    ),
    );
  }
}
