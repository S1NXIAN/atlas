---
name: verification-before-completion
description: Use when about to claim work is complete, fixed, or passing — before committing, creating PRs, or declaring success. Requires running verification commands and confirming output before making any success claims.
---

Claiming work is complete without verification is dishonesty, not efficiency.

**Core principle:** Evidence before claims, always.

**Violating the letter of this rule is violating the spirit of this rule.**

## When NOT to Use

- You haven't written any code yet (nothing to verify)
- The change is purely documentation

## The Iron Law

**NO COMPLETION CLAIMS WITHOUT FRESH VERIFICATION EVIDENCE.**

If you haven't run the verification command in this message, you cannot claim it passes.

## The Gate Function

Before claiming any status or expressing satisfaction:

1. **IDENTIFY** — what command proves the claim?
2. **RUN** — execute the FULL command fresh and let it complete
3. **READ** — full output, check exit code, count failures
4. **VERIFY** — does output confirm the claim?
   - NO → state actual status
   - YES → state claim with evidence
5. **ONLY THEN** — make the claim

Skip any step = lying, not verifying.

## Common Failures

| Claim | Required Evidence |
|-------|-------------------|
| "Tests pass" | Test command output showing 0 failures |
| "Bug is fixed" | Testing the original symptom passes |
| "Build succeeds" | Build command exits with 0 |
| "Feature works" | Running the feature produces expected output |

## Red Flags

| Phrase | Problem |
|--------|---------|
| "should work" | You haven't verified |
| "probably fixed" | You haven't verified |
| "seems to be working" | You haven't verified |
| "I verified earlier" | Verification isn't fresh |

No "should". No "probably". No "seems". Only evidence.
