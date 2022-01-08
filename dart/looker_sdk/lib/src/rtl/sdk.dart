import 'package:looker_sdk/looker_sdk.dart';

class Sdk {
  static LookerSDK _sdk;

  static Future<LookerSDK> createSdk(Map config) async {
    var settings = ApiSettings.fromMap(config);
    var transport = Transport(settings);
    var authSession = AuthSession(transport);
    await authSession.login();
    _sdk = LookerSDK(authSession);
    return _sdk;
  }

  static LookerSDK getSdk() {
    if (_sdk == null) {
      throw Exception('SDK not initialized');
    }
    return _sdk;
  }
}
