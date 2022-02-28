package com.google.looker.server.rtl;

import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;
import com.google.looker.common.Constants;
import io.grpc.Status;
import java.io.IOException;
import java.lang.reflect.Type;
import java.security.KeyManagementException;
import java.security.NoSuchAlgorithmException;
import java.util.Map;
import okhttp3.FormBody;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.Response;
import okhttp3.ResponseBody;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class LoginTransport implements Transport {

  final private static Logger LOGGER = LoggerFactory.getLogger(LoginTransport.class);

  public LookerClientResponse request(
      String apiVersion,
      HttpMethod method,
      String path,
      String inputJson) {
    LOGGER.debug(inputJson);
    Gson gson = new Gson();
    Type inputDataMapType = new TypeToken<Map<String, Object>>() {}.getType();
    Map<String, Object> inputData = gson.fromJson(inputJson, inputDataMapType);
    FormBody.Builder builder = new FormBody.Builder();
    inputData.forEach((k, v) -> builder.add(k, (String) v));
    String fullPath = String.format("%s/api/%s%s", System.getProperty(Constants.LOOKER_BASE_URL), apiVersion, path);
    LOGGER.debug("fullpath=" + fullPath);
    Request request = new Request.Builder()
        .url(fullPath)
        .addHeader("Content-Type", "application/x-www-form-urlencoded; charset=UTF-8")
        .addHeader("x-looker-appid", "Looker GRPC Proxy Server")
        .post(builder.build())
        .build();
    try {
      Response response = getHttpClient().newCall(request).execute();
      int statusCode = response.code();
      if (statusCode > 199 && statusCode < 300) {
        ResponseBody responseBody = response.body();
        if (responseBody == null) {
          LOGGER.error("login response has no body");
          return new LookerClientResponse(Status.NOT_FOUND);
        } else {
          String loginResponse = String.format("{\"result\":%s}", responseBody.string());
          LOGGER.debug("login request succeeded " + loginResponse);
          return new LookerClientResponse(statusCode, loginResponse);
        }
      } else {
        LOGGER.debug("login request failed: " + statusCode);
        return new LookerClientResponse(statusCode);
      }
    } catch (IOException | KeyManagementException | NoSuchAlgorithmException e) {
      LOGGER.error("login request failed", e);
      return new LookerClientResponse(Status.INTERNAL);
    }
  }

  @Override
  public OkHttpClient getHttpClient() throws KeyManagementException, NoSuchAlgorithmException {
    return TransportFactory.instance().getDefaultTransport().getHttpClient();
  }

}
