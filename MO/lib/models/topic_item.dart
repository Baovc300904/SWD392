import 'dart:convert';

class TopicItem {
  const TopicItem({
    required this.id,
    required this.title,
    required this.description,
    required this.status,
    required this.createdAt,
  });

  final int id;
  final String title;
  final String description;
  final String status;
  final DateTime? createdAt;

  factory TopicItem.fromJson(Map<String, dynamic> json) {
    return TopicItem(
      id: int.tryParse(json['id']?.toString() ?? '') ?? 0,
      title: _repairMojibake(json['title']?.toString() ?? '(No title)'),
      description: _repairMojibake(json['description']?.toString() ?? ''),
      status: json['status']?.toString() ?? 'Unknown',
      createdAt: DateTime.tryParse(json['createdAt']?.toString() ?? ''),
    );
  }

  static String _repairMojibake(String value) {
    if (value.isEmpty) return value;

    // Common signs when UTF-8 bytes were decoded as Latin-1/Windows-1252.
    const suspiciousMarkers = ['Ã', 'Â', 'Ä', 'áº', 'á»', 'Æ'];
    final looksBroken = suspiciousMarkers.any(value.contains);
    if (!looksBroken) return value;

    try {
      return utf8.decode(latin1.encode(value));
    } catch (_) {
      return value;
    }
  }
}
