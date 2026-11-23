# Publishing & Repository Governance Guide

This guide details:
1. **npm Setup & Trusted Publishing (OIDC)**: Linking npmjs.com to GitHub Actions without long-lived tokens.
2. **Branch Protection & Governance**: Enforcing Pull Requests and mandatory status checks on `main`.
3. **Automated Release Pipeline**: Using `make release-*` and GitHub Actions with cryptographic Sigstore provenance.

---

## 1. npm Trusted Publishing (OIDC) & Provenance Setup

`@comify.art/thuli` uses tokenless **Trusted Publishing (OpenID Connect / OIDC)**. GitHub Actions automatically generates a short-lived OIDC token to authenticate with the public npm registry, eliminating the need for persistent personal access tokens (`NPM_TOKEN`).

### 1.1 Prerequisites
1. **NPM Account**: An account on [npmjs.com](https://www.npmjs.com) with Two-Factor Authentication (2FA) enabled.
2. **Organization Membership**: Owner or Admin of the `@comify.art` organization on npmjs.com.
3. **Initial Version**: The package must be claimed on npm at least once (e.g. `v1.0.0`) via manual publish before OIDC trusted publishing can be configured.

### 1.2 Trusted Publisher Configuration on npmjs.com
To link GitHub Actions to npmjs.com:
1. Navigate to: `https://www.npmjs.com/package/@comify.art/thuli/access`
2. Under **Trusted Publishers**, click **Add publisher** and select **GitHub Actions**.
3. Configure the fields with exact values:
   - **Organization or user**: `comify-art` *(matches GitHub repository owner; note hyphen, not dot)*
   - **Repository**: `thuli`
   - **Workflow filename**: `publish.yml` *(do not prefix with `.github/workflows/`)*
   - **Environment name**: *(leave blank unless a GitHub Environment is used)*
   - **Allowed actions**: Check **`npm publish`** to allow automated continuous deployment. *(Leaving this unchecked restricts to staged publishing, requiring manual 2FA approval for each release).*
4. Click **Add publisher**.

> [!IMPORTANT]
> **48-Hour Validation Window**: After adding a trusted publisher, the first workflow publish must execute successfully within 48 hours; otherwise, npm will automatically expire the unvalidated configuration.

### 1.3 Cryptographic Provenance Requirement (`package.json`)
The publish workflow runs `npm publish --provenance`, which signs a cryptographic provenance statement via Sigstore. For provenance verification to succeed, `package.json` must declare the matching Git repository:

```json
"repository": {
  "type": "git",
  "url": "https://github.com/comify-art/thuli.git"
},
"homepage": "https://github.com/comify-art/thuli#readme",
"bugs": {
  "url": "https://github.com/comify-art/thuli/issues"
}
```

---

## 2. Locking Down `main` with Pull Requests & Branch Protection

To ensure no developer (or agent) can push directly to `main`, and that every change requires a peer-reviewed Pull Request and passing CI checks:

### 2.1 Setting up Branch Protection on GitHub

1. Push this repository to GitHub (e.g. `git remote add origin https://github.com/comify-art/thuli.git && git push -u origin main`).
2. In the GitHub repository, click **Settings** (tab).
3. In the left navigation, click **Branches** (under Code and automation).
4. Click **Add branch protection rule** (or **Rulesets** > **New branch ruleset**).
5. Set **Branch name pattern** to: `main`.

### 2.2 Configure Mandatory Protection Rules

Check the following settings:
- ✅ **Require a pull request before merging**:
  - Set **Required approvals** to `1` (or `0` for solo-maintainer repositories, since GitHub does not allow self-approval).
  - Check **Dismiss stale pull request approvals when new commits are pushed**.
- ✅ **Require status checks to pass before merging**:
  - Check **Require branches to be up to date before merging**.
  - In the search bar for status checks, search for and select:  
    `Type-Check, Test & Build` (from `.github/workflows/ci.yml`).
- ✅ **Require linear history** (optional, recommended for clean commit graphs).
- ✅ **Do not allow bypassing the above settings**:
  - Enforces the rule for everyone, including repository administrators and owners.
- ✅ **Restrict who can push to matching branches**:
  - Leave empty or specify none: this disables direct `git push origin main` entirely, requiring all changes to arrive via approved Pull Requests.

Click **Create** / **Save changes**.

---

## 3. Automated Test Suite & CI/CD Pipeline

The repository includes comprehensive automated quality gates:

### 3.1 Unit Testing (Vitest)
Unit tests reside alongside source files (e.g., `src/**/*.test.ts`).
- Run all tests once:
  ```bash
  npm test
  ```
- Run tests in watch mode during development:
  ```bash
  npm run test:watch
  ```

### 3.2 Continuous Integration (`.github/workflows/ci.yml`)
Runs automatically on:
- Every Pull Request targeting `main`.
- Every direct commit merged into `main`.

**Validation Steps in CI:**
1. Installs clean dependencies via `npm ci`.
2. Validates type safety via `npm run type-check` (`tsc --noEmit`).
3. Executes unit test suite via `npm test`.
4. Compiles library and minified Tailwind v4 CSS via `npm run build`.
5. Verifies package tarball generation via `npm run package`.
6. Tests both sample applications (`samples/v1-classic-starter/` and `samples/v2-modern-portal/`) to verify v1 compatibility and v2 container bundling.

### 3.3 Automated Publishing (`.github/workflows/publish.yml`)
When you release a new version:

**Option A: Version bump + release on `main`** (if `package.json` is not bumped yet):
1. Run `make release-patch`, `make release-minor`, or `make release-major`.

**Option B: Tag and release an already-merged version** (if `package.json` was bumped in a PR):
1. Sync `main` with the merged PR:
   ```bash
   git checkout main
   git pull origin main
   ```
2. Create the annotated Git tag matching `package.json` (for example, `v2.0.4`):
   ```bash
   git tag -a v2.0.4 -m "Release v2.0.4"
   ```
3. Run `make release`:
   ```bash
   make release
   ```
   `make release` pushes the tag to `origin`, builds the release tarball, and creates the GitHub Release, which triggers `.github/workflows/publish.yml` to run CI checks and publish to npmjs.org with OIDC Trusted Publishing provenance.

### 3.4 Verify the npm Publish
1. Watch the GitHub Actions workflow (`Publish to npmjs.org`):
   ```bash
   gh run list --workflow=publish.yml --limit=3
   gh run watch
   ```
2. Confirm the new version is live on npm:
   ```bash
   npm view @comify.art/thuli version
   ```
3. Check the package page and provenance badge at `https://www.npmjs.com/package/@comify.art/thuli`.
