---
name: Bug Report
about: Create a report to help us improve the Node.js tutorial application
title: '[BUG] '
labels: ['bug', 'needs-triage']
assignees: []
---

<!--
Node.js Tutorial Application Bug Report Template v1.0.0
This template provides comprehensive bug reporting for the Express.js 5.1.0 educational
application running on Node.js >=24.0.0. Please complete all required sections to
facilitate efficient bug triage, debugging, and resolution while maintaining
educational objectives.

Required Sections: Bug Summary, Steps to Reproduce, Expected Behavior, Actual Behavior,
Environment Information, Educational Impact, Bug Category, Frequency and Reproducibility,
Technical Details and Environment Validation

Supported Configurations:
- Node.js: >=24.0.0 (LTS October 2025)
- Express.js: ^5.1.0 (with ReDoS protection and automatic promise rejection handling)
- TypeScript: ^5.6.3 (ES2024 compilation target)
- Platforms: Windows 10+, macOS 12+, Ubuntu 20.04+
-->

## Bug Summary
<!-- Required: Brief, clear description of the bug or issue -->

**Provide a clear and concise description of what the bug is. Include what you expected to happen vs what actually happened.**

<!-- Minimum 30 characters required -->


## Steps to Reproduce
<!-- Required: Detailed steps to reproduce the bug -->

**Provide detailed step-by-step instructions to reproduce the bug:**

1. Go to '...'
2. Click on '...'
3. Run command '...'
4. See error

<!--
Please ensure steps are:
- Clear and actionable
- Include specific commands, URLs, or actions
- Can be followed by someone unfamiliar with your setup
- Include any necessary setup or prerequisites
-->


## Expected Behavior
<!-- Required: Description of what should happen -->

**A clear and concise description of what you expected to happen.**

<!-- Minimum 20 characters required -->


## Actual Behavior
<!-- Required: Description of what actually happens -->

**A clear and concise description of what actually happened instead.**

<!-- Minimum 20 characters required -->


## Environment Information
<!-- Required: Technical environment details for bug reproduction -->

**Please provide the following environment information:**

- **Node.js Version**: <!-- e.g., 24.0.0 (run `node --version`) -->
- **npm Version**: <!-- e.g., 11.0.0 (run `npm --version`) -->
- **Express.js Version**: <!-- e.g., 5.1.0 (check package.json) -->
- **Operating System**: <!-- e.g., Windows 11, macOS 14.0, Ubuntu 22.04 -->
- **TypeScript Version**: <!-- e.g., 5.6.3 (if applicable) -->
- **Browser**: <!-- e.g., Chrome 120.0, Firefox 121.0 (if web-related) -->

<!--
Environment Validation Requirements:
- Node.js version must match >=24.0.0 requirement
- npm version should be >=11.0.0 for compatibility
- Express.js version should be ^5.1.0 for security features
- Operating system must be supported platform
-->


## Error Messages and Logs
<!-- Optional: Complete error messages, stack traces, and relevant logs -->

**Paste any error messages, stack traces, or relevant log output here:**

```text
Paste any error messages, stack traces, or relevant log output here.
Include the full error message and any relevant context.
```

<!--
Include:
- Complete error messages (not truncated)
- Full stack traces when available
- Console output leading up to the error
- Any relevant log files or debugging output
- CI/CD pipeline logs if applicable
-->


## Code Sample
<!-- Optional: Minimal code example that reproduces the issue -->

**Provide a minimal, complete code example that reproduces the issue:**

```typescript
// Provide a minimal, complete code example that reproduces the issue
// Include only the necessary code to demonstrate the problem

import express from 'express';

const app = express();

// Your code that demonstrates the issue
app.get('/hello', (req, res) => {
  // Issue occurs here
});

app.listen(3000);
```

<!--
Code sample guidelines:
- Keep it minimal but complete
- Include all necessary imports and setup
- Focus on the specific issue
- Use TypeScript syntax when applicable
- Include comments explaining where the issue occurs
-->


## Educational Impact
<!-- Required: Assessment of how this bug affects the learning experience -->

### Learning Objective Impact
**How does this bug affect the tutorial's learning objectives?**
<!-- Minimum 20 characters required -->


### Skill Level Affected
**Which skill levels are most impacted by this bug?**
- [ ] Beginner
- [ ] Intermediate
- [ ] Advanced
- [ ] All Levels

### Tutorial Section Affected
**Which part of the tutorial is affected by this bug?**
- [ ] Hello World Endpoint Implementation
- [ ] Express.js Server Configuration
- [ ] TypeScript Integration and Setup
- [ ] Testing Framework and Coverage
- [ ] Security Middleware Implementation
- [ ] Error Handling and Logging
- [ ] Development Workflow and Scripts
- [ ] Deployment and Infrastructure
- [ ] Documentation and Examples
- [ ] CI/CD Pipeline Configuration

### Severity for Learning
**How severely does this impact the learning experience?**
- [ ] Low (Minor inconvenience with minimal educational disruption)
- [ ] Medium (Hinders learning progress but workarounds exist)
- [ ] High (Significantly impacts learning objectives)
- [ ] Critical (Completely blocks tutorial completion)

### Student Experience Impact
**How does this affect the student learning experience?**
- [ ] Completely blocks tutorial progression
- [ ] Significantly hinders learning progress
- [ ] Causes confusion but workaround exists
- [ ] Minor inconvenience with minimal impact
- [ ] Cosmetic issue with no learning impact


## Bug Category
<!-- Required: Categorize the type of bug for better triage -->

