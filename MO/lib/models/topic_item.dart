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
      title: json['title']?.toString() ?? '(No title)',
      description: json['description']?.toString() ?? '',
      status: json['status']?.toString() ?? 'Unknown',
      createdAt: DateTime.tryParse(json['createdAt']?.toString() ?? ''),
    );
  }
}
