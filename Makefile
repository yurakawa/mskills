.PHONY: build test lint

build:
	npm run build

test:
	npm run test

lint:
	npm run lint

all: lint build test
