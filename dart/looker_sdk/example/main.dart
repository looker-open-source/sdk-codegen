import 'package:looker_sdk/looker_rtl.dart';
import 'package:looker_sdk/src/rtl/sdk.dart';
import 'package:looker_sdk/src/sdk/3.1/models.dart' as models31;
import 'package:looker_sdk/src/sdk/4.0/models.dart' as models40;

void main() async {
  // await run31();
  await run40();
}

void run40() async {
  Looker40SDK sdk = await Sdk.create40Sdk({
    "base_url": "https://self-signed.looker.com:19999",
    "credentials_callback": credentialsCallback
  });
  try {
    List<models40.DBConnection> connections =
        await sdk.ok(sdk.all_connections());
    connections.forEach((connection) => print(connection.name));
    models40.DBConnection connection =
        await sdk.ok(sdk.connection(connections[0].name, "name,host,port"));
    print(
        "name=${connection.name} host=${connection.host} port=${connection.port}");
    models40.WriteDBConnection newConnection = models40.WriteDBConnection();
    SDKResponse resp = await sdk.connection("TestConnection");
    if (resp.statusCode == 200) {
      print("TestConnection already exists");
    } else {
      newConnection.name = 'TestConnection';
      newConnection.dialect_name = "mysql";
      newConnection.host = "db1.looker.com";
      newConnection.port = 3306;
      newConnection.username = "looker_demoX";
      newConnection.password = "look_your_data";
      newConnection.database = "demo_db2";
      newConnection.tmp_db_name = "looker_demo_scratch";
      connection = await sdk.ok(sdk.create_connection(newConnection));
      print("created ${connection.name}");
    }
    models40.WriteDBConnection updateConnection = models40.WriteDBConnection();
    updateConnection.username = "looker_demo";
    connection =
        await sdk.ok(sdk.update_connection("TestConnection", updateConnection));
    print("Connection updated: username=${connection.username}");
    List<models40.DBConnectionTestResult> testResults = await sdk
        .ok(sdk.test_connection("TestConnection", DelimList(["connect"])));
    if (testResults.length == 0) {
      print("No connection tests run");
    } else {
      testResults.forEach((i) => print("test result: ${i.name}=${i.message}"));
    }
    String deleteResult = await sdk.ok(sdk.delete_connection("TestConnection"));
    print("Delete result $deleteResult");
  } catch (error, stacktrace) {
    print(error);
    print(stacktrace);
  }
}

void run31() async {
  Looker31SDK sdk = await Sdk.create31Sdk({
    "base_url": "https://self-signed.looker.com:19999",
    "credentials_callback": credentialsCallback
  });
  try {
    List<models31.DBConnection> result = await sdk.ok(sdk.all_connections());
    print(result);
  } catch (error, stacktrace) {
    print(error);
    print(stacktrace);
  }
}

Map credentialsCallback() {
  return {
    "client_id": "get from looker instance",
    "client_secret": "get from looker instance"
  };
}
