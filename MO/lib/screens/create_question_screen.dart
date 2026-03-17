import 'package:flutter/material.dart';

import '../services/group_service.dart';
import '../services/question_service.dart';
import '../state/app_session.dart';
import '../widgets/ui_kit.dart';

class CreateQuestionScreen extends StatefulWidget {
  const CreateQuestionScreen({super.key});

  @override
  State<CreateQuestionScreen> createState() => _CreateQuestionScreenState();
}

class _CreateQuestionScreenState extends State<CreateQuestionScreen> {
  final _formKey = GlobalKey<FormState>();
  final _titleController = TextEditingController();
  final _contentController = TextEditingController();
  bool _loadingGroups = true;
  List<Map<String, dynamic>> _groups = const <Map<String, dynamic>>[];
  int? _selectedGroupId;

  bool _submitting = false;

  @override
  void initState() {
    super.initState();
    _loadGroups();
  }

  @override
  void dispose() {
    _titleController.dispose();
    _contentController.dispose();
    super.dispose();
  }

  Future<void> _loadGroups() async {
    setState(() {
      _loadingGroups = true;
    });

    try {
      final groups = await GroupService.instance.getAll();
      if (!mounted) return;

      setState(() {
        _groups = groups;
        final firstId = groups.isEmpty
            ? null
            : int.tryParse(groups.first['id']?.toString() ?? '');
        _selectedGroupId ??= firstId;
      });
    } catch (_) {
      if (!mounted) return;
      setState(() {
        _groups = const <Map<String, dynamic>>[];
        _selectedGroupId = null;
      });
    } finally {
      if (mounted) {
        setState(() {
          _loadingGroups = false;
        });
      }
    }
  }

  Future<bool> _submit() async {
    if (!(_formKey.currentState?.validate() ?? false)) return false;

    final askedBy = AppSession.instance.session?.userId ?? 1;
    final groupId = _selectedGroupId;

    if (groupId == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Ban can co nhom truoc khi tao question.')),
      );
      return false;
    }

    setState(() {
      _submitting = true;
    });

    try {
      await QuestionService.instance.create(
        title: _titleController.text.trim(),
        content: _contentController.text.trim(),
        groupId: groupId,
        askedBy: askedBy,
      );

      if (!mounted) return false;
      _titleController.clear();
      _contentController.clear();

      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Tao question thanh cong.')),
      );
      return true;
    } catch (e) {
      if (!mounted) return false;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(e.toString().replaceFirst('Exception: ', ''))),
      );
      return false;
    } finally {
      if (mounted) {
        setState(() {
          _submitting = false;
        });
      }
    }

  }

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;
    return Scaffold(
      appBar: AppBar(title: const Text('New Question')),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(16),
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Create a new ticket for your lecturer to review.',
                  style: TextStyle(color: colorScheme.onSurfaceVariant, height: 1.35),
                ),
                const SizedBox(height: 14),
                SectionCard(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const _FieldLabel('Title'),
                      TextFormField(
                        controller: _titleController,
                        textInputAction: TextInputAction.next,
                        decoration: const InputDecoration(
                          hintText: 'Enter a short title',
                          isDense: true,
                        ),
                        validator: (value) {
                          if ((value ?? '').trim().isEmpty) return 'Title is required';
                          return null;
                        },
                      ),
                      const SizedBox(height: 12),
                      const _FieldLabel('Details'),
                      TextFormField(
                        controller: _contentController,
                        minLines: 3,
                        maxLines: 6,
                        decoration: const InputDecoration(
                          hintText: 'Describe your question clearly',
                          isDense: true,
                        ),
                        validator: (value) {
                          if ((value ?? '').trim().isEmpty) return 'Details are required';
                          return null;
                        },
                      ),
                      const SizedBox(height: 12),
                      const _FieldLabel('Group'),
                      if (_loadingGroups)
                        const Padding(
                          padding: EdgeInsets.symmetric(vertical: 8),
                          child: LinearProgressIndicator(minHeight: 3),
                        )
                      else if (_groups.isEmpty)
                        Container(
                          width: double.infinity,
                          padding: const EdgeInsets.all(12),
                          decoration: BoxDecoration(
                            border: Border.all(color: colorScheme.outlineVariant),
                            borderRadius: BorderRadius.circular(10),
                          ),
                          child: const Text('Ban chua co nhom nao. Hay tao nhom o tab Topic.'),
                        )
                      else
                        DropdownButtonFormField<int>(
                          initialValue: _selectedGroupId,
                          items: _groups
                              .map(
                                (group) => DropdownMenuItem<int>(
                                  value: int.tryParse(group['id']?.toString() ?? ''),
                                  child: Text(group['groupName']?.toString() ?? 'Group'),
                                ),
                              )
                              .where((item) => item.value != null)
                              .cast<DropdownMenuItem<int>>()
                              .toList(growable: false),
                          onChanged: (value) => setState(() => _selectedGroupId = value),
                          decoration: const InputDecoration(
                            isDense: true,
                            hintText: 'Select your group',
                          ),
                          validator: (value) => value == null ? 'Group is required' : null,
                        ),
                      const SizedBox(height: 8),
                      Align(
                        alignment: Alignment.centerLeft,
                        child: TextButton.icon(
                          onPressed: _loadingGroups ? null : _loadGroups,
                          icon: const Icon(Icons.refresh),
                          label: const Text('Reload groups'),
                        ),
                      ),
                      const SizedBox(height: 14),
                      SizedBox(
                        width: double.infinity,
                        height: 48,
                        child: FilledButton(
                          onPressed: _submitting
                              ? null
                              : () async {
                                  final success = await _submit();
                                  if (!mounted) return;
                                  if (success) {
                                    Navigator.of(this.context).pop(true);
                                  }
                                },
                          child: _submitting
                              ? const SizedBox(
                                  width: 20,
                                  height: 20,
                                  child: CircularProgressIndicator(strokeWidth: 2),
                                )
                              : const Text('Submit Question'),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _FieldLabel extends StatelessWidget {
  const _FieldLabel(this.text);

  final String text;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 6),
      child: Text(
        text,
        style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 12, letterSpacing: 0.2),
      ),
    );
  }
}
