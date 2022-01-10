import 'package:test/test.dart';
import 'package:looker_sdk/looker_sdk.dart';
import './utils.dart';

void main() {
  LookerSDK sdk;
  setUp(() async {
    sdk = await utils.getSdk();
  });

  test('boards', () async {
    var boards = await sdk.ok(sdk.allBoards());
    if (boards.isNotEmpty) {
      expect(boards[0].createdAt, isNotNull);
      print(boards[0].createdAt.toIso8601String());
      print(boards[0].getApiRawValue('created_at'));
    } else {
      print('No boards to run tests against');
    }
  });
}
