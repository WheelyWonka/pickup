# GitHub Templates for Pickup!

This directory contains GitHub issue and pull request templates to help maintain consistency and gather the right information for effective project management.

## Issue Templates

### 🐛 Bug Report (`bug_report.yml`)
Use this template when reporting bugs or unexpected behavior. It includes:
- Component categorization (Session Management, Player Roster, etc.)
- Severity levels
- Detailed reproduction steps
- Environment information
- Session data context
- Console error reporting

### ✨ Feature Request (`feature_request.yml`)
Use this template for suggesting new features or enhancements. It includes:
- Feature area categorization
- Priority levels
- Problem statement and proposed solution
- User story format
- Acceptance criteria
- Technical considerations

### ⚡ Performance Issue (`performance_issue.yml`)
Use this template for reporting performance problems. It includes:
- Performance issue types specific to Pickup!
- Environment details
- Session size information
- Browser developer tools data
- Timing measurements

### ⚖️ Fairness Concern (`fairness_concern.yml`)
Use this template for reporting fairness issues, which is crucial for Pickup!. It includes:
- Fairness issue types
- Session details
- Specific examples of unfairness
- Statistics context
- Fairness rules reference

### 📚 Documentation (`documentation.yml`)
Use this template for documentation improvements. It includes:
- Documentation type categorization
- Target audience identification
- Content proposals
- Use case descriptions

### ❓ Question (`question.yml`)
Use this template for asking questions about usage or development. It includes:
- Question type categorization
- Context provision
- Research done section
- Expected answer format

## Pull Request Template

The pull request template (`pull_request_template.md`) includes:
- Change type categorization
- Testing checklist specific to Pickup! features
- Performance and fairness impact assessment
- Code quality checklist
- Deployment considerations

## Configuration

The `config.yml` file:
- Disables blank issues (forces template usage)
- Provides helpful contact links
- Links to project documentation and live app

## Usage Guidelines

### For Issue Submitters
1. Choose the most appropriate template for your issue
2. Fill out all required fields
3. Provide as much detail as possible
4. Include relevant context (session data, environment, etc.)
5. Be specific about reproduction steps for bugs

### For Maintainers
1. Review issues using the template structure
2. Use labels to categorize and prioritize
3. Reference the provided context when responding
4. Close issues when resolved with clear explanations

### Labeling Strategy
The templates suggest these labels:
- `bug` - For bug reports
- `enhancement` - For feature requests
- `performance` - For performance issues
- `fairness` - For fairness concerns
- `documentation` - For documentation issues
- `question` - For questions
- `needs-triage` - For initial review

## Customization

To modify these templates:
1. Edit the YAML files for issue templates
2. Update the markdown file for pull request template
3. Modify `config.yml` for configuration changes
4. Test changes by creating test issues/PRs

## Best Practices

1. **Be Specific**: The more detail provided, the easier it is to understand and resolve issues
2. **Use Context**: Include relevant session data, player counts, and environment details
3. **Reproduce Issues**: For bugs, provide clear steps to reproduce
4. **Test Thoroughly**: For PRs, test with various session sizes and scenarios
5. **Consider Fairness**: Always think about how changes affect game fairness
6. **Document Changes**: Update documentation when adding new features

## Related Resources

- [GitHub Issue Templates Documentation](https://docs.github.com/en/communities/using-templates-to-encourage-useful-issues-and-pull-requests/configuring-issue-templates-for-your-repository)
- [Pickup! Project README](../README.md)
- [User Stories and Tasks](../docs/TASKS.md)
- [Live Application](https://pickup.montrealbikepolo.ca)
