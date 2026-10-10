import 'package:flutter/material.dart';

import 'api_client.dart';
import 'local_store.dart';
import 'screens/escaneos_page.dart';
import 'screens/login_page.dart';
import 'sync_service.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(const RefaccionariaApp());
}

class RefaccionariaApp extends StatefulWidget {
  const RefaccionariaApp({super.key});

  @override
  State<RefaccionariaApp> createState() => _RefaccionariaAppState();
}

class _RefaccionariaAppState extends State<RefaccionariaApp> {
  final store = LocalStore();
  final api = ApiClient();
  late final SyncService sync = SyncService(store, api);
  String? token;
  bool listo = false;

  @override
  void initState() {
    super.initState();
    _cargar();
  }

  Future<void> _cargar() async {
    final guardado = await store.token();
    if (!mounted) return;
    setState(() {
      token = guardado;
      api.token = guardado;
      listo = true;
    });
    if (guardado != null) {
      sync.sincronizar().catchError((_) => null);
    }
  }

  void _entrar(String nuevo) {
    setState(() {
      token = nuevo;
      api.token = nuevo;
    });
    sync.sincronizar().catchError((_) => null);
  }

  Future<void> _salir() async {
    await store.cerrarSesion();
    setState(() {
      token = null;
      api.token = null;
    });
  }

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      title: 'Refaccionaria',
      theme: ThemeData(
        brightness: Brightness.dark,
        scaffoldBackgroundColor: const Color(0xFF0A0A0A),
        colorScheme: const ColorScheme.dark(
          primary: Color(0xFFE10600),
          surface: Color(0xFF121212),
        ),
      ),
      home: !listo
          ? const Scaffold(body: Center(child: CircularProgressIndicator()))
          : token == null
              ? LoginPage(store: store, api: api, sync: sync, onLogin: _entrar)
              : EscaneosPage(store: store, sync: sync, onSalir: _salir),
    );
  }
}
