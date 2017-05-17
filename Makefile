VERSION?=patch

publish:
	npm run build; \
	npm version ${VERSION}; \
	npm publish

start:
	npm start

lint:
	npm run lint
