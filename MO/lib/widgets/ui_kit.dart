import 'package:flutter/material.dart';

class DashboardHero extends StatelessWidget {
	const DashboardHero({
		super.key,
		required this.title,
		required this.subtitle,
		required this.icon,
	});

	final String title;
	final String subtitle;
	final IconData icon;

	@override
	Widget build(BuildContext context) {
		final colorScheme = Theme.of(context).colorScheme;
		return Container(
			width: double.infinity,
			padding: const EdgeInsets.all(16),
			decoration: BoxDecoration(
				borderRadius: BorderRadius.circular(20),
				gradient: LinearGradient(
					colors: <Color>[
						colorScheme.primary,
						colorScheme.primary.withValues(alpha: 0.78),
					],
					begin: Alignment.topLeft,
					end: Alignment.bottomRight,
				),
			),
			child: Row(
				children: [
					Expanded(
						child: Column(
							crossAxisAlignment: CrossAxisAlignment.start,
							children: [
								Text(
									title,
									style: const TextStyle(
										color: Colors.white,
										fontSize: 20,
										fontWeight: FontWeight.w800,
									),
								),
								const SizedBox(height: 4),
								Text(
									subtitle,
									style: TextStyle(
										color: Colors.white.withValues(alpha: 0.92),
										fontSize: 13,
										height: 1.3,
									),
								),
							],
						),
					),
					Container(
						padding: const EdgeInsets.all(10),
						decoration: BoxDecoration(
							color: Colors.white.withValues(alpha: 0.2),
							borderRadius: BorderRadius.circular(14),
						),
						child: Icon(icon, color: Colors.white, size: 26),
					),
				],
			),
		);
	}
}

class StatCard extends StatelessWidget {
	const StatCard({
		super.key,
		required this.label,
		required this.value,
		required this.icon,
	});

	final String label;
	final int value;
	final IconData icon;

	@override
	Widget build(BuildContext context) {
		final colorScheme = Theme.of(context).colorScheme;
		return Container(
			width: 165,
			padding: const EdgeInsets.all(12),
			decoration: BoxDecoration(
				color: colorScheme.surface,
				borderRadius: BorderRadius.circular(14),
				border: Border.all(color: colorScheme.outlineVariant),
			),
			child: Column(
				crossAxisAlignment: CrossAxisAlignment.start,
				children: [
					Icon(icon, size: 20, color: colorScheme.primary),
					const SizedBox(height: 8),
					Text(
						'$value',
						style: TextStyle(
							fontSize: 24,
							fontWeight: FontWeight.w900,
							color: colorScheme.onSurface,
						),
					),
					const SizedBox(height: 2),
					Text(
						label,
						style: TextStyle(color: colorScheme.onSurfaceVariant),
					),
				],
			),
		);
	}
}

class SectionCard extends StatelessWidget {
	const SectionCard({super.key, required this.child, this.margin});

	final Widget child;
	final EdgeInsets? margin;

	@override
	Widget build(BuildContext context) {
		final colorScheme = Theme.of(context).colorScheme;
		return Container(
			margin: margin,
			padding: const EdgeInsets.all(12),
			decoration: BoxDecoration(
				color: colorScheme.surface,
				borderRadius: BorderRadius.circular(14),
				border: Border.all(color: colorScheme.outlineVariant),
			),
			child: child,
		);
	}
}
