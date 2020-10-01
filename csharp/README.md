# Look#

**C# SDK for Looker**

Look# was developed using the principles in [Build Your Own SDK](/docs/byosdk.md).

Look# has:

- C# Runtime library with strong typing for HTTP responses
- Uses .NET Core 3.x, an Open Source, cross-platform run-time for macOS, Windows, and Linux
- SDK Codegen generates the SDK bindings from the Looker API spec
- Both API 3.1 and API 4.0 methods (SDK calls) and models (SDK types)
- Includes many unit and some functional tests!
  - nice: `AllDashboardsTests` shows LINQ, which is one of the coolest features of .NET
  
**NOTE**: We used JetBrains Rider instead of VS Code, which provided much better developer tools for C#. 

**WARNING**: This SDK isn't even in alpha status yet. We've still got lots of tuning to do.

**WARNING**: Look# is currently only "community supported" via issues or questions in this repository. It will eventually reach "officially supported by Looker" status in the future. The date for official support has not yet been established.
