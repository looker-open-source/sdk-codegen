package com.google.looker.server.rtl;

public class LookerClient {
  final private String apiVersion;

  public LookerClient(String apiVersion) {
    this.apiVersion = apiVersion;
  }

  public LookerClientResponse get(String path, String inputJson) {
    return TransportFactory.instance().getTransport(path).request(apiVersion, Transport.HttpMethod.GET, path, inputJson);
  }

  public LookerClientResponse post(String path, String inputJson) {
    return TransportFactory.instance().getTransport(path).request(apiVersion, Transport.HttpMethod.POST, path, inputJson);
  }

  public LookerClientResponse put(String path, String inputJson) {
    return TransportFactory.instance().getTransport(path).request(apiVersion, Transport.HttpMethod.PUT, path, inputJson);
  }

  public LookerClientResponse patch(String path, String inputJson) {
    return TransportFactory.instance().getTransport(path).request(apiVersion, Transport.HttpMethod.PATCH, path, inputJson);
  }

  public LookerClientResponse delete(String path, String inputJson) {
    return TransportFactory.instance().getTransport(path).request(apiVersion, Transport.HttpMethod.DELETE, path, inputJson);
  }

}
