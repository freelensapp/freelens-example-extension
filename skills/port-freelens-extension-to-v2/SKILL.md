---
name: port-freelens-extension-to-v2
description: Port an existing Freelens extension written for the v1 extension API (the API inherited from Lens and OpenLens) to the Freelens v2 extension API, so that it loads on Freelens 2.x. Use when an extension declares engines.freelens ^1.x or depends on @freelensapp/extensions 1.x and the user wants it on v2. Plans the port as a migration issue and feature issues after the template in freelensapp/freelens-example-extension, aligns the toolchain and build with that reference template, lets the type check drive the API changes, and verifies the result in Freelens.
license: MIT
compatibility: Needs network access to github.com and raw.githubusercontent.com for the linked documents and issues, the gh CLI to read and open issues, and Node.js with pnpm (through corepack) to build and check the extension.
---

# Port a Freelens extension to v2

An extension needs this port when its `package.json` declares
`engines.freelens` as `^1.x` or depends on `@freelensapp/extensions` 1.x.
Freelens v2 breaks the v1 extension API on purpose, and it refuses such an
extension at discovery, before any of its code runs.

This skill is the workflow. The documents below are the source of truth: read
the sections each step names instead of relying on memory of the v1 API.

## Documents

Fetch the raw URLs; they return Markdown. Read the issues and the pull request
with `gh`, which returns their source, as in step 1.

