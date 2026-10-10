import 'package:connectivity_plus/connectivity_plus.dart';

import 'api_client.dart';
import 'local_store.dart';

class SyncService {
  SyncService(this.store, this.api);

  final LocalStore store;
  final ApiClient api;

  Future<bool> hayRed() async {
    final redes = await Connectivity().checkConnectivity();
    return redes.any((red) => red != ConnectivityResult.none);
  }

  Future<String?> sincronizar() async {
    if (!await hayRed()) return 'Sin internet. Los datos quedan en el telefono.';
    final token = await store.token();
    api.token = token;

    for (final fila in await store.registrosPendientes()) {
      try {
        await api.register(
          nombre: fila['nombre'] as String,
          apellido: fila['apellido'] as String,
          correo: fila['correo'] as String,
          password: fila['password'] as String,
        );
      } on ApiException catch (e) {
        if (!e.message.toLowerCase().contains('existe')) rethrow;
      }
      await store.borrarRegistro(fila['id'] as int);
    }

    if (api.token == null) return 'Cuenta guardada. Inicia sesion cuando tengas red para subir escaneos.';

    for (final fila in await store.escaneosPendientes()) {
      final remoto = await api.crearEscaneo({
        'client_id': fila['client_id'],
        'codigo': fila['codigo'],
        'lat': fila['lat'],
        'lng': fila['lng'],
        'created_at': fila['created_at'],
      });
      await store.marcarEscaneo(fila['client_id'] as String, remoto['id']?.toString());
    }

    final remotos = await api.escaneos();
    for (final row in remotos) {
      await store.guardarRemoto(row);
    }
    return 'Sincronizado.';
  }
}
