
	# docker run \
	# 	-v $(shell pwd):/app \
	# 	-v $(shell pwd)/dist:/dist \
	# 	--env NPM_SCRIPT="release" \
	# 	--env GITHUB_TOKEN=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\
	# 	npm-build

.PHONY: release-app
release-app:
	docker run \
		-v $(shell pwd):/app \
		-v $(shell pwd)/dist:/dist \
		--env NPM_SCRIPT="release" \
		--env GITHUB_TOKEN=$(GITHUB_TOKEN)\
    npm-build
