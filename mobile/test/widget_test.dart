import 'package:flutter_test/flutter_test.dart';
import 'package:refaccionaria_movil/main.dart';

void main() {
  test('la app esta definida', () {
    const app = RefaccionariaApp();
    expect(app, isA<RefaccionariaApp>());
  });
}
