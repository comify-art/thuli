# Orchestration & Release Makefile for @comify.art/thuli
# Location: comify.art/thuli/

SHELL := bash
.SHELLFLAGS := -eu -o pipefail -c
.DEFAULT_GOAL := help

VERSION ?= $(shell node -p "require('./package.json').version")

.PHONY: help
help: ## Show this help message
	@printf "💧 \033[1;35m@comify.art/thuli Workspace\033[0m\n"
	@printf "Shared React UI components, services, and publishing automation.\n\n"
	@printf "\033[1;34mCurrent Version:\033[0m v%s\n\n" "$(VERSION)"
	@printf "\033[1;34mUsage:\033[0m\n"
	@printf "  make <target>\n\n"
	@grep -E '^[-a-zA-Z0-9_]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-22s\033[0m %s\n", $$1, $$2}'
	@printf "\n"

# --- Development & Quality ---
.PHONY: install
install: ## Setup: Install dependencies
	npm install

.PHONY: type-check
type-check: ## Quality: Verify TypeScript types (tsc --noEmit)
	npm run type-check

.PHONY: test
test: ## Quality: Run unit test suite (Vitest)
	npm test

.PHONY: test-watch
test-watch: ## Quality: Run Vitest in interactive watch mode
	npm run test:watch

.PHONY: build
build: ## Build: Clean, compile TypeScript, and build Tailwind CSS bundle
	npm run build

.PHONY: package
package: ## Build: Compile and package release tarball to dist/
	npm run package

.PHONY: sample
sample: ## Sample: Build reference app in samples/simple-app
	cd samples/simple-app && npm run build

.PHONY: clean
clean: ## Cleanup: Remove dist/ and build artifacts
	npm run clean

# --- Publishing & GitHub Release Automation ---
.PHONY: release
release: ## Publish: Push tag v$(VERSION) and create GitHub Release (triggers OIDC publish)
	@printf "🚀 \033[1;34mPushing tag v$(VERSION) to origin...\033[0m\n"
	git push origin "v$(VERSION)"
	@printf "📦 \033[1;34mPackaging release tarball for v$(VERSION)...\033[0m\n"
	npm run package
	@printf "🏷️  \033[1;32mCreating GitHub Release thuli-v$(VERSION)...\033[0m\n"
	gh release create "v$(VERSION)" "dist/comify.art-thuli-$(VERSION).tgz" \
		--title "thuli-v$(VERSION)" \
		--generate-notes
	@printf "\n✨ \033[1;32mRelease thuli-v$(VERSION) created on GitHub!\033[0m\n"
	@printf "🔒 \033[1;35mGitHub Action 'Publish to npmjs.org' triggered via Trusted Publishing OIDC.\033[0m\n\n"

.PHONY: pr-release
pr-release: ## Ship: Branch, commit, open PR, wait for manual merge, release, and watch npm publish
	@printf "\n\033[1;36m━━━ Step 1/5: Prepare branch & commit ━━━\033[0m\n"
	@BRANCH="$$(git rev-parse --abbrev-ref HEAD)"; \
	if [ "$$BRANCH" = "main" ]; then \
		BRANCH="release/v$(VERSION)"; \
		git checkout -b "$$BRANCH"; \
	fi; \
	if [ -n "$$(git status --porcelain)" ]; then \
		git add -A; \
		git commit -m "$${MSG:-chore(release): v$(VERSION)}"; \
	fi; \
	git push -u origin "$$BRANCH"; \
	printf "\n\033[1;36m━━━ Step 2/5: Open PR & await manual approval/merge ━━━\033[0m\n"; \
	PR_URL="$$(gh pr view --json url -q .url 2>/dev/null || true)"; \
	if [ -z "$$PR_URL" ]; then \
		PR_URL="$$(gh pr create --base main --head "$$BRANCH" --title "Release v$(VERSION)" --body "Automated release PR for v$(VERSION).")"; \
	fi; \
	printf "🔗 PR ready: %s\n" "$$PR_URL"; \
	printf "👉 Action required: Open the PR link above on GitHub, approve it, and click Merge.\n"; \
	printf "⏳ Waiting for PR to be merged into main...\n"; \
	until [ "$$(gh pr view "$$PR_URL" --json state -q .state)" = "MERGED" ]; do \
		STATE="$$(gh pr view "$$PR_URL" --json state -q .state)"; \
		if [ "$$STATE" = "CLOSED" ]; then \
			printf "❌ PR was closed without merging.\n"; exit 1; \
		fi; \
		sleep 5; \
	done; \
	printf "✅ PR merged!\n\n"; \
	printf "\033[1;36m━━━ Step 3/5: Sync main, tag v$(VERSION) & create GitHub Release ━━━\033[0m\n"; \
	git checkout main && git pull origin main; \
	git tag -f "v$(VERSION)"; \
	$(MAKE) release; \
	printf "\033[1;36m━━━ Step 4/5: Watch GitHub Actions publish workflow ━━━\033[0m\n"; \
	sleep 5; \
	RUN_ID="$$(gh run list --workflow=publish.yml --limit 1 --json databaseId -q '.[0].databaseId')"; \
	if [ -n "$$RUN_ID" ]; then \
		gh run watch "$$RUN_ID" --exit-status; \
	fi; \
	printf "\n\033[1;36m━━━ Step 5/5: Verify @comify.art/thuli@$(VERSION) on npmjs.org ━━━\033[0m\n"; \
	printf "⏳ Waiting for npm registry propagation...\n"; \
	until [ "$$(npm view @comify.art/thuli version 2>/dev/null)" = "$(VERSION)" ]; do \
		sleep 5; \
	done; \
	printf "🎉 @comify.art/thuli@$(VERSION) is live on npm: https://www.npmjs.com/package/@comify.art/thuli\n\n"

.PHONY: release-patch
release-patch: ## Release: Bump patch version (x.x.+1) and publish release
	npm version patch
	$(MAKE) release

.PHONY: release-minor
release-minor: ## Release: Bump minor version (x.+1.0) and publish release
	npm version minor
	$(MAKE) release

.PHONY: release-major
release-major: ## Release: Bump major version (+1.0.0) and publish release
	npm version major
	$(MAKE) release
