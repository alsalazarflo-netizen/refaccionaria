import 'dart:convert';
import 'dart:math';

import 'package:http/http.dart' as http;

const apiBase = 'https://refaccionaria-r0yw.onrender.com';

class ApiException implements Exception {
  ApiException(this.message);
  final String message;
  @override
  String toString() => message;
}

class ApiClient {
  ApiClient({this.token});

  String? token;

  Future<Map<String, dynamic>> login(String correo, String password) async {
    return _send('/api/auth/login', {
      'correo': correo.trim(),
      'password': password,
    });
  }

  Future<void> register({
    required String nombre,
    required String apellido,
    required String correo,
    required String password,
  }) async {
    await _send('/api/auth/register', {
      'nombre': nombre.trim(),
      'apellido': apellido.trim(),
      'correo': correo.trim(),
      'password': password,
    });
  }

  Future<Map<String, dynamic>> crearEscaneo(Map<String, dynamic> body) {
    return _send('/api/escaneos', body, auth: true);
  }

  Future<List<Map<String, dynamic>>> escaneos() async {
    final data = await _send('/api/escaneos', null, auth: true, method: 'GET');
    return (data['lista'] as List).cast<Map<String, dynamic>>();
  }

  Future<Map<String, dynamic>> _send(
    String path,
    Map<String, dynamic>? body, {
    bool auth = false,
    String method = 'POST',
  }) async {
    final headers = {'Content-Type': 'application/json'};
    if (auth && token != null) headers['Authorization'] = 'Bearer $token';
    final uri = Uri.parse('$apiBase$path');
    final response = method == 'GET'
        ? await http.get(uri, headers: headers).timeout(const Duration(seconds: 20))
        : await http
            .post(uri, headers: headers, body: jsonEncode(body))
            .timeout(const Duration(seconds: 20));
    if (response.statusCode == 204) return {};
    final decoded = response.body.isEmpty ? <String, dynamic>{} : jsonDecode(response.body);
    if (response.statusCode >= 400) {
      final error = decoded is Map ? decoded['error']?.toString() : null;
      throw ApiException(error ?? 'Error ${response.statusCode}');
    }
    if (decoded is List) return {'lista': decoded};
    return Map<String, dynamic>.from(decoded as Map);
  }
}

String nuevoId() {
  final r = Random.secure();
  final bytes = List<int>.generate(16, (_) => r.nextInt(256));
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  final hex = bytes.map((n) => n.toRadixString(16).padLeft(2, '0')).join();
  return '${hex.substring(0, 8)}-${hex.substring(8, 12)}-${hex.substring(12, 16)}-${hex.substring(16, 20)}-${hex.substring(20)}';
}
