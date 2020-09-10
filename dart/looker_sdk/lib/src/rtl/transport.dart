import 'dart:convert';
import 'dart:mirrors';
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

  SDKResponse.createFromHttpResponse(http.Response response,
      [Function<T>() create]) {
    var statusCode = response.statusCode;
    var statusText = response.reasonPhrase;
    var responseBody = jsonDecode(response.body);
    print('Response status: ${statusCode}');
    // print('Response body: ${responseBody}');
    print('Response body is Map: ${responseBody is Map}');
    print('Response body is List: ${responseBody is List}');
    _ok = statusCode >= 200 && statusCode <= 299;
    _statusCode = statusCode;
    _statusText = statusText;
    _statusCode = statusCode;
    if (result == null) {
      _result = responseBody as T;
    } else {
      _result = result;
      var reflectedClass = reflect(_result);
      reflectedClass.invoke(Symbol('populateFromMap'), [responseBody]);
    }
  }

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
}

class Transport {
  ApiSettings settings;

  Transport(ApiSettings this.settings) {}

  Future<SDKResponse> rawRequest(HttpMethod method, String path,
      Map queryParams, Map body, Map options) async {
    throw UnimplementedError("rawRequest");
  }

  Future<SDKResponse<T>> request<T>(HttpMethod method, String path,
      [Map queryParams,
      Map body,
      Map<String, String> headers,
      // T responseInstance,
      Function<T>() create]) async {
    print(">>>>> invoke $path");
    switch (method) {
      case HttpMethod.get:
        print(path);
        print(headers);
        var response =
            await http.get("${settings.baseUrl}$path", headers: headers);
        return SDKResponse<T>.createFromHttpResponse(
            response, responseInstance);
        break;
      case HttpMethod.post:
        print(json.encode(body));
        http.Response response = await http.post("${settings.baseUrl}$path",
            headers: headers, body: body);
        return SDKResponse<T>.createFromHttpResponse(
            response, responseInstance);
        break;
      case HttpMethod.patch:
        throw UnimplementedError("patch");
        break;
      case HttpMethod.delete:
        throw UnimplementedError("delete");
        break;
      case HttpMethod.put:
        throw UnimplementedError("put");
        break;
      case HttpMethod.head:
        throw UnimplementedError("head");
        break;
    }
    throw UnimplementedError("how did I get hear");
  }

  Future<SDKResponse> stream(Function callback, HttpMethod method, String path,
      [Map queryParams, Map body, Map options]) async {
    throw UnimplementedError("stream");
  }
}
