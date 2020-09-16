import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:looker_sdk/looker_rtl.dart';
import 'api_settings.dart';

enum HttpMethod { get, head, delete, post, put, patch }

String encodeParam(dynamic param) {
  return param.toString();
}

class SDKResponse<T> {
  bool _ok;
  T _result;
  int _statusCode;
  String _statusText;
  dynamic _rawResult;

  SDKResponse(bool ok, int statusCode, String statusText,
      [dynamic result, dynamic rawResult])
      : _ok = ok,
        _statusCode = statusCode,
        _statusText = statusText,
        _result = result as T,
        _rawResult = rawResult;

  get ok {
    return _ok;
  }

  get result {
    return _result;
  }

  get statusCode {
    return _statusCode;
  }

  get statusText {
    return _statusText;
  }

  get rawResult {
    return _rawResult;
  }

  get decodedRawResult {
    return _rawResult == null ? null : json.decode(_rawResult);
  }
}

class Transport {
  ApiSettings settings;

  Transport(ApiSettings this.settings) {}

  Future<SDKResponse> rawRequest(HttpMethod method, String path,
      Map queryParams, Map body, Map options) async {
    throw UnimplementedError("rawRequest");
  }

  Future<SDKResponse<T>> request<T>(
      T Function(dynamic json) responseHandler, HttpMethod method, String path,
      [Map queryParams, dynamic body, Map<String, String> headers]) async {
    var fullPath = makePath(path, queryParams);
    switch (method) {
      case HttpMethod.get:
        var response = await http.get(fullPath, headers: headers);
        return handleResponse(response, responseHandler);
      case HttpMethod.post:
        http.Response response =
            await http.post(fullPath, headers: headers, body: body);
        return handleResponse(response, responseHandler);
      case HttpMethod.patch:
        http.Response response =
            await http.patch(fullPath, headers: headers, body: body);
        return handleResponse(response, responseHandler);
      case HttpMethod.delete:
        var response = await http.delete(fullPath, headers: headers);
        return handleResponse(response, responseHandler);
      case HttpMethod.put:
        http.Response response =
            await http.put(fullPath, headers: headers, body: body);
        return handleResponse(response, responseHandler);
      case HttpMethod.head:
        throw UnimplementedError("head");
    }
    throw UnimplementedError("how did I get here?");
  }

  String makePath(String path, [Map queryParams]) {
    var queryString = "";
    if (queryParams != null) {
      List params = [];
      queryParams.forEach((name, value) {
        if (value != null) {
          params.add(
              "${Uri.encodeComponent(name)}=${Uri.encodeComponent(value.toString())}");
        }
      });
      if (params.length > 0) {
        queryString = "?${params.join("&")}";
      }
    }
    return "${settings.baseUrl}$path$queryString";
  }

  Future<SDKResponse> stream(Function callback, HttpMethod method, String path,
      [Map queryParams, Map body, Map options]) async {
    throw UnimplementedError("stream");
  }

  SDKResponse<T> handleResponse<T>(
      http.Response response, T Function(dynamic response) responseHandler) {
    var ok = response.statusCode >= 200 && response.statusCode <= 299;
    var result = null;
    if (ok) {
      if (response.headers["content-type"] == "application/json") {
        var json = jsonDecode(response.body);
        result = responseHandler(json);
      } else {
        result = response.body;
      }
    }
    return SDKResponse(
        ok, response.statusCode, response.reasonPhrase, result, response.body);
  }
}
