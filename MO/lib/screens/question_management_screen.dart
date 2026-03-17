import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

import '../models/question_item.dart';
import 'create_question_screen.dart';
import '../services/question_service.dart';
import 'question_detail_screen.dart';

class QuestionManagementScreen extends StatefulWidget {
  const QuestionManagementScreen({
    super.key,
    this.showCreateButton = false,
    this.title = 'Q&A',
    this.subtitle = 'Ask questions and share knowledge',
  });

  final bool showCreateButton;
  final String title;
  final String subtitle;

  @override
  State<QuestionManagementScreen> createState() => _QuestionManagementScreenState();
}

class _QuestionManagementScreenState extends State<QuestionManagementScreen> {
  final _searchController = TextEditingController();

  bool _loading = true;
  String? _error;
  List<QuestionItem> _questions = const <QuestionItem>[];
  List<QuestionItem> _filtered = const <QuestionItem>[];

  @override
  void initState() {
    super.initState();
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
      final data = await QuestionService.instance.getAll();
      if (!mounted) return;
      setState(() {
        _questions = data;
        _applyFilter(_searchController.text);
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

  void _applyFilter(String value) {
    final query = value.trim().toLowerCase();
    if (query.isEmpty) {
      _filtered = _questions;
      return;
    }
    _filtered = _questions.where((item) {
      final source = '${item.title} ${item.content} ${item.askerName}'.toLowerCase();
      return source.contains(query);
    }).toList(growable: false);
  }

  Future<void> _openCreateQuestion() async {
    await Navigator.of(context).push(
      MaterialPageRoute(builder: (_) => const CreateQuestionScreen()),
    );
    if (!mounted) return;
    await _load();
  }

  Future<void> _confirmDelete(QuestionItem item) async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Delete question'),
        content: Text('Ban chac chan muon xoa question #${item.id}?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(false),
            child: const Text('Cancel'),
          ),
          FilledButton(
            onPressed: () => Navigator.of(context).pop(true),
            child: const Text('Delete'),
          ),
        ],
      ),
    );

    if (confirm != true) return;

    try {
      await QuestionService.instance.deleteQuestion(item.id);
      if (!mounted) return;
      await _load();
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Da xoa question thanh cong.')),
      );
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
    return SafeArea(
      child: RefreshIndicator(
        onRefresh: _load,
        child: ListView(
          physics: const AlwaysScrollableScrollPhysics(),
          padding: const EdgeInsets.all(16),
          children: [
            Wrap(
              alignment: WrapAlignment.spaceBetween,
              crossAxisAlignment: WrapCrossAlignment.center,
              runSpacing: 10,
              children: [
                Text(
                  widget.title,
                  style: Theme.of(context).textTheme.titleLarge?.copyWith(
                        fontWeight: FontWeight.w900,
                      ),
                ),
                Wrap(
                  spacing: 8,
                  children: [
                    if (widget.showCreateButton)
                      FilledButton.icon(
                        onPressed: _openCreateQuestion,
                        icon: const Icon(Icons.add),
                        label: const Text('New Question'),
                      ),
                    OutlinedButton.icon(
                      onPressed: _load,
                      icon: const Icon(Icons.refresh),
                      label: const Text('Reload'),
                    ),
                  ],
                ),
              ],
            ),
            const SizedBox(height: 6),
            Text(
              widget.subtitle,
              style: TextStyle(color: colorScheme.onSurfaceVariant),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: _searchController,
              onChanged: (value) => setState(() => _applyFilter(value)),
              decoration: const InputDecoration(
                hintText: 'Search questions...',
                prefixIcon: Icon(Icons.search),
              ),
            ),
            const SizedBox(height: 12),
            if (_loading)
              const Center(child: CircularProgressIndicator())
            else if (_error != null)
              Text(_error!, style: const TextStyle(color: Colors.red))
            else if (_filtered.isEmpty)
              const Text('Chua co question nao.')
            else
              ..._filtered.map(
                (item) => Card(
                  child: ListTile(
                    title: Text(item.title, maxLines: 1, overflow: TextOverflow.ellipsis),
                    subtitle: Text(
                      'By ${item.askerName} • ${item.answerCount} replies\n${DateFormat('M/d/yyyy, h:mm:ss a').format(item.createdAt ?? DateTime.now())} • ${item.status}',
                    ),
                    isThreeLine: true,
                    trailing: Wrap(
                      spacing: 6,
                      children: [
                        IconButton(
                          tooltip: 'Detail',
                          onPressed: () async {
                            await Navigator.of(context).push(
                              MaterialPageRoute(
                                builder: (_) => QuestionDetailScreen(questionId: item.id),
                              ),
                            );
                            if (!mounted) return;
                            await _load();
                          },
                          icon: const Icon(Icons.open_in_new),
                        ),
                        IconButton(
                          tooltip: 'Delete',
                          onPressed: () => _confirmDelete(item),
                          icon: const Icon(Icons.delete_outline, color: Colors.red),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }
}
