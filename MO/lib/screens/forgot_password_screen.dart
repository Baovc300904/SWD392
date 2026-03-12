import 'package:flutter/material.dart';

import '../services/auth_service.dart';

class ForgotPasswordScreen extends StatefulWidget {
  const ForgotPasswordScreen({super.key});

  @override
  State<ForgotPasswordScreen> createState() => _ForgotPasswordScreenState();
}

class _ForgotPasswordScreenState extends State<ForgotPasswordScreen> {
  final _emailController = TextEditingController();
  final _otpController = TextEditingController();
  final _newPasswordController = TextEditingController();

  bool _loading = false;
  bool _otpSent = false;
  bool _showPassword = false;
  String? _error;

  static const _bg = Color(0xFF13151A);
  static const _panel = Color(0xFF1E2028);
  static const _border = Color(0xFF2E3240);
  static const _accent = Color(0xFFF27125);

  @override
  void dispose() {
    _emailController.dispose();
    _otpController.dispose();
    _newPasswordController.dispose();
    super.dispose();
  }

  InputDecoration _dec(String label, String hint, IconData icon, {Widget? suffix}) {
    return InputDecoration(
      labelText: label,
      hintText: hint,
      prefixIcon: Icon(icon, color: const Color(0xFF6B7280), size: 18),
      suffixIcon: suffix,
      filled: true,
      fillColor: _panel,
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: const BorderSide(color: _border),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: const BorderSide(color: _accent),
      ),
    );
  }

  Future<void> _sendOtp() async {
    final email = _emailController.text.trim();
    if (email.isEmpty || !email.contains('@')) {
      setState(() => _error = 'Please enter valid email.');
      return;
    }

    setState(() {
      _loading = true;
      _error = null;
    });

    try {
      await AuthService.instance.forgotPassword(email);
      if (!mounted) return;
      setState(() => _otpSent = true);
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('OTP has been sent to your Gmail.')),
      );
    } catch (e) {
      if (!mounted) return;
      setState(() => _error = e.toString().replaceFirst('Exception: ', ''));
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  Future<void> _resetPassword() async {
    final email = _emailController.text.trim();
    final otp = _otpController.text.trim();
    final newPassword = _newPasswordController.text;

    if (otp.isEmpty || newPassword.isEmpty) {
      setState(() => _error = 'Please enter OTP and new password.');
      return;
    }

    setState(() {
      _loading = true;
      _error = null;
    });

    try {
      await AuthService.instance.resetPassword(
        email: email,
        otp: otp,
        newPassword: newPassword,
      );
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Password reset successfully. Please sign in.')),
      );
      Navigator.of(context).pop();
    } catch (e) {
      if (!mounted) return;
      setState(() => _error = e.toString().replaceFirst('Exception: ', ''));
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  Future<void> _resendOtp() async {
    setState(() {
      _loading = true;
      _error = null;
    });

    try {
      await AuthService.instance.resendOtp(_emailController.text.trim());
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('OTP resent to your Gmail.')),
      );
    } catch (e) {
      if (!mounted) return;
      setState(() => _error = e.toString().replaceFirst('Exception: ', ''));
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: _bg,
      appBar: AppBar(
        backgroundColor: _bg,
        title: const Text('Forgot Password'),
      ),
      body: Center(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(20),
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 460),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                if (_error != null)
                  Container(
                    margin: const EdgeInsets.only(bottom: 12),
                    padding: const EdgeInsets.all(10),
                    decoration: BoxDecoration(
                      color: const Color(0x19EF4444),
                      borderRadius: BorderRadius.circular(10),
                      border: Border.all(color: const Color(0x66EF4444)),
                    ),
                    child: Text(_error!, style: const TextStyle(color: Color(0xFFF87171))),
                  ),

                TextField(
                  controller: _emailController,
                  style: const TextStyle(color: Colors.white),
                  decoration: _dec('Email', 'student@fpt.edu.vn', Icons.mail_outline),
                ),
                const SizedBox(height: 12),

                if (_otpSent) ...[
                  TextField(
                    controller: _otpController,
                    style: const TextStyle(color: Colors.white),
                    decoration: _dec('OTP', 'Enter OTP code', Icons.pin_outlined),
                  ),
                  const SizedBox(height: 12),
                  TextField(
                    controller: _newPasswordController,
                    style: const TextStyle(color: Colors.white),
                    obscureText: !_showPassword,
                    decoration: _dec(
                      'New Password',
                      'Enter new password',
                      Icons.lock_reset_outlined,
                      suffix: IconButton(
                        onPressed: () => setState(() => _showPassword = !_showPassword),
                        icon: Icon(
                          _showPassword ? Icons.visibility_off_outlined : Icons.visibility_outlined,
                          color: const Color(0xFF6B7280),
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(height: 14),
                  SizedBox(
                    height: 50,
                    child: FilledButton(
                      onPressed: _loading ? null : _resetPassword,
                      style: FilledButton.styleFrom(backgroundColor: _accent, foregroundColor: Colors.white),
                      child: _loading
                          ? const SizedBox(
                              width: 18,
                              height: 18,
                              child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                            )
                          : const Text('Reset Password'),
                    ),
                  ),
                  const SizedBox(height: 10),
                  TextButton(onPressed: _loading ? null : _resendOtp, child: const Text('Resend OTP')),
                ] else ...[
                  SizedBox(
                    height: 50,
                    child: FilledButton(
                      onPressed: _loading ? null : _sendOtp,
                      style: FilledButton.styleFrom(backgroundColor: _accent, foregroundColor: Colors.white),
                      child: _loading
                          ? const SizedBox(
                              width: 18,
                              height: 18,
                              child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                            )
                          : const Text('Send OTP to Gmail'),
                    ),
                  ),
                ],
              ],
            ),
          ),
        ),
      ),
    );
  }
}
