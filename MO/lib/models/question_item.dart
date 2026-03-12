class QuestionItem {
  const QuestionItem({
    required this.id,
    required this.title,
    required this.status,
    required this.content,
  });

  final int id;
  final String title;
  final String status;
  final String content;

  factory QuestionItem.fromJson(Map<String, dynamic> json) {
    return QuestionItem(
      id: int.tryParse(json['id']?.toString() ?? '') ?? 0,
      title: json['title']?.toString() ?? '(No title)',
      status: json['status']?.toString() ?? 'Unknown',
      content: json['content']?.toString() ?? '',
    );
  }
}
