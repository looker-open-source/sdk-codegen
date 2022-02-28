package com.google.looker.client;

import com.google.looker.common.BearerToken;
import com.google.looker.common.Constants;
import com.google.looker.grpc.services.AccessToken;
import com.google.looker.grpc.services.LoginRequest;
import com.google.looker.grpc.services.LoginResponse;
import com.google.looker.grpc.services.LogoutRequest;
import com.google.looker.grpc.services.LookerServiceGrpc;
import com.google.looker.grpc.services.LookerStreamingServiceGrpc;
import com.google.looker.grpc.services.PingServiceGrpc;
import io.github.cdimascio.dotenv.Dotenv;
import io.grpc.ManagedChannel;
import io.grpc.netty.shaded.io.grpc.netty.GrpcSslContexts;
import io.grpc.netty.shaded.io.grpc.netty.NettyChannelBuilder;
import java.io.File;
import javax.net.ssl.SSLException;
import org.apache.commons.lang3.math.NumberUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class LookerGrpcClient {

  static {
    Dotenv dotenv = Dotenv.load();
    dotenv.entries().forEach(e -> System.setProperty(e.getKey(), e.getValue()));
  }

  private static final Logger LOGGER = LoggerFactory.getLogger(LookerGrpcClient.class);

  private SSLException initFailure;
  private ManagedChannel channel;
  private PingServiceGrpc.PingServiceBlockingStub pingBlockingStub;
  private LookerServiceGrpc.LookerServiceBlockingStub lookerServiceBlockingStub;
  private LookerStreamingServiceGrpc.LookerStreamingServiceStub lookerStreamingServiceStub;
  private AccessToken accessTokenResult;

  public LookerGrpcClient() {
    try {
      channel = NettyChannelBuilder
          .forAddress(
              System.getProperty(Constants.GRPC_SERVER_HOST),
              NumberUtils.toInt(System.getProperty(Constants.GRPC_SERVER_LISTEN_PORT))
          )
          .sslContext(
              GrpcSslContexts
                  .forClient()
                  .trustManager(new File(System.getProperty(Constants.TRUST_MANAGER_FILE))
                  ).build())
          .build();
    } catch (SSLException e) {
      LOGGER.error("initialization failure");
      initFailure = e;
    }
  }

  public PingServiceGrpc.PingServiceBlockingStub getPingBlockingStub() throws SSLException {
    if (initFailure != null) {
      throw  initFailure;
    }
    if (pingBlockingStub == null) {
      pingBlockingStub = PingServiceGrpc
          .newBlockingStub(channel);
    }
    return pingBlockingStub;
  }

  public LookerServiceGrpc.LookerServiceBlockingStub getLookerServiceBlockingStub() throws SSLException {
    if (initFailure != null) {
      throw  initFailure;
    }
    if (lookerServiceBlockingStub == null) {
      if (accessTokenResult == null) {
        LOGGER.debug("create blocking stub WITHOUT credentials");
        lookerServiceBlockingStub = LookerServiceGrpc
            .newBlockingStub(channel);
      } else {
        LOGGER.debug("create blocking stub WITH credentials: " + accessTokenResult.getAccessToken());
        BearerToken token = new BearerToken(accessTokenResult.getAccessToken());
        lookerServiceBlockingStub = LookerServiceGrpc
            .newBlockingStub(channel)
            .withCallCredentials(token);
      }
    }
    return lookerServiceBlockingStub;
  }

  public LookerStreamingServiceGrpc.LookerStreamingServiceStub getLookerStreamingServiceStub() throws SSLException {
    if (initFailure != null) {
      throw  initFailure;
    }
    if (lookerStreamingServiceStub == null) {
      if (accessTokenResult == null) {
        LOGGER.debug("create blocking stub WITHOUT credentials");
        lookerStreamingServiceStub = LookerStreamingServiceGrpc
            .newStub(channel);
      } else {
        LOGGER.debug("create blocking stub WITH credentials: " + accessTokenResult.getAccessToken());
        BearerToken token = new BearerToken(accessTokenResult.getAccessToken());
        lookerStreamingServiceStub = LookerStreamingServiceGrpc
            .newStub(channel)
            .withCallCredentials(token);
      }
    }
    return lookerStreamingServiceStub;
  }

  public void clearAccessToken() {
    accessTokenResult = null;
    lookerServiceBlockingStub = null;
    lookerStreamingServiceStub = null;
  }

  public void login() throws SSLException {
    accessTokenResult = null;
    lookerServiceBlockingStub = null;
    lookerStreamingServiceStub = null;
    LookerServiceGrpc.LookerServiceBlockingStub stub = getLookerServiceBlockingStub();
    LoginResponse response = stub.login(
        LoginRequest
            .newBuilder()
            .setClientId(System.getProperty(Constants.LOOKER_CLIENT_ID))
            .setClientSecret(System.getProperty(Constants.LOOKER_CLIENT_SECRET))
            .build()
    );
    accessTokenResult = response.getResult();
    lookerServiceBlockingStub = null;
  }

  public void logout() throws SSLException {
    if (accessTokenResult != null) {
      LookerServiceGrpc.LookerServiceBlockingStub stub = getLookerServiceBlockingStub();
      accessTokenResult = null;
      lookerServiceBlockingStub = null;
      stub.logout(
          LogoutRequest
              .newBuilder()
              .build()
      );
    }
  }

  public String getAccessToken() {
    return accessTokenResult == null ? null: accessTokenResult.getAccessToken();
  }

  public long getAccessTokenExpires() {
    return accessTokenResult == null ? -1: accessTokenResult.getExpiresIn();
  }
}
