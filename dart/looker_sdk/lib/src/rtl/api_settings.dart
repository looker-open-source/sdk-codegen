import 'constants.dart';

class ApiSettings {
  Map settings;
  String baseUrl;
  bool verifySsl;
  int timeout;
  String agentTag;
  Function credentialsCallback;

  ApiSettings(
      {this.baseUrl = '',
      this.verifySsl = true,
      this.timeout = defaultTimeout,
      this.agentTag = "$agentPrefix $lookerVersion",
      this.credentialsCallback}) {}

  ApiSettings.fromMap(Map this.settings) {
    baseUrl = settings.containsKey('base_url') ? settings['base_url'] : '';
    verifySsl =
        settings.containsKey('verify_ssl') ? settings['verify_ssl'] : true;
    timeout =
        settings.containsKey('timeout') ? settings['timeout'] : defaultTimeout;
    agentTag = settings.containsKey('agent_tag')
        ? settings['agent_tag']
        : "$agentPrefix $lookerVersion";
    credentialsCallback = settings.containsKey(("credentials_callback"))
        ? settings["credentials_callback"]
        : null;
  }

  bool isConfigured() {
    return baseUrl != null;
  }

  readConfig(String section) {
    throw UnimplementedError("readConfig");
  }
}
