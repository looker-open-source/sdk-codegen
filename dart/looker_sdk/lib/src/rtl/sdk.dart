import 'package:looker_sdk/looker_rtl.dart';

class Sdk {
  static Looker31SDK _31Sdk;
  static Looker40SDK _40Sdk;

  static Future<Looker31SDK> create31Sdk(Map config) async {
    var settings = ApiSettings.fromMap(apiVersion31, config);
    var transport = Transport(settings);
    var authSession = AuthSession(transport);
    await authSession.login();
    _31Sdk = Looker31SDK(authSession);
    return _31Sdk;
  }

  static Looker31SDK get31Sdk() {
    if (_31Sdk == null) {
      throw Exception('SDK not initialized');
    }
    return _31Sdk;
  }

  static Future<Looker40SDK> create40Sdk(Map config) async {
    var settings = ApiSettings.fromMap(apiVersion40, config);
    var transport = Transport(settings);
    var authSession = AuthSession(transport);
    await authSession.login();
    _40Sdk = Looker40SDK(authSession);
    return _40Sdk;
  }

  static Looker40SDK get40dk() {
    if (_40Sdk == null) {
      throw Exception('SDK not initialized');
    }
    return _40Sdk;
  }
}
