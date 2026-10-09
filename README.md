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

This repository is the reference template for building, type-checking,
testing and releasing an extension for the [Freelens](https://freelens.app)
application. The
[Freelens extension documentation](https://github.com/freelensapp/freelens/tree/main/docs/extensions)
describes the extension API and points here for everything around it. Start a
new extension from a copy of this repository.

The extension adds a cluster page, a details panel and a context menu item
for a custom resource, `Example`, and a setting on the preferences page:

- **Two API versions of one CRD.** `Example` is implemented for `v1alpha1`
  and `v1alpha2`, each with its own model, list page, details and menu item.
  `v1alpha2` renames `spec.active` to `spec.suspended`, with the meaning
  inverted.
- **The served API version picked at runtime.** The "Examples" page shows the
  newest version the cluster serves, or a message when the CRDs are not
  installed.
- **Static helpers on the model.** Per-object logic is a `static` method that
  takes the object, such as `Example.getSuspended(object)`.
- **An error boundary.** Each page, details panel and menu item renders an
  error message instead of breaking the view when it throws.
- **A persisted preference.** The "Example checkbox" setting is kept across
  restarts and shown in the details panel.

## Requirements

- Freelens >= 2.0.0
- Kubernetes >= 1.24

## Supported APIs

### example.freelens.app

<!-- markdownlint-disable MD013 -->

| API Version | Kind | Scope | Description |
| --- | --- | --- | --- |
| v1alpha1 | `Example` | Namespaced | Example custom resource (v1alpha1) |
| v1alpha2 | `Example` | Namespaced | Example custom resource (v1alpha2) |

<!-- markdownlint-enable MD013 -->

To install the Custom Resource Definitions for this example, run:

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

Open Freelens and go to Extensions (`ctrl`+`shift`+`E` or
`cmd`+`shift`+`E`). The field at the top takes a package name, the URL of a
tarball, or the path to a tarball or a directory.

### From the registry

Enter `@freelensapp/example-extension` and press Install.

Alternatively, open the following URL in the browser to install directly:

[freelens://app/extensions/install/%40freelensapp%2Fexample-extension](freelens://app/extensions/install/%40freelensapp%2Fexample-extension)

### From a release tarball

Each [release](https://github.com/freelensapp/freelens-example-extension/releases)
has the extension as `freelensapp-example-extension-<version>.tgz`, with its
checksum in `freelensapp-example-extension-<version>.tgz.sha256`. Use a
release whose major version matches your Freelens version.

- Enter the URL of the `.tgz` asset and press Install. Freelens downloads the
  `.tgz.sha256` next to it and checks the tarball against it.
- Or download both files into one directory and enter the path to the `.tgz`,
  or drop the `.tgz` on the Freelens window. Freelens checks it against the
  `.tgz.sha256` next to it.

### From a directory

Build the extension (see below), then enter the path to your checkout, the
directory with `package.json`, and press Install. Freelens runs the extension
from that directory, from the files in `dist/`, and lists it as unverified.
This is how you work on the extension: see
[Development loop](#development-loop).

## Build from the source

### Prerequisites

Use [NVM](https://github.com/nvm-sh/nvm),
[mise-en-place](https://mise.jdx.dev/), or
[windows-nvm](https://github.com/coreybutler/nvm-windows) to install the
Node.js version in `.nvmrc`.

From the root of this repository:

```sh
nvm install
# or
mise install
# or
winget install CoreyButler.NVMforWindows
nvm install "$(cat .nvmrc)"
nvm use "$(cat .nvmrc)"
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
pnpm install
pnpm build
```

The extension is built into `dist/`. To pack it into a tarball:

```sh
pnpm pack
```

One script to bump the prerelease version, build and pack the extension for
testing:

```sh
pnpm pack:dev
```

The tarball is placed in the current directory. Install it as described in
[From a release tarball](#from-a-release-tarball).

### Development loop

Install the extension from your checkout once, as described in
[From a directory](#from-a-directory), then run:

```sh
pnpm dev
```

It rebuilds the extension whenever a source file changes, and Freelens
reloads the extension after each rebuild, without a restart and without
packing. Stop it with `ctrl`+`C`.

Neither `pnpm build` nor `pnpm dev` type-checks; run `pnpm type:check` for
that. A change to `main` or `renderer` in `package.json` needs Freelens
restarted once.

### Check the code

```sh
pnpm type:check
pnpm test:unit
pnpm lint:check
pnpm knip:check
```

and, for the formats that Biome does not cover:

```sh
pnpm trunk:check
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
