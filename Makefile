# Orchestration & Release Makefile for @comify.art/thuli
# Location: ~/src/externals/comify.art/thuli/

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
release: ## Publish: Push commits/tags and create GitHub Release (triggers OIDC publish)
	@printf "🚀 \033[1;34mStep 2: Pushing commits and tag v$(VERSION) to origin...\033[0m\n"
	git push origin main "v$(VERSION)"
	@printf "📦 \033[1;34mPackaging release tarball for v$(VERSION)...\033[0m\n"
	npm run package
	@printf "🏷️  \033[1;32mStep 3: Creating GitHub Release thuli-v$(VERSION)...\033[0m\n"
	gh release create "v$(VERSION)" "dist/comify.art-thuli-$(VERSION).tgz" \
		--title "thuli-v$(VERSION)" \
		--generate-notes
	@printf "\n✨ \033[1;32mRelease thuli-v$(VERSION) created on GitHub!\033[0m\n"
	@printf "🔒 \033[1;35mGitHub Action 'Publish to npmjs.org' triggered via Trusted Publishing OIDC.\033[0m\n\n"

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
