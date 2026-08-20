# Security Policy

## Reporting vulnerabilities

Please report security issues privately to the repository owner instead of opening a public issue.

Include:
- affected component
- reproduction steps
- potential impact
- suggested mitigation if available

## Production security practices

This project uses:

- environment variable validation
- HTTP security headers
- rate limiting
- dependency update monitoring
- CI validation checks

Never commit:

- API keys
- database credentials
- JWT secrets
- payment provider secrets
