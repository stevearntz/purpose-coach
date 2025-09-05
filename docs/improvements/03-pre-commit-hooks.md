# Pre-Commit Hooks Implementation Plan

## Overview
Implement automated pre-commit hooks to ensure code quality, successful builds, and passing tests before any commit is made.

## Current State
- Manual testing before commits
- Build failures discovered after push
- TypeScript errors found during Vercel deployment
- No automated test execution
- Time wasted on fixing broken commits

## Benefits
- Prevent broken code from entering repository
- Catch TypeScript errors before deployment
- Ensure consistent code quality
- Save time on CI/CD pipeline
- Reduce "fix build" commits

## Implementation Steps

### Phase 1: Install and Configure Husky
1. **Install Husky and dependencies**
   ```bash
   npm install --save-dev husky lint-staged
   npm install --save-dev @commitlint/cli @commitlint/config-conventional
   npx husky install
   ```

2. **Initialize Husky**
   ```bash
   npm pkg set scripts.prepare="husky install"
   npx husky install
   ```

3. **Create Husky configuration**
   ```bash
   # Create pre-commit hook
   npx husky add .husky/pre-commit "npx lint-staged"
   
   # Create commit-msg hook for conventional commits
   npx husky add .husky/commit-msg "npx --no -- commitlint --edit $1"
   ```

### Phase 2: Configure Lint-Staged
1. **Create `.lintstagedrc.json`**
   ```json
   {
     "*.{ts,tsx,js,jsx}": [
       "eslint --fix",
       "prettier --write"
     ],
     "*.{json,md,mdx}": [
       "prettier --write"
     ],
     "*.prisma": [
       "npx prisma format"
     ]
   }
   ```

2. **Add type checking to lint-staged**
   ```json
   {
     "*.{ts,tsx}": [
       "bash -c 'tsc --noEmit'",
       "eslint --fix",
       "prettier --write"
     ]
   }
   ```

### Phase 3: Implement Build Verification
1. **Create build verification script**
   ```bash
   # .husky/pre-commit
   #!/usr/bin/env sh
   . "$(dirname -- "$0")/_/husky.sh"
   
   echo "🔍 Running pre-commit checks..."
   
   # Run lint-staged
   npx lint-staged
   
   # Type checking
   echo "📝 Checking TypeScript..."
   npm run type-check || {
     echo "❌ TypeScript errors found. Please fix before committing."
     exit 1
   }
   
   # Build check (fast mode)
   echo "🏗️  Verifying build..."
   npm run build:check || {
     echo "❌ Build failed. Please fix before committing."
     exit 1
   }
   
   echo "✅ All pre-commit checks passed!"
   ```

2. **Add fast build check script**
   ```json
   // package.json
   {
     "scripts": {
       "type-check": "tsc --noEmit",
       "build:check": "next build --experimental-type-check-only",
       "build:fast": "NODE_ENV=production next build"
     }
   }
   ```

### Phase 4: Add Test Execution
1. **Create test runner configuration**
   ```bash
   # .husky/pre-push
   #!/usr/bin/env sh
   . "$(dirname -- "$0")/_/husky.sh"
   
   echo "🧪 Running tests before push..."
   npm test -- --watchAll=false --passWithNoTests || {
     echo "❌ Tests failed. Please fix before pushing."
     exit 1
   }
   ```

2. **Add quick test suite for commits**
   ```json
   // package.json
   {
     "scripts": {
       "test:quick": "jest --bail --findRelatedTests",
       "test:pre-commit": "jest --onlyChanged --passWithNoTests"
     }
   }
   ```

### Phase 5: Database Migration Checks
1. **Add migration verification**
   ```bash
   # scripts/check-migrations.sh
   #!/bin/bash
   
   # Check if schema.prisma was modified
   if git diff --cached --name-only | grep -q "schema.prisma"; then
     echo "📊 Schema changes detected, checking migrations..."
     
     # Verify migration exists
     if ! git diff --cached --name-only | grep -q "migrations/"; then
       echo "❌ Schema changed but no migration file found!"
       echo "Run: npm run db:migrate"
       exit 1
     fi
   fi
   ```

