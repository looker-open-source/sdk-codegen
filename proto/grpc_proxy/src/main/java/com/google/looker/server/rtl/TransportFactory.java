package com.google.looker.server.rtl;

public class TransportFactory {

  private static TransportFactory instance = new TransportFactory();

  public static TransportFactory instance() {
    return instance;
  }

  final private Transport defaultTransport;
  final private Transport loginTransport;
  final private Transport logoutTransport;

  private TransportFactory() {
    defaultTransport = new DefaultTransport();
    loginTransport = new LoginTransport();
    logoutTransport = new LogoutTransport();
  }

  public Transport getDefaultTransport() {
    return defaultTransport;
  }

  public Transport getTransport(String path) {
    if (path.startsWith("/login")) {
      return loginTransport;
    } else if (path.startsWith("/logout")) {
        return logoutTransport;
    } else {
      return defaultTransport;
    }
  }

}
