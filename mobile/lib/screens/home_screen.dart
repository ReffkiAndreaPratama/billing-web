import 'package:flutter/material.dart';
import 'dart:async';
import '../services/api_service.dart';
import '../services/socket_service.dart';
import 'billing_screen.dart';
import 'booking_screen.dart';
import 'members_screen.dart';
import '../widgets/dashboard_card.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});
  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  Map<String, dynamic>? _stats;
  List<dynamic> _activeSessions = [];
  int _selectedIndex = 0;
  Timer? _timer;

  final _pages = [
    const _DashboardPage(),
    const BillingScreen(),
    const BookingScreen(),
    const MembersScreen(),
  ];

  @override
  void initState() {
    super.initState();
    _loadData();
    _timer = Timer.periodic(const Duration(seconds: 10), (_) => _loadData());
    SocketService.addListener(_onSocket);
  }

  @override
  void dispose() {
    _timer?.cancel();
    SocketService.removeListener(_onSocket);
    super.dispose();
  }

  void _onSocket(Map<String, dynamic> msg) {
    if (msg['event'] == 'billing_update') setState(() => _activeSessions = msg['data'] ?? []);
  }

  Future<void> _loadData() async {
    final stats = await ApiService.get('/dashboard/stats');
    final sessions = await ApiService.getList('/billing/active');
    if (mounted) setState(() { _stats = stats; _activeSessions = sessions; });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Row(children: [
          Container(
            padding: const EdgeInsets.all(6),
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(8),
              gradient: const LinearGradient(colors: [Color(0xFF06B6D4), Color(0xFF2563EB)]),
            ),
            child: const Icon(Icons.sports_esports, size: 18, color: Colors.white),
          ),
          const SizedBox(width: 10),
          const Text('Billing Pro', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
        ]),
      ),
      body: _pages[_selectedIndex],
      bottomNavigationBar: NavigationBar(
        selectedIndex: _selectedIndex,
        onDestinationSelected: (i) => setState(() => _selectedIndex = i),
        backgroundColor: const Color(0xFF18181B),
        indicatorColor: const Color(0xFF06B6D4).withOpacity(0.2),
        destinations: const [
          NavigationDestination(icon: Icon(Icons.dashboard), label: 'Dashboard'),
          NavigationDestination(icon: Icon(Icons.timer), label: 'Billing'),
          NavigationDestination(icon: Icon(Icons.calendar_month), label: 'Booking'),
          NavigationDestination(icon: Icon(Icons.people), label: 'Members'),
        ],
      ),
    );
  }
}

class _DashboardPage extends StatelessWidget {
  const _DashboardPage();
  @override
  Widget build(BuildContext context) {
    return RefreshIndicator(
      color: const Color(0xFF06B6D4),
      onRefresh: () async {},
      child: ListView(padding: const EdgeInsets.all(16), children: [
        Row(children: [
          Expanded(child: DashboardCard(title: 'Active Sessions', value: '12', icon: Icons.computer, color: const Color(0xFF06B6D4))),
          const SizedBox(width: 12),
          Expanded(child: DashboardCard(title: 'Revenue Today', value: 'Rp 245rb', icon: Icons.monetization_on, color: const Color(0xFF22C55E))),
        ]),
        const SizedBox(height: 12),
        Row(children: [
          Expanded(child: DashboardCard(title: 'Units', value: '10/10', icon: Icons.desktop_windows, color: const Color(0xFFA855F7))),
          const SizedBox(width: 12),
          Expanded(child: DashboardCard(title: 'Members', value: '48', icon: Icons.people, color: const Color(0xFFEAB308))),
        ]),
        const SizedBox(height: 24),
        const Text('Active Sessions', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
        const SizedBox(height: 12),
        ...List.generate(5, (i) => Container(
          margin: const EdgeInsets.only(bottom: 8),
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            color: const Color(0xFF18181B),
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: const Color(0xFF27272A)),
          ),
          child: Row(children: [
            Container(
              width: 40, height: 40,
              decoration: BoxDecoration(
                color: const Color(0xFF06B6D4).withOpacity(0.1),
                borderRadius: BorderRadius.circular(10),
              ),
              child: const Icon(Icons.computer, color: Color(0xFF06B6D4), size: 20),
            ),
            const SizedBox(width: 12),
            Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              const Text('Unit-${i + 1}', style: TextStyle(fontWeight: FontWeight.w600)),
              Text('PC-${100 + i} · Rp${(3500 + i * 500)}/h', style: TextStyle(color: Colors.grey[500], fontSize: 12)),
            ])),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
              decoration: BoxDecoration(
                color: i < 2 ? const Color(0xFF22C55E).withOpacity(0.15) : const Color(0xFFEAB308).withOpacity(0.15),
                borderRadius: BorderRadius.circular(6),
              ),
              child: Text('${i * 12 + 15}:${42 - i * 7}', style: TextStyle(
                fontFamily: 'Monospace', fontSize: 12,
                color: i < 2 ? const Color(0xFF22C55E) : const Color(0xFFEAB308),
              )),
            ),
          ]),
        )),
      ]),
    );
  }
}
