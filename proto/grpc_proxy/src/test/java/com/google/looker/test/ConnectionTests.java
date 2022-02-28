package com.google.looker.test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

import com.google.looker.client.LookerGrpcClient;
import com.google.looker.grpc.services.AllConnectionsRequest;
import com.google.looker.grpc.services.AllConnectionsResponse;
import com.google.looker.grpc.services.ConnectionRequest;
import com.google.looker.grpc.services.ConnectionResponse;
import com.google.looker.grpc.services.CreateConnectionRequest;
import com.google.looker.grpc.services.CreateConnectionResponse;
import com.google.looker.grpc.services.DBConnection;
import com.google.looker.grpc.services.DeleteConnectionRequest;
import com.google.looker.grpc.services.DeleteConnectionResponse;
import com.google.looker.grpc.services.LookerServiceGrpc;
import com.google.looker.grpc.services.TestConnectionRequest;
import com.google.looker.grpc.services.TestConnectionResponse;
import com.google.looker.grpc.services.UpdateConnectionRequest;
import com.google.looker.grpc.services.UpdateConnectionResponse;
import javax.net.ssl.SSLException;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class ConnectionTests {

  final private static Logger LOGGER = LoggerFactory.getLogger(ConnectionTests.class);
  final private LookerGrpcClient lookerGrpcClient = new LookerGrpcClient();
  private LookerServiceGrpc.LookerServiceBlockingStub stub;
  final private static String TEST_CONNECTION_NAME = "testconnection";

  @BeforeEach
  void login() throws SSLException {
    lookerGrpcClient.login();
    stub = lookerGrpcClient.getLookerServiceBlockingStub();
  }

  @AfterEach
  void logout() throws SSLException {
    stub = null;
    lookerGrpcClient.logout();
  }

  @Test
  void connections() throws SSLException {
    LOGGER.debug("run connections test");
    // Get all connections
    AllConnectionsResponse allConnectionsResponse = stub
        .allConnections(
            AllConnectionsRequest
                .newBuilder()
                .build()
        );
    assertTrue(allConnectionsResponse.getResultCount() > 0);

    // Get a single connection
    String connectionName = allConnectionsResponse.getResult(0).getName();
    ConnectionResponse connectionResponse = stub
        .connection(
            ConnectionRequest
                .newBuilder()
                .setConnectionName(connectionName)
                .setFields("name")
                .build()
        );
    assertNotNull(connectionResponse.getResult());
    assertEquals(connectionName, connectionResponse.getResult().getName());

    // Create a connection
    cleanupTestConnection();
    CreateConnectionResponse createConnectionResponse = stub.createConnection(
        CreateConnectionRequest
            .newBuilder()
            .setBody(
                DBConnection
                    .newBuilder()
                    .setName(TEST_CONNECTION_NAME)
                    .setDialectName("mysql")
                    .setHost("db1.looker.com")
                    .setPort(3306)
                    .setUsername(System.getProperty("TEST_LOOKER_USERNAME") + "X")
                    .setPassword(System.getProperty("TEST_LOOKER_PASSWORD"))
                    .setDatabase("demo_db2")
                    .setTmpDbName("looker_demo_scratch")
                    .build()
            )
            .build()
    );
    assertNotNull(createConnectionResponse.getResult());
    assertEquals(TEST_CONNECTION_NAME, createConnectionResponse.getResult().getName());

    // Update connection
    UpdateConnectionResponse updateConnectionResponse = stub.updateConnection(
        UpdateConnectionRequest
            .newBuilder()
            .setConnectionName(TEST_CONNECTION_NAME)
            .setBody(
                DBConnection
                    .newBuilder()
                    .setUsername(System.getProperty("TEST_LOOKER_USERNAME"))
                    .build()
            )
            .build()
    );
    assertNotNull(updateConnectionResponse.getResult());
    assertEquals(System.getProperty("TEST_LOOKER_USERNAME"),
        updateConnectionResponse.getResult().getUsername());

    // Test connection
    TestConnectionResponse testConnectionResponse = stub.testConnection(TestConnectionRequest
        .newBuilder()
        .setConnectionName(System.getProperty("TEST_CONNECTION_NAME"))
        .setTests("connect")
        .build());
    assertTrue(testConnectionResponse.getResultCount() > 0);
    assertEquals("Can connect", testConnectionResponse.getResult(0).getMessage());

    // Delete connection
    DeleteConnectionResponse deleteConnectionResponse = stub.deleteConnection(
        DeleteConnectionRequest
            .newBuilder()
            .setConnectionName(TEST_CONNECTION_NAME)
            .build()
    );
    assertNotNull(deleteConnectionResponse.getResult());
    assertEquals("", deleteConnectionResponse.getResult());
  }

  private void cleanupTestConnection() {
    try {
      stub.connection(
          ConnectionRequest
              .newBuilder()
              .setConnectionName(TEST_CONNECTION_NAME)
              .setFields("name")
              .build()
      );
      stub.deleteConnection(
          DeleteConnectionRequest
              .newBuilder()
              .setConnectionName(TEST_CONNECTION_NAME)
              .build()
      );
    } catch(RuntimeException e) {
      // noop - not supposed to be there
    }

  }

  //
}
