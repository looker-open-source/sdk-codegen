package com.google.looker.test;

import static org.junit.jupiter.api.Assertions.assertTrue;

import com.google.looker.client.LookerGrpcClient;
import com.google.looker.grpc.services.AllUsersRequest;
import com.google.looker.grpc.services.AllUsersStreamResponse;
import com.google.looker.grpc.services.LookerStreamingServiceGrpc;
import com.google.looker.grpc.services.User;
import io.grpc.stub.StreamObserver;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.TimeUnit;
import javax.net.ssl.SSLException;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class StreamingUserTests {

  final private static Logger LOGGER = LoggerFactory.getLogger(StreamingUserTests.class);
  final private LookerGrpcClient lookerGrpcClient = new LookerGrpcClient();
  private LookerStreamingServiceGrpc.LookerStreamingServiceStub stub;

  @BeforeEach
  void login() throws SSLException {
    lookerGrpcClient.login();
    stub = lookerGrpcClient.getLookerStreamingServiceStub();
  }

  @AfterEach
  void logout() throws SSLException {
    stub = null;
    lookerGrpcClient.logout();
  }

  @Test
  void allUsers() throws InterruptedException {
    LOGGER.debug("run allUsers test");
    CountDownLatch latch = new CountDownLatch(1);
    List<User> users = new ArrayList<>();
    int[] countChunks = {0};
    StreamObserver<AllUsersStreamResponse> responseObserver = new StreamObserver<AllUsersStreamResponse>() {

      @Override
      public void onNext(AllUsersStreamResponse value) {
        countChunks[0] += 1;
        users.add(value.getResult());
      }

      @Override
      public void onError(Throwable t) {
      }

      @Override
      public void onCompleted() {
        latch.countDown();
      }
    };
    stub.allUsers(
        AllUsersRequest.newBuilder().build(),
        responseObserver
    );
    latch.await(3, TimeUnit.SECONDS);
    assertTrue(countChunks[0] > 0);
    assertTrue(users.size() > 0);
  }

}
