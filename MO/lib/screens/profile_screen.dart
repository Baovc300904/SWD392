import 'package:flutter/material.dart';

import '../models/auth_session.dart';
import '../screens/login_screen.dart';
import '../services/auth_service.dart';
import '../services/notification_service.dart';
import '../services/user_service.dart';
import '../state/app_session.dart';
import '../theme/app_settings.dart';

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  bool _loading = true;
  String? _error;
  Map<String, dynamic> _profile = <String, dynamic>{};

  @override
  void initState() {
    super.initState();
    _loadProfile();
  }

  Future<void> _loadProfile() async {
    setState(() {
      _loading = true;
      _error = null;
    });

    try {
      final data = await UserService.instance.getCurrentUser();
      if (!mounted) return;
      setState(() => _profile = data);
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _error = e.toString().replaceFirst('Exception: ', '');
      });
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  String get _displayName {
    final fromApi = _profile['fullName']?.toString();
    if (fromApi != null && fromApi.trim().isNotEmpty) return fromApi;
    return AppSession.instance.session?.fullName ?? 'Unknown User';
  }

  String get _email {
    final fromApi = _profile['email']?.toString();
    if (fromApi != null && fromApi.trim().isNotEmpty) return fromApi;
    return AppSession.instance.session?.email ?? '-';
  }

  String get _studentCode {
    final value = _profile['studentCode']?.toString();
    if (value == null || value.trim().isEmpty) return '-';
    return value;
  }

  String get _role {
    final fromApi = _profile['role']?.toString();
    final raw = fromApi ?? AppSession.instance.session?.role ?? 'student';
    return raw.toLowerCase();
  }

  String get _status {
    final value = _profile['status']?.toString();
    if (value != null && value.trim().isNotEmpty) return value;
    return (_profile['isOnline'] == true) ? 'Online' : 'Offline';
  }

  int get _userId {
    final id = int.tryParse(_profile['id']?.toString() ?? '');
    return id ?? (AppSession.instance.session?.userId ?? 0);
  }

  String get _avatarInitial {
    final name = _displayName.trim();
    if (name.isEmpty) return 'U';
    return name.substring(0, 1).toUpperCase();
  }

  void _toggleDarkMode(bool enabled) {
    AppSettings.themeMode.value = enabled ? ThemeMode.dark : ThemeMode.light;
  }

  Future<void> _editProfile() async {
    final userId = _userId;
    if (userId == 0) return;

    final fullNameController = TextEditingController(text: _displayName);
    final emailController = TextEditingController(text: _email);
    final studentCodeController = TextEditingController(
      text: _studentCode == '-' ? '' : _studentCode,
    );

    final shouldSave = await showDialog<bool>(
      context: context,
      builder: (context) {
        return AlertDialog(
          title: const Text('Edit Profile'),
          content: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                TextField(
                  controller: fullNameController,
                  decoration: const InputDecoration(labelText: 'Full Name'),
                ),
                const SizedBox(height: 8),
                TextField(
                  controller: emailController,
                  decoration: const InputDecoration(labelText: 'Email'),
                ),
                const SizedBox(height: 8),
                TextField(
                  controller: studentCodeController,
                  decoration: const InputDecoration(labelText: 'Student Code'),
                ),
              ],
            ),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(context).pop(false),
              child: const Text('Cancel'),
            ),
            FilledButton(
              onPressed: () => Navigator.of(context).pop(true),
              child: const Text('Save'),
            ),
          ],
        );
      },
    );

    if (shouldSave != true) return;

    try {
      await UserService.instance.updateUser(userId, <String, dynamic>{
        'fullName': fullNameController.text.trim(),
        'email': emailController.text.trim(),
        'studentCode': studentCodeController.text.trim(),
      });

      final session = AppSession.instance.session;
      if (session != null) {
        await AppSession.instance.setSession(
          AuthSession(
            accessToken: session.accessToken,
            refreshToken: session.refreshToken,
            userId: session.userId,
            fullName: fullNameController.text.trim(),
            email: emailController.text.trim(),
            role: session.role,
          ),
        );
      }

      await _loadProfile();
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Profile updated successfully.')),
      );
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('$e')));
    }
  }

  Future<void> _changePasswordOtpFlow() async {
    final emailController = TextEditingController(text: _email == '-' ? '' : _email);
    final otpController = TextEditingController();
    final passwordController = TextEditingController();

    final sendOtp = await showDialog<bool>(
      context: context,
      builder: (context) {
        return AlertDialog(
          title: const Text('Change Password'),
          content: TextField(
            controller: emailController,
            decoration: const InputDecoration(labelText: 'Email'),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(context).pop(false),
              child: const Text('Cancel'),
            ),
            FilledButton(
              onPressed: () => Navigator.of(context).pop(true),
              child: const Text('Send OTP'),
            ),
          ],
        );
      },
    );

    if (sendOtp != true) return;

    try {
      await AuthService.instance.forgotPassword(emailController.text.trim());
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('OTP sent. Check your email.')),
      );
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('$e')));
      return;
    }

    if (!mounted) return;

    final shouldReset = await showDialog<bool>(
      context: context,
      builder: (context) {
        return AlertDialog(
          title: const Text('Enter OTP'),
          content: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                TextField(
                  controller: otpController,
                  decoration: const InputDecoration(labelText: 'OTP'),
                ),
                const SizedBox(height: 8),
                TextField(
                  controller: passwordController,
                  obscureText: true,
                  decoration: const InputDecoration(labelText: 'New Password'),
                ),
              ],
            ),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(context).pop(false),
              child: const Text('Cancel'),
            ),
            FilledButton(
              onPressed: () => Navigator.of(context).pop(true),
              child: const Text('Update Password'),
            ),
          ],
        );
      },
    );

    if (shouldReset != true) return;

    try {
      await AuthService.instance.resetPassword(
        email: emailController.text.trim(),
        otp: otpController.text.trim(),
        newPassword: passwordController.text.trim(),
      );
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Password updated successfully.')),
      );
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('$e')));
    }
  }

  Future<void> _logout() async {
    final ok = await showDialog<bool>(
      context: context,
      builder: (context) {
        return AlertDialog(
          title: const Text('Log Out'),
          content: const Text('Bạn có chắc muốn đăng xuất không?'),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(context).pop(false),
              child: const Text('Cancel'),
            ),
            FilledButton(
              onPressed: () => Navigator.of(context).pop(true),
              child: const Text('Log Out'),
            ),
          ],
        );
      },
    );

    if (ok != true || !mounted) return;

    final refreshToken = AppSession.instance.session?.refreshToken;
    if (refreshToken != null && refreshToken.isNotEmpty) {
      try {
        await AuthService.instance.logout(refreshToken);
      } catch (_) {
        // Keep local logout resilient when network logout fails.
      }
    }
    await NotificationService.instance.onLogout();
    await AppSession.instance.clear();
    if (!mounted) return;

    await Navigator.of(context).pushAndRemoveUntil(
      MaterialPageRoute(builder: (_) => const LoginScreen()),
      (route) => false,
    );
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;
    final isDark = AppSettings.themeMode.value == ThemeMode.dark;
    final roleDisplay = _role.toUpperCase();

    return Scaffold(
      body: SafeArea(
        child: _loading
            ? const Center(child: CircularProgressIndicator())
            : ListView(
          padding: const EdgeInsets.fromLTRB(16, 18, 16, 16),
          children: [
            Row(
              children: [
                const Spacer(),
                IconButton(
                  onPressed: _loadProfile,
                  icon: const Icon(Icons.refresh),
                  tooltip: 'Refresh profile',
                ),
              ],
            ),
            if (_error != null)
              Padding(
                padding: const EdgeInsets.only(bottom: 10),
                child: Text(
                  _error!,
                  style: const TextStyle(color: Colors.red),
                  textAlign: TextAlign.center,
                ),
              ),
            Center(
              child: Stack(
                clipBehavior: Clip.none,
                children: [
                  Container(
                    padding: const EdgeInsets.all(4),
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      border: Border.fromBorderSide(
                        BorderSide(color: colorScheme.primary, width: 2),
                      ),
                    ),
                    child: CircleAvatar(
                      radius: 36,
                      backgroundColor: colorScheme.primaryContainer,
                      child: Text(
                        _avatarInitial,
                        style: TextStyle(
                          fontSize: 28,
                          fontWeight: FontWeight.w900,
                          color: colorScheme.onPrimaryContainer,
                        ),
                      ),
                    ),
                  ),
                  const Positioned(
                    right: 6,
                    bottom: 6,
                    child: DecoratedBox(
                      decoration: BoxDecoration(
                        color: Color(0xFF22C55E),
                        shape: BoxShape.circle,
                      ),
                      child: SizedBox(width: 12, height: 12),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 12),
            Center(
              child: Text(
                _displayName,
                style: theme.textTheme.titleLarge?.copyWith(
                  fontWeight: FontWeight.w900,
                ),
              ),
            ),
            const SizedBox(height: 6),
            Center(
              child: Text(
                'User ID: $_userId  |  Role: $roleDisplay',
                style: TextStyle(
                  color: colorScheme.onSurfaceVariant,
                  fontWeight: FontWeight.w600,
                  fontSize: 12,
                ),
              ),
            ),
            const SizedBox(height: 4),
            Center(
              child: Text(
                _email,
                style: TextStyle(
                  color: colorScheme.onSurfaceVariant,
                  fontWeight: FontWeight.w600,
                  fontSize: 12,
                ),
              ),
            ),
            const SizedBox(height: 4),
            Center(
              child: Text(
                'Student Code: $_studentCode  |  Status: $_status',
                style: TextStyle(
                  color: colorScheme.onSurfaceVariant,
                  fontWeight: FontWeight.w600,
                  fontSize: 12,
                ),
              ),
            ),
            const SizedBox(height: 18),

            const _SectionLabel('PREFERENCES'),
            const SizedBox(height: 8),
            _GroupCard(
              children: [
                _SettingsTile(
                  icon: Icons.edit_outlined,
                  title: 'Edit Profile',
                  subtitle: 'Update name, email, and student code',
                  onTap: _editProfile,
                ),
                const _GroupDivider(),
                _SettingsTile(
                  icon: Icons.dark_mode_outlined,
                  title: 'Dark Mode',
                  subtitle: 'Toggle dark theme',
                  trailing: Switch(
                    value: isDark,
                    onChanged: (value) {
                      setState(() {
                        _toggleDarkMode(value);
                      });
                    },
                  ),
                ),
                const _GroupDivider(),
                _SettingsTile(
                  icon: Icons.badge_outlined,
                  title: 'Account Role',
                  subtitle: roleDisplay,
                ),
              ],
            ),
            const SizedBox(height: 16),

            const _SectionLabel('SECURITY'),
            const SizedBox(height: 8),
            _GroupCard(
              children: [
                _SettingsTile(
                  icon: Icons.lock_outline,
                  title: 'Change Password (OTP)',
                  subtitle: 'Send OTP and set a new password',
                  onTap: _changePasswordOtpFlow,
                ),
                const _GroupDivider(),
                _SettingsTile(
                  icon: Icons.privacy_tip_outlined,
                  title: 'Privacy',
                  subtitle: 'Manage privacy settings',
                  onTap: () {},
                ),
              ],
            ),
            const SizedBox(height: 16),

            const _SectionLabel('SUPPORT'),
            const SizedBox(height: 8),
            _GroupCard(
              children: [
                _SettingsTile(
                  icon: Icons.admin_panel_settings_outlined,
                  title: 'Admin Account',
                  subtitle: 'Manager-level access enabled',
                ),
                const _GroupDivider(),
                _SettingsTile(
                  icon: Icons.settings_outlined,
                  title: 'Settings',
                  subtitle: 'App preferences',
                ),
              ],
            ),

            const SizedBox(height: 16),
            SizedBox(
              height: 52,
              child: OutlinedButton.icon(
                style: OutlinedButton.styleFrom(
                  foregroundColor: colorScheme.error,
                  side: BorderSide(color: colorScheme.error),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(14),
                  ),
                ),
                onPressed: _logout,
                icon: const Icon(Icons.logout_outlined),
                label: const Text(
                  'Log Out',
                  style: TextStyle(fontWeight: FontWeight.w800),
                ),
              ),
            ),
            const SizedBox(height: 14),
            Center(
              child: Text(
                'SWP Hub v1.0.0',
                style: theme.textTheme.bodySmall?.copyWith(
                  color: colorScheme.onSurfaceVariant,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _SectionLabel extends StatelessWidget {
  const _SectionLabel(this.text);
  final String text;

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;
    return Text(
      text,
      style: TextStyle(
        color: colorScheme.onSurfaceVariant,
        fontWeight: FontWeight.w900,
        fontSize: 11,
        letterSpacing: 0.8,
      ),
    );
  }
}

class _GroupCard extends StatelessWidget {
  const _GroupCard({required this.children});

  final List<Widget> children;

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;
    return Container(
      decoration: BoxDecoration(
        color: colorScheme.surface,
        borderRadius: BorderRadius.circular(16),
        border: Border.fromBorderSide(
          BorderSide(color: colorScheme.outlineVariant),
        ),
      ),
      child: Column(children: children),
    );
  }
}

class _GroupDivider extends StatelessWidget {
  const _GroupDivider();

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;
    return Divider(
      height: 1,
      thickness: 1,
      color: colorScheme.outlineVariant,
    );
  }
}

class _SettingsTile extends StatelessWidget {
  const _SettingsTile({
    required this.icon,
    required this.title,
    required this.subtitle,
    this.trailing,
    this.onTap,
  });

  final IconData icon;
  final String title;
  final String subtitle;
  final Widget? trailing;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;
    return ListTile(
      onTap: onTap,
      leading: Container(
        width: 42,
        height: 42,
        decoration: BoxDecoration(
          color: colorScheme.primaryContainer.withValues(alpha: 0.55),
          borderRadius: BorderRadius.circular(12),
        ),
        child: Icon(icon, color: colorScheme.onPrimaryContainer),
      ),
      title: Text(
        title,
        style: TextStyle(fontWeight: FontWeight.w800, fontSize: 14, color: colorScheme.onSurface),
      ),
      subtitle: Text(
        subtitle,
        style: TextStyle(
          color: colorScheme.onSurfaceVariant,
          fontWeight: FontWeight.w600,
          fontSize: 12,
        ),
      ),
      trailing: trailing ?? Icon(Icons.chevron_right, color: colorScheme.onSurfaceVariant),
    );
  }
}
