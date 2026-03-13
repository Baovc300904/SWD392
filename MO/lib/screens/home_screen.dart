import 'package:flutter/material.dart';

import 'login_screen.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  final ScrollController _scrollController = ScrollController();
  bool _showBackToTop = false;
  final PageController _previewController = PageController(viewportFraction: 0.92);
  int _previewIndex = 0;

  List<Widget> _buildAppBarActions(BuildContext context) {
    final width = MediaQuery.sizeOf(context).width;

    // Mobile: keep only the primary CTA.
    if (width < 520) {
      return [
        Padding(
          padding: const EdgeInsets.only(right: 12),
          child: FilledButton(
            onPressed: _goToLogin,
            style: FilledButton.styleFrom(
              backgroundColor: const Color(0xFFF27125),
              foregroundColor: Colors.white,
            ),
            child: const Text('Get Started'),
          ),
        ),
      ];
    }

    // Tablet-ish: keep primary CTAs.
    if (width < 820) {
      return [
        TextButton(onPressed: _goToLogin, child: const Text('Sign In')),
        const SizedBox(width: 4),
        Padding(
          padding: const EdgeInsets.only(right: 12),
          child: FilledButton(
            onPressed: _goToLogin,
            style: FilledButton.styleFrom(
              backgroundColor: const Color(0xFFF27125),
              foregroundColor: Colors.white,
            ),
            child: const Text('Get Started'),
          ),
        ),
      ];
    }

    // Desktop: show full nav.
    return [
      TextButton(onPressed: () => _showSoon('About'), child: const Text('About')),
      TextButton(onPressed: () => _showSoon('Docs'), child: const Text('Docs')),
      TextButton(onPressed: () => _showSoon('FAQ'), child: const Text('FAQ')),
      const SizedBox(width: 6),
      TextButton(onPressed: _goToLogin, child: const Text('Sign In')),
      const SizedBox(width: 4),
      Padding(
        padding: const EdgeInsets.only(right: 12),
        child: FilledButton(
          onPressed: _goToLogin,
          style: FilledButton.styleFrom(
            backgroundColor: const Color(0xFFF27125),
            foregroundColor: Colors.white,
          ),
          child: const Text('Get Started'),
        ),
      ),
    ];
  }

  @override
  void initState() {
    super.initState();
    _scrollController.addListener(_onScroll);
  }

  @override
  void dispose() {
    _scrollController
      ..removeListener(_onScroll)
      ..dispose();
    _previewController.dispose();
    super.dispose();
  }

  Widget _dot(bool active) {
    return AnimatedContainer(
      duration: const Duration(milliseconds: 180),
      width: active ? 18 : 8,
      height: 8,
      margin: const EdgeInsets.symmetric(horizontal: 4),
      decoration: BoxDecoration(
        color: active ? const Color(0xFFF27125) : const Color(0x55FFFFFF),
        borderRadius: BorderRadius.circular(999),
      ),
    );
  }

  Widget _previewCard({
    required String title,
    required String subtitle,
    required IconData icon,
    required List<String> bullets,
  }) {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 6, vertical: 10),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(16),
        color: const Color(0x0DFFFFFF),
        border: Border.all(color: const Color(0x33FFFFFF)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                width: 40,
                height: 40,
                decoration: BoxDecoration(
                  color: const Color(0x22F27125),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: const Color(0x55F27125)),
                ),
                child: Icon(icon, color: const Color(0xFFF27125)),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      title,
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 18,
                        fontWeight: FontWeight.w800,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      subtitle,
                      style: const TextStyle(
                        color: Color(0xFFCBD5E1),
                        fontSize: 13,
                        height: 1.35,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 14),
          Expanded(
            child: Container(
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(14),
                color: const Color(0x1A000000),
                border: Border.all(color: const Color(0x22FFFFFF)),
              ),
              child: Column(
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                    decoration: const BoxDecoration(
                      border: Border(bottom: BorderSide(color: Color(0x22FFFFFF))),
                    ),
                    child: Row(
                      children: [
                        const CircleAvatar(
                          radius: 12,
                          backgroundColor: Color(0xFFF27125),
                          child: Text('S', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w800)),
                        ),
                        const SizedBox(width: 10),
                        Expanded(
                          child: Text(
                            'SWP Hub',
                            style: TextStyle(color: Colors.white.withValues(alpha: 0.95), fontWeight: FontWeight.w700),
                          ),
                        ),
                        Icon(Icons.more_horiz, color: Colors.white.withValues(alpha: 0.7)),
                      ],
                    ),
                  ),
                  Expanded(
                    child: ListView.separated(
                      physics: const NeverScrollableScrollPhysics(),
                      padding: const EdgeInsets.all(12),
                      itemCount: bullets.length,
                      separatorBuilder: (_, __) => const SizedBox(height: 8),
                      itemBuilder: (_, i) {
                        return Container(
                          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                          decoration: BoxDecoration(
                            borderRadius: BorderRadius.circular(12),
                            color: const Color(0x0FFFFFFF),
                            border: Border.all(color: const Color(0x1AFFFFFF)),
                          ),
                          child: Row(
                            children: [
                              const Icon(Icons.check_circle_outline, size: 18, color: Color(0xFFF27125)),
                              const SizedBox(width: 10),
                              Expanded(
                                child: Text(
                                  bullets[i],
                                  style: const TextStyle(color: Color(0xFFE5E7EB), fontSize: 13, height: 1.2),
                                ),
                              ),
                            ],
                          ),
                        );
                      },
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  void _onScroll() {
    final visible = _scrollController.offset > 300;
    if (visible != _showBackToTop) {
      setState(() => _showBackToTop = visible);
    }
  }

  Future<void> _goToLogin() async {
    await Navigator.of(context).push(
      MaterialPageRoute(builder: (_) => const LoginScreen()),
    );
  }

  void _showSoon(String feature) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text('$feature page is not integrated yet in MO.')),
    );
  }

  @override
  Widget build(BuildContext context) {
    final width = MediaQuery.sizeOf(context).width;
    final isSmall = width < 420;

    return Scaffold(
      backgroundColor: Colors.white,
      floatingActionButton: AnimatedSlide(
        duration: const Duration(milliseconds: 240),
        offset: _showBackToTop ? Offset.zero : const Offset(0, 2),
        child: AnimatedOpacity(
          duration: const Duration(milliseconds: 240),
          opacity: _showBackToTop ? 1 : 0,
          child: FloatingActionButton(
            onPressed: () {
              _scrollController.animateTo(
                0,
                duration: const Duration(milliseconds: 450),
                curve: Curves.easeOutCubic,
              );
            },
            backgroundColor: const Color(0xFFF27125),
            child: const Icon(Icons.keyboard_arrow_up, color: Colors.white),
          ),
        ),
      ),
      body: CustomScrollView(
        controller: _scrollController,
        slivers: [
          SliverAppBar(
            pinned: true,
            toolbarHeight: 72,
            backgroundColor: Colors.white.withValues(alpha: 0.95),
            surfaceTintColor: Colors.transparent,
            title: Row(
              children: [
                Container(
                  width: 32,
                  height: 32,
                  decoration: BoxDecoration(
                    color: const Color(0xFFF27125),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: const Center(
                    child: Text(
                      'S',
                      style: TextStyle(color: Colors.white, fontWeight: FontWeight.w800),
                    ),
                  ),
                ),
                const SizedBox(width: 10),
                const Text(
                  'SWP Hub',
                  style: TextStyle(color: Color(0xFF111827), fontWeight: FontWeight.w800),
                ),
              ],
            ),
            actions: _buildAppBarActions(context),
          ),

          SliverToBoxAdapter(
            child: Container(
              padding: EdgeInsets.fromLTRB(24, isSmall ? 62 : 80, 24, isSmall ? 62 : 80),
              decoration: const BoxDecoration(
                color: Color(0xFF1A1D21),
              ),
              child: Center(
                child: ConstrainedBox(
                  constraints: const BoxConstraints(maxWidth: 1180),
                  child: Column(
                    children: [
                      const Text(
                        'Monitor & Manage the Complete\nStudent Project Experience',
                        textAlign: TextAlign.center,
                        style: TextStyle(
                          color: Colors.white,
                          fontSize: 48,
                          height: 1.15,
                          fontWeight: FontWeight.w800,
                        ),
                      ),
                      const SizedBox(height: 16),
                      Text(
                        'The all-in-one platform for FPT students to manage topics, form groups, and get instant answers.',
                        textAlign: TextAlign.center,
                        style: TextStyle(
                          color: const Color(0xFFD1D5DB),
                          fontSize: isSmall ? 16 : 20,
                          height: 1.5,
                        ),
                      ),
                      const SizedBox(height: 30),
                      Wrap(
                        spacing: 12,
                        runSpacing: 12,
                        alignment: WrapAlignment.center,
                        children: [
                          FilledButton.icon(
                            onPressed: _goToLogin,
                            style: FilledButton.styleFrom(
                              backgroundColor: const Color(0xFFF27125),
                              foregroundColor: Colors.white,
                              padding: const EdgeInsets.symmetric(horizontal: 26, vertical: 16),
                            ),
                            icon: const Icon(Icons.arrow_forward),
                            label: const Text('Get Started', style: TextStyle(fontWeight: FontWeight.w700)),
                          ),
                          OutlinedButton.icon(
                            onPressed: () => _showSoon('Documentation'),
                            style: OutlinedButton.styleFrom(
                              foregroundColor: Colors.white,
                              side: const BorderSide(color: Color(0x55FFFFFF)),
                              padding: const EdgeInsets.symmetric(horizontal: 26, vertical: 16),
                            ),
                            icon: const Icon(Icons.play_circle_outline),
                            label: const Text('View Documentation', style: TextStyle(fontWeight: FontWeight.w700)),
                          ),
                        ],
                      ),
                      const SizedBox(height: 34),
                      Container(
                        height: isSmall ? 360 : 380,
                        width: double.infinity,
                        decoration: BoxDecoration(
                          borderRadius: BorderRadius.circular(16),
                          color: const Color(0x0DFFFFFF),
                          border: Border.all(color: const Color(0x33FFFFFF)),
                        ),
                        child: Column(
                          children: [
                            Padding(
                              padding: const EdgeInsets.fromLTRB(16, 14, 16, 0),
                              child: Row(
                                children: [
                                  const Text(
                                    'Product Preview',
                                    style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.w800),
                                  ),
                                  const Spacer(),
                                  Icon(Icons.swipe, color: Colors.white.withValues(alpha: 0.7), size: 18),
                                  const SizedBox(width: 6),
                                  Text(
                                    'Swipe',
                                    style: TextStyle(color: Colors.white.withValues(alpha: 0.7), fontSize: 12),
                                  ),
                                ],
                              ),
                            ),
                            Expanded(
                              child: PageView(
                                controller: _previewController,
                                onPageChanged: (i) => setState(() => _previewIndex = i),
                                children: [
                                  _previewCard(
                                    title: 'Dashboard',
                                    subtitle: 'Track topics, classes, and queues at a glance.',
                                    icon: Icons.dashboard_outlined,
                                    bullets: const [
                                      'Pending topics & approvals',
                                      'Waiting Q&A tickets',
                                      'Quick status overview',
                                    ],
                                  ),
                                  _previewCard(
                                    title: 'Topic Proposals',
                                    subtitle: 'Propose, review, and manage topics quickly.',
                                    icon: Icons.lightbulb_outline,
                                    bullets: const [
                                      'Create proposal in seconds',
                                      'Approval status tracking',
                                      'Syllabus link attached',
                                    ],
                                  ),
                                  _previewCard(
                                    title: 'Hierarchical Q&A',
                                    subtitle: 'Answer, escalate, and resolve questions fast.',
                                    icon: Icons.quiz_outlined,
                                    bullets: const [
                                      'Prioritized ticket view',
                                      'Escalate edge cases',
                                      'Keep answers consistent',
                                    ],
                                  ),
                                ],
                              ),
                            ),
                            Padding(
                              padding: const EdgeInsets.only(bottom: 12),
                              child: Row(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  _dot(_previewIndex == 0),
                                  _dot(_previewIndex == 1),
                                  _dot(_previewIndex == 2),
                                ],
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

          SliverToBoxAdapter(
            child: Container(
              color: const Color(0xFFF9FAFB),
              padding: const EdgeInsets.fromLTRB(24, 70, 24, 70),
              child: Center(
                child: ConstrainedBox(
                  constraints: const BoxConstraints(maxWidth: 1180),
                  child: Column(
                    children: [
                      const Text(
                        'Why Choose SWP Hub?',
                        style: TextStyle(fontSize: 40, fontWeight: FontWeight.w800, color: Color(0xFF111827)),
                      ),
                      const SizedBox(height: 10),
                      const Text(
                        'Everything you need to succeed in your Software Project',
                        style: TextStyle(fontSize: 20, color: Color(0xFF6B7280)),
                      ),
                      const SizedBox(height: 34),
                      LayoutBuilder(
                        builder: (context, constraints) {
                          final narrow = constraints.maxWidth < 960;
                          return Wrap(
                            spacing: 16,
                            runSpacing: 16,
                            children: [
                              _featureCard(
                                width: narrow ? constraints.maxWidth : (constraints.maxWidth - 32) / 3,
                                title: 'AI-Powered Answers',
                                desc:
                                    'Get syllabus-based suggestions instantly. Our AI assistant analyzes your questions and provides accurate answers.',
                                icon: Icons.psychology_alt_outlined,
                              ),
                              _featureCard(
                                width: narrow ? constraints.maxWidth : (constraints.maxWidth - 32) / 3,
                                title: 'Smart Group Matching',
                                desc: 'Find teammates that match your skill set and form balanced project teams quickly.',
                                icon: Icons.groups_2_outlined,
                              ),
                              _featureCard(
                                width: narrow ? constraints.maxWidth : (constraints.maxWidth - 32) / 3,
                                title: 'Topic Management',
                                desc: 'Streamlined workflow for topic submission, approval, and milestone tracking.',
                                icon: Icons.shield_outlined,
                              ),
                            ],
                          );
                        },
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ),

          SliverToBoxAdapter(
            child: Container(
              color: const Color(0xFF1A1D21),
              padding: const EdgeInsets.fromLTRB(24, 64, 24, 64),
              child: Center(
                child: ConstrainedBox(
                  constraints: const BoxConstraints(maxWidth: 920),
                  child: Column(
                    children: [
                      const Text(
                        'Ready to start your journey?',
                        style: TextStyle(color: Colors.white, fontSize: 40, fontWeight: FontWeight.w800),
                      ),
                      const SizedBox(height: 12),
                      const Text(
                        'Join thousands of FPT students already using SWP Hub to ace their projects.',
                        textAlign: TextAlign.center,
                        style: TextStyle(color: Color(0xFFD1D5DB), fontSize: 20),
                      ),
                      const SizedBox(height: 24),
                      FilledButton(
                        onPressed: _goToLogin,
                        style: FilledButton.styleFrom(
                          backgroundColor: const Color(0xFFF27125),
                          foregroundColor: Colors.white,
                          padding: const EdgeInsets.symmetric(horizontal: 28, vertical: 16),
                        ),
                        child: const Text('Get Started for Free', style: TextStyle(fontWeight: FontWeight.w700)),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _featureCard({
    required double width,
    required String title,
    required String desc,
    required IconData icon,
  }) {
    return Container(
      width: width,
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: const Color(0xFFE5E7EB)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 52,
            height: 52,
            decoration: BoxDecoration(
              color: const Color(0x1AF27125),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Icon(icon, color: const Color(0xFFF27125), size: 26),
          ),
          const SizedBox(height: 14),
          Text(title, style: const TextStyle(fontSize: 24, fontWeight: FontWeight.w800, color: Color(0xFF111827))),
          const SizedBox(height: 8),
          Text(desc, style: const TextStyle(color: Color(0xFF6B7280), height: 1.5)),
        ],
      ),
    );
  }
}
