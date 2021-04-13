package com.looker.example;

import com.looker.rtl.AuthSession;
import com.looker.rtl.ConfigurationProvider;
import com.looker.rtl.Transport;
import com.looker.sdk.ApiSettings;
import com.looker.sdk.LookerSDK;
import com.looker.sdk.User;
import io.github.cdimascio.dotenv.Dotenv;
import java.util.HashMap;

public class ExampleRunner {

  private LookerSDK sdk;

  public static void main(String[] args) {
    try {
      new ExampleRunner()
          .configure()
          .runCallMe();
    } catch(Error e) {
      e.printStackTrace();
    }
    System.exit(0);
  }

  public ExampleRunner configure() {
    // Load settings from .env file into system properties.
    // Java does not allow ENV variables to be overridden so
    // system properties are used instead. System properties
    // can also be passed in using -Dkey=value.
    // Settings can also be passwed in using ini format.
    Dotenv dotenv = Dotenv.load();
    dotenv.entries().forEach(e -> System.setProperty(e.getKey(), e.getValue()));
    // Setup the settings from system properties
    ConfigurationProvider settings = ApiSettings.fromMap(new HashMap<>());
    settings.readConfig();
    AuthSession session = new AuthSession(settings, new Transport(settings));
    sdk = new LookerSDK(session);
    return this;
  }

  public ExampleRunner runCallMe() {
    User user = sdk.ok(sdk.me());
    System.out.println("User name is " + user.getDisplay_name());
    return this;
  }

}
