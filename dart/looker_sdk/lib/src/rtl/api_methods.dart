import 'auth_session.dart';
import 'transport.dart';

class APIMethods {
  AuthSession _authSession;

  APIMethods(this._authSession) {}

  ok(response) {
    throw UnimplementedError("ok");
  }

  // Future<SDKResponse<T>> request<T>(HttpMethod method, String path,
  //     [Map queryParams,
  //     Map body,
  //     Map<String, String> headers,
  //     T responseInstance]) async {

  Future<SDKResponse<T>> get<T>(String path,
      [dynamic queryParams, dynamic body, T responseInstance]) async {
    var headers = await _getHeaders();
    return _authSession.transport.request(
        HttpMethod.get,
        "${_authSession.apiPath}$path",
        queryParams,
        body,
        headers,
        responseInstance);
  }

  Future<SDKResponse> head(String path,
      [dynamic queryParams, dynamic body]) async {
    var headers = await _getHeaders();
    return _authSession.transport.request(HttpMethod.head,
        "${_authSession.apiPath}$path", queryParams, body, headers);
  }

  Future<SDKResponse<T>> delete<T>(String path,
      [dynamic queryParams, dynamic body, T responseInstance]) async {
    var headers = await _getHeaders();
    return _authSession.transport.request(
        HttpMethod.delete,
        "${_authSession.apiPath}$path",
        queryParams,
        body,
        headers,
        responseInstance);
  }

  Future<SDKResponse<T>> post<T>(String path,
      [dynamic queryParams, dynamic body, T responseInstance]) async {
    var headers = await _getHeaders();
    return _authSession.transport.request(
        HttpMethod.post,
        "${_authSession.apiPath}$path",
        queryParams,
        body,
        headers,
        responseInstance);
  }

  Future<SDKResponse<T>> put<T>(String path,
      [dynamic queryParams, dynamic body, T responseInstance]) async {
    var headers = await _getHeaders();
    return _authSession.transport.request(
        HttpMethod.put,
        "${_authSession.apiPath}$path",
        queryParams,
        body,
        headers,
        responseInstance);
  }

  Future<SDKResponse<T>> patch<T>(String path,
      [dynamic queryParams, dynamic body, T responseInstance]) async {
    var headers = await _getHeaders();
    return _authSession.transport.request(
        HttpMethod.patch,
        "${_authSession.apiPath}$path",
        queryParams,
        body,
        headers,
        responseInstance);
  }

  Future<Map<String, String>> _getHeaders() async {
    Map<String, String> headers = {
      "x-looker-appid": _authSession.transport.settings.agentTag
    };
    headers.addAll(_authSession.authenticate());
    return headers;
  }
}
