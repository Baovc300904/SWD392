import 'package:flutter/material.dart';

import '../services/auth_service.dart';

class RegisterScreen extends StatefulWidget {
  const RegisterScreen({super.key});

  @override
  State<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends State<RegisterScreen> {
  final _formKey = GlobalKey<FormState>();
  final _studentCodeController = TextEditingController();
  final _fullNameController = TextEditingController();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  final _confirmPasswordController = TextEditingController();
  final _otpController = TextEditingController();

  bool _loading = false;
  bool _showPassword = false;
  bool _showConfirm = false;
  bool _otpStep = false;
  String? _error;

  static const _bg = Color(0xFF13151A);
  static const _panel = Color(0xFF1E2028);
  static const _border = Color(0xFF2E3240);
  static const _accent = Color(0xFFF27125);

  @override
  void dispose() {
    _studentCodeController.dispose();
    _fullNameController.dispose();
    _emailController.dispose();
    _passwordController.dispose();
    _confirmPasswordController.dispose();
    _otpController.dispose();
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

  Future<void> _register() async {
    if (!(_formKey.currentState?.validate() ?? false)) return;
    setState(() {
      _loading = true;
      _error = null;
    });

    try {
      await AuthService.instance.register(
        studentCode: _studentCodeController.text.trim(),
        fullName: _fullNameController.text.trim(),
        email: _emailController.text.trim(),
        password: _passwordController.text,
        confirmPassword: _confirmPasswordController.text,
      );
      if (!mounted) return;
      setState(() => _otpStep = true);
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('OTP sent to your email. Please verify to complete registration.')),
      );
    } catch (e) {
      if (!mounted) return;
      setState(() => _error = e.toString().replaceFirst('Exception: ', ''));
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  Future<void> _verifyOtp() async {
    if (_otpController.text.trim().isEmpty) {
      setState(() => _error = 'Please enter OTP.');
      return;
    }

    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      await AuthService.instance.verifyOtp(
        email: _emailController.text.trim(),
        otp: _otpController.text.trim(),
      );
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Registration verified successfully. Please sign in.')),
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
        const SnackBar(content: Text('OTP resent. Please check your email.')),
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
        title: const Text('Create Account'),
      ),
      body: Center(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(20),
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 460),
            child: Form(
              key: _formKey,
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

                  if (!_otpStep) ...[
                    TextFormField(
                      controller: _studentCodeController,
                      style: const TextStyle(color: Colors.white),
                      decoration: _dec('Student Code', 'SE170001', Icons.badge_outlined),
                      validator: (v) {
                        final text = (v ?? '').trim();
                        if (text.isEmpty) return 'Please enter student code.';
                        if (!RegExp(r'^SE\d{6}$').hasMatch(text)) {
                          return 'Format: SE + 6 digits';
                        }
                        return null;
                      },
                    ),
                    const SizedBox(height: 10),
                    TextFormField(
                      controller: _fullNameController,
                      style: const TextStyle(color: Colors.white),
                      decoration: _dec('Full Name', 'Nguyen Van A', Icons.person_outline),
                      validator: (v) => (v ?? '').trim().isEmpty ? 'Please enter full name.' : null,
                    ),
                    const SizedBox(height: 10),
                    TextFormField(
                      controller: _emailController,
                      style: const TextStyle(color: Colors.white),
                      decoration: _dec('Email', 'student@fpt.edu.vn', Icons.mail_outline),
                      validator: (v) {
                        final text = (v ?? '').trim();
                        if (text.isEmpty) return 'Please enter email.';
                        if (!text.contains('@')) return 'Invalid email.';
                        return null;
                      },
                    ),
                    const SizedBox(height: 10),
                    TextFormField(
                      controller: _passwordController,
                      style: const TextStyle(color: Colors.white),
                      obscureText: !_showPassword,
                      decoration: _dec(
                        'Password',
                        'Enter password',
                        Icons.lock_outline,
                        suffix: IconButton(
                          onPressed: () => setState(() => _showPassword = !_showPassword),
                          icon: Icon(
                            _showPassword ? Icons.visibility_off_outlined : Icons.visibility_outlined,
                            color: const Color(0xFF6B7280),
                          ),
                        ),
                      ),
                      validator: (v) {
                        if ((v ?? '').isEmpty) return 'Please enter password.';
                        if ((v ?? '').length < 6) return 'Password must be at least 6 chars.';
                        return null;
                      },
                    ),
                    const SizedBox(height: 10),
                    TextFormField(
                      controller: _confirmPasswordController,
                      style: const TextStyle(color: Colors.white),
                      obscureText: !_showConfirm,
                      decoration: _dec(
                        'Confirm Password',
                        'Re-enter password',
                        Icons.lock_reset_outlined,
                        suffix: IconButton(
                          onPressed: () => setState(() => _showConfirm = !_showConfirm),
                          icon: Icon(
                            _showConfirm ? Icons.visibility_off_outlined : Icons.visibility_outlined,
                            color: const Color(0xFF6B7280),
                          ),
                        ),
                      ),
                      validator: (v) {
                        if ((v ?? '').isEmpty) return 'Please confirm password.';
                        if (v != _passwordController.text) return 'Password does not match.';
                        return null;
                      },
                    ),
                    const SizedBox(height: 16),
                    SizedBox(
                      height: 50,
                      child: FilledButton(
                        onPressed: _loading ? null : _register,
                        style: FilledButton.styleFrom(backgroundColor: _accent, foregroundColor: Colors.white),
                        child: _loading
                            ? const SizedBox(
                                width: 18,
                                height: 18,
                                child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                              )
                            : const Text('Register and Send OTP'),
                      ),
                    ),
                  ] else ...[
                    Text(
                      'We sent OTP to ${_emailController.text.trim()}',
                      style: const TextStyle(color: Color(0xFFD1D5DB)),
                    ),
                    const SizedBox(height: 10),
                    TextFormField(
                      controller: _otpController,
                      style: const TextStyle(color: Colors.white),
                      decoration: _dec('OTP Code', 'Enter 6-digit OTP', Icons.pin_outlined),
                    ),
                    const SizedBox(height: 16),
                    SizedBox(
                      height: 50,
                      child: FilledButton(
                        onPressed: _loading ? null : _verifyOtp,
                        style: FilledButton.styleFrom(backgroundColor: _accent, foregroundColor: Colors.white),
                        child: _loading
                            ? const SizedBox(
                                width: 18,
                                height: 18,
                                child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                              )
                            : const Text('Verify OTP'),
                      ),
                    ),
                    const SizedBox(height: 10),
                    TextButton(
                      onPressed: _loading ? null : _resendOtp,
                      child: const Text('Resend OTP'),
                    ),
                  ],
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
