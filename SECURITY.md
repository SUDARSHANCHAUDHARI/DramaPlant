# Security policy

## Supported version

Security fixes are applied to the latest version on the `main` branch.

## Reporting a vulnerability

Please report suspected vulnerabilities privately to `sudarshantechlabs@gmail.com`. Do not open a public issue for an unpatched vulnerability.

Include the affected page or file, reproduction steps, expected impact, and any suggested mitigation. Please avoid including secrets or personal data in the report.

## Security posture

DramaPlant has no backend, authentication, analytics, external runtime dependencies, or network API calls. Its production verification rejects common unsafe HTML execution APIs and checks the page's Content Security Policy.
