# Quick Reference: Dependency & Workflow Management

This is a condensed reference guide for common dependency management and workflow tasks. For detailed information, see [DEPENDENCY_MANAGEMENT.md](DEPENDENCY_MANAGEMENT.md).

## Quick Commands

### Daily Checks
```bash
# Check for security vulnerabilities
npm audit

# Check for outdated packages  
npm outdated

# Update patch/minor versions safely
npm update
```

### Weekly Maintenance
```bash
# Full dependency audit with detailed report
npm audit --json > audit-report.json

# Run tests after any updates
npm test

# Check test coverage
npm run test:coverage
```

### Before Major Updates
```bash
# Create backup branch
git checkout -b dependency-updates-$(date +%Y%m%d)

# Document current versions
npm list --depth=0 > versions-before.txt

# Run full test suite
npm test && npm run test:coverage
```

### Emergency Security Updates
```bash
# Fix critical vulnerabilities automatically
npm audit fix

# Manual update of specific vulnerable package
npm install package-name@latest --save-dev

# Verify fix
npm audit
```

## CI/CD Setup Checklist

### Initial Setup
- [ ] Create `.github/workflows/` directory
- [ ] Copy workflow files from `Documentation/workflows/`
- [ ] Customize maintainer usernames and settings
- [ ] Enable GitHub Actions in repository settings
- [ ] Configure branch protection rules

### Dependabot Setup
- [ ] Copy `dependabot.yml` to `.github/dependabot.yml`
- [ ] Update maintainer usernames
- [ ] Enable Dependabot security updates
- [ ] Configure auto-merge rules (optional)

### GitHub Pages Deployment
- [ ] Enable GitHub Pages in repository settings
- [ ] Select "GitHub Actions" as source
- [ ] Copy `deploy.yml` to workflows directory
- [ ] Test deployment on main branch

## Monthly Review Tasks

### Dependencies
- [ ] Review and merge Dependabot PRs
- [ ] Check `npm outdated` for major version updates
- [ ] Run security audit: `npm audit`
- [ ] Update documentation if dependency changes affect usage

### CI/CD
- [ ] Review GitHub Actions workflow runs
- [ ] Check for failed builds or tests
- [ ] Update workflow dependencies if needed
- [ ] Monitor deployment success rate

### Security
- [ ] Review GitHub security alerts
- [ ] Check for new vulnerability advisories
- [ ] Update security documentation if needed
- [ ] Verify all dependencies have acceptable licenses

## Emergency Procedures

### Critical Security Vulnerability
1. **Immediate**: Create hotfix branch
2. **Update**: `npm install vulnerable-package@fixed-version`
3. **Test**: `npm test` (must pass)
4. **Deploy**: Merge to main, deploy immediately
5. **Document**: Update changelog and security notes

### Broken Dependency Update
1. **Identify**: Check which update caused the issue
2. **Revert**: `npm install package-name@previous-version`
3. **Test**: Verify application works
4. **Plan**: Research breaking changes, plan gradual update
5. **Implement**: Update tests and code as needed

### CI/CD Pipeline Failure
1. **Check**: GitHub Actions logs for error details
2. **Local Test**: Reproduce issue locally
3. **Fix**: Update workflow or fix underlying issue
4. **Test**: Verify fix works in test environment
5. **Deploy**: Push fix to restore pipeline

## Useful Tools & Commands

### Analysis Tools
```bash
# Install useful global tools
npm install -g npm-check-updates license-checker depcheck

# Check for unused dependencies
npx depcheck

# Interactive dependency updates
npx npm-check-updates --interactive

# Generate license report
npx license-checker --summary
```

### Testing Commands
```bash
# Run specific test file
npm test -- chmextractor.test.js

# Run tests in watch mode during development
npm run test:watch

# Generate and view coverage report
npm run test:coverage && open coverage/lcov-report/index.html
```

### Git Workflow
```bash
# Create feature branch for dependency updates
git checkout -b deps/update-$(date +%Y%m%d)

# Stage only package files
git add package*.json

# Commit with descriptive message
git commit -m "deps: update development dependencies"
```

## Key File Locations

- **Dependencies**: `package.json`, `package-lock.json`
- **Tests**: `tests/` directory, `npm test`
- **CI/CD**: `.github/workflows/` (when set up)
- **Documentation**: `Documentation/DEPENDENCY_MANAGEMENT.md`
- **Security**: GitHub Security tab, `npm audit`

## Support Resources

- [Node.js Security Guidelines](https://nodejs.org/en/security/)
- [npm Security Documentation](https://docs.npmjs.com/auditing-package-dependencies-for-security-vulnerabilities)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Dependabot Documentation](https://docs.github.com/en/code-security/dependabot)
- [Jest Testing Framework](https://jestjs.io/docs/getting-started)

---

📚 **For comprehensive information, see [DEPENDENCY_MANAGEMENT.md](DEPENDENCY_MANAGEMENT.md)**