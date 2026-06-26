# Staged workflows

This directory holds complete, ready-to-use GitHub Actions workflow files that
must be applied by a maintainer.

The Claude Code GitHub App token does not have the `workflows` permission, so it
cannot push changes directly to `.github/workflows/`. Any proposed change to a
workflow is therefore delivered here as a full replacement file.

To apply a change, copy the file into `.github/workflows/`:

```bash
cp gitlab-workflows/release.yaml .github/workflows/release.yaml
```

## release.yaml

Adds SBOM and checksum publishing to the release job:

- Generates an SPDX SBOM with [`anchore/sbom-action`](https://github.com/anchore/sbom-action)
  named after the packed `*.tgz` file with a `-spdx.json` extension
  (e.g. `freelensapp-example-extension-1.10.1-spdx.json`).
- Generates `*.sha256` checksum files for both the `*.tgz` package and the SBOM.
- Uploads all of these alongside the `*.tgz` in the GitHub release.

Since the extension is a single Node.js module, one architecture is enough, so a
single SBOM is produced per release.
