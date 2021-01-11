package com.google.looker.server;

import com.google.looker.common.Constants;
import com.google.looker.server.rtl.auth.AuthorizationInterceptor;
import com.google.looker.server.rtl.ping.PingServiceImpl;
import com.google.looker.server.sdk.LookerServiceImpl;
import com.google.looker.server.sdk.LookerStreamingServiceImpl;
import io.github.cdimascio.dotenv.Dotenv;
import io.grpc.ServerBuilder;
import java.io.File;
import java.io.IOException;
import org.apache.commons.lang3.math.NumberUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class Server {

  static {
    Dotenv dotenv = Dotenv.load();
    dotenv.entries().forEach(e -> System.setProperty(e.getKey(), e.getValue()));
  }

  private static final Logger LOGGER = LoggerFactory.getLogger(Server.class);

  public void run() throws IOException, InterruptedException {
    System.out.println("Server starting up");
    io.grpc.Server server = ServerBuilder
        .forPort(NumberUtils.toInt(System.getProperty(Constants.GRPC_SERVER_LISTEN_PORT)))
        .addService(new PingServiceImpl())
        .addService(new LookerServiceImpl())
        .addService(new LookerStreamingServiceImpl())
        .useTransportSecurity(
            new File(System.getProperty(Constants.CERT_CHAIN_FILE)),
            new File(System.getProperty(Constants.PRIVATE_KEY_FILE))
        )
        .intercept(new AuthorizationInterceptor())
        .build();
    server.start();
    LOGGER.info("Server running");
    Runtime.getRuntime().addShutdownHook(new Thread(() -> {
      LOGGER.info("Server shutdown request received");
      server.shutdown();
      LOGGER.info("Server shutdown");
    }));
    server.awaitTermination();
  }

  public static void main(String[] args) throws IOException, InterruptedException {
    try {
      new Server().run();
    } catch (Exception e) {
      e.printStackTrace();
    }
  }
}
