package com.google.looker.common;

import static io.grpc.Metadata.ASCII_STRING_MARSHALLER;

import io.grpc.Context;
import io.grpc.Metadata;

public class Constants {
  public static final String GRPC_SERVER_HOST = "GRPC_SERVER_HOST";
  public static final String GRPC_SERVER_LISTEN_PORT = "GRPC_SERVER_LISTEN_PORT";
  public static final String LOOKER_CLIENT_ID = "LOOKER_CLIENT_ID";
  public static final String LOOKER_CLIENT_SECRET = "LOOKER_CLIENT_SECRET";
  public static final String LOOKER_BASE_URL = "LOOKER_BASE_URL";
  public static final String LOOKER_VERIFY_SSL = "LOOKER_VERIFY_SSL";
  public static final String CERT_CHAIN_FILE = "CERT_CHAIN_FILE";
  public static final String PRIVATE_KEY_FILE = "PRIVATE_KEY_FILE";
  public static final String TRUST_MANAGER_FILE = "TRUST_MANAGER_FILE";
  public static final String BEARER_TYPE = "Bearer";
  public static final Metadata.Key<String> AUTHORIZATION_METADATA_KEY = Metadata.Key.of("Authorization", ASCII_STRING_MARSHALLER);
  public static final Context.Key<String> CLIENT_ID_CONTEXT_KEY = Context.key("clientId");
}
