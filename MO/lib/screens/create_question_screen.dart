import 'package:flutter/material.dart';

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
  final _groupController = TextEditingController(text: '1');

  bool _submitting = false;

  @override
  void dispose() {
    _titleController.dispose();
    _contentController.dispose();
    _groupController.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (!(_formKey.currentState?.validate() ?? false)) return;

    final askedBy = AppSession.instance.session?.userId ?? 1;
    final groupId = int.tryParse(_groupController.text.trim()) ?? 1;

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

      if (!mounted) return;
      _titleController.clear();
      _contentController.clear();

      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Tao question thanh cong.')),
      );
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(e.toString().replaceFirst('Exception: ', ''))),
      );
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
    return SafeArea(
      child: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Ask a Question',
                style: Theme.of(context).textTheme.titleLarge?.copyWith(
                      fontWeight: FontWeight.w900,
                    ),
              ),
              const SizedBox(height: 6),
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
                    const _FieldLabel('Group ID'),
                    TextFormField(
                      controller: _groupController,
                      keyboardType: TextInputType.number,
                      decoration: const InputDecoration(
                        hintText: 'e.g. 1',
                        isDense: true,
                      ),
                    ),
                    const SizedBox(height: 14),
                    SizedBox(
                      width: double.infinity,
                      height: 48,
                      child: FilledButton(
                        onPressed: _submitting ? null : _submit,
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
