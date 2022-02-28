package com.google.looker.server.rtl;

import com.google.looker.common.Constants;
import io.grpc.Status;
import java.io.IOException;
import java.security.KeyManagementException;
import java.security.NoSuchAlgorithmException;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.Response;
import okhttp3.ResponseBody;
import org.apache.commons.lang3.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class LogoutTransport implements Transport {

  final private static Logger LOGGER = LoggerFactory.getLogger(LogoutTransport.class);

  public LookerClientResponse request(
      String apiVersion,
      HttpMethod method,
      String path,
      String inputJson) {
    String accessToken = Constants.CLIENT_ID_CONTEXT_KEY.get();
    if (accessToken == null || StringUtils.isBlank(accessToken)) {
      LOGGER.debug("logout request ignored because no access token");
      // But we dont care
      return new LookerClientResponse(200);
    } else {
      LOGGER.debug(inputJson);
      String fullPath = String.format("%s/api/%s%s", System.getProperty(Constants.LOOKER_BASE_URL), apiVersion, path);
      LOGGER.debug("fullpath=" + fullPath);
      Request request = new Request.Builder()
          .addHeader("Content-Type", "application/json")
          .addHeader("Authorization", "Bearer " + accessToken)
          .addHeader("x-looker-appid", "Looker GRPC Proxy Server")
          .url(fullPath)
          .delete()
          .build();
      try {
        Response response = getHttpClient().newCall(request).execute();
        int statusCode = response.code();
        if (statusCode > 199 && statusCode < 300) {
          ResponseBody responseBody = response.body();
          LOGGER.debug("logout request succeeded");
          if (responseBody == null) {
            return new LookerClientResponse(statusCode);
          } else {
            String logoutResponse = String.format("{\"result\":\"%s\"}", responseBody.string());
            return new LookerClientResponse(statusCode, logoutResponse);
          }
        } else {
          LOGGER.debug("logout request failed: " + statusCode);
          // But we dont care
          return new LookerClientResponse(200);
        }
      } catch (IOException | KeyManagementException | NoSuchAlgorithmException e) {
        LOGGER.error("logout request failed", e);
        return new LookerClientResponse(Status.INTERNAL);
      }

    }
  }

  @Override
  public OkHttpClient getHttpClient() throws KeyManagementException, NoSuchAlgorithmException {
    return TransportFactory.instance().getDefaultTransport().getHttpClient();
  }

}
