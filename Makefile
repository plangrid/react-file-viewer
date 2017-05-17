VERSION?=patch

publish:
	npm run build; \
	npm version ${VERSION}; \
	npm publish; \
	git push origin master; \
	git push origin --tags

start:
	npm start

lint:
	npm run lint
