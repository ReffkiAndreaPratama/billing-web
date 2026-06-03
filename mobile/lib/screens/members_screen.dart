import 'package:flutter/material.dart';
import '../services/api_service.dart';

class MembersScreen extends StatefulWidget {
  const MembersScreen({super.key});
  @override
  State<MembersScreen> createState() => _MembersScreenState();
}

class _MembersScreenState extends State<MembersScreen> {
  List<dynamic> _members = [];

  @override
  void initState() { super.initState(); _load(); }

  Future<void> _load() async {
    final data = await ApiService.getList('/members');
    if (mounted) setState(() => _members = data);
  }

  @override
  Widget build(BuildContext context) {
    return ListView(padding: const EdgeInsets.all(16), children: [
      Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
        const Text('Members', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
        Text('${_members.length} total', style: TextStyle(color: Colors.grey[500])),
      ]),
      const SizedBox(height: 16),
      SizedBox(
        height: 44,
        child: TextField(
          style: const TextStyle(color: Colors.white, fontSize: 14),
          decoration: InputDecoration(
            hintText: 'Search member...',
            prefixIcon: const Icon(Icons.search, size: 20),
            filled: true, fillColor: const Color(0xFF18181B),
            border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
            contentPadding: const EdgeInsets.symmetric(vertical: 0, horizontal: 16),
          ),
        ),
      ),
      const SizedBox(height: 16),
      ...List.generate(10, (i) => Container(
        margin: const EdgeInsets.only(bottom: 8),
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: const Color(0xFF18181B),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: const Color(0xFF27272A)),
        ),
        child: Row(children: [
          CircleAvatar(
            radius: 22,
            backgroundColor: Color(i % 3 == 0 ? 0xFF06B6D4 : i % 3 == 1 ? 0xFFA855F7 : 0xFF22C55E).withOpacity(0.2),
            child: Text('M${i + 1}', style: TextStyle(
              color: Color(i % 3 == 0 ? 0xFF06B6D4 : i % 3 == 1 ? 0xFFA855F7 : 0xFF22C55E),
              fontWeight: FontWeight.bold, fontSize: 14,
            )),
          ),
          const SizedBox(width: 12),
          Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text('Member ${i + 1}', style: const TextStyle(fontWeight: FontWeight.w600)),
            Text('Rp${(50000 + i * 15000).toString()} balance', style: TextStyle(color: Colors.grey[500], fontSize: 12)),
          ])),
          Column(crossAxisAlignment: CrossAxisAlignment.end, children: [
            Text('${(5 + i * 2)}h', style: const TextStyle(fontFamily: 'Monospace', fontWeight: FontWeight.bold)),
            Text('this month', style: TextStyle(color: Colors.grey[600], fontSize: 10)),
          ]),
        ]),
      )),
    ]);
  }
}
