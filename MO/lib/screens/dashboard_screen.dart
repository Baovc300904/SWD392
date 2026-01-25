import 'package:flutter/material.dart';

class DashboardScreen extends StatefulWidget {
  const DashboardScreen({super.key});

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  static const _bg = Color(0xFFF6F7FB);
  static const _cardBorder = Color(0xFFE6E8EF);
  static const _muted = Color(0xFF6B7280);
  static const _accent = Color(0xFFE67E22);

  bool _myTasks = false;

  static const _tasks = <_TaskItem>[
    _TaskItem(
      title: 'Design Database Schema',
      tag: 'Backend',
      tagColor: Color(0xFFE6F0FF),
      tagTextColor: Color(0xFF2563EB),
      priority: 'High Priority',
      priorityColor: Color(0xFFFFE4E6),
      priorityTextColor: Color(0xFFEF4444),
      dueText: 'Tomorrow',
      dueIsUrgent: true,
      status: 'In Progress',
      avatarText: 'DB',
    ),
    _TaskItem(
      title: 'Implement Authentication API',
      tag: 'Backend',
      tagColor: Color(0xFFE6F0FF),
      tagTextColor: Color(0xFF2563EB),
      priority: 'High Priority',
      priorityColor: Color(0xFFFFE4E6),
      priorityTextColor: Color(0xFFEF4444),
      dueText: 'Jan 23',
      dueIsUrgent: false,
      status: 'In Progress',
      avatarText: 'AU',
    ),
    _TaskItem(
      title: 'Create UI Mockups',
      tag: 'Design',
      tagColor: Color(0xFFF3E8FF),
      tagTextColor: Color(0xFF7C3AED),
      priority: null,
      dueText: 'Jan 25',
      dueIsUrgent: false,
      status: 'To Do',
      avatarText: 'UI',
    ),
    _TaskItem(
      title: 'Write Unit Tests',
      tag: 'Testing',
      tagColor: Color(0xFFDCFCE7),
      tagTextColor: Color(0xFF16A34A),
      priority: null,
      dueText: 'Jan 26',
      dueIsUrgent: false,
      status: 'To Do',
      avatarText: 'UT',
    ),
  ];

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final tasks = _myTasks ? _tasks.take(2).toList() : _tasks;

    return Scaffold(
      backgroundColor: _bg,
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.fromLTRB(16, 14, 16, 16),
          children: [
            Text(
              'Project Tasks',
              style: theme.textTheme.headlineSmall?.copyWith(
                fontWeight: FontWeight.w800,
              ),
            ),
            const SizedBox(height: 12),
            _Segmented(
              leftText: 'All Tasks',
              rightText: 'My Tasks',
              leftSelected: !_myTasks,
              onLeft: () => setState(() => _myTasks = false),
              onRight: () => setState(() => _myTasks = true),
            ),
            const SizedBox(height: 12),
            const _ProgressCard(percent: 0.67),
            const SizedBox(height: 14),
            ...tasks.map((t) => Padding(
                  padding: const EdgeInsets.only(bottom: 12),
                  child: _TaskCard(task: t),
                )),
          ],
        ),
      ),
    );
  }
}

class _Segmented extends StatelessWidget {
  const _Segmented({
    required this.leftText,
    required this.rightText,
    required this.leftSelected,
    required this.onLeft,
    required this.onRight,
  });

  final String leftText;
  final String rightText;
  final bool leftSelected;
  final VoidCallback onLeft;
  final VoidCallback onRight;

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 44,
      padding: const EdgeInsets.all(4),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        border: const Border.fromBorderSide(
          BorderSide(color: _DashboardScreenState._cardBorder),
        ),
      ),
      child: Row(
        children: [
          Expanded(
            child: _SegmentButton(
              text: leftText,
              selected: leftSelected,
              onTap: onLeft,
            ),
          ),
          const SizedBox(width: 6),
          Expanded(
            child: _SegmentButton(
              text: rightText,
              selected: !leftSelected,
              onTap: onRight,
            ),
          ),
        ],
      ),
    );
  }
}

class _SegmentButton extends StatelessWidget {
  const _SegmentButton({
    required this.text,
    required this.selected,
    required this.onTap,
  });

  final String text;
  final bool selected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return InkWell(
      borderRadius: BorderRadius.circular(12),
      onTap: onTap,
      child: Container(
        alignment: Alignment.center,
        decoration: BoxDecoration(
          color: selected ? _DashboardScreenState._accent : const Color(0xFFF3F4F6),
          borderRadius: BorderRadius.circular(12),
        ),
        child: Text(
          text,
          style: TextStyle(
            color: selected ? Colors.white : const Color(0xFF111827),
            fontWeight: FontWeight.w800,
            fontSize: 12,
          ),
        ),
      ),
    );
  }
}

class _ProgressCard extends StatelessWidget {
  const _ProgressCard({required this.percent});

