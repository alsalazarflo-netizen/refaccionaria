import 'package:flutter/material.dart';

import '../api_client.dart';
import '../local_store.dart';
import '../sync_service.dart';
import 'registro_page.dart';

class LoginPage extends StatefulWidget {
  const LoginPage({
    super.key,
    required this.store,
    required this.api,
    required this.sync,
    required this.onLogin,
  });

  final LocalStore store;
  final ApiClient api;
  final SyncService sync;
  final void Function(String token) onLogin;

  @override
  State<LoginPage> createState() => _LoginPageState();
}

class _LoginPageState extends State<LoginPage> {
  final correo = TextEditingController();
  final password = TextEditingController();
  String error = '';
  bool cargando = false;

  @override
  void dispose() {
    correo.dispose();
    password.dispose();
    super.dispose();
  }

  Future<void> _entrar() async {
    setState(() {
      cargando = true;
      error = '';
    });
    try {
      if (!await widget.sync.hayRed()) {
        final token = await widget.store.token();
        if (token == null) {
          setState(() => error = 'Sin internet. La primera vez necesitas red.');
          return;
        }
        widget.onLogin(token);
        return;
      }
      final data = await widget.api.login(correo.text, password.text);
      final token = data['token'] as String;
      await widget.store.guardarSesion(token, Map<String, dynamic>.from(data['usuario'] as Map));
      widget.onLogin(token);
    } on ApiException catch (e) {
      setState(() => error = e.message);
    } catch (_) {
      setState(() => error = 'No se pudo conectar con el servidor.');
    } finally {
      if (mounted) setState(() => cargando = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Center(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 420),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('ACCESO', style: TextStyle(color: Color(0xFFE10600), letterSpacing: 2)),
                const SizedBox(height: 8),
                const Text('Iniciar sesion', style: TextStyle(fontSize: 28, fontWeight: FontWeight.w600)),
                const SizedBox(height: 20),
                TextField(controller: correo, decoration: const InputDecoration(labelText: 'Email'), keyboardType: TextInputType.emailAddress),
                const SizedBox(height: 12),
                TextField(controller: password, decoration: const InputDecoration(labelText: 'Contrasena'), obscureText: true),
                if (error.isNotEmpty) ...[
                  const SizedBox(height: 12),
                  Text(error, style: const TextStyle(color: Color(0xFFE10600))),
                ],
                const SizedBox(height: 16),
                SizedBox(
                  width: double.infinity,
                  child: FilledButton(
                    onPressed: cargando ? null : _entrar,
                    child: Text(cargando ? 'Entrando...' : 'Entrar'),
                  ),
                ),
                TextButton(
                  onPressed: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (_) => RegistroPage(store: widget.store, api: widget.api, sync: widget.sync),
                      ),
                    );
                  },
                  child: const Text('Crear cuenta'),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
