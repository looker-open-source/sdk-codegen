import 'constants.dart';

class ApiSettings {
  String _version;
  String _baseUrl;
  bool _verifySsl;
  int _timeout;
  String _agentTag;
  Function _credentialsCallback;

  ApiSettings.fromMap(String version, Map settings) {
    if (version != apiVersion31 && version != apiVersion40) {
      throw 'Invalid version: ${version}';
    }
    _version = version;
    _baseUrl = settings.containsKey('base_url') ? settings['base_url'] : '';
    _verifySsl =
        settings.containsKey('verify_ssl') ? settings['verify_ssl'] : true;
    _timeout =
        settings.containsKey('timeout') ? settings['timeout'] : defaultTimeout;
    _agentTag = settings.containsKey('agent_tag')
        ? settings['agent_tag']
        : '$agentPrefix $lookerVersion';
    _credentialsCallback = settings.containsKey(('credentials_callback'))
        ? settings['credentials_callback']
        : null;
  }

  bool isConfigured() {
    return _baseUrl != null;
  }

  void readConfig(String section) {
    throw UnimplementedError('readConfig');
  }

  String get version {
    return _version;
  }

  String get baseUrl {
    return _baseUrl;
  }

  bool get verifySsl {
    return _verifySsl;
  }

  int get timeout {
    return _timeout;
  }

  String get agentTag {
    return _agentTag;
  }

  Function get credentialsCallback {
    return _credentialsCallback;
  }
}