  final double percent;

  @override
  Widget build(BuildContext context) {
    final pct = (percent * 100).round();
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: const Color(0xFFF2F3FF),
        borderRadius: BorderRadius.circular(16),
        border: const Border.fromBorderSide(
          BorderSide(color: _DashboardScreenState._cardBorder),
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Expanded(
                child: Text(
                  'Project Progress',
                  style: TextStyle(fontWeight: FontWeight.w700),
                ),
              ),
              Text(
                '$pct%',
                style: const TextStyle(
                  color: _DashboardScreenState._accent,
                  fontWeight: FontWeight.w900,
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),
          ClipRRect(
            borderRadius: BorderRadius.circular(999),
            child: LinearProgressIndicator(
              minHeight: 8,
              value: percent.clamp(0, 1),
              backgroundColor: const Color(0xFFE5E7EB),
              valueColor: const AlwaysStoppedAnimation(
                _DashboardScreenState._accent,
              ),
            ),
          ),
          const SizedBox(height: 10),
          const Text(
            '8 of 12 tasks completed',
            style: TextStyle(
              color: _DashboardScreenState._muted,
              fontWeight: FontWeight.w600,
              fontSize: 12,
            ),
          ),
        ],
      ),
    );
  }
}

class _TaskCard extends StatelessWidget {
  const _TaskCard({required this.task});

  final _TaskItem task;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final avatarColor = Colors.primaries[task.title.hashCode % Colors.primaries.length];

    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(18),
        border: const Border.fromBorderSide(
          BorderSide(color: _DashboardScreenState._cardBorder),
        ),
        boxShadow: const [
          BoxShadow(
            color: Color(0x12000000),
            blurRadius: 14,
            offset: Offset(0, 6),
          ),
        ],
      ),
      child: Padding(
        padding: const EdgeInsets.fromLTRB(14, 14, 12, 12),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Expanded(
                  child: Text(
                    task.title,
                    style: theme.textTheme.titleMedium?.copyWith(
                      fontWeight: FontWeight.w800,
                    ),
                  ),
                ),
                const SizedBox(width: 10),
                CircleAvatar(
                  radius: 16,
                  backgroundColor: avatarColor.shade200,
                  child: Text(
                    task.avatarText,
                    style: const TextStyle(fontWeight: FontWeight.w900),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 10),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: [
                _Pill(text: task.tag, bg: task.tagColor, fg: task.tagTextColor),
                if (task.priority != null)
                  _Pill(
                    text: task.priority!,
                    bg: task.priorityColor ?? const Color(0xFFFFE4E6),
                    fg: task.priorityTextColor ?? const Color(0xFFEF4444),
                    icon: Icons.priority_high,
                  ),
              ],
            ),
            const SizedBox(height: 12),
            const Divider(height: 1, color: _DashboardScreenState._cardBorder),
            const SizedBox(height: 10),
            Row(
              children: [
                Icon(
                  Icons.schedule,
                  size: 16,
                  color: task.dueIsUrgent
                      ? const Color(0xFFEF4444)
                      : _DashboardScreenState._muted,
                ),
                const SizedBox(width: 6),
                Text(
                  task.dueText,
                  style: TextStyle(
                    color: task.dueIsUrgent
                        ? const Color(0xFFEF4444)
                        : _DashboardScreenState._muted,
                    fontWeight: FontWeight.w700,
                    fontSize: 12,
                  ),
                ),
                const Spacer(),
                Text(
                  task.status,
                  style: const TextStyle(
                    color: _DashboardScreenState._muted,
                    fontWeight: FontWeight.w700,
                    fontSize: 12,
                  ),
                ),
                const SizedBox(width: 6),
                const Icon(Icons.chevron_right, color: _DashboardScreenState._muted),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

class _Pill extends StatelessWidget {
  const _Pill({
    required this.text,
    required this.bg,
    required this.fg,
    this.icon,
  });

  final String text;
  final Color bg;
  final Color fg;
  final IconData? icon;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(999),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          if (icon != null) ...[
            Icon(icon, size: 14, color: fg),
            const SizedBox(width: 6),
          ],
          Text(
            text,
            style: TextStyle(
              color: fg,
              fontWeight: FontWeight.w800,
              fontSize: 11,
            ),
          ),
        ],
      ),
    );
  }
}

class _TaskItem {
  const _TaskItem({
    required this.title,
    required this.tag,
    required this.tagColor,
    required this.tagTextColor,
    required this.dueText,
    required this.dueIsUrgent,
    required this.status,
    required this.avatarText,
    this.priority,
    this.priorityColor,
    this.priorityTextColor,
  });

  final String title;
  final String tag;
  final Color tagColor;
  final Color tagTextColor;
  final String? priority;
  final Color? priorityColor;
  final Color? priorityTextColor;
  final String dueText;
  final bool dueIsUrgent;
  final String status;
  final String avatarText;
}
