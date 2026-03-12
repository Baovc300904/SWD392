class AuthSession {
  const AuthSession({
    required this.accessToken,
    required this.refreshToken,
    required this.userId,
    required this.fullName,
    required this.email,
    required this.role,
  });

  final String accessToken;
  final String refreshToken;
  final int userId;
  final String fullName;
  final String email;
  final String role;

  String get normalizedRole {
    final value = role.toLowerCase().trim();
    if (value == 'admin') return 'manager';
    if (value == 'user') return 'student';
    return value;
  }

  factory AuthSession.fromApi(Map<String, dynamic> json) {
    final data = (json['data'] as Map<String, dynamic>? ?? <String, dynamic>{});
    final user = (data['user'] as Map<String, dynamic>? ?? <String, dynamic>{});

    return AuthSession(
      accessToken: data['accessToken']?.toString() ?? '',
      refreshToken: data['refreshToken']?.toString() ?? '',
      userId: int.tryParse(user['id']?.toString() ?? '') ?? 0,
      fullName: user['fullName']?.toString() ?? 'Unknown',
      email: user['email']?.toString() ?? '',
      role: user['role']?.toString() ?? '',
    );
  }

  Map<String, dynamic> toJson() {
    return <String, dynamic>{
      'accessToken': accessToken,
      'refreshToken': refreshToken,
      'userId': userId,
      'fullName': fullName,
      'email': email,
      'role': role,
    };
  }

  factory AuthSession.fromJson(Map<String, dynamic> json) {
    return AuthSession(
      accessToken: json['accessToken']?.toString() ?? '',
      refreshToken: json['refreshToken']?.toString() ?? '',
      userId: int.tryParse(json['userId']?.toString() ?? '') ?? 0,
      fullName: json['fullName']?.toString() ?? '',
      email: json['email']?.toString() ?? '',
      role: json['role']?.toString() ?? '',
    );
  }
}
