package com.google.looker.server.rtl;

import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;
import com.google.looker.common.Constants;
import io.grpc.Status;
import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.lang.reflect.Type;
import java.net.URLEncoder;
import java.security.KeyManagementException;
import java.security.NoSuchAlgorithmException;
import java.util.HashMap;
import java.util.Map;
import javax.net.ssl.SSLContext;
import javax.net.ssl.SSLSocketFactory;
import javax.net.ssl.TrustManager;
import javax.net.ssl.X509TrustManager;
import okhttp3.MediaType;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.RequestBody;
import okhttp3.Response;
import okhttp3.ResponseBody;
import org.apache.commons.lang3.ClassUtils;
import org.apache.commons.lang3.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

final public class DefaultTransport implements Transport {

  final private static Logger LOGGER = LoggerFactory.getLogger(DefaultTransport.class);

  private OkHttpClient client;

  public static final MediaType JSON
      = MediaType.parse("application/json; charset=utf-8");

  public LookerClientResponse request(
      String apiVersion,
      HttpMethod method,
      String path,
      String inputJson) {
    String accessToken = Constants.CLIENT_ID_CONTEXT_KEY.get();
    if (accessToken == null || StringUtils.isBlank(accessToken)) {
      LOGGER.debug("request ignored because no access token");
      return new LookerClientResponse(Status.NOT_FOUND);
    } else {
      Gson gson = new Gson();
      Type inputDataMapType = new TypeToken<Map<String, Object>>() {
      }.getType();
      Map<String, Object> inputData = gson.fromJson(inputJson, inputDataMapType);
      String fullPath = makePath(apiVersion, path, inputData);
      Request.Builder requestBuilder = new Request.Builder()
          .url(fullPath)
          .addHeader("Content-Type", "application/json")
          .addHeader("Authorization", "Bearer " + accessToken)
          .addHeader("x-looker-appid", "Looker GRPC Proxy Server");
      addMethod(requestBuilder, method, inputData);
      Request request = requestBuilder.build();
      try {
        Response response = getHttpClient().newCall(request).execute();
        int statusCode = response.code();
        if (statusCode > 199 && statusCode < 300) {
          // TODO do not assume json
          ResponseBody responseBody = response.body();
          if (responseBody == null) {
            LOGGER.error("response has no body");
            return new LookerClientResponse(Status.NOT_FOUND);
          } else {
            String lookerResponse = responseBody.string();
            if (!(lookerResponse.startsWith("{") || lookerResponse.startsWith("["))) {
              // TODO handle number or boolean instead of assuming string
              lookerResponse = "\"" + lookerResponse + "\"";
            }
            String defaultResponse = String.format("{\"result\":%s}", lookerResponse);
            LOGGER.debug("request succeeded " + defaultResponse);
            return new LookerClientResponse(statusCode, defaultResponse);
          }
        } else {
          LOGGER.debug("request failed: " + statusCode);
          return new LookerClientResponse(statusCode);
        }
      } catch (IOException | KeyManagementException | NoSuchAlgorithmException e) {
        LOGGER.error("login request failed", e);
        return new LookerClientResponse(Status.INTERNAL);
      }
    }
  }

  final public OkHttpClient getHttpClient()
      throws NoSuchAlgorithmException, KeyManagementException {
    if (this.client == null) {
      OkHttpClient.Builder builder = new OkHttpClient.Builder();
      if (System.getProperty(Constants.LOOKER_VERIFY_SSL).equals("false")) {
        final TrustManager[] trustAllCerts = new TrustManager[]{
            new X509TrustManager() {

              @Override
              public void checkClientTrusted(java.security.cert.X509Certificate[] chain,
                  String authType) {
              }

              @Override
              public void checkServerTrusted(java.security.cert.X509Certificate[] chain,
                  String authType) {
              }

              @Override
              public java.security.cert.X509Certificate[] getAcceptedIssuers() {
                return new java.security.cert.X509Certificate[]{};
              }
            }
        };
        final SSLContext sslContext = SSLContext.getInstance("SSL");
        sslContext.init(null, trustAllCerts, new java.security.SecureRandom());
        final SSLSocketFactory sslSocketFactory = sslContext.getSocketFactory();
        builder.sslSocketFactory(sslSocketFactory, (X509TrustManager) trustAllCerts[0])
            .hostnameVerifier((hostname, session) -> true)
        ;
      }
      this.client = builder.build();
    }
    return this.client;
  }

  public String makePath(String apiVersion, String path, Map<String, Object> inputData) {
    String fullPath = String.format("%s/api/%s%s",
        System.getProperty(Constants.LOOKER_BASE_URL),
        apiVersion,
        updatePath(path, inputData)
    );
    LOGGER.debug("fullpath=" + fullPath);
    return fullPath;
  }

  private String updatePath(String path, Map<String, Object> inputData) {
    Map<String, String> qsMap = new HashMap<>();
    StringBuilder updatedPath = new StringBuilder(path);
    for (Map.Entry<String, Object> entry : inputData.entrySet()) {
      String key = entry.getKey();
      Object value = entry.getValue();
      // TODO the handling of the body is potentially brittle. Modify generator to make it not so.
      if (!key.equals("body") &&
          value != null &&
          (value instanceof  String || ClassUtils.isPrimitiveOrWrapper(value.getClass()))) {
        String searchValue = "{" + key + "}";
        if (StringUtils.contains(updatedPath.toString(), searchValue)) {
          updatedPath = new StringBuilder(StringUtils
              .replace(updatedPath.toString(), searchValue, value.toString()));
        } else {
          qsMap.put(entry.getKey(), entry.getValue().toString());
        }
      }
    }
    if (qsMap.size() > 0) {
      String sep = "?";
      for (Map.Entry<String, String> entry : qsMap.entrySet()) {
        updatedPath.append(sep);
        updatedPath.append(entry.getKey()).append("=").append(encodeValue(entry.getValue()));
        sep = "&";
      }
    }
    return updatedPath.toString();
  }

  private String encodeValue(String value) {
    try {
      return URLEncoder.encode(value, "UTF8");
    } catch (UnsupportedEncodingException e) {
      return value;
    }
  }

  private void addMethod(Request.Builder requestBuilder, HttpMethod method, Map<String, Object> inputData) {
    switch (method) {
      case GET:
        requestBuilder.get();
        break;
      case POST:
        requestBuilder.post(createRequestBody(inputData.get("body")));
        break;
      case PUT:
        requestBuilder.put(createRequestBody(inputData.get("body")));
        break;
      case PATCH:
        requestBuilder.patch(createRequestBody(inputData.get("body")));
        break;
      case DELETE:
        requestBuilder.delete(createRequestBody(inputData.get("body")));
        break;
    }
  }

  private RequestBody createRequestBody(Object body) {
    Gson gson = new Gson();
    String jsonBody = body == null ? "{}" : gson.toJson(body);
    return RequestBody.create(jsonBody, MediaType.parse("application/json"));
  }

}
