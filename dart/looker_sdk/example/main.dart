import 'package:looker_sdk/looker_rtl.dart';
import 'package:looker_sdk/src/rtl/sdk.dart';

void main() async {
  Looker31SDK sdk = await Sdk.create31Sdk({
    "base_url": "https://self-signed.looker.com:19999",
    "credentials_callback": credentialsCallback
  });
  try {
    // var result = await sdk.ok(sdk.all_connections());
    var result = await sdk.all_connections();
    print(result);
  } catch (error) {
    print(error);
  }
}

Map credentialsCallback() {
  return {
    "client_id": "Nbwy5Y66vnvrZv7ZRDvN",
    "client_secret": "nmj6VskXQwBzqVTnDtJ6cmjj"
  };
}

// void main() {
//   // all_connections();
//   print("Hello World");
//   Transport t = Transport();
//   print(t);
//   var p = Parent("John");
//   p.p();
//   p.t();
//   p.t("XXX", true);
//   var c = Child("Jack");
//   c.p();
//   String s = "Sam";
//   print(s);
//   String w = "ABCD";
//   print(w);
// }

// class Parent {
//   String name;

//   Parent(String this.name) {}

//   p() {
//     print(name);
//   }

//   t([String s, /* */ bool b]) {
//     if (b == null) {
//       print("bool null");
//     } else {
//       print(b);
//     }
//     if (s == null) {
//       print("String null");
//     } else {
//       print(s);
//     }
//   }
// }

// class Child extends Parent {
//   Child(String name) : super(name) {}
// }
