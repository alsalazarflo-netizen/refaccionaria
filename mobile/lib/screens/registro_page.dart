import 'package:flutter/material.dart';

import '../api_client.dart';
import '../local_store.dart';
import '../sync_service.dart';

class RegistroPage extends StatefulWidget {
  const RegistroPage({super.key, required this.store, required this.api, required this.sync});

  final LocalStore store;
  final ApiClient api;
  final SyncService sync;

  @override
  State<RegistroPage> createState() => _RegistroPageState();
}

class _RegistroPageState extends State<RegistroPage> {
  final nombre = TextEditingController();
  final apellido = TextEditingController();
  final correo = TextEditingController();
  final password = TextEditingController();
  String mensaje = '';
  bool cargando = false;

  @override
  void dispose() {
    nombre.dispose();
    apellido.dispose();
    correo.dispose();
    password.dispose();
    super.dispose();
  }

  Future<void> _crear() async {
    if (nombre.text.trim().length < 2 || apellido.text.trim().length < 2 || password.text.length < 6 || !correo.text.contains('@')) {
      setState(() => mensaje = 'Revisa nombre, apellido, correo y contrasena (minimo 6).');
      return;
    }
    setState(() {
      cargando = true;
      mensaje = '';
    });
    try {
      if (await widget.sync.hayRed()) {
        await widget.api.register(
          nombre: nombre.text,
          apellido: apellido.text,
          correo: correo.text,
          password: password.text,
        );
        if (mounted) {
          setState(() => mensaje = 'Cuenta creada. Ya puedes iniciar sesion.');
        }
      } else {
        await widget.store.guardarRegistroPendiente(
          nombre: nombre.text.trim(),
          apellido: apellido.text.trim(),
          correo: correo.text.trim(),
          password: password.text,
        );
        if (mounted) {
          setState(() => mensaje = 'Sin internet. La cuenta se guardo en el telefono y se creara al sincronizar.');
        }
      }
    } on ApiException catch (e) {
      setState(() => mensaje = e.message);
    } catch (_) {
      setState(() => mensaje = 'No se pudo conectar con el servidor.');
    } finally {
      if (mounted) setState(() => cargando = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Crear cuenta')),
      body: ListView(
        padding: const EdgeInsets.all(24),
        children: [
          TextField(controller: nombre, decoration: const InputDecoration(labelText: 'Nombre')),
          TextField(controller: apellido, decoration: const InputDecoration(labelText: 'Apellido')),
          TextField(controller: correo, decoration: const InputDecoration(labelText: 'Email'), keyboardType: TextInputType.emailAddress),
          TextField(controller: password, decoration: const InputDecoration(labelText: 'Contrasena'), obscureText: true),
          const SizedBox(height: 16),
          if (mensaje.isNotEmpty) Text(mensaje),
          const SizedBox(height: 12),
          FilledButton(onPressed: cargando ? null : _crear, child: Text(cargando ? 'Guardando...' : 'Registrarme')),
        ],
      ),
    );
  }
}
