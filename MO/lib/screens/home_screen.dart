import 'package:flutter/material.dart';

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  static const _messages = <_ChatItem>[
    _ChatItem.message(
      name: 'Tuyet Minh',
      time: '9:12 AM',
      text: "Good morning team! Let's have a quick\nsync on today's priorities.",
      emoji: '👏',
      count: 3,
    ),
    _ChatItem.message(
      name: 'Tran Thi B',
      time: '9:32 AM',
      text: "Morning! I've finished the authentication\nflow. It's ready for testing.",
      emoji: '🎉',
      count: 2,
      emoji2: '👍',
      count2: 1,
    ),
    _ChatItem.message(
      name: 'Le Van C',
      time: '9:35 AM',
      text: "Great work! I'll start working on the\ndatabase integration today.",
    ),
    _ChatItem.separator('NEW MESSAGES'),
    _ChatItem.message(
      name: 'Pham Thi D',
      time: '9:38 AM',
      text:
          "I'm updating the UI mockups based on\nyesterday's feedback. Will share in a bit!",
      emoji: '✨',
      count: 1,
    ),
    _ChatItem.message(
      name: 'Dr. Tran Minh',
      time: '10:15 AM',
      text:
          "Good progress everyone. Don't forget we\nhave our sprint review on Friday. Make\nsure to prepare your demos.",
    ),
  ];

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      child: Column(
        children: [
          Expanded(
            child: ListView.separated(
              padding: const EdgeInsets.fromLTRB(12, 10, 12, 10),
              itemCount: _messages.length,
              separatorBuilder: (_, __) => const SizedBox(height: 10),
              itemBuilder: (context, index) {
                final item = _messages[index];
                return switch (item) {
                  _ChatMessageItem() => _ChatMessage(item: item),
                  _ChatSeparatorItem() => _ChatSeparator(text: item.text),
                };
              },
            ),
          ),
          const _Composer(),
        ],
      ),
    );
  }
}

sealed class _ChatItem {
  const _ChatItem();

  const factory _ChatItem.message({
    required String name,
    required String time,
    required String text,
    String? emoji,
    int? count,
    String? emoji2,
    int? count2,
  }) = _ChatMessageItem;

  const factory _ChatItem.separator(String text) = _ChatSeparatorItem;
}

final class _ChatMessageItem extends _ChatItem {
  const _ChatMessageItem({
    required this.name,
    required this.time,
    required this.text,
    this.emoji,
    this.count,
    this.emoji2,
    this.count2,
  });

  final String name;
  final String time;
  final String text;
  final String? emoji;
  final int? count;
  final String? emoji2;
  final int? count2;
}

final class _ChatSeparatorItem extends _ChatItem {
  const _ChatSeparatorItem(this.text);
  final String text;
}

class _ChatMessage extends StatelessWidget {
  const _ChatMessage({required this.item});

  final _ChatMessageItem item;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final avatarColor = Colors.primaries[item.name.hashCode % Colors.primaries.length];

    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        CircleAvatar(
          radius: 18,
          backgroundColor: avatarColor.shade200,
          child: Text(
            item.name.trim().isEmpty ? '?' : item.name.trim()[0].toUpperCase(),
            style: const TextStyle(fontWeight: FontWeight.w700),
          ),
        ),
        const SizedBox(width: 10),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Expanded(
                    child: Text(
                      item.name,
                      style: theme.textTheme.bodyMedium?.copyWith(
                        fontWeight: FontWeight.w700,
                      ),
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                  const SizedBox(width: 8),
                  Text(
                    item.time,
                    style: theme.textTheme.bodySmall?.copyWith(
                      color: theme.colorScheme.onSurfaceVariant,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 4),
              Text(item.text, style: theme.textTheme.bodyMedium),
              const SizedBox(height: 8),
              Wrap(
                spacing: 8,
                runSpacing: 6,
                children: [
                  if (item.emoji != null && item.count != null)
                    _ReactionChip(emoji: item.emoji!, count: item.count!),
                  if (item.emoji2 != null && item.count2 != null)
                    _ReactionChip(emoji: item.emoji2!, count: item.count2!),
                  _AddReactionButton(),
                ],
              ),
            ],
          ),
        ),
      ],
    );
  }
}

class _ChatSeparator extends StatelessWidget {
  const _ChatSeparator({required this.text});

  final String text;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        const Expanded(child: Divider()),
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 10),
          child: Text(
            text,
            style: const TextStyle(
              color: Colors.red,
              fontWeight: FontWeight.w700,
              fontSize: 12,
              letterSpacing: 0.4,
            ),
          ),
        ),
        const Expanded(child: Divider()),
      ],
    );
  }
}

class _ReactionChip extends StatelessWidget {
  const _ReactionChip({required this.emoji, required this.count});

  final String emoji;
  final int count;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(
        color: const Color(0xFFF3F4F6),
        borderRadius: BorderRadius.circular(18),
      ),
      child: Text(
        '$emoji $count',
        style: const TextStyle(fontWeight: FontWeight.w600),
      ),
    );
  }
}

class _AddReactionButton extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: const Color(0xFFF3F4F6),
        borderRadius: BorderRadius.circular(18),
      ),
      child: IconButton(
        visualDensity: VisualDensity.compact,
        iconSize: 18,
        onPressed: () {},
        icon: const Icon(Icons.emoji_emotions_outlined),
      ),
    );
  }
}

class _Composer extends StatelessWidget {
  const _Composer();

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.fromLTRB(10, 10, 10, 12),
      decoration: const BoxDecoration(
        border: Border(top: BorderSide(color: Color(0xFFE5E7EB))),
      ),
      child: Row(
        children: [
          IconButton(
            onPressed: () {},
            icon: const Icon(Icons.attach_file),
          ),
          Expanded(
            child: Container(
              height: 44,
              padding: const EdgeInsets.symmetric(horizontal: 12),
              decoration: BoxDecoration(
                color: const Color(0xFFF3F4F6),
                borderRadius: BorderRadius.circular(22),
              ),
              child: const Align(
                alignment: Alignment.centerLeft,
                child: Text(
                  'Message #general-chat',
                  style: TextStyle(color: Color(0xFF6B7280)),
                ),
              ),
            ),
          ),
          const SizedBox(width: 8),
          Container(
            width: 44,
            height: 44,
            decoration: BoxDecoration(
              color: const Color(0xFFF3F4F6),
              borderRadius: BorderRadius.circular(22),
            ),
            child: IconButton(
              onPressed: () {},
              icon: const Icon(Icons.send_outlined),
            ),
          ),
        ],
      ),
    );
  }
}
