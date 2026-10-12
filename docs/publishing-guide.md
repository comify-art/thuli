# Publishing & Repository Governance Guide

This guide details:
1. How to perform the **first-time publish** of `@comify.art/thuli` to [npmjs.org](https://www.npmjs.com).
2. How to **lock down the `main` branch** on GitHub to enforce Pull Requests and required CI checks.
3. How the **automated Test & CI/CD pipeline** works.

---

## 1. First-Time Publishing to npmjs.org

### 1.1 Prerequisites
1. **NPM Account**: An account registered on [npmjs.org](https://www.npmjs.com) with Two-Factor Authentication (2FA) enabled.
2. **Organization Access**: Ensure your npm account is an **Owner** or **Admin** of the `@comify.art` organization on npmjs.org.

### 1.2 Step-by-Step Terminal Instructions

#### Step 1: Authenticate with npm
In your terminal, run:
```bash
npm login
```
Follow the browser or one-time code prompt to authenticate. Verify your active login:
```bash
npm whoami
```

#### Step 2: Navigate to Library Root
```bash
cd /Users/murali/src/externals/comify.art/thuli
```

#### Step 3: Run Full Verification Suite
Ensure clean build, type check, and unit test pass:
```bash
npm run clean
npm run type-check
npm test
npm run build
```

#### Step 4: Dry-Run Inspection
Verify that only expected files in `dist/`, `README.md`, and `LICENSE` will be uploaded:
```bash
npm publish --access public --dry-run
```
Inspect the output. You should see 229 files, ~117 kB archive size, with no private source or environment files.

#### Step 5: Perform Initial Publish
Publish the package with public access:
```bash
npm publish --access public
```

Once completed, your package will be immediately live and installable worldwide at:
`https://www.npmjs.com/package/@comify.art/thuli`

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
  - Set **Required approvals** to `1` (or more).
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
6. Tests the sample application in `samples/simple-app/` to guarantee consumer compatibility.

### 3.3 Automated Publishing (`.github/workflows/publish.yml`)
When you release a new version:
1. Bump version locally (`npm version patch`, `minor`, or `major`).
2. Push the commit and tag to GitHub via a Pull Request.
3. In GitHub, create a **Release** from the tag.
4. The GitHub Action will automatically:
   - Run the complete CI verification suite.
   - Publish the package to npmjs.org with cryptographic **npm provenance**.
   *(Requires adding your `NPM_TOKEN` as a secret under Repository Settings > Secrets and variables > Actions > NPM_TOKEN).*
