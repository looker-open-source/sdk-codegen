# Looker GRPC Proxy Server

GRPC proxy server to a Looker instance.
1. Listens for GRPC requests.
2. Converts GRPC request to Looker JSON.
3. Calls Looker JSON rest endpoint.
4. Converts rest response to GRPC response.
5. Returns GRPC response.

## Setup

Install protobuf generator, `protoc`.
`brew install protobuf`

File formatter.
`brew install clang-format`

### SSL setup for local testing

Run `scripts/ssl_setup.sh`

### Generate protobuf definitions and java implementation (TODO)

Run `scripts/gen_protobuf.sh`

### .env setup

Prior to server startup create a `.env` file in the root of this project (note
that it should not be added to source control). A sample file, `.env_sample`,
contains the entries required.

```
# host grpc server listens on. Used by the grpc client.
GRPC_SERVER_HOST=localhost
# port grpc server listens on. Used by grpc server and client.
GRPC_SERVER_LISTEN_PORT=50051
# Certificate chain file. Used by server to support SSL setup for development.
CERT_CHAIN_FILE=ssl/server.crt
# Private key file. Used by server to support SSL setup for development.
PRIVATE_KEY_FILE=ssl/server.pem
# Trust manager file. Used by client to support SSL setup for development.
TRUST_MANAGER_FILE="ssl/ca.crt"
# Looker client id
LOOKER_CLIENT_ID=
# Looker client secret
LOOKER_CLIENT_SECRET=
# Looker server base url
LOOKER_BASE_URL=https://self-signed.looker.com:19999
# Verify ssl. Set to false for development environmet
LOOKER_VERIFY_SSL=false
# Looker connection db username - used by ConnectionTests
TEST_LOOKER_USERNAME=
# Looker connection db password - used by ConnectionTests
TEST_LOOKER_PASSWORD=
# Looker connection name - used by ConnectionTests to test a connection
TEST_CONNECTION_NAME=
```

## Notes

### Protobuf identifier generation

Not convinced about the implementation that generates protobuf identifiers but
it will do for now. Originally it used the index of the property in javascript
object but this is a little brittle as there is no guarantee a developer will
not insert a new property into the object. This generates a consistent value
across runs. The problem is that the identifier MUST be between 0 and 536870911.
To fix this negative values are multipled by -1 and values greater than
536870911 are bitwise shifted right until they are less than or equal to
536870911. So far their have been  no collisions but I suspect there are better
implementations.

## TODOs

In no particular order of importance.

1. Streaming support.
2. Add rest endpoint to protobuf files.
3. Sync Looker server environment variable names with other implementations.
4. Handle response content types other that JSON.
5. Industrialize generation of proto ids (handle slight possibility of duplicates).
Verify or improve current id generator.
6. Tests for generators.
7. Tests for java support functions.
8. Add support for productionized SSL connection.
9. Separate client into another project. Tests utilizing should go with the client.
10. Consider creating a new runtime that can be embedded in helltool. Note sure it
can be done. Basically it would call the internal ruby API endpoint and negate the
need for an extra network hop. Gets http2 for free?
11. Finish authentication methods.
12. Implement refresh token.
13. Rewrite setup script in typescript and to codegen scripts package.


