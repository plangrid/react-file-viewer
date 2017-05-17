VERSION?=patch

publish:
	npm run build; \
	npm version ${VERSION}; \
	npm publish; \
	git push origin master

start:
	npm start

lint:
	npm run lint
