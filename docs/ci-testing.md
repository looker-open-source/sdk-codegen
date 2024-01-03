# Adding required ci testing

## Create a test-area-ci workflow

Create a workflow in `.github/workflows/`. The existing workflows can be used as an example.

The new workflow should respond to pull requests, pushes, and workflow dispatch events. The
pull requests and pushes should be filtered by one of more file paths. The start of the
workflow will look something like this...

```yaml
name: API Explorer CI
on:
  pull_request:
    paths:
      - packages/code-editor/**
      - packages/run-it/**
      - packages/api-explorer/**
      - packages/extension-api-explorer/**
      - packages/extension-utils/**

  push:
    branches:
      - main
    paths:
      - packages/code-editor/**
      - packages/run-it/**
      - packages/api-explorer/**
      - packages/extension-api-explorer/**
      - packages/extension-utils/**

  workflow_dispatch:
```

In this example, the API Explorer (APIX for short) is being tested. That name and the
particular file paths should be customized for the area you wish to test.

The workflow will probably end with a step to report the results. This is especially
with a CI test that uses various combinations of Looker versions, platforms like Windows,
Linux, MaxOS, and versions of tools like Node or Python. Each variation of a matrix test
should report a result that is then aggregated into one overall result. That aggregate
reporting step might look like this...

```yaml
publish-test-results:
  needs: [unit]
  if: success() || failure()
  runs-on: ubuntu-latest

  steps:
    - name: Download Artifacts
      uses: actions/download-artifact@v2
      with:
        path: artifacts

    - name: Publish Unit Test Results
      uses: EnricoMi/publish-unit-test-result-action@v1.12
      with:
        check_name: APIX Tests
        github_token: ${{ secrets.GITHUB_TOKEN }}
        report_individual_runs: true
        hide_comments: orphaned commits
        check_run_annotations_branch: '*'
        files: 'artifacts/apix-test-results/*.xml'
```

In particular, note the `check_name: APIX Tests`. This will publish a check back to github
called `APIX Tests`. Of course that should be customized for the area you wish to test.

Now modify the file `.github/workflows/required-checks-hack-ci.yml`. This "test" makes sure
that success is reported if the file pattern in the pull request or push is not satisfied.
That way if someone modifies another part of the project unrelated tests don't need to be run.

Add a new filter with a unique name under the `changed-file-filter` step. Use the same filter
as the `paths:` clause under the `push:` and `pull_requests:` for your new ci workflow.

```yaml
- uses: tony84727/changed-file-filter@v0.2.0
  id: filter
  with:
    filters: |
      apix:
        - packages/code-editor/**
        - packages/run-it/**
        - packages/api-explorer/**
        - packages/extension-api-explorer/**
        - packages/extension-utils/**
      codegen:
        - packages/sdk-codegen/**
        - packages/sdk-codegen-utils/**
        - packages/sdk-codegen-scripts/**
```

The full set of outputs is also available in the JSON structure under the name `filters`. In
addition to the true/false flags the list of matching files is available as an array
like `apix_files`. The job output could be read in a workflow like
`fromJSON(${{ steps.filter.outputs.filters }}).apix`. I recommend adding the individual
flags to the outputs for convenience and readability.

The step after the filter step where the state of these flags is echoed to the logs
for debugging. You might want to add that as well.

Finally create a step with the name `Create Subject Area check` It should have an `if:` for the
job so it only runs if the filter is 'false'. The `name` element in the curl data body is the
same as the `check_name:` we found earlier.

```yaml
- name: Create Codegen check
  if: steps.filter.outputs.codegen == 'false'
  run: |
    curl --request POST \
    --url https://api.github.com/repos/looker-open-source/sdk-codegen/check-runs \
    --header "authorization: Bearer ${{ secrets.GITHUB_TOKEN }}" \
    --header "content-type: application/json" \
    --header "Accept: application/vnd.github.v3+json" \
    --data '{
      "name": "Codegen Tests",
      "head_sha": "${{ github.event.pull_request.head.sha || github.sha }}",
      "conclusion": "success"
    }' \
    --fail
```

## Example

To illustrate this, imagine you are adding a ci workflow for `go`. Your workflow
might be named `.github/workflows/go-ci.yml` and start with this:

```yaml
name: Go CI
on:
  pull_request:
    paths:
      - go/**

  push:
    branches:
      - main
    paths:
      - go/**

  workflow_dispatch:
```

The last step might be something like this...

```yaml
publish-test-results:
  needs: [unit]
  if: success() || failure()
  runs-on: ubuntu-latest

  steps:
    - name: Download Artifacts
      uses: actions/download-artifact@v2
      with:
        path: artifacts

    - name: Publish Unit Test Results
      uses: EnricoMi/publish-unit-test-result-action@v1.12
      with:
        check_name: Go Tests
        github_token: ${{ secrets.GITHUB_TOKEN }}
        report_individual_runs: true
        hide_comments: orphaned commits
        check_run_annotations_branch: '*'
        files: 'artifacts/go-test-results/*.xml'
```

Make note of the `paths:` filter `- go/**` and the `check_name:` 'Go Tests`.

In `.github/workflows/required-checks-hack-ci.yml` add a `go` filter to the
list of defined filters with the same filter.

```yaml
- uses: tony84727/changed-file-filter@v0.2.0
  id: filter
  with:
    filters: |
      apix:
        - packages/code-editor/**
        - packages/run-it/**
        - packages/api-explorer/**
        - packages/extension-api-explorer/**
        - packages/extension-utils/**
      codegen:
        - packages/sdk-codegen/**
        - packages/sdk-codegen-utils/**
        - packages/sdk-codegen-scripts/**
      go:
        - go/**
      # snipped
```

I add them alphabetically because it makes me happier.

Finally in `.github/workflows/required-checks-hack-ci.yml` add a step to
report a result if the `go-ci.yml` file is never run, making sure that
the name in the json bidy here matches the `check-name:` defined in
the `.github/workflows/go-ci.yml` `publish-test-results:` job.

```yaml
- name: Create Go check
  if: steps.filter.outputs.codegen == 'false'
  run: |
    curl --request POST \
    --url https://api.github.com/repos/looker-open-source/sdk-codegen/check-runs \
    --header "authorization: Bearer ${{ secrets.GITHUB_TOKEN }}" \
    --header "content-type: application/json" \
    --header "Accept: application/vnd.github.v3+json" \
    --data '{
      "name": "Go Tests",
      "head_sha": "${{ github.event.pull_request.head.sha || github.sha }}",
      "conclusion": "success"
    }' \
    --fail
```
