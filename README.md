## Automated releases with Conventional Commits

This repository now includes a GitHub Actions workflow that creates a GitHub Release whenever commits follow these formats:

- `fix: something` → **PATCH** release (`1.5.3` → `1.5.4`)
- `feat: something` → **MINOR** release (`1.5.3` → `1.6.0`)
- `feat!: breaking` (or any `BREAKING CHANGE` note) → **MAJOR** release (`1.5.3` → `2.0.0`)

### Commit format expected

Use conventional commit headers like:

- `fix: correct typo`
- `feat: add login system`
- `feat!: change API structure`

When changes are pushed to `main`, the workflow:

1. Finds the latest git tag (`vX.Y.Z`, defaults to `v0.0.0` if none exists).
2. Checks commit messages since that tag.
3. Calculates the next version.
4. Creates a GitHub Release with the new tag.

If no `fix`, `feat`, or breaking-change commit is found, no release is created.
