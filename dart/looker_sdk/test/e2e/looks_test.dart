import 'package:test/test.dart';
import 'package:looker_sdk/index.dart';
import './utils.dart';

void main() {
  LookerSDK sdk;
  setUp(() async {
    sdk = await utils.getSdk();
  });

  test('looks', () async {
    var looks = await sdk.ok(sdk.allLooks());
    if (looks.isNotEmpty) {
      var result = await sdk.ok(sdk.runLook(looks[looks.length - 1].id, 'png'));
      expect(result.runtimeType.toString(), equals('Uint8List'));
      result = await sdk.ok(sdk.runLook(looks[looks.length - 1].id, 'csv'));
      expect(result.runtimeType.toString(), equals('String'));
    } else {
      print('No looks to run tests against');
    }
  }, timeout: Timeout(Duration(minutes: 5)));
}
