Trigger Codemagic workflow
==========================

GitHub Action to trigger a workflow on Codemagic.

Quick start
-----------

Add the following configuration to `.github/workflows/main.yml` to trigger Codemagic build on any push event.

    on: push

    jobs:
      trigger-codemagic-build:
        runs-on: ubuntu-latest
        steps:
          - name: Trigger Codemagic build
            uses: codemagic-ci-cd/trigger-codemagic-workflow-action@v1.0.0
            with:
              app-id: <MY-APPLICATION-ID>
              workflow-id: <MY-WORKFLOW-ID>
              token: ${{ secrets.CODEMAGIC_API_TOKEN }}

Required `with` arguments:

| Argument      | Description              |
|---------------|--------------------------|
| `app-id`      | Codemagic application ID |
| `workflow-id` | Codemagic workflow ID    |
| `token`       | Codemagic API token      |

Advanced configuration
----------------------

    on: push

    jobs:
      trigger-codemagic-build:
        runs-on: ubuntu-latest
        steps:
          - name: Trigger Codemagic build
            id: build
            uses: codemagic-ci-cd/trigger-codemagic-workflow-action@v1.0.0
            with:
              app-id: <MY-APPLICATION-ID>
              workflow-id: <MY-WORKFLOW-ID>
              branch: <MY-BRANCH>
              token: ${{ secrets.CODEMAGIC_API_TOKEN }}
              labels: |
                github
                code-quality
              xcode: 12.4
            env:
              CM_IS_GITHUB_BUILD: true
              CM_RELEASE_NOTES: My release notes

Optional `with` arguments:

| Argument   | Description                  |
|------------|------------------------------|
| `branch`   | GitHub event branch override |
| `tag`      | GitHub event tag override    |
| `labels`   | Codemagic build labels       |
| *software* | Version\*                    |

\*Specify the version of a software to use in Codemagic build. Supported *software* arguments are `xcode`, `flutter`, `cocoapods`, `node`, `npm`, `ndk`, `java`,  and `ruby`.

Note that branch and tag name are inferred from the event that triggered the action. Use `branch` or `tag` arguments to override.

Add `CM_` prefix to environment variables to make them available in Codemagic builds:

    env:
      CM_FOO: bar

Output variables can be used later in the action steps:

    - name: Build ID
      run: echo "${{ steps.build.outputs.build-id }}"

| Output variable | Description                |
| ----------------|----------------------------|
| `build-id`      | Codemagic build ID         |
| `build-api-url` | Build details API endpoint |
| `build-url`     | Build page on Codemagic    |

Use `build-api-url` API endpoint to retrieve status and information about the started build.

