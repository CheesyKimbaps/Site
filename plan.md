# Payment Method Expansion & Analytics Overhaul Plan

## Goal
Expand payment methods to: Zelle, Cash App, Apple Pay, PayPal, Crypto. Update all analytics, forms, and summaries to use these methods, with normal finance math (profit = paid - cost).

---

## Phase 1: Data Model & Form Update
- [x] Update the `Transaction` type/interface to use the new payment methods.
- [x] Update the transaction form to allow selecting any of the five methods.
- [x] Update transaction history and filters to support all methods.

## Phase 2: Stats & Fee Logic
- [x] Remove/replace old fee logic with a generic or per-method approach (if needed).
- [x] Update summary statistics to show totals per method and overall.

## Phase 3: Charts & Analytics
- [x] Update charts to show breakdowns for all five methods.
- [x] Ensure daily earnings and profit-over-time charts work with the new methods, including daily earnings broken down by payment method.

## Phase 4: Data Migration & Backward Compatibility
- [x] No migration needed (starting with no existing data).

## Phase 5: Testing & Polish
- [ ] Test all flows for correctness.
- [ ] Update CSV/JSON export to include new methods.
- [ ] Update README and comments for maintainability.

---

**Current Step:** Phase 5: Testing & Polish 