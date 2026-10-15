# Branching, versioning and releasing

How changes move from a feature branch to a release on `main`, and how version numbers are chosen. The rules themselves are summarised in [CLAUDE.md](../CLAUDE.md); this page is the step-by-step version. For how the packages fit together, see [Architecture](architecture.md).

## Branches

The repo uses Git Flow with three kinds of branch:

| Branch | Purpose | Who merges into it |
| --- | --- | --- |
| `main` | Released code only. Every commit on `main` is a release, tagged `vX.Y.Z`. | `dev`, at release time |
| `dev` | Integration branch. Always the latest finished work. | Feature branches |
| `feature/<short-description>` | One piece of work. | Nobody; it's merged into `dev` |

Nothing is committed directly to `main` or `dev`.

## Versions

Every workspace package (`@ethannet/api`, `ui`, `media-server`, `core`, `e2e`, `types`) shares one [semver](https://semver.org) version, `MAJOR.MINOR.PATCH`. [Changesets](https://github.com/changesets/changesets) manages the numbers. `.changeset/config.json` puts every `@ethannet/*` package in one `fixed` group, so a bump to any package bumps them all to the same version. The root `package.json` isn't a workspace package and has no version.

| Bump | When |
| --- | --- |
| **major** | A breaking change to an API contract in `packages/types` or to an endpoint, or a large user-facing overhaul. |
| **minor** | A new feature or endpoint that doesn't break anything. |
| **patch** | A bug fix or a small internal change. |
| **none** | Docs, tests or tooling only. Use an empty changeset. |

Until the first `1.0.0` release, the repo stays on `0.y.z` and breaking changes bump the minor version.

## Working on a feature

1. Branch from an up-to-date `dev`:

   ```
   git switch dev
   git pull
   git switch -c feature/<short-description>
   ```

2. Do the work (tests first; see [CLAUDE.md](../CLAUDE.md)).
3. Add a changeset describing the change:

   ```
   pnpm changeset                                        # interactive
   pnpm changeset --minor @ethannet/api -m "Add /api/x"  # non-interactive
   pnpm changeset --empty                                # no version bump
   ```

   This writes a small Markdown file to `.changeset/`. Commit it with the rest of the branch. Because versions are fixed, naming any one package bumps all of them. The summary becomes the changelog entry, so write it for someone reading release notes.

4. Check what the release would do with `pnpm changeset status --verbose`. It compares against `dev`, so a local `dev` branch must exist.
5. Merge the branch into `dev` once `pnpm test`, `pnpm typecheck` and `pnpm lint` pass.

## Cutting a release

Only when the owner decides to release.

1. On a release branch off `dev`, apply the pending changesets:

   ```
   git switch dev && git pull
   git switch -c feature/release-vX.Y.Z
   pnpm version-packages
   ```

   This deletes the changeset files, bumps every package to the new version and adds an entry to each package's `CHANGELOG.md`. Check the diff, then commit it and merge it into `dev`.

2. Merge `dev` into `main` and tag the merge commit with the new version:

   ```
   git switch main && git pull
   git merge --no-ff dev
   git tag vX.Y.Z
   git push origin main vX.Y.Z
   ```

Changesets' own `publish` and `git-tag` commands aren't used. The packages are private and aren't published to npm, and the single `vX.Y.Z` tag replaces per-package tags.

## Edge cases

- **Several changesets on `dev`**: the release uses the largest bump among them. One minor and two patches gives a minor release.
- **A branch with only an empty changeset**: it contributes nothing to the version. If every pending changeset is empty, `pnpm version-packages` changes no versions, so there's nothing to release.
- **`pnpm changeset status` says it can't find where HEAD diverged from `dev`**: create the local branch with `git branch dev origin/dev`.
