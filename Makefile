.PHONY: lint test all build clean

# Run both lint and test
all: lint test

# Linting tasks
# Note: Assuming 'npm run lint' is configured in package.json. 
# If not, you might want to use 'npx eslint .' or similar.
lint:
	npm run lint

# Test tasks
test:
	npm test

# Build tasks
build:
	npm run build

# Clean tasks
clean:
	rm -rf dist
