VERSION?=patch

publish:
	npm run build; \
	npm version ${VERSION}
