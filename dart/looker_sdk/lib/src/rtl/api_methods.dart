import 'dart:convert';
import 'auth_session.dart';
import 'transport.dart';

class APIMethods {
  final AuthSession _authSession;

  APIMethods(this._authSession);

  Future<T> ok<T>(Future<SDKResponse<T>> future) async {
    var response = await future;
    if (response.ok) {
      return response.result;
    } else {
      throw Exception(
          'Invalid SDK response ${response.statusCode}/${response.statusText}/${response.decodedRawResult}');
    }
  }

  Future<SDKResponse<T>> get<T>(
      T Function(dynamic responseData, String contentType) responseHandler,
      String path,
      [dynamic queryParams,
      dynamic body]) async {
    var headers = await _getHeaders();
    return _authSession.transport.request(
      responseHandler,
      HttpMethod.get,
      '${_authSession.apiPath}$path',
      queryParams,
      body,
      headers,
    );
  }

  Future<SDKResponse> head(String path,
      [dynamic queryParams, dynamic body]) async {
    var headers = await _getHeaders();
    dynamic responseHandler(dynamic responseData, String contentType) {
      return null;
    }

    return _authSession.transport.request(responseHandler, HttpMethod.head,
        '${_authSession.apiPath}$path', queryParams, body, headers);
  }

  Future<SDKResponse<T>> delete<T>(
      T Function(dynamic responseData, String contentType) responseHandler,
      String path,
      [dynamic queryParams,
      dynamic body,
      T responseInstance]) async {
    var headers = await _getHeaders();
    return _authSession.transport.request(responseHandler, HttpMethod.delete,
        '${_authSession.apiPath}$path', queryParams, body, headers);
  }

  Future<SDKResponse<T>> post<T>(
      T Function(dynamic responseData, String contentType) responseHandler,
      String path,
      [dynamic queryParams,
      dynamic body,
      T responseInstance]) async {
    var headers = await _getHeaders();
    var requestBody = body == null ? null : jsonEncode(body);
    return _authSession.transport.request(responseHandler, HttpMethod.post,
        '${_authSession.apiPath}$path', queryParams, requestBody, headers);
  }

  Future<SDKResponse<T>> put<T>(
      T Function(dynamic responseData, String contentType) responseHandler,
      String path,
      [dynamic queryParams,
      dynamic body,
      T responseInstance]) async {
    var headers = await _getHeaders();
    return _authSession.transport.request(responseHandler, HttpMethod.put,
        '${_authSession.apiPath}$path', queryParams, body, headers);
  }

  Future<SDKResponse<T>> patch<T>(
      T Function(dynamic responseData, String contentType) responseHandler,
      String path,
      [dynamic queryParams,
      dynamic body,
      T responseInstance]) async {
    var headers = await _getHeaders();
    var requestBody;
    if (body != null) {
      body.removeWhere((key, value) => value == null);
      requestBody = jsonEncode(body);
    }
    return _authSession.transport.request(responseHandler, HttpMethod.patch,
        '${_authSession.apiPath}$path', queryParams, requestBody, headers);
  }

  Future<Map<String, String>> _getHeaders() async {
    var headers = <String, String>{
      'x-looker-appid': _authSession.transport.settings.agentTag
    };
    headers.addAll(_authSession.authenticate());
    return headers;
  }
}
