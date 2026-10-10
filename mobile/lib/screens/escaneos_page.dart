import 'package:flutter/material.dart';
import 'package:geolocator/geolocator.dart';
import 'package:mobile_scanner/mobile_scanner.dart';

import '../api_client.dart';
import '../local_store.dart';
import '../sync_service.dart';

class EscaneosPage extends StatefulWidget {
  const EscaneosPage({super.key, required this.store, required this.sync, required this.onSalir});

  final LocalStore store;
  final SyncService sync;
  final Future<void> Function() onSalir;

  @override
  State<EscaneosPage> createState() => _EscaneosPageState();
}

class _EscaneosPageState extends State<EscaneosPage> {
  List<Map<String, Object?>> filas = [];
  String aviso = '';
  String nombre = '';
  bool ocupado = false;

  @override
  void initState() {
    super.initState();
    _recargar();
  }

  Future<void> _recargar() async {
    final data = await widget.store.escaneos();
    final quien = await widget.store.nombre();
    if (!mounted) return;
    setState(() {
      filas = data;
      nombre = quien ?? '';
    });
  }

  Future<Position?> _gps() async {
    var permiso = await Geolocator.checkPermission();
    if (permiso == LocationPermission.denied) {
      permiso = await Geolocator.requestPermission();
    }
    if (permiso == LocationPermission.denied || permiso == LocationPermission.deniedForever) {
      return null;
    }
    return Geolocator.getCurrentPosition();
  }

  Future<void> _guardar(String codigo, Position? punto) async {
    final limpio = codigo.trim();
    if (limpio.isEmpty) return;
    await widget.store.guardarEscaneo(
      clientId: nuevoId(),
      codigo: limpio,
      lat: punto?.latitude,
      lng: punto?.longitude,
      createdAt: DateTime.now().toUtc().toIso8601String(),
    );
    await _recargar();
    await _sincronizar();
  }

  Future<void> _sincronizar() async {
    setState(() => ocupado = true);
    try {
      final texto = await widget.sync.sincronizar();
      if (mounted) setState(() => aviso = texto ?? '');
      await _recargar();
    } catch (e) {
      if (mounted) setState(() => aviso = e.toString());
    } finally {
      if (mounted) setState(() => ocupado = false);
    }
  }

  Future<void> _escanear() async {
    final punto = await _gps();
    if (!mounted) return;
    final codigo = await Navigator.push<String>(
      context,
      MaterialPageRoute(builder: (_) => const _ScannerPage()),
    );
    if (codigo == null || codigo.isEmpty) return;
    await _guardar(codigo, punto);
    if (punto == null && mounted) {
      setState(() => aviso = 'Escaneo guardado sin GPS. Activa el permiso de ubicacion.');
    }
  }

  Future<void> _manual() async {
    final control = TextEditingController();
    final codigo = await showDialog<String>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Codigo de la pieza'),
        content: TextField(controller: control, decoration: const InputDecoration(hintText: 'Ej. FIL-001')),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context), child: const Text('Cancelar')),
          FilledButton(onPressed: () => Navigator.pop(context, control.text), child: const Text('Guardar')),
        ],
      ),
    );
    control.dispose();
    if (codigo == null) return;
    final punto = await _gps();
    await _guardar(codigo, punto);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(nombre.isEmpty ? 'Escaneos' : nombre),
        actions: [
          IconButton(onPressed: ocupado ? null : _sincronizar, icon: const Icon(Icons.sync)),
          IconButton(onPressed: widget.onSalir, icon: const Icon(Icons.logout)),
        ],
      ),
      body: Column(
        children: [
          if (aviso.isNotEmpty)
            Padding(
              padding: const EdgeInsets.all(12),
              child: Text(aviso, style: const TextStyle(color: Color(0xFFE10600))),
            ),
          Expanded(
            child: filas.isEmpty
                ? const Center(child: Text('Aun no hay escaneos.'))
                : ListView.separated(
                    itemCount: filas.length,
                    separatorBuilder: (_, __) => const Divider(height: 1),
                    itemBuilder: (_, i) {
                      final fila = filas[i];
                      final lat = fila['lat'];
                      final lng = fila['lng'];
                      final synced = fila['synced'] == 1;
                      return ListTile(
                        title: Text(fila['codigo']?.toString() ?? ''),
                        subtitle: Text(
                          lat == null ? 'Sin GPS' : 'GPS ${lat.toString()}, ${lng.toString()}',
                        ),
                        trailing: Icon(synced ? Icons.cloud_done : Icons.cloud_off, color: synced ? Colors.green : Colors.orange),
                      );
                    },
                  ),
          ),
        ],
      ),
      floatingActionButton: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          FloatingActionButton.small(heroTag: 'manual', onPressed: _manual, child: const Icon(Icons.edit)),
          const SizedBox(height: 8),
          FloatingActionButton(heroTag: 'scan', onPressed: _escanear, child: const Icon(Icons.qr_code_scanner)),
        ],
      ),
    );
  }
}

class _ScannerPage extends StatefulWidget {
  const _ScannerPage();

  @override
  State<_ScannerPage> createState() => _ScannerPageState();
}

class _ScannerPageState extends State<_ScannerPage> {
  bool enviado = false;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Escanear codigo')),
      body: MobileScanner(
        onDetect: (captura) {
          if (enviado) return;
          final valor = captura.barcodes.isEmpty ? null : captura.barcodes.first.rawValue;
          if (valor == null || valor.isEmpty) return;
          enviado = true;
          Navigator.pop(context, valor);
        },
      ),
    );
  }
}