**Select the category that best describes this bug:**

- [ ] 🐛 Application Logic Error (incorrect behavior in code)
- [ ] 💥 Runtime Error (application crashes or throws exceptions)
- [ ] 🔧 Configuration Issue (setup or configuration problems)
- [ ] 📚 Documentation Error (incorrect or missing documentation)
- [ ] 🧪 Testing Issue (problems with tests or test setup)
- [ ] 🎨 UI/Display Issue (visual or formatting problems)
- [ ] ⚡ Performance Issue (slow response times or resource usage)
- [ ] 🔒 Security Issue (potential security vulnerability)
- [ ] 🌐 Environment Issue (platform or environment-specific problems)
- [ ] 📦 Dependency Issue (problems with npm packages or versions)


## Frequency and Reproducibility
<!-- Required: Information about how often the bug occurs -->

### Reproducibility
**How consistently can you reproduce this bug?**
- [ ] Always (100% of the time)
- [ ] Sometimes (50-99% of the time)
- [ ] Rarely (less than 50% of the time)
- [ ] Once (only happened once)

### First Occurrence
**When did you first notice this issue?**
<!-- Optional: e.g., "Started after updating to Node.js 24.1.0" -->


### Conditions
**Are there specific conditions that trigger this bug?**
<!-- Optional: e.g., "Only occurs on Windows", "Only with specific input data" -->


## Technical Details and Environment Validation
<!-- Required: Comprehensive technical information for debugging and resolution -->

### Package Manager Details
**npm/yarn version and any relevant configuration:**
```bash
# Run: npm config list
# Include relevant output here
```

### Development Environment
**IDE/Editor, terminal, development server setup:**
<!-- e.g., "Visual Studio Code 1.85.0, Windows Terminal, nodemon development server" -->


### Build Configuration
**TypeScript config, build scripts, compilation issues:**
```bash
# Include tsconfig.json settings or build output if relevant
```

### Network/Port Configuration
**Port conflicts, network settings, firewall issues:**
<!-- e.g., "Port 3000 in use, firewall blocking connections" -->


### System Resources
**Memory usage, CPU utilization, disk space:**
```bash
# Include system resource information if relevant
# e.g., output from: node -e "console.log(process.memoryUsage())"
```

### CI/CD Pipeline Context
**If this issue occurs in CI/CD (reference .github/workflows/ci.yml):**
- [ ] Issue occurs in GitHub Actions workflow
- [ ] Specific to validation job
- [ ] Related to test execution
- [ ] Security scanning failure
- [ ] Build process error
- [ ] Docker image build issue

**CI/CD Environment Variables (if applicable):**
```bash
# Include relevant environment variables from the CI/CD context
NODE_VERSION: "24.x"
NPM_VERSION: "11.x"
WORKING_DIRECTORY: "src/backend"
```


## Workaround
<!-- Optional: Any temporary solutions or workarounds found -->

**If you've found a way to work around this issue, please describe it here. This can help other users experiencing the same problem.**


## Framework-Specific Context
<!-- Required: Issues related to Node.js 24.x and Express.js 5.1.0 features -->

### Node.js 24.x Compatibility
**Is this issue related to Node.js 24.x specific features?**
- [ ] V8 engine 13.6 compatibility issues
- [ ] npm 11.x package management problems
- [ ] Built-in test runner integration issues
- [ ] AsyncLocalStorage and URLPattern usage problems
- [ ] Performance and memory-related issues
- [ ] ClangCL compilation requirements (Windows)

### Express.js 5.1.0 Integration
**Is this issue related to Express.js 5.1.0 features?**
- [ ] Automatic promise rejection handling problems
- [ ] Security feature issues (ReDoS protection)
- [ ] path-to-regexp@8.x compatibility problems
- [ ] Middleware pattern implementation issues
- [ ] Error handling and middleware execution problems

### TypeScript Integration
**Is this issue related to TypeScript usage?**
- [ ] TypeScript compilation errors or warnings
- [ ] Type definition problems with Express.js 5.1.0
- [ ] ES2024 feature compatibility issues
- [ ] Type-safe Express.js integration problems
- [ ] Declaration file generation issues

### Dependency Context (from package.json)
**Is this issue related to specific dependencies?**
- [ ] express: ^5.1.0
- [ ] helmet: ^7.1.0
- [ ] cors: ^2.8.5
- [ ] express-rate-limit: ^7.1.5
- [ ] typescript: ^5.3.0
- [ ] jest: ^29.7.0
- [ ] Other dependency (specify): _______________


## Additional Context
<!-- Optional: Any other relevant information, screenshots, or context -->

**Add any other context about the problem here. Include screenshots, network requests, or any other relevant information that might help diagnose the issue.**


## Related Issues
<!-- Optional: Links to related issues or discussions -->

**Link any related issues, discussions, or pull requests:**
- Related to #123
- Similar to #456
- Duplicate of #789


## Suggested Solution
<!-- Optional: Ideas for how this bug might be fixed -->

**If you have ideas about how this bug could be fixed, please share them here. Include any relevant code suggestions or approaches.**


---

<!--
Automated Processing Information:
- Bug Report Version: 1.0.0
- Node.js Requirement: >=24.0.0
- Express.js Requirement: ^5.1.0
- Supported Platforms: ["Windows", "macOS", "Linux"]
- Auto-assignment: Critical bugs → @maintainers, Security issues → @security-team
- CI/CD Integration: GitHub Actions workflow compatibility validation
- Educational Focus: Tutorial application quality assurance and learning effectiveness
-->