# Dependency and Workflow Management

This document provides comprehensive guidance for maintaining project dependencies and CI/CD workflows for the CHM Converter project.

## Overview

The CHM Converter project uses Node.js with npm for dependency management and Jest for testing. This guide covers dependency analysis, updates, security scanning, and workflow automation to keep the project secure and up-to-date.

## Current Tech Stack

- **Runtime**: Browser-based (client-side JavaScript)
- **Package Manager**: npm
- **Testing Framework**: Jest with jsdom
- **Dependencies**: Development dependencies only (no production runtime dependencies)
- **CI/CD**: Currently none (manual testing and deployment)

## Dependency Management

### Current Dependencies

The project uses only development dependencies:

```json
{
  "devDependencies": {
    "@testing-library/jest-dom": "^6.8.0",
    "css-tree": "^3.1.0",
    "jest": "^30.1.3",
    "jest-environment-jsdom": "^30.1.2",
    "jsdom": "^27.0.0"
  }
}
```

### Dependency Analysis Process

#### 1. Regular Dependency Auditing

**Frequency**: Monthly or when adding new dependencies

**Commands to run**:
```bash
# Check for outdated dependencies
npm outdated

# Check for security vulnerabilities
npm audit

# Get detailed vulnerability report
npm audit --json > audit-report.json
```

**What to look for**:
- Outdated packages (especially major version changes)
- Security vulnerabilities (high/critical severity)
- Deprecated packages
- License compatibility issues

#### 2. Dependency Update Strategy

**Safe Updates (Patch and Minor)**:
```bash
# Update all patch and minor versions
npm update

# Update specific package
npm update package-name

# Check what will be updated (dry run)
npm update --dry-run
```

**Major Version Updates**:
```bash
# Check for major updates available
npm outdated

# Update specific package to latest major version
npm install package-name@latest --save-dev

# For testing packages, consider compatibility
npm install jest@latest --save-dev
```

#### 3. Update Verification Process

**Before updating**:
1. Create a backup branch: `git checkout -b dependency-updates-YYYY-MM-DD`
2. Document current versions: `npm list --depth=0 > versions-before.txt`
3. Run full test suite: `npm test`
4. Check test coverage: `npm run test:coverage`

**After updating**:
1. Install and verify: `npm install`
2. Run full test suite: `npm test`
3. Compare coverage: `npm run test:coverage`
4. Test browser functionality manually
5. Document changes: `npm list --depth=0 > versions-after.txt`

**Manual testing checklist**:
- [ ] File upload functionality works
- [ ] CHM file validation functions correctly
- [ ] JSON extraction and preview display properly
- [ ] CSV export generates valid files
- [ ] Download functionality works in multiple browsers
- [ ] Error handling displays appropriate messages
- [ ] Responsive design works on mobile devices

### Security Management

#### 1. Vulnerability Scanning

**Regular scans**:
```bash
# Basic audit
npm audit

# Fix automatically fixable vulnerabilities
npm audit fix

# Force fix (use with caution - may break compatibility)
npm audit fix --force

# Detailed security report
npm audit --json | jq '.' > security-audit.json
```

**Interpreting results**:
- **Critical/High**: Update immediately
- **Moderate**: Update in next planned update cycle
- **Low**: Update when convenient, consider risk vs. benefit

#### 2. Dependency Scanning Tools

Consider integrating additional security tools:

**Snyk** (for comprehensive scanning):
```bash
# Install globally
npm install -g snyk

# Test for vulnerabilities
snyk test

# Monitor continuously
snyk monitor
```

**GitHub Dependabot** (automated security updates):
- Enable Dependabot security updates in repository settings
- Configure automatic dependency updates

#### 3. License Compliance

Check for license compatibility:
```bash
# Install license checker
npm install -g license-checker

# Check licenses
license-checker --summary

# Generate detailed license report
license-checker --json > licenses.json
```

## CI/CD Workflow Setup

### Recommended GitHub Actions Workflow

Create `.github/workflows/ci.yml`:

```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    strategy:
      matrix:
        node-version: [18.x, 20.x]
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Use Node.js ${{ matrix.node-version }}
      uses: actions/setup-node@v4
      with:
        node-version: ${{ matrix.node-version }}
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run tests
      run: npm test
    
    - name: Run test coverage
      run: npm run test:coverage
    
    - name: Upload coverage to Codecov
      uses: codecov/codecov-action@v3
      if: matrix.node-version == '20.x'
    
    - name: Run security audit
      run: npm audit --audit-level high

  dependency-check:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4
    
    - name: Use Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '20.x'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Check for outdated dependencies
      run: npm outdated || true
    
    - name: Security audit
      run: npm audit --audit-level high
```

### Dependabot Configuration

Create `.github/dependabot.yml`:

```yaml
version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "weekly"
      day: "monday"
      time: "06:00"
    open-pull-requests-limit: 5
    commit-message:
      prefix: "deps"
      include: "scope"
    reviewers:
      - "maintainer-username"
    labels:
      - "dependencies"
    allow:
      - dependency-type: "direct"
      - dependency-type: "indirect"
    ignore:
      - dependency-name: "*"
        update-types: ["version-update:semver-major"]
```

