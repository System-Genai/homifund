# Cross-Role Dashboard Consistency Design

## Scope

Standardize the renter, landlord, and admin dashboard shells without changing their data, routes, permissions, or page-specific workflows.

## Visual Contract

- Header actions use one 44px square, 8px-radius, bordered surface treatment.
- The current route uses a restrained primary tint, primary icon color, and inset indicator instead of a fully filled button.
- Only the exact current route may receive current-page styling and `aria-current="page"`.
- Dashboard content uses one 1280px maximum width, fluid 16-32px page gutters, and a 24-32px vertical rhythm.
- Top-level page grids use the same gap scale, align at the top, and guarantee `min-width: 0` for every grid child.
- Mobile layouts remain single-column. Existing page-specific grid ratios may activate at their current desktop breakpoints.

## Implementation

1. Add shared dashboard tokens and component rules to `public/css/style.css`.
2. Let the existing dashboard initializer mark the content container, page heading, and top-level grids with semantic classes.
3. Remove false filled Profile states from landlord pages and restore missing current-page semantics where required.
4. Add static regression contracts for visual tokens, content normalization, and active-state correctness.

## Validation

- Run the full Node test suite and production CSS build.
- Compare renter, landlord, and admin representative routes at mobile, tablet, desktop, and wide-desktop widths.
- Confirm identical header-control geometry, exact current-route state, consistent content bounds, stable grid gaps, and zero horizontal overflow.

## Non-Goals

- No new workflows, data services, role permissions, typography, or color rebrand.
- No forced identical column ratios where page content has different information needs.
