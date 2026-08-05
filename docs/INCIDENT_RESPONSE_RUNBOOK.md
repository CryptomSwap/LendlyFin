# Incident Response Runbook (Beta)

This runbook defines how to respond to production incidents during beta.

## Severity levels

- `SEV-1` Critical outage: booking/auth/admin core flows down, data corruption risk, or security incident.
- `SEV-2` Major degradation: important flow partially broken, elevated 5xx, high user impact.
- `SEV-3` Minor issue: limited scope, workaround exists, low immediate risk.

## First 15 minutes

1. Acknowledge incident in team channel and assign incident commander.
2. Capture scope quickly:
   - affected routes/features
   - start time
   - user impact
3. Check recent deploys/config changes.
4. Decide immediate mitigation:
   - rollback deploy
   - feature flag off
   - temporary route disable/block

## Triage checklist

- Verify if auth/session is healthy.
- Check DB connectivity and query errors.
- Check API error logs for top failing routes.
- Check admin/security events for suspicious activity.
- Confirm if issue is isolated to one role (admin/owner/renter) or global.

## Communication cadence

- `SEV-1`: updates every 15 minutes.
- `SEV-2`: updates every 30 minutes.
- `SEV-3`: updates every 60 minutes.

Each update should include: current impact, mitigation status, next action, ETA.

## Exit criteria

- Error rate returns to baseline for at least 30 minutes.
- Core smoke flows pass (signin, listings, booking create, admin review).
- Incident timeline and root cause are documented.

## Postmortem template

- What happened
- Impact summary
- Root cause
- Detection gaps
- Action items (owner + due date)
