# Remaining Test Failures

As of 2026-02-28, the following test suites are failing. These appear to be related to environmental configuration (missing files, network access) rather than code regressions in the SDK itself.

## 1. Missing `service_account.json`
**Suites:**
- `packages/wholly-sheet/src/WhollySheet.spec.ts`
- `packages/wholly-sheet/src/SheetSDK.spec.ts`

**Error:**
```
ENOENT: no such file or directory, open '.../examples/access-token-server/service_account.json'
```
**Cause:**
These tests require a Google Cloud service account JSON file to authenticate with Google Sheets, which is not present in the repository or test environment.

## 2. Network / Integration Tests
**Suites:**
- `packages/embed-services/src/ServiceFactory.spec.ts`
- `packages/hackathon/src/models/Hacker.spec.ts`
- `packages/sdk-node/test/methods.spec.ts`

**Error:**
```
LookerSDKError: Network request failed
console.error: Error: Cross origin http://localhost forbidden
```
**Cause:**
These tests attempt to connect to a local Looker instance (`http://localhost`) or perform network requests that are blocked or have no server listening. They are integration tests running in an environment without the required services.

## 3. Uninitialized SDK (Hackathon Models)
**Suites:**
- `packages/hackathon/src/models/Projects.spec.ts`
- `packages/hackathon/src/models/Hackathons.spec.ts`

**Error:**
```
Error: Looker host connection not established
```
**Cause:**
These tests rely on a global SDK instance (`_core40SDK`) being initialized (likely via `ExtensionProvider` or similar), but the test setup does not initialize it, or the initialization fails due to missing environment/context.

## 4. Missing INI Configuration
**Suite:**
- `packages/sdk-codegen-scripts/src/declarationMiner.spec.ts`

**Error:**
```
Error: No section named "Miner" was found
```
**Cause:**
The test expects a strictly defined section `[Miner]` in `looker.ini` (or the config file being read), which is missing in the current test environment's configuration.

## 5. Timeouts (WhollyArtifact)
**Suite:**
- `packages/wholly-artifact/src/WhollyArtifact.spec.ts`

**Error:**
```
Exceeded timeout of 5000 ms for a hook.
```
**Cause:**
The `beforeEach` hook calls `purge()`, which likely attempts network operations (CRUDS on rows) that hang or timeout, possibly due to the same missing credentials or network issues as the WhollySheet tests.
