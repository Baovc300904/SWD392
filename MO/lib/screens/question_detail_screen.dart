import 'package:flutter/material.dart';

import '../models/question_item.dart';
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
  String? _error;
  QuestionItem? _question;
  List<Map<String, dynamic>> _answers = const <Map<String, dynamic>>[];
  final TextEditingController _answerController = TextEditingController();

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
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(e.toString().replaceFirst('Exception: ', ''))),
      );
    }
  }

  Future<void> _addAnswer() async {
    final content = _answerController.text.trim();
    if (content.isEmpty) return;

    final userId = AppSession.instance.session?.userId ?? 1;

    try {
      await AnswerService.instance.create(
        questionId: widget.questionId,
        answeredBy: userId,
        content: content,
        isPublic: true,
      );
      _answerController.clear();
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
                            FilledButton(
                              onPressed: _resolve,
                              child: const Text('Mark Resolved'),
                            ),
                          ],
                        ),
                        const SizedBox(height: 16),
                        const Text(
                          'Answers',
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
                                  'Public: ${answer['isPublic'] == true ? 'Yes' : 'No'}',
                                ),
                              ),
                            ),
                          ),
                        const SizedBox(height: 14),
                        TextField(
                          controller: _answerController,
                          minLines: 2,
                          maxLines: 4,
                          decoration: const InputDecoration(
                            border: OutlineInputBorder(),
                            hintText: 'Nhap answer moi...',
                          ),
                        ),
                        const SizedBox(height: 8),
                        Align(
                          alignment: Alignment.centerRight,
                          child: FilledButton(
                            onPressed: _addAnswer,
                            child: const Text('Add Answer'),
                          ),
                        ),
                      ],
                    ),
    );
  }
}
