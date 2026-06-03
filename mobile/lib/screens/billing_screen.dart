import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../services/api_service.dart';
import '../services/socket_service.dart';

class BillingScreen extends StatefulWidget {
  const BillingScreen({super.key});
  @override
  State<BillingScreen> createState() => _BillingScreenState();
}

class _BillingScreenState extends State<BillingScreen> {
  List<dynamic> _sessions = [];
  String? _token;

  @override
  void initState() {
    super.initState();
    _init();
    SocketService.addListener(_onSocket);
  }

  Future<void> _init() async {
    final prefs = await SharedPreferences.getInstance();
    _token = prefs.getString('token');
    _load();
  }

  void _onSocket(Map<String, dynamic> msg) {
    if (msg['event'] == 'billing_update') setState(() => _sessions = msg['data'] ?? []);
  }

  Future<void> _load() async {
    final data = await ApiService.getList('/billing/active');
    if (mounted) setState(() => _sessions = data);
  }

  Future<void> _endSession(String sessionId) async {
    await ApiService.post('/billing/end/$sessionId', {});
    _load();
  }

  @override
  void dispose() {
    SocketService.removeListener(_onSocket);
    super.dispose();
  }

  Color _timeColor(String timeStr) {
    final parts = timeStr.split(':');
    if (parts.length == 2) {
      final min = int.tryParse(parts[0]) ?? 0;
      if (min < 5) return Colors.red;
      if (min < 10) return Colors.orange;
    }
    return const Color(0xFF22C55E);
  }

  @override
  Widget build(BuildContext context) {
    return ListView(padding: const EdgeInsets.all(16), children: [
      Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
        const Text('Active Billing', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
        Text('${_sessions.length} sessions', style: TextStyle(color: Colors.grey[500])),
      ]),
      const SizedBox(height: 16),
      ...(_sessions.isEmpty
          ? [Container(
              padding: const EdgeInsets.all(32),
              decoration: BoxDecoration(color: const Color(0xFF18181B), borderRadius: BorderRadius.circular(12)),
              child: const Column(children: [
                Icon(Icons.timer_off, size: 48, color: Colors.grey),
                SizedBox(height: 12),
                Text('No active sessions', style: TextStyle(color: Colors.grey)),
              ]),
            )]
          : _sessions.map((s) => Container(
              margin: const EdgeInsets.only(bottom: 8),
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: const Color(0xFF18181B),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: const Color(0xFF27272A)),
              ),
              child: Row(children: [
                Container(
                  width: 44, height: 44,
                  decoration: BoxDecoration(
                    color: _timeColor(s['remaining'] ?? '30:00').withOpacity(0.1),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Icon(Icons.computer, color: _timeColor(s['remaining'] ?? '30:00'), size: 22),
                ),
                const SizedBox(width: 12),
                Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  Text(s['unitName'] ?? 'Unit', style: const TextStyle(fontWeight: FontWeight.w600)),
                  Text('Rp${s['rate'] ?? 0}/h', style: TextStyle(color: Colors.grey[500], fontSize: 12)),
                ])),
                Column(crossAxisAlignment: CrossAxisAlignment.end, children: [
                  Text(s['remaining'] ?? '00:00', style: TextStyle(
                    fontFamily: 'Monospace', fontSize: 16, fontWeight: FontWeight.bold,
                    color: _timeColor(s['remaining'] ?? '00:00'),
                  )),
                  Text('${s['elapsed'] ?? '00:00'} elapsed', style: TextStyle(color: Colors.grey[600], fontSize: 10)),
                ]),
                const SizedBox(width: 8),
                IconButton(
                  icon: const Icon(Icons.stop_circle_outlined, color: Colors.red, size: 20),
                  onPressed: () => _endSession(s['id'] ?? ''),
                ),
              ]),
            ))),
    ]);
  }
}
