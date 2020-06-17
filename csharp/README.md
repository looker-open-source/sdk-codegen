# LookSharp!

**The C# SDK for Looker**

LookSharp was developed using the principles in [Build Your Own SDK](../byosdk.md).

Developed with JetBrains Rider, not VS Code, because it works way better for C#. Go figure. 

LookSharp! has:

- C# Runtime library with strong typing
- Uses .NET Core 3.x, an Open Source, cross-platform run-time for macOS, Windows, and Linux
- SDK Codegen generates the SDK bindings from the Looker API spec
- Both API 3.1 and API 4.0 methods (SDK calls) and models (SDK types)
- Includes some unit and functional tests!
  - nice: `AllDashboardsTests` shows LINQ, which is one of the coolest features of .NET