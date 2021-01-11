package com.google.looker.server.rtl;

import io.grpc.Status;

public class LookerClientResponse {

  private Status status;
  private boolean success;
  private String jsonResponse;

  public LookerClientResponse(Status status) {
    this.status = status;
  }

  public LookerClientResponse(int statusCode,String jsonResponse) {
    generateStatus(statusCode);
    this.jsonResponse = jsonResponse;
  }

  public LookerClientResponse(int statusCode) {
    generateStatus(statusCode);
  }

  public Status getStatus() {
    return status;
  }

  public String getJsonResponse() {
    return jsonResponse;
  }

  private void generateStatus(int statusCode) {
    if (statusCode < 200) {
      status = Status.INTERNAL;
    } else if (statusCode > 299) {
      if (statusCode == 404 || statusCode == 401 || statusCode == 403) {
        status = Status.NOT_FOUND;
      } else {
        status = Status.INTERNAL;
      }
    }
  }
}
