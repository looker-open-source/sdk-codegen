import 'package:dotenv/dotenv.dart' show load, env;
import 'package:looker_sdk/looker_sdk.dart';

class Utils {
  Utils() {
    load();
  }

  Map _credentials() {
    return {
      'client_id': env['CLIENT_ID'],
      'client_secret': env['CLIENT_SECRET']
    };
  }

  Future<LookerSDK> getSdk() {
    return Sdk.createSdk({
      'base_url': env['URL'],
      'verify_ssl': false,
      'credentials_callback': _credentials
    });
  }
}

Utils utils = Utils();
