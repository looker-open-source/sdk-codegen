package com.google.looker.server.rtl;

import java.security.KeyManagementException;
import java.security.NoSuchAlgorithmException;
import okhttp3.OkHttpClient;

public interface Transport {
  enum HttpMethod {
    GET,
    POST,
    PUT,
    PATCH,
    DELETE
  }
  LookerClientResponse request(
      String apiVersion,
      HttpMethod method,
      String path,
      String inputJson);

  OkHttpClient getHttpClient() throws NoSuchAlgorithmException, KeyManagementException;
}
