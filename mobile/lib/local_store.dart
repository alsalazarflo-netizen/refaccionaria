import 'package:path/path.dart' as p;
import 'package:shared_preferences/shared_preferences.dart';
import 'package:sqflite/sqflite.dart';

class LocalStore {
  Database? _db;

  Future<Database> get db async {
    if (_db != null) return _db!;
    final dir = await getDatabasesPath();
    _db = await openDatabase(
      p.join(dir, 'refaccionaria.db'),
      version: 1,
      onCreate: (database, _) async {
        await database.execute('''
          create table escaneos (
            client_id text primary key,
            remote_id text,
            codigo text not null,
            lat real,
            lng real,
            created_at text not null,
            synced integer not null default 0
          )
        ''');
        await database.execute('''
          create table pendientes (
            id integer primary key autoincrement,
            nombre text not null,
            apellido text not null,
            correo text not null,
            password text not null
          )
        ''');
      },
    );
    return _db!;
  }

  Future<void> guardarSesion(String token, Map<String, dynamic> usuario) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('token', token);
    await prefs.setString('usuario', usuario.toString());
    await prefs.setString('nombre', '${usuario['nombre'] ?? ''} ${usuario['apellido'] ?? ''}'.trim());
    await prefs.setString('correo', usuario['correo']?.toString() ?? '');
  }

  Future<String?> token() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString('token');
  }

  Future<String?> nombre() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString('nombre');
  }

  Future<void> cerrarSesion() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('token');
    await prefs.remove('nombre');
    await prefs.remove('correo');
  }

  Future<void> guardarEscaneo({
    required String clientId,
    required String codigo,
    double? lat,
    double? lng,
    required String createdAt,
  }) async {
    final database = await db;
    await database.insert('escaneos', {
      'client_id': clientId,
      'codigo': codigo,
      'lat': lat,
      'lng': lng,
      'created_at': createdAt,
      'synced': 0,
    });
  }

  Future<void> marcarEscaneo(String clientId, String? remoteId) async {
    final database = await db;
    await database.update(
      'escaneos',
      {'synced': 1, 'remote_id': remoteId},
      where: 'client_id = ?',
      whereArgs: [clientId],
    );
  }

  Future<void> guardarRemoto(Map<String, dynamic> row) async {
    final database = await db;
    await database.insert('escaneos', {
      'client_id': row['client_id'],
      'remote_id': row['id'],
      'codigo': row['codigo'],
      'lat': row['lat'],
      'lng': row['lng'],
      'created_at': row['created_at'],
      'synced': 1,
    }, conflictAlgorithm: ConflictAlgorithm.replace);
  }

  Future<List<Map<String, Object?>>> escaneos() async {
    final database = await db;
    return database.query('escaneos', orderBy: 'created_at desc');
  }

  Future<List<Map<String, Object?>>> escaneosPendientes() async {
    final database = await db;
    return database.query('escaneos', where: 'synced = 0');
  }

  Future<void> guardarRegistroPendiente({
    required String nombre,
    required String apellido,
    required String correo,
    required String password,
  }) async {
    final database = await db;
    await database.insert('pendientes', {
      'nombre': nombre,
      'apellido': apellido,
      'correo': correo,
      'password': password,
    });
  }

  Future<List<Map<String, Object?>>> registrosPendientes() async {
    final database = await db;
    return database.query('pendientes');
  }

  Future<void> borrarRegistro(int id) async {
    final database = await db;
    await database.delete('pendientes', where: 'id = ?', whereArgs: [id]);
  }
}