### Deployment Workflow

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '20'
        cache: 'npm'
    - name: Install dependencies
      run: npm ci
    - name: Run tests
      run: npm test

  deploy:
    needs: test
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    steps:
    - name: Checkout
      uses: actions/checkout@v4
    - name: Setup Pages
      uses: actions/configure-pages@v4
    - name: Upload artifact
      uses: actions/upload-pages-artifact@v3
      with:
        path: '.'
    - name: Deploy to GitHub Pages
      id: deployment
      uses: actions/deploy-pages@v4
```

## Maintenance Schedule

### Weekly Tasks
- [ ] Review Dependabot PRs and security alerts
- [ ] Monitor CI/CD pipeline health
- [ ] Check for critical security updates

### Monthly Tasks
- [ ] Run comprehensive dependency audit: `npm audit`
- [ ] Check for outdated dependencies: `npm outdated`
- [ ] Review and update dev dependencies
- [ ] Test application functionality after updates
- [ ] Update documentation if needed

### Quarterly Tasks
- [ ] Review Node.js version compatibility
- [ ] Evaluate new testing tools and dependencies
- [ ] Update CI/CD workflow configurations
- [ ] Perform manual browser compatibility testing
- [ ] Review and update security policies

### Annual Tasks
- [ ] Major dependency updates (breaking changes)
- [ ] CI/CD infrastructure review
- [ ] Security audit and penetration testing
- [ ] Documentation review and updates
- [ ] License compliance review

## Emergency Update Procedures

### Critical Security Vulnerabilities

When a critical security vulnerability is discovered:

1. **Immediate Response (within 24 hours)**:
   ```bash
   # Create emergency branch
   git checkout -b security-fix-$(date +%Y%m%d)
   
   # Update vulnerable dependency
   npm update vulnerable-package-name
   
   # Run tests
   npm test
   
   # If tests pass, merge immediately
   ```

2. **Verification**:
   - Run full test suite
   - Manual functionality testing
   - Security scan verification
   - Create hotfix release if needed

3. **Documentation**:
   - Update CHANGELOG.md
   - Document security fix in release notes
   - Notify users if user action required

### Handling Breaking Changes

For major version updates with breaking changes:

1. **Preparation**:
   - Create dedicated branch: `git checkout -b major-update-package-name`
   - Read migration guides and changelogs
   - Plan testing approach

2. **Implementation**:
   - Update one major dependency at a time
   - Update tests and configurations as needed
   - Verify application functionality

3. **Testing**:
   - Run automated tests: `npm test`
   - Manual testing across browsers
   - Performance testing for large files
   - Accessibility testing

4. **Rollback Plan**:
   - Keep previous package-lock.json backed up
   - Document rollback procedure
   - Test rollback process in separate branch

## Tools and Resources

### Recommended Tools
- **npm-check-updates**: `npm install -g npm-check-updates`
- **depcheck**: `npm install -g depcheck`
- **license-checker**: `npm install -g license-checker`
- **snyk**: `npm install -g snyk`

### Useful Commands Reference
```bash
# Dependency management
npm outdated                    # Check for outdated packages
npm audit                       # Security audit
npm update                      # Update minor/patch versions
npm list --depth=0              # List installed packages
npm ci                         # Clean install (for CI)

# Testing
npm test                       # Run test suite
npm run test:coverage          # Run with coverage
npm run test:watch            # Watch mode

# Package analysis
npx depcheck                   # Find unused dependencies
npx license-checker            # Check licenses
npx npm-check-updates         # Check for updates
```

## Best Practices

1. **Never update all dependencies at once** - Update incrementally
2. **Always test after updates** - Automated and manual testing
3. **Keep package-lock.json in version control** - Ensures reproducible builds
4. **Use specific versions for critical dependencies** - Avoid breaking changes
5. **Document breaking changes** - Help future maintainers
6. **Monitor security advisories** - Stay informed about vulnerabilities
7. **Use automated tools** - Reduce manual effort and errors
8. **Have a rollback plan** - Be prepared for failed updates

## Troubleshooting

### Common Issues

**npm audit reports false positives**:
- Research the vulnerability carefully
- Check if it affects your usage
- Consider using `npm audit fix --force` carefully
- Use `npm audit --json` for detailed analysis

**Tests fail after dependency update**:
- Check for breaking changes in updated packages
- Review migration guides
- Update test configurations if needed
- Consider reverting and updating incrementally

**CI/CD pipeline failures**:
- Check Node.js version compatibility
- Verify all required environment variables
- Review GitHub Actions logs carefully
- Test locally with same Node.js version

**Large package-lock.json changes**:
- This is normal for major updates
- Review changes for unexpected packages
- Consider running `npm ci` to verify
- Commit the changes together with code updates

This documentation should be reviewed and updated regularly as the project evolves and new tools become available.