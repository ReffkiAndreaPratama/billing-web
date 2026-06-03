import 'package:flutter/material.dart';
import '../services/api_service.dart';

class BookingScreen extends StatefulWidget {
  const BookingScreen({super.key});
  @override
  State<BookingScreen> createState() => _BookingScreenState();
}

class _BookingScreenState extends State<BookingScreen> {
  List<dynamic> _bookings = [];

  @override
  void initState() { super.initState(); _load(); }

  Future<void> _load() async {
    final data = await ApiService.getList('/bookings');
    if (mounted) setState(() => _bookings = data);
  }

  @override
  Widget build(BuildContext context) {
    return ListView(padding: const EdgeInsets.all(16), children: [
      Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
        const Text('Bookings', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
        Text('${_bookings.length} total', style: TextStyle(color: Colors.grey[500])),
      ]),
      const SizedBox(height: 16),
      SizedBox(
        height: 44,
        child: TextField(
          style: const TextStyle(color: Colors.white, fontSize: 14),
          decoration: InputDecoration(
            hintText: 'Search booking...',
            prefixIcon: const Icon(Icons.search, size: 20),
            filled: true, fillColor: const Color(0xFF18181B),
            border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
            contentPadding: const EdgeInsets.symmetric(vertical: 0, horizontal: 16),
          ),
        ),
      ),
      const SizedBox(height: 16),
      ...List.generate(8, (i) => Container(
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
              color: i % 2 == 0 ? const Color(0xFF06B6D4).withOpacity(0.1) : const Color(0xFFA855F7).withOpacity(0.1),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Icon(Icons.person, color: i % 2 == 0 ? const Color(0xFF06B6D4) : const Color(0xFFA855F7), size: 22),
          ),
          const SizedBox(width: 12),
          Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text('Member ${i + 1}', style: const TextStyle(fontWeight: FontWeight.w600)),
            Text('Unit-${i + 1} · ${i + 2}:00 PM', style: TextStyle(color: Colors.grey[500], fontSize: 12)),
          ])),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
            decoration: BoxDecoration(
              color: i < 3 ? const Color(0xFF22C55E).withOpacity(0.15) : const Color(0xFFEAB308).withOpacity(0.15),
              borderRadius: BorderRadius.circular(6),
            ),
            child: Text(i < 3 ? 'Confirmed' : 'Pending', style: TextStyle(
              fontSize: 11, color: i < 3 ? const Color(0xFF22C55E) : const Color(0xFFEAB308),
            )),
          ),
        ]),
      )),
    ]);
  }
}
