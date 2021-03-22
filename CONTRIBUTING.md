# Contributing to Looker sdk-codegen

🎉 Before we dive in... Thank you for taking the time contribute! 🎉

The following is a set of guidelines for contributing to the sdk-codegen repository, which are hosted in the Looker Organization on GitHub. These are mostly guidelines, not rules. Use your best judgment, and feel free to propose changes to this document in a pull request.

## Code of Conduct

This project and everyone participating in it is governed by the [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.

## Developer Setup

See our [README](README.md) for development setup instructions.

### Bug Reports

Bugs from the community are tracked in [Github Issues](https://github.com/looker-open-source/sdk-codegen/issues).
Because there are many different SDKs and languages included in this repository, it may be useful to look at issues in a [project](https://github.com/looker-open-source/sdk-codegen/projects) context instead.

- Use a clear and descriptive title for the issue
- Note what version and which SDK you're using
- Describe how to reproduce the problem
    - Bonus points for a working example in [examples](/examples)
- Explain the behavior your were expecting
- Label your issue with "bug"

## Enhancements Requests

Enhancements Requests from the community are tracked in [Github Issues](https://github.com/looker-open-source/sdk-codegen/issues).

- Use a clear and descriptive title for the issue
- Describe what you want to be able to accomplish with Looker Components
- Label your issue with "enhancement"
- Link your issue to the relevant project

## Pull Requests

We're so excited that you're ready to make your first contribution! Go ahead and open a "New Pull Request." You should see a sample "Developer Checklist" as well as a quick video on what we're looking for to help get your change accepted.

### Title Guidelines

We squash Pull Requests (all commits in a pull request show up in our `main` branch history as a single commit) and we use [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) to generate our CHANGELOG.

So we use Conventional Commit style Pull Request titles:

`<type>[optional scope]: <description>`

Examples:

```
fix(BrowserSession): Fixed issue with Oauth flow
feat(NewComponentName): Component to support exciting new thing
chore(deps): Updated package dependency X from version y to z
```

#### Types

We generally follow [Angular's types](https://github.com/angular/angular/blob/22b96b9/CONTRIBUTING.md#type). The most common types used are:

- fix: a commit of the type fix patches a bug (this correlates with PATCH in Semantic Versioning).
- feat: a commit of the type feat introduces a new feature or changes an existing one (this correlates with MINOR in Semantic Versioning).

If a change does _NOT_ make a change to the build artifacts produced (`fix` or `feat` above) you can also use one of these alternative types:

- build: Changes that affect the build system or external dependencies
- docs: Documentation only changes
- refactor: A code change that neither fixes a bug nor adds a feature
- style: Changes that do not affect the meaning of the code (white-space, formatting, missing semi-colons, etc)
- test: Adding missing tests or correcting existing tests

#### Scope

Specify a scope when your change is focused on a specific component, package, or portion of the code. E.g.:

```
feat(RunIt): Now has even more colors 🌈
```

### Developer Checklist

Edit the developer checklist to reflect only items relevant to your pull request (delete items that aren't relevant). Feel free to reach out if you have questions or get stuck.

Not sure if an item applies? Leave it in place and ask your reviewer to help determine if it's relevant.

- [ ] ♿️ Accessibility addressed
- [ ] 🌏 Localization & Internationalization addressed
- [ ] 🖼 Image Snapshot coverage
- [ ] Documentation updated 📚
- [ ] Bundle size impact addressed 🧳
- [ ] Performance impacts addressed 🚤
- [ ] Cross-browser tested 👾
    - [ ] Chrome
    - [ ] Firefox
    - [ ] Safari
    - [ ] IE11

#### What does "addressed" mean?

If your pull request introduces a regression to the item (or simply leaves that task for a later PR if the component in question isn't already marked as "stable") please document that a follow-up issue has been logged to address that item as technical debt.
