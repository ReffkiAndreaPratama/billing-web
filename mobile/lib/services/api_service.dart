import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

class ApiService {
  static const String baseUrl = 'http://10.0.2.2:4000/api';
  static String? _token;

  static Future<Map<String, String>> _headers() async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('token');
    return {
      'Content-Type': 'application/json',
      if (token != null) 'Authorization': 'Bearer $token',
    };
  }

  static Future<bool> login(String username, String password) async {
    try {
      final r = await http.post(
        Uri.parse('$baseUrl/auth/login'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'username': username, 'password': password}),
      );
      if (r.statusCode == 201 || r.statusCode == 200) {
        final data = jsonDecode(r.body);
        final prefs = await SharedPreferences.getInstance();
        await prefs.setString('token', data['access_token']);
        await prefs.setString('user', jsonEncode(data['user']));
        return true;
      }
      return false;
    } catch (_) { return false; }
  }

  static Future<void> logout() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('token');
    await prefs.remove('user');
  }

  static Future<Map<String, dynamic>?> get(String path) async {
    try {
      final r = await http.get(Uri.parse('$baseUrl$path'), headers: await _headers());
      if (r.statusCode == 200) return jsonDecode(r.body);
      return null;
    } catch (_) { return null; }
  }

  static Future<List<dynamic>> getList(String path) async {
    try {
      final r = await http.get(Uri.parse('$baseUrl$path'), headers: await _headers());
      if (r.statusCode == 200) return jsonDecode(r.body) is List ? jsonDecode(r.body) : (jsonDecode(r.body)['data'] ?? []);
      return [];
    } catch (_) { return []; }
  }

  static Future<Map<String, dynamic>?> post(String path, Map<String, dynamic> body) async {
    try {
      final r = await http.post(Uri.parse('$baseUrl$path'), headers: await _headers(), body: jsonEncode(body));
      if ([200, 201].contains(r.statusCode)) return jsonDecode(r.body);
      return null;
    } catch (_) { return null; }
  }
}
