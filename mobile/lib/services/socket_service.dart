import 'dart:convert';
import 'package:web_socket_channel/web_socket_channel.dart';

class SocketService {
  static WebSocketChannel? _channel;
  static final List<void Function(Map<String, dynamic>)> _listeners = [];

  static void connect(String token) {
    _channel?.sink.close();
    _channel = WebSocketChannel.connect(
      Uri.parse('ws://10.0.2.2:4000?token=$token'),
    );
    _channel!.stream.listen((data) {
      try {
        final msg = jsonDecode(data);
        for (final listener in _listeners) {
          listener(msg);
        }
      } catch (_) {}
    }, onError: (_) => Future.delayed(const Duration(seconds: 3), () => connect(token)));
  }

  static void addListener(void Function(Map<String, dynamic>) cb) => _listeners.add(cb);
  static void removeListener(void Function(Map<String, dynamic>) cb) => _listeners.remove(cb);
  static void disconnect() { _channel?.sink.close(); }
}