2. **Integrate with pre-commit hook**
   ```bash
   # Add to .husky/pre-commit
   bash scripts/check-migrations.sh || exit 1
   ```

### Phase 6: Commit Message Standards
1. **Create `.commitlintrc.json`**
   ```json
   {
     "extends": ["@commitlint/config-conventional"],
     "rules": {
       "type-enum": [
         2,
         "always",
         [
           "feat",
           "fix",
           "docs",
           "style",
           "refactor",
           "test",
           "chore",
           "perf",
           "build",
           "ci",
           "revert"
         ]
       ],
       "subject-case": [2, "never", ["upper-case"]],
       "subject-max-length": [2, "always", 72]
     }
   }
   ```

2. **Add commit message template**
   ```bash
   # .gitmessage
   # <type>: <subject>
   #
   # <body>
   #
   # <footer>
   #
   # Types: feat, fix, docs, style, refactor, test, chore
   # Example: feat: add user authentication
   
   git config --local commit.template .gitmessage
   ```

### Phase 7: Performance Optimization
1. **Create bypass for emergencies**
   ```bash
   # For emergency commits (use sparingly!)
   git commit --no-verify -m "emergency: fix critical issue"
   ```

2. **Add progressive checks**
   ```javascript
   // .husky/pre-commit-config.js
   module.exports = {
     // Quick checks (< 5 seconds)
     quick: [
       'lint-staged',
       'type-check'
     ],
     // Full checks (on CI or pre-push)
     full: [
       'build:check',
       'test:all'
     ]
   }
   ```

3. **Optimize for speed**
   ```json
   {
     "scripts": {
       "pre-commit": "concurrently \"npm:lint\" \"npm:type-check\"",
       "lint": "eslint . --cache --cache-location .eslintcache",
       "type-check": "tsc --noEmit --incremental"
     }
   }
   ```

### Phase 8: Team Documentation
1. **Create developer guide**
   ```markdown
   # Pre-Commit Hooks Guide
   
   ## What runs on commit:
   - ESLint (auto-fix)
   - Prettier (auto-format)
   - TypeScript check
   - Build verification
   
   ## Bypass (emergency only):
   git commit --no-verify
   
   ## Fix common issues:
   - TypeScript: npm run type-check
   - Lint: npm run lint:fix
   - Build: npm run build:check
   ```

## Rollback Plan
```bash
# Temporarily disable hooks
mv .husky .husky.backup

# Re-enable hooks
mv .husky.backup .husky
```

## Success Criteria
- [ ] No broken commits reach repository
- [ ] TypeScript errors caught before push
- [ ] Build verification under 30 seconds
- [ ] Team adoption > 90%
- [ ] Reduced "fix build" commits by 80%

## Estimated Time
- Setup: 2-3 hours
- Configuration tuning: 2 hours
- Testing and optimization: 2 hours
- Team onboarding: 1 hour
- Total: 7-8 hours

## Dependencies
- Benefits from local database (Plan #1) for faster checks
- Should be implemented after migrations setup (Plan #2)

## Risks and Mitigations
| Risk | Impact | Mitigation |
|------|--------|------------|
| Slow commit process | Developer frustration | Optimize checks, allow bypass |
| False positives | Blocks valid commits | Fine-tune rules, regular updates |
| Team resistance | Low adoption | Training, show time saved |

## Performance Targets
```yaml
Pre-commit checks:
  - Linting: < 3 seconds
  - Type check: < 5 seconds
  - Build check: < 15 seconds
  - Total: < 25 seconds

Pre-push checks:
  - Tests: < 30 seconds
  - Full build: < 60 seconds
```