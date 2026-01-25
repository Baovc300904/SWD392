import 'package:flutter/material.dart';

class NotificationsScreen extends StatelessWidget {
  const NotificationsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      child: ListView(
        padding: const EdgeInsets.all(16),
        children: const [
          Text('Notifications', style: TextStyle(fontSize: 22)),
          SizedBox(height: 12),
          _NotifTile(title: 'Thông báo 1', subtitle: 'Nội dung ngắn gọn.'),
          _NotifTile(title: 'Thông báo 2', subtitle: 'Nội dung ngắn gọn.'),
          _NotifTile(title: 'Thông báo 3', subtitle: 'Nội dung ngắn gọn.'),
        ],
      ),
    );
  }
}

class _NotifTile extends StatelessWidget {
  const _NotifTile({required this.title, required this.subtitle});

  final String title;
  final String subtitle;

  @override
  Widget build(BuildContext context) {
    return Card(
      child: ListTile(
        leading: const Icon(Icons.notifications_outlined),
        title: Text(title),
        subtitle: Text(subtitle),
      ),
    );
  }
}
