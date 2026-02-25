# Frontend Makefile
# Directories
SRC_DIR = src
BUILD_DIR = build
NODE_MODULES = node_modules

FORCE:

prod: tests lint build github

tests: FORCE
	CI=true npm test

github: FORCE
	-git commit -a -m "Auto commit"
	git push origin main

# Linting
lint: FORCE
	npx eslint $(SRC_DIR) --ext .js,.jsx

lint_fix: FORCE
	npx eslint $(SRC_DIR) --ext .js,.jsx --fix

# Development environment
dev_env: FORCE
	npm install
	@echo "Development environment setup complete"

prod_env: FORCE
	npm install --production

# Development server
dev: FORCE
	npm start

# Build
build: FORCE
	npm run build
	@echo "Production build created in $(BUILD_DIR)/"

# Clean
clean: FORCE
	rm -rf $(BUILD_DIR)

# Quality checks
check: tests lint
	@echo "All quality checks passed!"