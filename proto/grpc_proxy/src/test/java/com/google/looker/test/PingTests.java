package com.google.looker.test;

import static org.junit.jupiter.api.Assertions.assertEquals;

import com.google.looker.client.LookerGrpcClient;
import com.google.looker.grpc.services.PingServiceGrpc;
import com.google.looker.server.rtl.PingRequest;
import javax.net.ssl.SSLException;
import org.junit.jupiter.api.Test;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class PingTests {

  final private static Logger LOGGER = LoggerFactory.getLogger(PingTests.class);

  @Test
  void ping() throws SSLException {
    LOGGER.debug("run ping test");
    LookerGrpcClient lookerGrpcClient = new LookerGrpcClient();
    PingServiceGrpc.PingServiceBlockingStub stub = lookerGrpcClient.getPingBlockingStub();
    boolean active = stub.ping((PingRequest.newBuilder().build())).getActive();
    assertEquals(true, active);
  }

}
