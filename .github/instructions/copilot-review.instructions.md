# GitHub Copilot Review Instructions

When reviewing pull requests, only leave comments for issues that meet at least one of these criteria:

1. The change introduces or is likely to introduce a bug.
2. The change creates a major correctness, security, reliability, scalability, or maintainability flaw.
3. The change breaks existing behavior, tests, contracts, APIs, or documented assumptions.

Do not leave comments for:

* Style preferences.
* Naming preferences unless they cause ambiguity or incorrect behavior.
* Minor refactors.
* Subjective readability opinions.
* Alternative implementations that are not materially safer or more correct.
* Nitpicks.
* Suggestions that do not block merge readiness.

Every review comment must clearly explain:

* The concrete risk.
* Why the current code is flawed.
* The minimum required fix.

If there are no blocking critiques remaining, leave exactly this comment:

Ready to merge.
