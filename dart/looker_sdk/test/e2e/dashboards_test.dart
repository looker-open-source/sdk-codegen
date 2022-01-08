import 'package:test/test.dart';
import 'package:looker_sdk/looker_sdk.dart';
import './utils.dart';

void main() {
  LookerSDK sdk;
  setUp(() async {
    sdk = await utils.getSdk();
  });

  test('get dashboards', () async {
    var dashboards = await sdk.ok(sdk.all_dashboards());
    expect(dashboards.length, isNonNegative);
    dashboards.forEach((dashboard) => expect(dashboard.id, isNotNull));
    if (dashboards.isNotEmpty) {
      var dashboard = await sdk.ok(sdk.dashboard(dashboards[0].id));
      expect(dashboard.id, isNotNull);
    } else {
      print('No dashboards to run tests against');
    }
  });
}
