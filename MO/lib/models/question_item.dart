class QuestionItem {
  const QuestionItem({
    required this.id,
    required this.title,
    required this.status,
    required this.content,
    required this.askerName,
    required this.isPublic,
    required this.createdAt,
    required this.answerCount,
    required this.answers,
  });

  final int id;
  final String title;
  final String status;
  final String content;
  final String askerName;
  final bool isPublic;
  final DateTime? createdAt;
  final int answerCount;
  final List<Map<String, String>> answers;

  factory QuestionItem.fromJson(Map<String, dynamic> json) {
    final answerData = json['answers'] as List<dynamic>? ?? <dynamic>[];
    final parsedAnswers = answerData
        .whereType<Map<String, dynamic>>()
        .map((item) {
          final answerer = item['answerer'] as Map<String, dynamic>? ?? <String, dynamic>{};
          return <String, String>{
            'content': item['content']?.toString() ?? '',
            'answerer': answerer['fullName']?.toString() ?? 'Lecturer',
            'visibility': (item['isPublic'] == true) ? 'Public' : 'Private',
          };
        })
        .toList(growable: false);

    final asker = json['asker'] as Map<String, dynamic>? ?? <String, dynamic>{};

    return QuestionItem(
      id: int.tryParse(json['id']?.toString() ?? '') ?? 0,
      title: json['title']?.toString() ?? '(No title)',
      status: json['status']?.toString() ?? 'Unknown',
      content: json['content']?.toString() ?? '',
      askerName: asker['fullName']?.toString() ?? 'Student',
      isPublic: true,
      createdAt: DateTime.tryParse(json['createdAt']?.toString() ?? ''),
      answerCount: parsedAnswers.length,
      answers: parsedAnswers,
    );
  }
}
