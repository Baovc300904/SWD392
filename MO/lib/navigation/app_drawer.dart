import 'package:flutter/material.dart';

class AppDrawer extends StatelessWidget {
  const AppDrawer({super.key});

  static const _bg = Color(0xFF0B1016);
  static const _panel = Color(0xFF0F1620);
  static const _muted = Color(0xFF94A3B8);
  static const _divider = Color(0xFF17212B);
  static const _accent = Color(0xFFE67E22);

  @override
  Widget build(BuildContext context) {
    return Drawer(
      backgroundColor: _bg,
      child: SafeArea(
        child: Column(
          children: [
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 10, 12, 10),
              child: Row(
                children: [
                  const Expanded(
                    child: Text(
                      'SWP Hub',
                      style: TextStyle(
                        color: Colors.white,
                        fontWeight: FontWeight.w800,
                        fontSize: 16,
                      ),
                    ),
                  ),
                  IconButton(
                    onPressed: () => Navigator.of(context).maybePop(),
                    icon: const Icon(Icons.close, color: _muted),
                  ),
                ],
              ),
            ),
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 0, 16, 12),
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                decoration: BoxDecoration(
                  color: _panel,
                  borderRadius: BorderRadius.circular(14),
                  border: const Border.fromBorderSide(
                    BorderSide(color: _divider),
                  ),
                ),
                child: Row(
                  children: [
                    Container(
                      width: 34,
                      height: 34,
                      decoration: BoxDecoration(
                        color: _accent,
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: const Center(
                        child: Text(
                          'S4',
                          style: TextStyle(
                            color: Colors.white,
                            fontWeight: FontWeight.w800,
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(width: 10),
                    const Expanded(
                      child: Text(
                        'SWP Group 04',
                        style: TextStyle(
                          color: Colors.white,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                    ),
                    const Icon(Icons.keyboard_arrow_down, color: _muted),
                  ],
                ),
              ),
            ),
            const _SectionTitle('CHANNELS'),
            Expanded(
              child: ListView(
                padding: EdgeInsets.zero,
                children: const [
                  _ChannelTile(
                    name: 'general-chat',
                    selected: true,
                    badge: null,
                  ),
                  _ChannelTile(name: 'project-tasks', badge: 3),
                  _ChannelTile(name: 'ai-mentor-bot'),
                  _ChannelTile(name: 'resources-files', badge: 1),
                  _ChannelTile(name: 'random'),
                  SizedBox(height: 14),
                  _SectionTitle('DIRECT MESSAGES'),
                  _DmTile(
                    name: 'Dr. Tran Minh',
                    role: 'Lecturer',
                    online: true,
                    badge: null,
                  ),
                  _DmTile(
                    name: 'Nguyen Van A',
                    role: 'Team Lead',
                    online: true,
                    badge: 2,
                  ),
                  _DmTile(
                    name: 'Tran Thi B',
                    role: 'Developer',
                    online: false,
                    badge: null,
                  ),
                  _DmTile(
                    name: 'Le Van C',
                    role: 'Developer',
                    online: true,
                    badge: null,
                  ),
                  _DmTile(
                    name: 'Pham Thi D',
                    role: 'Designer',
                    online: true,
                    badge: 1,
                  ),
                  SizedBox(height: 80),
                ],
              ),
            ),
            Container(
              decoration: const BoxDecoration(
                border: Border(top: BorderSide(color: _divider)),
              ),
              padding: const EdgeInsets.fromLTRB(16, 10, 16, 12),
              child: Row(
                children: [
                  const _Avatar(name: 'Nguyen Van A'),
                  const SizedBox(width: 10),
                  const Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Nguyen Van A',
                          style: TextStyle(
                            color: Colors.white,
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                        SizedBox(height: 2),
                        Text(
                          'SE161234',
                          style: TextStyle(color: _muted, fontSize: 12),
                        ),
                      ],
                    ),
                  ),
                  Container(
                    width: 10,
                    height: 10,
                    decoration: const BoxDecoration(
                      color: Color(0xFF22C55E),
                      shape: BoxShape.circle,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _SectionTitle extends StatelessWidget {
  const _SectionTitle(this.text);

  final String text;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 10, 16, 8),
      child: Text(
        text,
        style: const TextStyle(
          color: AppDrawer._muted,
          fontSize: 11,
          fontWeight: FontWeight.w800,
          letterSpacing: 0.8,
        ),
      ),
    );
  }
}

class _ChannelTile extends StatelessWidget {
  const _ChannelTile({
    required this.name,
    this.badge,
    this.selected = false,
  });

  final String name;
  final int? badge;
  final bool selected;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
      child: Container(
        decoration: BoxDecoration(
          color: selected ? AppDrawer._accent : Colors.transparent,
          borderRadius: BorderRadius.circular(12),
        ),
        child: ListTile(
          dense: true,
          contentPadding: const EdgeInsets.symmetric(horizontal: 12),
          leading: Icon(
            Icons.tag,
            size: 18,
            color: selected ? Colors.white : AppDrawer._muted,
          ),
          title: Text(
            name,
            style: TextStyle(
              color: selected ? Colors.white : Colors.white,
              fontWeight: selected ? FontWeight.w800 : FontWeight.w600,
              fontSize: 13,
            ),
          ),
          trailing: badge == null
              ? null
              : _Badge(
                  value: badge!,
                  bg: selected ? Colors.white : AppDrawer._accent,
                  fg: selected ? AppDrawer._accent : Colors.white,
                ),
          onTap: () {},
        ),
      ),
    );
  }
}

class _DmTile extends StatelessWidget {
  const _DmTile({
    required this.name,
    required this.role,
    required this.online,
    this.badge,
  });

  final String name;
  final String role;
  final bool online;
  final int? badge;

  @override
  Widget build(BuildContext context) {
    return ListTile(
      contentPadding: const EdgeInsets.symmetric(horizontal: 16),
      leading: Stack(
        clipBehavior: Clip.none,
        children: [
          _Avatar(name: name),
          Positioned(
            right: -2,
            bottom: -2,
            child: Container(
              width: 10,
              height: 10,
              decoration: BoxDecoration(
                color: online ? const Color(0xFF22C55E) : const Color(0xFF64748B),
                shape: BoxShape.circle,
                border: Border.all(color: AppDrawer._bg, width: 2),
              ),
            ),
          ),
        ],
      ),
      title: Text(
        name,
        style: const TextStyle(
          color: Colors.white,
          fontWeight: FontWeight.w700,
          fontSize: 13,
        ),
      ),
      subtitle: Text(
        role,
        style: const TextStyle(color: AppDrawer._muted, fontSize: 12),
      ),
      trailing: badge == null ? null : _Badge(value: badge!),
      onTap: () {},
    );
  }
}

class _Badge extends StatelessWidget {
  const _Badge({
    required this.value,
    this.bg = AppDrawer._accent,
    this.fg = Colors.white,
  });

  final int value;
  final Color bg;
  final Color fg;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(999),
      ),
      child: Text(
        '$value',
        style: TextStyle(color: fg, fontWeight: FontWeight.w800, fontSize: 12),
      ),
    );
  }
}

class _Avatar extends StatelessWidget {
  const _Avatar({required this.name});

  final String name;

  @override
  Widget build(BuildContext context) {
    final letter = name.trim().isEmpty ? '?' : name.trim()[0].toUpperCase();
    final color = Colors.primaries[name.hashCode % Colors.primaries.length];

    return CircleAvatar(
      radius: 18,
      backgroundColor: color.shade200,
      child: Text(
        letter,
        style: const TextStyle(fontWeight: FontWeight.w800),
      ),
    );
  }
}
