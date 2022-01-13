import '../../index.dart';

class AuthSession {
  Transport transport;
  final AuthToken _authToken = AuthToken();
  String _apiPath;

  AuthSession(this.transport) {
    _apiPath = '/api/${transport.settings.version}';
  }

  String get apiPath {
    return _apiPath;
  }

  Map<String, String> authenticate() {
    var headers = <String, String>{};
    if (isAuthenticated()) {
      headers['Authorization'] = 'Bearer ${_authToken.accessToken.accessToken}';
    }
    return headers;
  }

  bool isAuthenticated() {
    return _authToken.isActive();
  }

  Future<AuthToken> getToken() async {
    if (!isAuthenticated()) {
      await login();
    }
    return _authToken;
  }

  Future<void> login([dynamic sudoId]) async {
    if (sudoId != null) {
      throw UnimplementedError('support for sudo');
    }
    if (!_authToken.isActive()) {
      reset();
      if (transport.settings.credentialsCallback == null) {
        throw Exception('credentials callback required');
      }
      Map credentials = transport.settings.credentialsCallback();
      if (credentials['client_id'] == null ||
          credentials['client_secret'] == null) {
        throw Exception('credentials required');
      }

      AuthAccessToken jsonHandler(dynamic json, String contentType) {
        return AuthAccessToken.fromResponse(json, contentType);
      }

      var token = await ok(transport.request(jsonHandler, HttpMethod.post,
          '/api/${transport.settings.version}/login', null, credentials, null));
      _authToken.setAccessToken(token);
    }
  }

  Future<bool> logout() async {
    dynamic jsonHandler(dynamic json, String contentType) {
      return json;
    }

    try {
      await ok(transport.request(
          jsonHandler,
          HttpMethod.delete,
          '/logout',
          null,
          null,
          {'Authorization': 'Bearer ${_authToken.accessToken.accessToken}'}));
      return true;
    } catch (exception) {
      return false;
    } finally {
      reset();
    }
  }

  bool isSudo() {
    throw UnimplementedError('support for sudo');
  }

  void reset() {
    _authToken.reset();
  }

  Future<T> ok<T>(Future<SDKResponse<T>> future) async {
    var response = await future;
    if (response.ok) {
      return response.result;
    } else {
      throw Exception(response);
    }
  }
}
