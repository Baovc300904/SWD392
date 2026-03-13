import 'package:flutter/material.dart';

import 'forgot_password_screen.dart';
import 'home_screen.dart';
import 'register_screen.dart';
import '../navigation/root_scaffold.dart';
import '../services/auth_service.dart';
import '../services/notification_service.dart';
import '../state/app_session.dart';

enum _LoginRole { student, lecturer }

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _formKey = GlobalKey<FormState>();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();

  bool _showPassword = false;
  bool _rememberMe = false;
  bool _isSubmitting = false;
  String? _error;
  _LoginRole _loginRole = _LoginRole.student;

  static const _charcoal = Color(0xFF1E2028);
  static const _border = Color(0xFF2E3240);
  static const _bgRight = Color(0xFF13151A);
  static const _bgLeft = Color(0xFF0E1016);
  static const _accent = Color(0xFFF27125);

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    FocusScope.of(context).unfocus();
    if (!(_formKey.currentState?.validate() ?? false)) return;

    setState(() {
      _isSubmitting = true;
      _error = null;
    });

    try {
      final session = await AuthService.instance.login(
        email: _emailController.text.trim(),
        password: _passwordController.text,
      );

      final roleLower = session.normalizedRole;
      if (_loginRole == _LoginRole.student && roleLower != 'student') {
        throw Exception(
          'This account is not a student account. Please use Lecturer Portal.',
        );
      }
      if (_loginRole == _LoginRole.lecturer && roleLower == 'student') {
        throw Exception(
          'Student accounts must use Student Portal.',
        );
      }

      await AppSession.instance.setSession(session);
      await NotificationService.instance.onLogin();

      if (!mounted) return;
      await Navigator.of(context).pushReplacement(
        MaterialPageRoute(builder: (_) => const RootScaffold()),
      );
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _error = e.toString().replaceFirst('Exception: ', '');
      });
    } finally {
      if (mounted) {
        setState(() {
          _isSubmitting = false;
        });
      }
    }
  }

  InputDecoration _inputDecoration({
    required String label,
    required String hint,
    required IconData icon,
    Widget? suffix,
  }) {
    return InputDecoration(
      labelText: label,
      labelStyle: const TextStyle(
        color: Color(0xFF6B7280),
        fontSize: 11,
        fontWeight: FontWeight.w700,
        letterSpacing: 1.0,
      ),
      hintText: hint,
      hintStyle: const TextStyle(color: Color(0xFF6B7280)),
      prefixIcon: Icon(icon, color: const Color(0xFF4B5563), size: 18),
      suffixIcon: suffix,
      filled: true,
      fillColor: _charcoal,
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: const BorderSide(color: _border),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: const BorderSide(color: _accent),
      ),
      errorBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: BorderSide(color: Colors.red.shade400),
      ),
      focusedErrorBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: BorderSide(color: Colors.red.shade400),
      ),
    );
  }

  Widget _leftPanel() {
    return Container(
      color: _bgLeft,
      child: Stack(
        children: [
          Positioned(
            top: -140,
            left: -140,
            child: Container(
              width: 520,
              height: 520,
              decoration: const BoxDecoration(
                shape: BoxShape.circle,
                gradient: RadialGradient(
                  colors: [Color(0x55F27125), Colors.transparent],
                ),
              ),
            ),
          ),
          Positioned(
            top: 220,
            right: -120,
            child: Container(
              width: 420,
              height: 420,
              decoration: const BoxDecoration(
                shape: BoxShape.circle,
                gradient: RadialGradient(
                  colors: [Color(0x338B5CF6), Colors.transparent],
                ),
              ),
            ),
          ),
          Padding(
            padding: const EdgeInsets.fromLTRB(36, 36, 36, 28),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Container(
                      width: 40,
                      height: 40,
                      decoration: BoxDecoration(
                        borderRadius: BorderRadius.circular(14),
                        gradient: const LinearGradient(
                          colors: [Color(0xFFF27125), Color(0xFFD96420)],
                        ),
                      ),
                      child: const Center(
                        child: Text(
                          'S',
                          style: TextStyle(
                            color: Colors.white,
                            fontWeight: FontWeight.w800,
                            fontSize: 18,
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(width: 10),
                    const Text(
                      'SWP Hub',
                      style: TextStyle(
                        color: Colors.white,
                        fontWeight: FontWeight.w800,
                        fontSize: 20,
                      ),
                    ),
                    const SizedBox(width: 8),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                      decoration: BoxDecoration(
                        color: const Color(0x22F27125),
                        borderRadius: BorderRadius.circular(999),
                        border: Border.all(color: const Color(0x55F27125)),
                      ),
                      child: const Text(
                        'BETA',
                        style: TextStyle(
                          color: _accent,
                          fontSize: 9,
                          fontWeight: FontWeight.w800,
                          letterSpacing: 1.1,
                        ),
                      ),
                    ),
                  ],
                ),
                const Spacer(),
                const Text(
                  'Trusted by FPT Students',
                  style: TextStyle(
                    color: _accent,
                    fontSize: 10,
                    fontWeight: FontWeight.w800,
                    letterSpacing: 2.2,
                  ),
                ),
                const SizedBox(height: 14),
                const Text(
                  'The platform built\nfor your project.',
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 42,
                    fontWeight: FontWeight.w900,
                    height: 1.1,
                  ),
                ),
                const SizedBox(height: 8),
                const Text(
                  'Everything you need to manage topics, form teams, and collaborate in one AI-powered workspace.',
                  style: TextStyle(color: Color(0xFF9CA3AF), fontSize: 14, height: 1.5),
                ),
                const SizedBox(height: 22),
                _featureTile('🤖', 'AI Mentor Bot', 'Instant answers from your syllabus'),
                const SizedBox(height: 8),
                _featureTile('👥', 'Smart Group Matching', 'Find teammates by skill and interest'),
                const SizedBox(height: 8),
                _featureTile('✅', 'Topic Management', 'Submit, track and get approved fast'),
                const SizedBox(height: 18),
                const Divider(color: Color(0x33FFFFFF)),
                const SizedBox(height: 14),
                const Row(
                  children: [
                    Expanded(child: _StatTile(val: '2,400+', label: 'Students')),
                    SizedBox(width: 8),
                    Expanded(child: _StatTile(val: '480+', label: 'Groups')),
                    SizedBox(width: 8),
                    Expanded(child: _StatTile(val: '8k', label: 'AI / day')),
                  ],
                ),
                const SizedBox(height: 14),
                Container(
                  padding: const EdgeInsets.all(14),
                  decoration: BoxDecoration(
                    color: const Color(0x0DFFFFFF),
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: const Color(0x1AFFFFFF)),
                  ),
                  child: const Text(
                    '"SWP Hub completely transformed how our team collaborated. The AI assistant saved us countless hours during sprint weeks!"',
                    style: TextStyle(color: Color(0xFFD1D5DB), fontSize: 12, height: 1.5),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _featureTile(String icon, String title, String desc) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 11),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(14),
        color: const Color(0x0DFFFFFF),
        border: Border.all(color: const Color(0x1AFFFFFF)),
      ),
      child: Row(
        children: [
          Container(
            width: 34,
            height: 34,
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(10),
              color: const Color(0x22F27125),
              border: Border.all(color: const Color(0x55F27125)),
            ),
            child: Center(child: Text(icon)),
          ),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w700, fontSize: 13),
                ),
                const SizedBox(height: 1),
                Text(
                  desc,
                  style: const TextStyle(color: Color(0xFF6B7280), fontSize: 11),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _roleSwitch() {
    final isStudent = _loginRole == _LoginRole.student;
    return Container(
      height: 50,
      padding: const EdgeInsets.all(4),
      decoration: BoxDecoration(
        color: const Color(0x0DFFFFFF),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0x1AFFFFFF)),
      ),
      child: Stack(
        children: [
          AnimatedAlign(
            duration: const Duration(milliseconds: 260),
            alignment: isStudent ? Alignment.centerLeft : Alignment.centerRight,
            child: FractionallySizedBox(
              widthFactor: 0.5,
              child: Container(
                margin: const EdgeInsets.symmetric(horizontal: 2),
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(12),
                  gradient: const LinearGradient(
                    colors: [Color(0x44F27125), Color(0x22F27125)],
                  ),
                  border: Border.all(color: const Color(0x66F27125)),
                ),
              ),
            ),
          ),
          Row(
            children: [
              Expanded(
                child: TextButton.icon(
                  onPressed: () => setState(() => _loginRole = _LoginRole.student),
                  icon: Icon(
                    Icons.shield_outlined,
                    size: 16,
                    color: isStudent ? _accent : const Color(0xFF6B7280),
                  ),
                  label: Text(
                    'Student',
                    style: TextStyle(
                      color: isStudent ? _accent : const Color(0xFF6B7280),
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                ),
              ),
              Expanded(
                child: TextButton.icon(
                  onPressed: () => setState(() => _loginRole = _LoginRole.lecturer),
                  icon: Icon(
                    Icons.groups_outlined,
                    size: 16,
                    color: !isStudent ? _accent : const Color(0xFF6B7280),
                  ),
                  label: Text(
                    'Lecturer / Admin',
                    style: TextStyle(
                      color: !isStudent ? _accent : const Color(0xFF6B7280),
                      fontWeight: FontWeight.w700,
                      fontSize: 12,
                    ),
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _googleIcon() {
    return const Icon(Icons.g_mobiledata, size: 26, color: Color(0xFFEA4335));
  }

  Widget _formPanel() {
    final isLecturer = _loginRole == _LoginRole.lecturer;

    return Container(
      color: _bgRight,
      child: Center(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 18),
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 430),
            child: Form(
              key: _formKey,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  TextButton.icon(
                    onPressed: () {
                      final nav = Navigator.of(context);
                      if (nav.canPop()) {
                        nav.pop();
                        return;
                      }
                      nav.pushReplacement(
                        MaterialPageRoute(builder: (_) => const HomeScreen()),
                      );
                    },
                    style: TextButton.styleFrom(alignment: Alignment.centerLeft),
                    icon: const Icon(Icons.arrow_back, color: Color(0xFF6B7280)),
                    label: const Text(
                      'Back to Home',
                      style: TextStyle(color: Color(0xFF6B7280)),
                    ),
                  ),
                  const SizedBox(height: 18),
                  _roleSwitch(),
                  const SizedBox(height: 24),
                  Text(
                    isLecturer ? 'Lecturer Portal' : 'Student Portal',
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 34,
                      fontWeight: FontWeight.w900,
                      height: 1.05,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    isLecturer
                        ? 'Sign in with your lecturer or admin credentials'
                        : 'Sign in to continue to your workspace',
                    style: const TextStyle(color: Color(0xFF6B7280), fontSize: 14),
                  ),
                  const SizedBox(height: 20),
                  if (_error != null)
                    Container(
                      margin: const EdgeInsets.only(bottom: 14),
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        borderRadius: BorderRadius.circular(12),
                        color: const Color(0x17EF4444),
                        border: Border.all(color: const Color(0x55EF4444)),
                      ),
                      child: Text(
                        _error!,
                        style: const TextStyle(color: Color(0xFFF87171), fontSize: 13),
                      ),
                    ),
                  TextFormField(
                    controller: _emailController,
                    style: const TextStyle(color: Colors.white),
                    keyboardType: TextInputType.emailAddress,
                    decoration: _inputDecoration(
                      label: 'EMAIL ADDRESS',
                      hint: isLecturer ? 'lecturer@fpt.edu.vn' : 'student@fpt.edu.vn',
                      icon: Icons.mail_outline,
                    ),
                    validator: (value) {
                      final text = (value ?? '').trim();
                      if (text.isEmpty) return 'Please enter your email.';
                      if (!text.contains('@')) return 'Invalid email.';
                      return null;
                    },
                  ),
                  const SizedBox(height: 12),
                  TextFormField(
                    controller: _passwordController,
                    style: const TextStyle(color: Colors.white),
                    obscureText: !_showPassword,
                    decoration: _inputDecoration(
                      label: 'PASSWORD',
                      hint: 'Enter your password',
                      icon: Icons.lock_outline,
                      suffix: IconButton(
                        onPressed: () => setState(() => _showPassword = !_showPassword),
                        icon: Icon(
                          _showPassword ? Icons.visibility_off_outlined : Icons.visibility_outlined,
                          color: const Color(0xFF6B7280),
                        ),
                      ),
                    ),
                    validator: (value) {
                      if ((value ?? '').isEmpty) return 'Please enter your password.';
                      return null;
                    },
                    onFieldSubmitted: (_) => _submit(),
                  ),
                  const SizedBox(height: 12),
                  Row(
                    children: [
                      InkWell(
                        onTap: () => setState(() => _rememberMe = !_rememberMe),
                        child: Container(
                          width: 18,
                          height: 18,
                          decoration: BoxDecoration(
                            color: _rememberMe ? _accent : _charcoal,
                            borderRadius: BorderRadius.circular(4),
                            border: Border.all(color: _rememberMe ? _accent : _border),
                          ),
                          child: _rememberMe
                              ? const Icon(Icons.check, size: 13, color: Colors.white)
                              : null,
                        ),
                      ),
                      const SizedBox(width: 8),
                      const Text(
                        'Remember me',
                        style: TextStyle(color: Color(0xFF6B7280), fontSize: 13),
                      ),
                      const Spacer(),
                      TextButton(
                        onPressed: () async {
                          await Navigator.of(context).push(
                            MaterialPageRoute(builder: (_) => const ForgotPasswordScreen()),
                          );
                        },
                        child: const Text(
                          'Forgot Password?',
                          style: TextStyle(color: _accent, fontWeight: FontWeight.w700),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  SizedBox(
                    height: 52,
                    child: ElevatedButton(
                      onPressed: _isSubmitting ? null : _submit,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: _accent,
                        foregroundColor: Colors.white,
                        disabledBackgroundColor: const Color(0x99F27125),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      ),
                      child: _isSubmitting
                          ? const SizedBox(
                              width: 18,
                              height: 18,
                              child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                            )
                          : const Text('Sign In', style: TextStyle(fontWeight: FontWeight.w800)),
                    ),
                  ),
                  const SizedBox(height: 14),
                  const Row(
                    children: [
                      Expanded(child: Divider(color: Color(0x1AFFFFFF))),
                      Padding(
                        padding: EdgeInsets.symmetric(horizontal: 10),
                        child: Text(
                          'Or continue with',
                          style: TextStyle(color: Color(0xFF6B7280), fontSize: 12),
                        ),
                      ),
                      Expanded(child: Divider(color: Color(0x1AFFFFFF))),
                    ],
                  ),
                  const SizedBox(height: 12),
                  SizedBox(
                    height: 50,
                    child: OutlinedButton.icon(
                      onPressed: () {
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(content: Text('Google Sign-In is not integrated yet.')),
                        );
                      },
                      style: OutlinedButton.styleFrom(
                        foregroundColor: const Color(0xFF9CA3AF),
                        side: const BorderSide(color: _border),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                        backgroundColor: _charcoal,
                      ),
                      icon: _googleIcon(),
                      label: const Text('Sign in with FPT Google'),
                    ),
                  ),
                  const SizedBox(height: 20),
                  Center(
                    child: Wrap(
                      crossAxisAlignment: WrapCrossAlignment.center,
                      children: [
                        const Text(
                          "Don't have an account? ",
                          style: TextStyle(color: Color(0xFF6B7280), fontSize: 13),
                        ),
                        TextButton(
                          onPressed: () async {
                            await Navigator.of(context).push(
                              MaterialPageRoute(builder: (_) => const RegisterScreen()),
                            );
                          },
                          child: const Text(
                            'Sign up now',
                            style: TextStyle(color: _accent, fontWeight: FontWeight.w700),
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () => FocusScope.of(context).unfocus(),
      child: Scaffold(
        body: LayoutBuilder(
          builder: (context, constraints) {
            final wide = constraints.maxWidth >= 1100;
            if (!wide) {
              return _formPanel();
            }
            return Row(
              children: [
                Expanded(flex: 52, child: _leftPanel()),
                Expanded(flex: 48, child: _formPanel()),
              ],
            );
          },
        ),
      ),
    );
  }
}

class _StatTile extends StatelessWidget {
  const _StatTile({required this.val, required this.label});

  final String val;
  final String label;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 10),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(14),
        color: const Color(0x0DFFFFFF),
        border: Border.all(color: const Color(0x14FFFFFF)),
      ),
      child: Column(
        children: [
          Text(
            val,
            style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w800, fontSize: 18),
          ),
          const SizedBox(height: 2),
          Text(
            label,
            style: const TextStyle(color: Color(0xFF6B7280), fontSize: 10, letterSpacing: 0.8),
          ),
        ],
      ),
    );
  }
}
