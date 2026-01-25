import 'package:flutter/material.dart';

import 'app_drawer.dart';
import '../screens/home_screen.dart';
import '../screens/profile_screen.dart';
import '../screens/dashboard_screen.dart';

class RootScaffold extends StatefulWidget {
  const RootScaffold({super.key});

  @override
  State<RootScaffold> createState() => _RootScaffoldState();
}

class _RootScaffoldState extends State<RootScaffold> {
  int _index = 0;

  static const _destinations = <NavigationDestination>[
    NavigationDestination(icon: Icon(Icons.home_outlined), label: 'Home'),
    NavigationDestination(icon: Icon(Icons.dashboard_outlined), label: 'Dashboard'),
    NavigationDestination(icon: Icon(Icons.person_outline), label: 'Account'),
  ];

  static const _titles = <String>[
    'Home',
    'Project Tasks',
    'Account',
  ];

  static const _pages = <Widget>[
    HomeScreen(),
    DashboardScreen(),
    ProfileScreen(),
  ];

  PreferredSizeWidget _buildAppBar() {
    if (_index == 0) {
      return AppBar(
        centerTitle: false,
        leading: Builder(
          builder: (context) {
            return IconButton(
              icon: const Icon(Icons.menu),
              onPressed: () => Scaffold.of(context).openDrawer(),
            );
          },
        ),
        title: Row(
          mainAxisSize: MainAxisSize.min,
          children: const [
            Text('# general-chat'),
            SizedBox(width: 4),
            Icon(Icons.keyboard_arrow_down, size: 20),
          ],
        ),
        actions: const [
          Padding(
            padding: EdgeInsets.only(right: 12),
            child: CircleAvatar(
              radius: 16,
              backgroundColor: Color(0xFFE5E7EB),
              child: Icon(Icons.person, size: 18, color: Color(0xFF374151)),
            ),
          ),
        ],
      );
    }

    return AppBar(
      title: Text(_titles[_index]),
      centerTitle: true,
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: _index == 2 ? null : _buildAppBar(),
      drawer: const AppDrawer(),
      drawerEnableOpenDragGesture: _index == 0,
      body: IndexedStack(
        index: _index,
        children: _pages,
      ),
      bottomNavigationBar: NavigationBar(
        selectedIndex: _index,
        destinations: _destinations,
        onDestinationSelected: (value) {
          setState(() {
            _index = value;
          });
        },
      ),
    );
  }
}