| Document | Read it for |
| --- | --- |
| [`migrating-from-v1.md`](https://raw.githubusercontent.com/freelensapp/freelens/main/docs/extensions/migrating-from-v1.md) | The porting guide: what changed and what replaces it, the "v1→v2 rename table" and the "Checklist" at the end. |
| [`api.md`](https://raw.githubusercontent.com/freelensapp/freelens/main/docs/extensions/api.md) | The normative contracts C1 to C14: what the host guarantees and how a violation fails. |
| [`binaries.md`](https://raw.githubusercontent.com/freelensapp/freelens/main/docs/extensions/binaries.md) | Only for an extension that ships executables. |
| [`AGENTS.md`](https://raw.githubusercontent.com/freelensapp/freelens-example-extension/main/AGENTS.md) of the template | The build, type-check, test, lint and CI patterns of a v2 extension, each with its reason, and "Rules That Fail Silently". |
| [`README.md`](https://raw.githubusercontent.com/freelensapp/freelens-example-extension/main/README.md) of the template | Installing an extension in Freelens and the development loop. |
| [The source tree](https://github.com/freelensapp/freelens-example-extension/tree/main) of the template | The worked example of a v2 extension. |
| [freelensapp/freelens-example-extension#326](https://github.com/freelensapp/freelens-example-extension/issues/326) | The plan of a v2 migration, written as a template for other extensions. |
| [freelensapp/freelens-example-extension#327](https://github.com/freelensapp/freelens-example-extension/issues/327) | A feature issue: the port of one feature, the `Example` CRD. |
| [freelensapp/freelens-example-extension#336](https://github.com/freelensapp/freelens-example-extension/pull/336) | The pull request that ported that feature, with its functional checks. |

## 1. Plan the port in two kinds of issue

Open both in the extension's own repository.

**The migration issue**, a copy of #326, covers the extension itself: manifest,
build, TypeScript layout, tests, CI, documentation and the components its
features share. Copy the source of the body, which keeps the HTML comments the
rendered page drops:

```sh
gh issue view 326 --repo freelensapp/freelens-example-extension --json body --jq .body
```

- Copy the sections marked **(generic)** as they are, including their
  findings, which every later port inherits.
- Rewrite the sections marked **(project-specific)** for this extension:
  "Inventory" (every v1 construct in the repository, with its v2 requirement
  and the API symbols to check), "Functional checks" and "Decisions".
- Reset the checkboxes of the plan and the validation, and drop the "Done in"
  notes, which record the template's own port.
- A short reference such as `#328` resolves in the repository it is written
  in. In the copy, write the template's issues and pull requests as
  `freelensapp/freelens-example-extension#328`, and replace #327 with the
  extension's own feature issues.
- Keep the Claude handle split as `@<!-- -->claude` wherever the body names
  it: an issue whose body contains the handle starts the Claude workflow when
  it is opened, in a repository that has one.

**One feature issue per feature**, as #327 is for the `Example` CRD: a custom
resource with its models, pages, details and menu items, or another view of the
extension. Each lists its scope, the v1 constructs and API symbols it uses, its
steps with a prefix of its own (`E1`, `E2`, ...) and its functional checks.
Keeping the features out of the migration issue keeps that issue reusable as a
template; its "Rules for the CI agent" say how the two are worked on together.

## 2. Order of work

1. **Manifest.** Bump `engines.freelens` to `^2.0.0` first: until then the
   host refuses the extension, and nothing else is observable ("Step one: bump
   `engines.freelens`" in `migrating-from-v1.md`). Install the exact
   `@freelensapp/extensions` version that "Source of truth" in the migration
   issue names, and set `"type": "module"` ("`package.json` for an
   extension").
2. **Toolchain and build.** Align them with the template: take the files that
   [create-freelens-extension](../create-freelens-extension/SKILL.md) lists
   under "Keep as is", the dependency versions of the template's
   `package.json`, and its scripts. Move the code into `src/main/`,
   `src/renderer/` and `src/common/`, one TypeScript program each ("Source
   layout: one tsconfig per runtime environment" in `migrating-from-v1.md`,
   "Build" and "TypeScript" in `AGENTS.md`). Remove whatever only the v1 build
   needed: the bundler configuration, the global externals, legacy decorator
   plugins.
3. **API changes.** Let `pnpm type:check` drive them. Look every error up in
   the "v1→v2 rename table" of `migrating-from-v1.md` and follow the section it
   links. Decorators follow "MobX 7 and mobx-react 10 (standard decorators
   only)", stylesheets "Styling and CSS", and Node or Electron in renderer code
   "Node and Electron in the renderer".
4. **Features.** One feature issue at a time, after "CRD KubeObject Pattern"
   and "Renderer Components" in `AGENTS.md`.
5. **Functional check in Freelens**, as in "Verify" below.

## 3. What compiles and fails at runtime

The type check does not catch everything a v1 extension gets wrong on v2.
Check the port against:

- "Rules That Fail Silently" in `AGENTS.md`: a second copy of React or mobx,
  `@observable` without `accessor`, Node or Electron in renderer code, a CSS
  asset other than `dist/renderer.css`, an instance method on a KubeObject
  subclass, a cluster page that expects more than `params`, a CommonJS `main`.
- The porting hint in "Renderer Components" in `AGENTS.md`: the `clusterPages`
  and `globalPages` registrations that compiled under v1 and get `undefined`
  props on v2, and how to pass the extension from the registration instead.
- The "Checklist" at the end of `migrating-from-v1.md`, including the two items
  it marks as failing silently.

## 4. Findings

Work on the extension, never around Freelens:

- A gap or an error in the Freelens documents or in `@freelensapp/extensions`,
  such as a symbol that is missing from the API namespaces, a type that does not
  match what the host passes, or a document that contradicts the declaration,
  is reported to [freelensapp/freelens](https://github.com/freelensapp/freelens/issues),
  and recorded under "Findings" and "Upstream work item" of the migration issue.
  It is not worked around silently in the extension, with `as any`,
  `globalThis.require` or a reach into the host's internals.
- A gap in the template is reported to
  [freelensapp/freelens-example-extension](https://github.com/freelensapp/freelens-example-extension/issues).

## 5. Verify

```sh
pnpm install
pnpm type:check
pnpm build
pnpm test:unit
pnpm knip:check
pnpm lint:check
pnpm trunk:check
```

All of them pass. `dist/` then has `main.js`, `renderer.js` and one
stylesheet, `renderer.css`, with their source maps.

Then run the extension in Freelens 2.x, as "From a directory" and "Development
loop" in the template's `README.md` describe: install the checkout's directory
from the Extensions page and run `pnpm dev`. The Extensions page lists it as
enabled. Open every page, details panel, menu item and preference the
extension registers, and check that neither the renderer's DevTools console nor
the terminal running Freelens shows an error. Make one change through mobx,
such as a preference, and check that the UI follows it: that proves the
extension uses the host's mobx. Then tick the functional checks of the
migration issue and of each feature issue.
