# Requirements Traceability (2026-02-14)

Source: `Reference/Requirements..md`

## Implemented Mapping
1. California district capture:
   - `filing-plan.california_district` includes Northern/Eastern/Central/Southern.
2. California opt-out exemption logic:
   - `filing-plan.exemption_system` enforces `703` or `704` selection.
   - Review and intake pages display exemption context.
3. Means-test screening workflow:
   - Six-month gross income capture fields (`income_month_1` ... `income_month_6`).
   - California median income logic (effective `2025-11-01`) in `src/lib/bankruptcy/california.ts`.
   - Chapter 7 screening states: exception / below-median / above-median.
   - Chapter 13 screening states: likely 36 vs 60 month window.
4. Exception and consumer-debt inputs:
   - `primarily_consumer_debts`
   - `disabled_veteran_means_test_exception`
   - `active_military_means_test_exception`
5. Mandatory filing checkpoints:
   - Credit counseling completion + certificate.
   - 341 meeting attendance acknowledgment.
   - Debtor education tracking.
6. Credit report authorization controls:
   - FCRA authorization field + signature date.

## Still Needed (when you complete deployment step 3)
1. Apply migration and deploy staging.
2. Add jurisdiction-specific chapter 13 plan form metadata per district.
3. Add automated median update process (DOJ table refresh cadence).
4. Add attorney fee-estimate module only after final attorney approval of ranges/disclaimers.
