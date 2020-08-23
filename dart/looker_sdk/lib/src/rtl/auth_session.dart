import 'package:looker_sdk/looker_rtl.dart';

import 'transport.dart';

class AuthSession {
  Transport transport;
  AuthToken _authToken = AuthToken();
  String _apiPath = "/api/$defaultApiVersion";

  AuthSession(Transport this.transport) {}

  get apiPath {
    return _apiPath;
  }

  Map<String, String> authenticate() {
    Map<String, String> headers = {};
    if (isAuthenticated()) {
      headers["Authorization"] = "Bearer ${_authToken.accessToken.accessToken}";
    }
    return headers;
  }

  bool isAuthenticated() {
    return _authToken.isActive();
  }

  Future<AuthToken> getToken() async {
    if (!this.isAuthenticated()) {
      await this.login();
    }
    return _authToken;
  }

  Future<void> login([dynamic sudoId]) async {
    if (sudoId != null) {
      throw UnimplementedError("support for sudo");
    }
    if (!this._authToken.isActive()) {
      this.reset();
      if (transport.settings.credentialsCallback == null) {
        throw Exception("credentials callback required");
      }
      Map credentials = transport.settings.credentialsCallback();
      if (credentials["client_id"] == null ||
          credentials["client_secret"] == null) {
        throw Exception("credentials required");
      }
      AuthAccessToken token = await ok(transport.request(HttpMethod.post,
          "/login", null, credentials, null, AuthAccessToken()));
      this._authToken.setAccessToken(token);
    }
  }

  Future<bool> logout() async {
    try {
      await ok(transport.request(HttpMethod.delete, "/logout", null, null,
          {"Authorization": "Bearer ${_authToken.accessToken.accessToken}"}));
      return true;
    } catch (exception) {
      return false;
    } finally {
      reset();
    }
  }

  bool isSudo() {
    throw UnimplementedError("support for sudo");
  }

  reset() {
    this._authToken.reset();
  }

  Future<T> ok<T>(Future<SDKResponse<T>> future) async {
    SDKResponse<T> response = await future;
    if (response.ok) {
      return response.result;
    } else {
      throw Exception(response);
    }
  }
}
