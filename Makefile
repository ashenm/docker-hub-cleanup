.DEFAULT_GOAL=help

.PHONY: build
.SILENT: build
build: ## build index.js
	ncc build index.js

.PHONY: help
.SILENT: help
help: ## list make targets
	awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {sub("\\\\n",sprintf("\n%22c"," "), $$2);printf " \033[36m%-20s\033[0m  %s\n", $$1, $$2}' $(MAKEFILE_LIST)

.PHONY: release
.SILENT: release
release: ## tag latest build
	
	# init build folder
	rm --recursive --force /tmp/build
	mkdir --parent /tmp/build
	cp --force package.json action.yml dist/
	rsync --delete --links --recursive dist/ /tmp/build
	
	# commit changes
	git -C /tmp/build init
	git -C /tmp/build checkout -B latest
	git -C /tmp/build add -A .
	git -C /tmp/build commit -qm "Deploy $$(git log --max-count=1 --format='%h') on master as latest"

.PHONY: install
.SILENT: install
install: ## install build dependencies
	
	# https://github.com/vercel/ncc
	npm install --global @zeit/ncc
	
	# node modules
	npm install

.PHONY: push
.SILENT: push
push: release
	git -C /tmp/build push --force --quiet "https://${GITHUB_TOKEN}@github.com/ashenm/docker-hub-cleanup.git" "latest:latest"
