# Example CI/CD Workflow Templates

This directory contains example GitHub Actions workflow templates that can be used to set up automated testing, dependency management, and deployment for the CHM Converter project.

## Quick Setup

To set up CI/CD workflows:

1. Create `.github/workflows/` directory in the repository root
2. Copy the desired workflow files from this directory to `.github/workflows/`
3. Customize the workflows as needed for your specific requirements
4. Commit and push the changes to enable GitHub Actions

## Available Templates

### `ci.yml` - Continuous Integration
- Runs tests on multiple Node.js versions
- Performs security audits
- Generates test coverage reports
- Checks for outdated dependencies

### `dependabot.yml` - Automated Dependency Updates  
- Configure in `.github/dependabot.yml`
- Weekly dependency update checks
- Automatic security updates
- PR management and labeling

### `deploy.yml` - GitHub Pages Deployment
- Deploys to GitHub Pages on main branch changes
- Runs tests before deployment
- Manual deployment trigger option

## Customization

Before using these templates:

1. Replace `maintainer-username` with actual GitHub usernames
2. Adjust Node.js versions based on your support requirements
3. Configure branch names to match your workflow
4. Add or remove steps based on your needs
5. Set up required secrets (if using external services)

## Security Considerations

- Review all workflow permissions before enabling
- Use pinned action versions for security
- Limit workflow permissions to minimum required
- Consider using environment protection rules for deployments

For detailed information about setting up and managing these workflows, see the [Dependency Management documentation](../DEPENDENCY_MANAGEMENT.md).