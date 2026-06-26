# @freelensapp/example-extension

<!-- markdownlint-disable MD013 -->

[![Home](https://img.shields.io/badge/%F0%9F%8F%A0-freelens.app-02a7a0)](https://freelens.app)
[![GitHub](https://img.shields.io/github/stars/freelensapp/freelens?style=flat&label=GitHub%20%E2%AD%90)](https://github.com/freelensapp/freelens)
[![DeepWiki](https://deepwiki.com/badge.svg)](https://deepwiki.com/freelensapp/freelens-example-extension)
[![Release](https://img.shields.io/github/v/release/freelensapp/freelens-example-extension?display_name=tag&sort=semver)](https://github.com/freelensapp/freelens-example-extension)
[![Integration tests](https://github.com/freelensapp/freelens-example-extension/actions/workflows/integration-tests.yaml/badge.svg?branch=main)](https://github.com/freelensapp/freelens-example-extension/actions/workflows/integration-tests.yaml)
[![npm](https://img.shields.io/npm/v/@freelensapp/example-extension.svg)](https://www.npmjs.com/package/@freelensapp/example-extension)

<!-- markdownlint-enable MD013 -->

## Overview

This repository serves as an example and template for building and publishing
extensions for the [Freelens](https://freelens.app) application.

It demonstrates how to add support for custom Kubernetes resources by
implementing cluster pages, list views, and detail panels for Custom Resource
Definitions (CRDs). Each resource is accessible from the Freelens sidebar,
with status conditions, spec fields, and related objects displayed in the
detail view.

Notable patterns demonstrated in this repository:

- **Multiple API versions of the same CRD** -- the `Example` resource is
  implemented for both `v1alpha1` and `v1alpha2`, each with separate typed
  interfaces, detail views, list pages, and context menu items. The
  v1alpha1 to v1alpha2 migration also illustrates a field rename with
  inverted semantics (`active` to `suspended`).

- **Auto-detection of the available API version** -- the
  `createAvailableVersionPage` helper tries each registered version in
  priority order at runtime, renders the page for the first version whose
  store is available in the cluster, and shows a friendly message if the
  CRD is not installed.

- **Static methods instead of instance methods** -- Freelens creates plain
  object copies of Kubernetes resources rather than class instances, so all
  per-object logic is implemented as `static` methods on the KubeObject
  subclass (e.g. `Example.getActive(object)`).

- **Error boundary with `withErrorPage`** -- every component render is
  wrapped in a `withErrorPage(props, fn)` helper that catches errors, logs
  them, and renders a graceful error UI instead of crashing the panel.

- **Persisted preferences with MobX** -- `ExamplePreferencesStore` shows
  how to persist extension settings across restarts using
  `Common.Store.ExtensionStore` with MobX `@observable` fields.

Visit the wiki page about [creating
extensions](https://github.com/freelensapp/freelens/wiki/Creating-extensions)
for more information.

## Requirements

- Kubernetes >= 1.24
- Freelens >= 1.8.0

## Supported APIs

### example.freelens.app

<!-- markdownlint-disable MD013 -->

| API Version | Kind | Scope | Description |
| --- | --- | --- | --- |
| v1alpha1 | `Example` | Namespaced | Example custom resource (v1alpha1) |
| v1alpha2 | `Example` | Namespaced | Example custom resource (v1alpha2) |

<!-- markdownlint-enable MD013 -->

To install Custom Resource Definitions for this example run:

```sh
kubectl apply -k examples/v1alpha1/crds
kubectl apply -k examples/v1alpha2/crds
```

Example resources for testing:

```sh
kubectl apply -k examples/v1alpha2/test
# or
kubectl apply -k examples/v1alpha1/test
```

## Install

To install, open Freelens and go to Extensions (`ctrl`+`shift`+`E` or
`cmd`+`shift`+`E`), then search for and install
`@freelensapp/example-extension`.

Alternatively, open the following URL in the browser to install directly:

[freelens://app/extensions/install/%40freelensapp%2Fexample-extension](freelens://app/extensions/install/%40freelensapp%2Fexample-extension)

## Build from the source

You can build the extension from this repository.

### Prerequisites

Use [NVM](https://github.com/nvm-sh/nvm),
[mise-en-place](https://mise.jdx.dev/), or
[windows-nvm](https://github.com/coreybutler/nvm-windows) to install the
required Node.js version.

From the root of this repository:

```sh
nvm install
# or
mise install
# or
winget install CoreyButler.NVMforWindows
nvm install 24.15.0
nvm use 24.15.0
```

Install pnpm:

```sh
corepack install
# or
curl -fsSL https://get.pnpm.io/install.sh | sh -
# or
winget install pnpm.pnpm
```

### Build extension

```sh
pnpm i
pnpm build
pnpm pack
```

One script to build and pack the extension for testing:

```sh
pnpm pack:dev
```

### Install built extension

The tarball will be placed in the current directory. In Freelens, navigate
to the Extensions page and provide the path to the tarball, or drag and
drop the `.tgz` file into the Freelens window.

### Check code statically

```sh
pnpm lint:check
```

and

```sh
pnpm build
pnpm knip:check
```

### Testing the extension with unpublished Freelens

In the Freelens working repository:

```sh
rm -f *.tgz
pnpm i
pnpm build
pnpm pack -r
```

Then in the extension repository:

```sh
echo "overrides:" >> pnpm-workspace.yaml
for i in ../freelens/*.tgz; do
  name=$(tar zxOf $i package/package.json | yq -r .name)
  echo "  \"$name\": $i" >> pnpm-workspace.yaml
done

pnpm clean:node_modules
pnpm build
```

## License

Copyright (c) 2025-2026 Freelens Authors.

[MIT License](https://opensource.org/licenses/MIT)
