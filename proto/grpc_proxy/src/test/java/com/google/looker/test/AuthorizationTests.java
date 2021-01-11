package com.google.looker.test;

import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;

import com.google.looker.client.LookerGrpcClient;
import com.google.looker.common.Constants;
import com.google.looker.grpc.services.AccessToken;
import com.google.looker.grpc.services.LoginRequest;
import com.google.looker.grpc.services.LoginResponse;
import com.google.looker.grpc.services.LookerServiceGrpc;
import javax.net.ssl.SSLException;
import org.junit.jupiter.api.Test;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class AuthorizationTests {

  final private static Logger LOGGER = LoggerFactory.getLogger(AuthorizationTests.class);

  @Test
  void rawLogin() throws SSLException {
    LOGGER.debug("run login test");
    LookerGrpcClient lookerGrpcClient = new LookerGrpcClient();
    LookerServiceGrpc.LookerServiceBlockingStub stub = lookerGrpcClient.getLookerServiceBlockingStub();
    LoginResponse loginResponse = stub.login(
        LoginRequest
            .newBuilder()
            .setClientId(System.getProperty(Constants.LOOKER_CLIENT_ID))
            .setClientSecret(System.getProperty(Constants.LOOKER_CLIENT_SECRET))
            .build()
    );
    AccessToken accessToken = loginResponse.getResult();
    assertNotNull(accessToken);
    assertNotNull(accessToken.getAccessToken());
  }

  @Test
  void clientLogout() throws SSLException {
    LOGGER.debug("run login test");
    LookerGrpcClient lookerGrpcClient = new LookerGrpcClient();
    lookerGrpcClient.login();
    assertNotNull(lookerGrpcClient.getAccessToken());
    lookerGrpcClient.logout();
    assertNull(lookerGrpcClient.getAccessToken());
  }

}
