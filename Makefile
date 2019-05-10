ESLINT = node_modules/.bin/eslint
ESLINT_OPTS = --config node_modules/sanctuary-style/eslint-es6.json --env es6 --env node
LIB = $(shell find src test -name '*.js' | sort)

.PHONY: lint
lint:
	$(ESLINT) $(ESLINT_OPTS) -- $(LIB)


