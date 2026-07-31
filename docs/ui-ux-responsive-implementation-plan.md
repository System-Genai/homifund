# HomiFund UI/UX and Responsive Implementation Plan

Date: 2026-07-30  
Status: Analysis and planning only; no application implementation changes are included in this document.

## 1. Executive summary

HomiFund is an Express 5, EJS, Tailwind-CDN application with a public marketing site and role-based renter, landlord, and admin workspaces. The frontend currently contains 50 screen templates, 50 GET routes, 3 POST routes, 8 shared EJS partials, 1 shared stylesheet, and 1 shared behavior script. Most product data and interactions are static prototypes; only signup, login, logout, and role selection have server-backed behavior.

The most urgent UI/UX problems are systemic rather than isolated:

1. Protected navigation is unavailable below 768px. `setupDashboardDrawer()` expects the header inside `main`, but the templates use several incompatible header/main structures. The initializer exits before creating a menu button or drawer.
2. Dashboard layouts use incompatible fixed offsets (`240px`, `280px`, and `304px`). The renter HomiScore screen is almost entirely off-canvas at 320px, and landlord dashboard/HomiScore content is compressed or clipped at tablet widths.
3. The shared `/js/main.js` file is included twice in 42 of the 50 screen templates. A public page consequently creates 2 mobile drawers and 2 overlays while showing only 1 menu button.
4. Accessibility foundations are incomplete: no `focus-visible` rules, no reduced-motion handling, 95 outline removals, 136 `transition-all` usages, 501 buttons but only 70 `aria-label` occurrences, 229 form controls but 123 labels, and modal semantics/focus management are largely absent.
5. UI state coverage is minimal. Apart from auth errors and 2 local toasts, the application has no reusable loading, skeleton, empty, offline, unauthorized, server-error, or retry states. Role failures render the 404 screen with 403 status rather than a purpose-built unauthorized state.
6. The application has 7 tables and 10 forms, but many apparent forms are unwrapped controls or static prototypes. Onboarding, verification, settings, profile, contact, password reset, and property wizard flows do not yet have consistent validation, persistence, progress, or submission feedback.
7. A global `main { max-width: 1100px; }` rule constrains every screen, including dashboards, to about 43% of a 2560px viewport. The same stylesheet sets Arial while the shared head configures Inter, causing ownership and consistency conflicts.

The recommended delivery strategy is to repair the shared shell and design foundations first, migrate one representative renter and landlord vertical slice, and then roll the same tested primitives through every route. Page-by-page CSS patching should be avoided because the current failures come from conflicting layout ownership.

## 2. Audit scope and evidence

### 2.1 Code inspected

- `server.js`, `routes/mainRoutes.js`, `controllers/auth.js`, `middleware/auth.js`, and `models/User.js`
- All 50 non-partial EJS screen templates
- All 8 shared EJS partials
- `public/css/style.css`
- `public/js/main.js` and all auth/profile/session scripts
- Route-to-view, view-to-partial, form-action, link, inline-script, modal, table, image, and conditional-state relationships

### 2.2 Live validation performed

- Public routes were validated through the running application at `http://localhost:5000`.
- All 50 EJS screen templates were rendered through a temporary read-only local audit server with representative locals. This bypassed role authentication only for visual inspection and did not modify application code or database data.
- Layout checks were run at 320, 375, 480, 768, 1024, 1440, and 2560 CSS pixels.
- Representative screenshots were inspected for public navigation, pricing, landlord dashboard, and renter HomiScore.
- The protected screens were not validated with real authenticated data mutations. Backend submission behavior, persisted empty states, and role-specific data authorization remain implementation-time test requirements.

### 2.3 Key source evidence

- `public/js/main.js:48-61`: dashboard drawer initialization searches for `main`, then `main.querySelector("header")`, and exits when the header is a sibling.
- `public/css/style.css:16-29`: root overflow is hidden, Arial is assigned, and every `main` receives a global 1100px maximum width.
- `views/user/partials/sidebar-renter.ejs:3` and `sidebar-landlord.ejs:3`: sidebars are hidden below `md` and fixed to 240px.
- User screens independently apply `ml-[280px]`, `md:ml-[240px]`, `pl-[304px]`, and header padding offsets.
- `middleware/auth.js:43-45`: role failures render `main/404` with a 403 response.
- `views/admin/management.ejs` and `verification-review.ejs`: both render the same single heading and include `main.js` twice.
- `views/main/onboarding-complete.ejs`: the completion screen contains only an H1 and includes `main.js` twice.
- `views/user/landlord/review-application.ejs` and `view-profile.ejs` differ by only 2 added and 2 removed lines, indicating a duplicated screen.

## 3. Application and route inventory

### 3.1 Route summary

| Area | GET routes | POST routes | Screen templates | Access |
|---|---:|---:|---:|---|
| Public marketing and auth | 12, including logout | 2 | 11 plus shared 404 | Public or redirect-if-auth |
| Onboarding and verification | 5 | 1 role-selection POST counted above | 5 | Authenticated |
| Landlord workspace | 19 | 0 | 19 | `landlord` role |
| Renter workspace | 12 | 0 | 12 | `renter` role |
| Admin workspace | 2 | 0 | 2 | `admin` role |
| Fallback state | Middleware fallback | 0 | 1 | Any unmatched URL |
| Total | 50 | 3 | 50 | Mixed |

`GET /logout` has no screen template. The 404 screen is middleware-rendered and is not one of the 50 explicit GET routes.

### 3.2 Public, auth, onboarding, and edge screens

| Route | Template | Screen and interactive surfaces | Current findings | Target responsive behavior | Issue IDs |
|---|---|---|---|---|---|
| `/` | `main/index` | Marketing home, trust metrics, renter/landlord CTAs | Shared script runs twice; action routing is bound by visible text; ultra-wide content is globally capped | Single-row mobile header, stacked content at base, 2-column sections from `lg`, 1280px marketing container | HF-006, HF-011, HF-019, HF-020, HF-028 |
| `/about` | `main/about` | Company story, principles, CTA | External image rendered broken in audit; missing alt/dimensions; decorative overflow hidden by root | Full-width bands with constrained copy; image uses aspect ratio, responsive sources, alt, and reserved space | HF-011, HF-017, HF-018, HF-028 |
| `/contact` | `main/contact` | Contact details, resource links, contact form | 400px decorative icon extends outside viewport at 320-1024; form has no action/state; controls remove outlines | Hide/resize decorative art by breakpoint; 1-column mobile form; inline errors and submission status | HF-003, HF-007, HF-009, HF-013, HF-021 |
| `/faqs` | `main/FAQs` | Search, category tabs, accordion, CTA | Search has no programmatic label; 4 accordion icon buttons lack names; tabs/accordion targets are under 44px; no URL state | Scrollable or wrapping tablist, semantic accordion, 44px targets, query-param search/category | HF-013, HF-014, HF-029, HF-033 |
| `/pricing` | `main/pricing` | Plan cards and feature comparison table | No `main` landmark; table uses horizontal scroll but needs better mobile discovery; duplicate shared script | Plan cards and feature accordions below 768px; comparison table with sticky feature column above 768px | HF-006, HF-012, HF-016, HF-034 |
| `/renters` | `main/renters` | Renter product page, score card, FAQ, CTA | Broken external image in audit; image lacks alt/dimensions; multiple cursor-only cards; low-contrast accent token | Content-first mobile stack; real semantic buttons/links; responsive image assets | HF-005, HF-015, HF-017, HF-020 |
| `/landlords` | `main/landlords` | Landlord product page, listing cards, chart mockup, FAQ, CTA | 9 non-semantic clickable surfaces; 2 broken external images; charts rely on hover and color; fixed visual heights | Semantic cards/actions, accessible chart summary, responsive image aspect ratios, stacked metrics | HF-005, HF-014, HF-017, HF-026, HF-033 |
| `/signup` | `main/signup` | Signup form, password reveal, policy links | Password icon is 24x25px and unnamed; errors are not announced; placeholder policy links are `#`; no complete autocomplete contract | 44px password control, field errors with `aria-describedby`, loading state, valid legal links | HF-013, HF-014, HF-021, HF-023, HF-033 |
| `/login` | `main/login` | Login form, social placeholders, forgot password | Password icon is 24x25px and unnamed; error not live; social action is prototype-only; image lacks dimensions | Single-column form, stable 44px actions, inline/live errors, explicit pending state | HF-013, HF-014, HF-017, HF-021, HF-033 |
| `/logout` | No template; controller redirect | Session-ending navigation action | State-changing action uses GET and immediately redirects with no pending, confirmation, or failure surface | Use a POST action with CSRF protection; expose a named menu action; redirect to a signed-out success state only when useful | HF-020, HF-021, HF-033 |
| `/forget-password` | `main/forget-password` | Reset email form | Prevents submit and appends fake success text; no backend action; low-contrast support text; no live region | Server-backed request state with neutral anti-enumeration copy and retry path | HF-003, HF-015, HF-021, HF-023 |
| `/role-selection` | `main/role-selection` | Renter/landlord role cards and submit | Cards are clickable `div`s with inline handlers and no keyboard behavior; landlord is preselected; errors not live | Radio-card group with labels, arrow/tab support, visible checked state, no preselection unless intentional | HF-005, HF-007, HF-013, HF-021 |
| `/onboarding-landlord` | `main/onboarding-landlord` | Multi-section profile form and progress stepper | Form has no action/method contract; several controls lack associated labels; progress is visually dense; no save state | Multi-step form route/state, sticky progress summary, 1-column mobile fields, 2-column desktop groups | HF-003, HF-013, HF-021, HF-025 |
| `/onboarding-tenant` | `main/onboarding-tenant` | Household, income, preferences, passport preview | 11 controls but no form element; no H1; all visible controls failed programmatic-label check; stepper clips | Semantic form, one H1, associated labels, step-based mobile flow, autosave/draft status | HF-003, HF-013, HF-016, HF-025 |
| `/onboarding-complete` | `main/onboarding-complete` | Completion state | Only displays `HomiFund`; no success summary, next action, or recovery; script loaded twice | Purpose-built success state with role-aware next action and resume/retry path | HF-006, HF-021, HF-023 |
| `/landlord-verification` | `main/landlord-verification` | Identity/address/ownership/banking verification | Dense stepper and cards clip at 320px; upload and method controls are mostly prototype surfaces; no form state | Vertical mobile stepper, resumable sections, semantic upload controls, per-step status and error | HF-003, HF-005, HF-009, HF-021, HF-025 |
| `/tenant-verification` | `main/tenant-verification` | Identity/address/income/banking/rental verification | 8 meaningful clipped elements at 320px after excluding the intentional stepper scroller; 3 unlabeled controls; no form | Vertical mobile status list, wrapped method chips, labelled controls, resumable verification tasks | HF-003, HF-009, HF-013, HF-021, HF-025 |
| Any missing URL | `main/404` | Not-found state | Correct 404 content, but footer links use `#`; same screen is reused for authorization failure | Preserve 404; add dedicated 403 and 500 states with safe next actions | HF-022, HF-023 |

### 3.3 Landlord workspace screens

| Route | Template | Screen and complex surfaces | Current findings | Target responsive behavior | Issue IDs |
|---|---|---|---|---|---|
| `/user/landlord/dashboard` | `dashboard` | KPIs, HomiScore, applicants, pipeline, payments, calendar | No mobile navigation; header clips at 320; 768px content is only about 522px wide and applicant actions clip | App shell drawer below `lg`; stacked KPIs/cards on mobile; 2-column tablet; 12-column desktop | HF-001, HF-009, HF-010, HF-026 |
| `/user/landlord/homiscore` | `HomiScore` | Score gauge, factors, history, sensitive-data modal | Header/profile clips at 320; score panel clips at 768 and chevrons at 1024; modal lacks full dialog contract | Single-column score summary on mobile; gauge scales by container; factors accordion; accessible modal | HF-001, HF-002, HF-008, HF-009, HF-010 |
| `/user/landlord/properties` | `properties` | KPI cards, search/filter controls, property table | Mobile filter button reaches edge; table relies only on generic horizontal scroll; root content has desktop assumptions | Mobile property cards; table at `lg`; filter sheet; column visibility and URL state | HF-001, HF-012, HF-029, HF-034 |
| `/user/landlord/applicants` | `applicants` | Applicant pipeline filters and table | Search lacks label; icon actions lack names; images lack dimensions; wide data table | Mobile applicant cards with primary decision/status; expandable rows on tablet; full table on desktop | HF-012, HF-013, HF-017, HF-033 |
| `/user/landlord/documents` | `documents` | Readiness summary, filters, document table, upload action | 3 unlabeled controls; many small targets; image lacks dimensions; table has no mobile record representation | Mobile document cards with status/expiry; filter drawer; desktop table with column controls | HF-012, HF-013, HF-014, HF-017, HF-034 |
| `/user/landlord/payments` | `payments` | Activity filters/table, payout, deposits | `Overdue` and `Deposits` tabs clip at 320; unlabeled search; table-only records | Segmented filter scroll/wrap; mobile payment cards; desktop table; persistent totals summary | HF-009, HF-012, HF-013, HF-029 |
| `/user/landlord/messages` | `messages` | Message dropdown and full message workspace plus copied dashboard content | Duplicates dashboard content; header/workspace clips; dialog has no `aria-modal`; no focus trap/restore | Mobile list -> full-screen thread; tablet split pane; desktop 3-pane; one shared message surface | HF-008, HF-009, HF-024 |
| `/user/landlord/notification-bell` | `notification-bell` | Notification dropdown plus copied dashboard content | 37 clipped descendants at 320; duplicates dashboard; dialog lacks full modal/popover semantics | Dedicated responsive notification center plus reusable top-bar popover; grouped and filterable list | HF-008, HF-009, HF-024 |
| `/user/landlord/settings` | `settings` | Listing, communication, notifications, security, account management | 24 controls but no form/persistence contract; 6 unlabeled controls; 34 small targets; destructive actions need confirmation | Sectioned settings form; mobile save bar; unsaved-change guard; confirmation/undo for destructive actions | HF-003, HF-013, HF-014, HF-027 |
| `/user/landlord/support` | `support` | Search, guide cards, FAQ, contact channels, request list | 2 unlabeled controls; non-semantic cards; arrows clip at 320; no request states | Search-first mobile layout, semantic disclosure, support request empty/loading/error states | HF-005, HF-009, HF-013, HF-021, HF-027 |
| `/user/landlord/user-profile` | `user-profile` | Avatar upload, account fields, score, actions | Profile input reaches 380px on 320px viewport; 5 unlabeled controls; changes are local prototype only | Mobile stacked form, responsive crop/upload, save state, publish preview | HF-003, HF-009, HF-013, HF-017, HF-027 |
| `/user/landlord/view-profile` | `view-profile` | Applicant profile, documents, score, activity, action modal | Near-duplicate of review-application; header clips; modal is not a semantic dialog | One applicant detail component/route with responsive summary and shared action dialog | HF-008, HF-009, HF-024, HF-027 |
| `/user/landlord/review-application` | `review-application` | Application review, decision controls, action modal, toast | Near-duplicate of view-profile; header clips; dialog semantics/focus missing; mutation feedback is local only | One review workspace; sticky decision bar on mobile; preview/confirm before status changes | HF-008, HF-009, HF-021, HF-024 |
| `/user/landlord/view-calendar` | `view-calendar` | Month calendar, event pills, schedule modal | Header clips at 320; month grid is not optimized for mobile; modal lacks dialog behavior | Mobile agenda; tablet week view; desktop month grid; date in URL; accessible event dialog | HF-008, HF-009, HF-026, HF-029 |
| `/user/landlord/properties/add/address` | `address-and-type` | Property wizard step 1 | Continue action clips at 320; form lacks save/validation state; fixed desktop shell | Single-column fields; sticky mobile footer with Back/Continue; shared wizard shell and draft state | HF-001, HF-003, HF-009, HF-025 |
| `/user/landlord/properties/add/listing-details` | `listing-details` | Property wizard step 2 | Long option labels clip at 320; 16 controls with incomplete label/state contract | Wrapping check cards, grouped fields, progressive disclosure, shared wizard controls | HF-003, HF-009, HF-013, HF-025 |
| `/user/landlord/properties/add/rent` | `rent-and-availabilty` | Property wizard step 3 | Bills/service labels clip; dense multi-column groups; no submission state | 1-column mobile, 2-column tablet/desktop, currency/date input modes, inline validation | HF-003, HF-009, HF-013, HF-025 |
| `/user/landlord/properties/add/photos` | `photos-and-documents` | Property wizard step 4, uploads | Upload behavior and progress/error states absent; controls use prototype actions | Accessible file picker/drop zone, previews, progress, reorder/remove, mobile-safe thumbnails | HF-003, HF-017, HF-021, HF-025 |
| `/user/landlord/properties/add/review` | `review-and-publish` | Review sections, publish checklist, renter preview | Readiness banner clips at 320; edit routes are bound by text/index; no publish pending/success/failure | Stacked review sections, anchored errors, sticky publish action, explicit readiness blockers | HF-009, HF-020, HF-021, HF-025 |

### 3.4 Renter workspace screens

| Route | Template | Screen and complex surfaces | Current findings | Target responsive behavior | Issue IDs |
|---|---|---|---|---|---|
| `/user/renter/dashboard` | `dashboard` | HomiScore, matches, active applications | No mobile navigation; stats/application controls clip at 320; images missing alt/dimensions | Drawer app shell, stacked summary, horizontal snap only for optional match cards, full-width application cards | HF-001, HF-009, HF-017, HF-026 |
| `/user/renter/homiscore` | `HomiScore` | Score/status/history and profile header | Catastrophic 320px failure: `pl-[304px]` leaves the content off-canvas; no responsive override | Remove page-owned sidebar padding; mobile score summary and accordion history; container-based chart/gauge | HF-001, HF-002, HF-009, HF-026 |
| `/user/renter/applications` | `applications` | Profile status, property cards, application controls | Search unlabeled; icon actions unnamed; images missing dimensions; small actions | Mobile application cards with status timeline; filters in sheet; tablet/desktop grid | HF-012, HF-013, HF-014, HF-017 |
| `/user/renter/documents` | `documents` | Readiness, filters, document table, upload | 2 unlabeled controls, many small targets, image dimensions missing, table-only data | Mobile cards, add-document sheet, expiry/status emphasis, desktop table | HF-012, HF-013, HF-014, HF-017 |
| `/user/renter/payments` | `Payments` | Payment filters/table, payment method, deposit | Search unlabeled; 20 small targets; table-only records; image dimensions missing | Mobile payment cards and method panel; desktop table; filter URL state | HF-012, HF-013, HF-014, HF-017, HF-029 |
| `/user/renter/messages` | `messages` | Message dropdown, conversation list/thread, copied dashboard content | Repeats dashboard content; application elements clip; dialog/focus semantics incomplete | Mobile conversation route/thread, tablet split pane, desktop 3-pane, shared composer | HF-008, HF-009, HF-024 |
| `/user/renter/notification-bell` | `notification-bell` | Notification dropdown plus copied dashboard | Notification surface shifts largely off the left side at 320; duplicate dashboard structure | Reusable notification center with mobile full-screen sheet and desktop anchored popover | HF-008, HF-009, HF-024 |
| `/user/renter/profile` | `profile` | Avatar, account fields, score, actions | Input extends to 380px at 320; 5 unlabeled controls; no persisted save state | Mobile stacked form, avatar crop, inline validation, save/publish preview | HF-003, HF-009, HF-013, HF-017, HF-027 |
| `/user/renter/settings` | `settings` | Preferences, sharing, notifications, security, account | 27 controls; 12 unlabeled in live audit; 37 small targets; no form/persistence | Section forms, sticky save, safe destructive actions, 44px toggles and rows | HF-003, HF-013, HF-014, HF-027 |
| `/user/renter/support` | `support` | Search, guides, FAQ, contact, requests | 2 unlabeled controls; non-semantic cards; arrow content clips at 320 | Same shared support pattern with role-specific content configuration | HF-005, HF-009, HF-013, HF-021, HF-027 |
| `/user/renter/view-detail` | `view-detail` | Viewing detail, fit summary, action modal | Modal lacks role/aria-modal/focus trap; image dimensions missing; desktop assumptions in header | Mobile summary with sticky actions; semantic reschedule/cancel dialog; desktop split detail | HF-008, HF-014, HF-017, HF-027 |
| `/user/renter/view-property` | `View-property` | Property gallery, details, amenities, enquiry/apply actions | Save/apply action row clips at 320; 5 images lack dimensions; inline relative navigation; icon names missing | Responsive gallery, sticky mobile CTA, semantic save/share controls, stable absolute routes | HF-009, HF-017, HF-020, HF-033 |

### 3.5 Admin workspace

| Route | Template | Current findings | Target responsive behavior | Issue IDs |
|---|---|---|---|---|
| `/admin/management` | `admin/management` | Single heading only; duplicate of verification page; duplicate script include; no loading/empty/error/table/form states | Shared admin shell plus real management list, filters, pagination, and responsive record details | HF-006, HF-021, HF-023, HF-027 |
| `/admin/verification-review` | `admin/verification-review` | Identical to management and even shows the same heading; duplicate script include | Shared admin review queue with mobile cards, desktop table, detail drawer, and review confirmation | HF-006, HF-021, HF-023, HF-027 |

### 3.6 Screens and states not currently implemented

The following are not separate routes or reusable states in the current frontend and must be added to the implementation backlog:

- Dedicated 403 unauthorized screen
- Dedicated 500/unexpected-error screen and route-level error handler
- Offline/network retry state where async data is introduced
- Session-expired state with return-to-task behavior
- Reusable empty state for every list/table/dashboard module
- Reusable skeletons for dashboard, table, card grid, profile, and detail views
- Reusable inline and page-level error state
- Reusable success/undo toast and persistent completion state
- No-results state distinct from an empty account
- Permission-denied state distinct from role mismatch
- Unsaved-changes dialog for long forms/wizards/settings
- Delete/account/security confirmation dialogs

No map screen exists. Current chart-like surfaces are static HTML/SVG mockups in dashboards, HomiScore, and landlord marketing screens. Reports and analytics are embedded dashboard sections rather than dedicated routes.

## 4. Prioritized issue register

Complexity: S = up to 1 focused day, M = 2-4 days, L = 1-2 weeks, XL = cross-module program. Estimates assume one experienced frontend engineer and exclude missing backend endpoints unless stated.

| ID | Affected page/component | Exact problem and root cause | Recommended solution and responsive behavior | Reusable opportunity | Priority / complexity | Testing requirements |
|---|---|---|---|---|---|---|
| HF-001 | All renter, landlord, and admin screens; `main.js`; sidebars | Mobile navigation never initializes because the script expects a header inside `main`; templates use conflicting sibling/nested structures and fixed offsets | Build one `AppShell` contract with sidebar, top bar, main content, overlay, Escape close, focus return, and safe-area padding. Drawer below 1024; persistent rail from 1024; optional compact rail from 1280 | `AppShell`, `SidebarNav`, `TopBar`, `NavDrawer` | Critical / XL | Keyboard, screen reader, 320-2560, 200% zoom, all roles, route-active state |
| HF-002 | Renter and landlord HomiScore | Fixed `pl-[304px]` and rigid score/gauge layouts push or clip content | Remove page-owned shell offsets; use container queries/aspect ratios; stack score, factors, and history on mobile | `ScoreSummary`, `ScoreGauge`, `FactorList`, `TrendChart` | Critical / L | Pixel and DOM overflow checks at 320, 375, 768, 1024; reduced motion; chart labels |
| HF-003 | Contact, forgot password, onboarding, verification, profile, settings, wizard | Controls often have no action/persistence contract, so users cannot complete or recover tasks | Define server/API contracts; use real forms; pending/success/error states; draft/autosave for long flows; disable only while submitting | `Form`, field wrappers, `SubmitButton`, `SaveBar`, `DraftStatus` | Critical / XL, backend dependency | Submit success/failure, retry, duplicate submit, refresh/resume, network interruption |
| HF-004 | All data modules | UI is hardcoded, so genuine loading/empty/error/permission behavior is absent | Define a state matrix for each module and implement deterministic fixtures before API integration | `AsyncBoundary`, skeleton, empty, error, unauthorized | High / L | Fixture-driven tests for every state; no layout shift; focus on error summary |
| HF-005 | Role cards, FAQ, marketing cards, support guides, chart bars | Clickable `div`/`span`, inline handlers, and hover-only affordances are not keyboard-operable | Use buttons for actions and anchors for navigation; preserve browser link semantics; add keyboard and active states | `ActionCard`, `Disclosure`, semantic link/button primitives | High / M | Tab/Enter/Space, Ctrl/Cmd-click, no click-only element, visible focus |
| HF-006 | 42 templates and `main.js` | Shared script is loaded twice; duplicate drawers/overlays and event listeners are created | Include shared assets once in a base layout/footer; make initializers idempotent as a safeguard | Base EJS layout or consistent partial | High / M | Assert 1 script, 1 overlay, 1 drawer, 1 listener effect per action |
| HF-007 | All interactive UI | 95 outline removals, no `focus-visible`, and inconsistent focus rings | Establish a global focus token and never remove outline without replacement; use `:focus-visible` and `:focus-within` | Focus ring utility and component states | High / M | Keyboard path snapshots, high contrast mode, Windows forced colors |
| HF-008 | HomiScore, messages, notifications, application review, calendar, viewing detail | Modal/popover surfaces lack complete role, label, `aria-modal`, focus trap, Escape, scroll containment, and focus restoration | Adopt one dialog/popover controller with correct modality; use anchored popover only when non-modal | `Dialog`, `AlertDialog`, `Popover`, `Drawer` | High / L | Focus trap/restore, Escape/backdrop, screen reader name, scroll lock, nested content |
| HF-009 | Identified mobile pages | Root `overflow-x:hidden` masks clipped controls/content rather than solving layout constraints | Remove root masking after repairing widths; add `min-width:0`, wrapping, responsive grids, and component-level overflow only where intentional | Layout primitives: `Stack`, `Cluster`, `ResponsiveGrid` | Critical / L | Root scrollWidth equals clientWidth at all widths; visual clips test; long strings |
| HF-010 | 768-1023 dashboards | Desktop rail remains at 240px, compressing landlord content to about 522px; desktop card/action patterns do not adapt | Use drawer or compact rail through 1023; promote persistent rail at 1024 only after content fit tests | App shell breakpoint policy | High / M | 768 portrait/landscape, 820, 1024, zoom 125-200% |
| HF-011 | Shared head/style and all pages | Global Arial overrides configured Inter; global `main` padding/max-width conflicts with page layout; 3 head partials are identical | Create one token source and scoped container utilities; remove element-level global layout rules | Design tokens, `PageContainer`, shared head | High / L | Computed font/token checks, no unexpected container override, visual baseline |
| HF-012 | Pricing, applicants, documents, payments, properties | Generic horizontal scrolling is applied to every table without deciding the correct mobile information model | Define per-table strategy: cards for operational records, sticky-column comparison for pricing, column controls/expandable rows on tablet | `DataTable`, `MobileRecordCard`, `ColumnMenu`, `ExpandableRow` | High / XL | Keyboard table navigation, sticky behavior, screen reader headers, 320-1440 |
| HF-013 | All forms and filters | 229 controls vs 123 labels; inconsistent `name`, type, inputmode, autocomplete, helper text, and field errors | Build typed field primitives with persistent labels, descriptions, required indicators, and inline error IDs | `TextField`, `SelectField`, `CheckboxField`, `RadioCard`, `SearchField` | High / XL | Accessible-name audit, mobile keyboards, autocomplete, paste, error focus |
| HF-014 | Navigation, filters, auth icons, settings, tables | Many targets are under 44x44px; 10-37 small targets were observed on common screens | Increase hit areas without inflating visual glyphs; use full-row labels for toggles/checks | `IconButton`, `SegmentedControl`, `ToggleRow` | High / M | 44x44 computed hit-box assertion at touch breakpoints |
| HF-015 | Muted text and accent tokens | `#757682` on `#f7f9fb` measures about 4.3:1; some green/blue accents are also below required contrast | Audit token pairs; adjust semantic foregrounds, not one-off page colors; retain non-color status cues | Semantic color tokens and contrast test | High / M | Automated contrast plus manual gradient/image checks; normal/large text thresholds |
| HF-016 | Pricing, onboarding tenant, tenant verification, many dashboards | Missing `main` or H1, duplicate H1 from sidebar branding, and inconsistent heading hierarchy | One `main` and one page H1; brand text is not H1; sequential section headings; add skip link | `PageHeader`, semantic shell | High / M | Landmark/heading automated assertions and screen-reader outline review |
| HF-017 | Marketing, dashboards, cards, profile/gallery | Images lack explicit dimensions; several remote images failed in audit; some images lack alt; no responsive source/loading policy | Host reliable assets, set width/height/aspect-ratio, use `srcset`, lazy loading, and meaningful/decorative alt rules | `ResponsiveImage`, `Avatar`, `PropertyGallery` | High / L | Broken-asset test, CLS, alt audit, 1x/2x, slow network |
| HF-018 | All animated/transitioned UI | 136 `transition-all` usages and no `prefers-reduced-motion` handling | Limit transitions to transform/opacity/color; define durations/easing; disable nonessential motion when requested | Motion tokens and utilities | Medium / M | Reduced-motion emulation, interruptibility, no layout-property animation |
| HF-019 | Public header/footer | At 320px the mobile menu wraps onto a second header row; footer/legal links have small hit areas | Use one-row header with brand, primary action, and menu; move all secondary actions into drawer; enlarge footer link rows | `PublicHeader`, `PublicNavDrawer`, `PublicFooter` | High / M | 320/375/480, long labels, open/close focus, sticky overlap |
| HF-020 | Shared prototype navigation and inline route handlers | Actions are bound by visible text/index and several relative URLs; copy changes can break routing | Put destination in markup as real `href` or explicit data contract; remove text-matching router | Link/button components and route map | High / L | Crawl all links, Ctrl/Cmd-click, back/forward, mixed-case redirect |
| HF-021 | Entire app | Loading, success, warning, retry, no-results, empty-account, and error feedback are absent or ad hoc | Define copy, icon, action, announcement, and placement for every state; prevent layout collapse | State primitives and toast system | High / L | State fixtures, live regions, focus movement, timeout/undo behavior |
| HF-022 | Authorization failures | 403 response renders 404 copy, misleading users and obscuring permission recovery | Add dedicated 403 template with role-aware destination; preserve requested URL for support/login return | `ErrorPage` variants | High / S | Wrong-role renter/landlord/admin tests; correct status/title/copy |
| HF-023 | Admin, onboarding complete, legal/social placeholders | Skeletal screens and `#` links imply capabilities without working destinations | Complete or clearly disable planned capabilities with reason; never ship empty routes or dead links | `ComingSoonState` only when product-approved | High / M plus product dependency | Link crawl; no `href="#"`; route content acceptance tests |
| HF-024 | Messages, notifications, view/review application | Entire dashboard structures are copied into message/notification templates; review/view files are near duplicates | Separate shell from route content; one message center, notification center, and applicant workspace with mode/config variants | Shared feature modules with role configuration | High / XL | No duplicate IDs/listeners; parity tests by role; responsive state retention |
| HF-025 | Onboarding, verification, add-property wizard | Progress indicators and action rows are page-specific; steps clip or lose context; no draft/unsaved guard | Shared stepper/wizard shell, URL-addressable steps, completion summary, draft persistence, leave confirmation | `WizardShell`, `Stepper`, `ReviewSection`, `UnsavedGuard` | High / XL | Deep links, reload/resume, back/forward, validation jump, mobile sticky actions |
| HF-026 | Dashboard, HomiScore, calendar, marketing chart | Visualizations have fixed geometry, hover dependence, limited text alternatives, and no resize contract | Use responsive SVG/container sizing, accessible legends/summaries, table fallback, and agenda fallback for calendar | Chart/gauge/calendar primitives | Medium / L | Resize observer, keyboard/tooltips, color-blind palette, printed/text summary |
| HF-027 | Settings, profile, support, admin/detail modules | Similar page headers, sections, save actions, help panels, and profile structures are repeatedly handwritten | Extract stable shared primitives while keeping role-specific permissions and content at page/module level | `PageHeader`, `SectionPanel`, `HelpPanel`, `ProfileForm`, `SettingsSection` | Medium / XL | Role parity, snapshot variants, no permission logic in generic UI |
| HF-028 | Public pages and dashboards at 1536-2560 | Global 1100px cap leaves excessive dead space and prevents data dashboards using available width | Marketing max 1280; forms 720-960; operational workspaces 1440-1600; readable text subcolumns remain 60-75ch | Container variants | Medium / M | 1440/1920/2560 screenshots; line length and density review |
| HF-029 | Tabs, filters, pagination, calendar, search | UI state is mostly local DOM state and is not represented in URLs | Use query params for tab/filter/search/page/date; preserve state across refresh/back/share | `FilterBar`, URL state adapter, `Pagination` | Medium / L | Deep-link, reload, back/forward, invalid query fallback |
| HF-030 | Dates, GBP values, scores, table numbers | Dates/currency are hardcoded strings and number columns lack consistent formatting/alignment | Use `Intl.DateTimeFormat`/`Intl.NumberFormat`; tabular numerals; explicit timezone/date semantics | Formatting utilities and `DataCell` | Medium / M | Locale/timezone fixtures, GBP formatting, narrow-column overflow |
| HF-031 | Theme classes and native controls | Tailwind dark mode is configured and some dark classes exist, but no complete theme or `color-scheme` contract exists | Decide light-only for this phase or implement complete dark tokens/control; never leave partial theme behavior | Theme tokens/provider | Low / L if dark mode is included | Native input/select, scrollbar, contrast, stored preference, OS preference |
| HF-032 | Frontend build and CSS ownership | Runtime Tailwind CDN, inline page scripts, and duplicated head config make style generation and regression control fragile | Move to a versioned Tailwind build or compiled CSS; lint templates/scripts; centralize tokens and asset loading | Build pipeline and base layout | High / L | Production CSS build, CSP readiness, cache behavior, no CDN failure dependency |
| HF-033 | Icon buttons and decorative icons | Most material-symbol buttons expose only glyph text; decorative icons are not consistently hidden | Require `aria-label`/tooltip for icon commands; `aria-hidden=true` for decorative icons; visible labels where ambiguity exists | `IconButton`, `Tooltip`, icon wrapper | High / L | Accessible-name audit, hover/focus tooltip, touch behavior |
| HF-034 | Shared table scroller | JS injects the same swipe hint after every table and uses a visual edge treatment without per-table semantics | Put scroll behavior in table component; announce caption/instructions once; show hint only when overflow exists | `TableViewport` | Medium / M | Overflow/no-overflow cases, screen reader caption, keyboard horizontal scroll |

## 5. Responsive strategy by screen size

| Range / representative devices | Current risks | Required application behavior |
|---|---|---|
| 320-374 small mobile | No protected navigation; clipped headers/actions; renter HomiScore off-canvas; dense cards; tiny targets | Base styles must work without a breakpoint. One-column content, 16px gutters, 44px controls, drawer navigation, sticky bottom actions only when they do not cover content |
| 375-479 standard/large mobile | Public header wraps; pricing/table discovery; long labels and legal/footer targets | One-row public header, wrap-safe labels, mobile cards for operational data, full-screen dialogs/sheets, safe-area padding |
| 480-639 large mobile/small tablet | Existing special max-width rule is limited and inconsistent | Optional `xs=480` only for layout changes that cannot wait for `sm`; 2-column small card grids where each card remains at least 220px |
| 640-767 tablet portrait | Desktop content may begin too early; filters and stepper density | Use `sm` for spacing/grid enhancement, not persistent sidebar. Keep drawer navigation and touch-first controls |
| 768-1023 tablet portrait/landscape | 240px sidebar consumes too much space; dashboard cards/actions clip | Keep drawer or compact rail. Use 2-column summaries, split forms only when labels/inputs remain usable, tablet table/card hybrids |
| 1024-1279 small laptop | Landlord HomiScore still clips at 1024; wide tables compete with rail | Enable persistent rail only after fit tests; allow compact rail; 12-column content grid; column menu for dense tables |
| 1280-1535 desktop | Best current fit but duplicated shell and global 1100px cap remain | Persistent nav, full data tables, multi-column dashboards, constrained reading widths within wider workspace |
| 1536-1919 large desktop | Excessive dead space begins | Operational container up to 1440-1600; add useful columns/detail panes, not stretched text |
| 1920-2560 ultra-wide | Every `main` remains 1100px, about 43% at 2560 | Centered max workspace with optional 3-pane detail layouts; keep copy at 60-75ch; avoid empty decorative expansion |
| 125-200% browser zoom | Equivalent CSS width can cross sidebar/table thresholds; sticky/fixed elements may cover content | Breakpoint behavior must follow available CSS width, not device assumptions; no loss of content/action at 200%; dialogs remain fully scrollable |

### 5.1 Recommended breakpoint tokens

Keep Tailwind-compatible, mobile-first breakpoints to reduce migration cost:

```text
base:  0-639px      Small through large mobile
sm:    640px        Small tablet / generous mobile layout
md:    768px        Tablet layout, but still drawer navigation
lg:    1024px       Small laptop and persistent/compact rail eligibility
xl:    1280px       Standard desktop workspace
2xl:   1536px       Large desktop workspace
wide:  1920px       Optional container/density token, not a new content scale
```

Do not add device-specific breakpoints for individual pages. Use container queries for score cards, charts, data cards, and split panes that can appear in different parent widths.

### 5.2 Container strategy

- Marketing bands: full-width background with inner `max-width: 1280px`.
- Auth/simple forms: `max-width: 480-560px`.
- Long onboarding/settings forms: `max-width: 720-960px`, depending on grouped fields.
- Standard operational pages: `max-width: 1440px` inside the app shell.
- Dense analytics/messages: up to `1600px` with explicit pane minimums.
- Reading copy: `max-width: 60-75ch` even when the page container is wider.

## 6. Data-heavy mobile decisions

| Surface | Under 640px | 640-1023px | 1024px and above |
|---|---|---|---|
| Pricing comparison | Plan cards plus feature accordions | Horizontally scrollable comparison with sticky feature column | Full comparison table |
| Landlord applicants | Applicant cards with score, property, status, primary action | Expandable rows or reduced-column table | Full table plus column controls |
| Properties | Property cards; filter/sort sheet | Card/table toggle; selected columns | Full table with bulk/actions menu |
| Renter/landlord documents | Document cards with status/expiry/action menu | Reduced-column table with expandable details | Full table and column controls |
| Renter/landlord payments | Payment cards grouped by period/status | Reduced-column table and summary cards | Full table, pagination, export controls |
| Dashboard applicant/application lists | Full-width cards with one primary action | 2-column cards or compact rows | Dense rows/table as appropriate |
| Messages | Conversation list route, then full-screen thread | 2-pane list/thread | 3-pane list/thread/context when useful |
| Calendar | Agenda/day list | Week or 3-day view | Month grid with detail dialog |

Horizontal scrolling remains acceptable for comparison and power-user tables, but it must be deliberate, keyboard accessible, captioned, and never the only mobile representation for high-frequency operational tasks.

## 7. Shared component refactoring plan

### 7.1 Existing shared assets

- 3 identical head partials: consolidate immediately.
- Public header and footer partials: retain but rebuild around a semantic responsive contract.
- Separate renter, landlord, and admin sidebars: converge on one shell and navigation primitive with role-owned configuration.
- Shared `style.css` and `main.js`: split by responsibility after the new shell is introduced.

### 7.2 Target component hierarchy

```text
BaseLayout
|-- SkipLink
|-- PublicShell
|   |-- PublicHeader
|   |-- PublicNavDrawer
|   `-- PublicFooter
`-- AppShell
    |-- SidebarNav (role configuration)
    |-- TopBar
    |   |-- SearchField
    |   |-- NotificationPopover
    |   |-- MessagePopover
    |   `-- ProfileMenu
    `-- PageContainer
        |-- PageHeader
        |-- Breadcrumbs
        |-- FilterBar
        `-- RouteContent
```

### 7.3 Reusable component backlog

| Component | Responsibilities | First migration target |
|---|---|---|
| `PageHeader` | H1, description, breadcrumb, primary/secondary actions, mobile wrapping | Properties and applications |
| `FilterBar` | Search, filters, sort, clear state, URL synchronization, mobile sheet | Applicants and documents |
| `DataTable` | Caption, headers, sorting, selection, pagination, responsive mode | Payments |
| `MobileRecordCard` | Priority fields, status, primary action, expandable details | Applicants |
| `Pagination` | Page size, range, next/previous, URL state, accessible labels | All future paginated lists |
| `EmptyState` | Distinguish empty account, no results, permission, and failure | Properties/documents |
| `Skeleton` | Preserve final dimensions for cards, tables, profile, charts | Dashboards |
| `ErrorState` | Clear problem, recovery action, support reference | Route and module boundaries |
| `Dialog` / `AlertDialog` | Focus trap/restore, label, description, Escape, scroll lock | Viewing cancel and application decisions |
| `Drawer` / `Popover` | Correct mobile/desktop modality, anchored placement, dismissal | Navigation, filters, notifications |
| `FormField` family | Label, helper, required state, control, inline error | Signup then onboarding |
| `WizardShell` | Steps, draft status, actions, error summary, responsive progress | Add Property |
| `StatusBadge` | Text + icon + semantic tone; no color-only meaning | Applications/documents/payments |
| `ActionMenu` | Named icon trigger, keyboard menu, destructive grouping | Data rows/cards |
| `KpiCard` | Label, value, trend, context, loading state, tabular numbers | Dashboards |
| `ToastRegion` | Polite/assertive announcements, timeout, pause, undo | Save and review actions |
| `ResponsiveImage` | Aspect ratio, width/height, sources, loading, alt | Marketing and property gallery |
| `ChartFrame` | Title, summary, legend, tooltip, resize, data-table fallback | HomiScore/history |

Shared components must remain presentation/interaction primitives. Role permissions, tenant scoping, data mutation rules, and landlord/renter business decisions stay in their route/module layer.

## 8. Accessibility plan

Target WCAG 2.2 AA.

### 8.1 Required foundation

1. Add a skip link and one `main` landmark per screen.
2. Use one page H1. Sidebar/brand headings must not create duplicate H1s.
3. Add global `:focus-visible` and forced-colors behavior. Remove outline suppression without replacement.
4. Convert clickable non-semantic elements to buttons/links.
5. Give icon commands accessible names and tooltips; hide decorative icons from assistive technology.
6. Associate every input/select/textarea with a label and description/error IDs.
7. Keep touch targets at least 44x44px with 8px separation where actions are adjacent.
8. Add dialog/popover semantics, focus management, Escape behavior, and scroll containment.
9. Add live regions for form submission, validation summaries, toasts, uploads, and async list updates.
10. Honor `prefers-reduced-motion`; avoid `transition-all` and layout-property animation.
11. Validate all semantic color pairs at 4.5:1 for normal text, 3:1 for large text and essential UI graphics.
12. Use icons/text/patterns in addition to color for statuses and charts.
13. Add width/height and alt policy for every image; test broken/fallback assets.
14. Use `Intl` formatting and meaningful date/time markup.

### 8.2 Keyboard acceptance path

- Public header -> navigation drawer -> close -> focus returns to trigger.
- Login/signup -> validation errors -> password reveal -> submit state.
- Role selection radio cards -> Continue.
- Dashboard menu -> active route -> top bar menus -> route content.
- Filters -> result count -> table/card actions -> pagination.
- Dialog open -> initial focus -> tab loop -> Escape/cancel -> focus return.
- Wizard step -> first invalid field -> error summary -> back/continue -> leave warning.
- Messages list -> thread -> composer -> attachment/action menu.

## 9. Design consistency plan

### 9.1 Preserve and formalize

The existing navy/white/light-gray trust-oriented visual direction is appropriate for the product. Do not replace it with a new palette during responsive remediation. Formalize it into semantic tokens and validate contrast.

### 9.2 Resolve inconsistencies

- One font ownership path: Inter from the design tokens; remove the Arial body override.
- One spacing scale based on 4px with documented page gutters and section gaps.
- Radius roles: 4px controls, 8px standard cards/dialog panels, pills only for badges/segmented controls.
- Border and elevation roles instead of page-specific opacity combinations.
- Semantic color roles: primary action, neutral surface, success, warning, error, info, and focus.
- Standard button hierarchy and action placement: primary right/bottom, destructive separated, mobile sticky action only for task-critical flows.
- Standard page density: marketing spacious, dashboards compact but scannable, forms grouped by task.
- Standard empty/loading/error copy and iconography.
- Use symbols/icons from one library; do not mix glyph text, emoji, and ad hoc inline icons.

## 10. Dependencies and risks

| Dependency or risk | Impact | Mitigation |
|---|---|---|
| Missing backend endpoints for most forms/data | UI states cannot be proven against real data | Define API/state contracts and deterministic fixtures before page migration |
| No automated frontend test suite | High regression risk across 50 templates | Add Playwright route matrix, accessibility checks, and visual baselines in Phase 2 |
| Tailwind CDN/runtime generation | CSP, offline, performance, and deterministic build risk | Introduce compiled Tailwind/CSS build before broad component extraction |
| External Google fonts/images/icons | Broken assets and layout shift | Self-host or provide robust fallbacks; reserve dimensions |
| Large duplicated templates | Fixes can diverge or be overwritten | Migrate shell first, then feature modules; delete duplication only after parity tests |
| Role-protected routes | Visual tests require stable role fixtures | Add local test users/seed data and storage-isolated browser projects |
| Global CSS specificity | New components may still inherit legacy `main` and margin rules | Scope legacy CSS, add migration classes, remove global rules after route conversion |
| Mixed static and future live data | Empty/loading behavior may be guessed incorrectly | Create state contract per module with product/backend review |
| Browser zoom/sticky UI | Fixed headers/actions can hide content at 150-200% | Include zoom in every phase gate, not only final QA |
| Refactor blast radius | Shell changes touch nearly every protected route | Migrate representative pages, gate on screenshots, then batch by component family |

## 11. Testing and validation plan

### 11.1 Automated route matrix

Create authenticated Playwright projects for public, renter, landlord, and admin roles. Every explicit GET route plus 404/403/500 states must load with:

- Expected status, title, H1, and main landmark
- No uncaught console error or failed first-party asset
- No root horizontal overflow
- One shared script initialization and one shell instance
- Correct role navigation and active route
- Deterministic loading, populated, empty, no-results, error, and unauthorized fixtures where applicable

### 11.2 Viewport matrix

```text
320x568, 360x800, 375x812, 390x844, 414x896, 480x960
640x960, 768x1024, 820x1180, 1024x768
1280x800, 1366x768, 1440x900, 1920x1080, 2560x1080
```

Run critical workflows at 100%, 125%, 150%, and 200% browser zoom. Add 80% only for ultra-wide density review, not as an accessibility gate.

### 11.3 Browser matrix

- Chromium/Chrome and Edge on Windows
- Firefox current
- WebKit/Safari current, including iOS safe areas
- Android Chrome for touch keyboard and viewport behavior

### 11.4 Accessibility gates

- Axe or equivalent automated WCAG scan with zero critical/serious issues
- Full keyboard walkthroughs for the acceptance paths in Section 8
- Screen reader spot checks: NVDA/Windows plus VoiceOver/iOS or macOS
- Contrast token tests and manual checks over images/gradients
- Forced-colors/high-contrast mode
- Reduced-motion mode
- 44x44 touch-target assertion at mobile breakpoints

### 11.5 Visual regression gates

- Baseline every page family, not every data permutation.
- Required baselines: public shell, auth form, onboarding, dashboard, table, mobile record cards, settings, messages, modal, calendar, HomiScore, error/empty/loading.
- Capture both the smallest supported width and the breakpoint immediately before/after each layout transition.
- Fail on overlap, clipping, occluded sticky content, unexpected scrollbars, missing assets, or text outside containers.

### 11.6 Performance and resilience

- Measure CLS after image and skeleton fixes; target below 0.1.
- Verify production CSS does not depend on runtime Tailwind CDN.
- Lazy-load below-fold imagery and reserve all media dimensions.
- Test slow network, failed image, expired session, duplicate submit, and API timeout.
- Use virtualization or `content-visibility` when live lists exceed 50 rows.

## 12. Implementation phases

### Phase 1: Application and route discovery baseline

Scope:

- Convert this inventory into an executable route/state matrix.
- Add role fixtures and representative data fixtures.
- Capture baseline screenshots and known-failure snapshots.
- Document API/state contracts for forms and data modules.

Exit gate:

- All 50 GET routes and fallback states are represented in tests.
- Current failures are recorded separately from new regressions.
- No application behavior is changed yet except test scaffolding.

### Phase 2: Shared layout and design-system fixes

Scope:

- Consolidate head/assets and remove duplicate script inclusion.
- Add compiled Tailwind/CSS pipeline.
- Define typography, color, spacing, radius, elevation, focus, motion, and container tokens.
- Build `BaseLayout`, `PageContainer`, state primitives, and accessible form/button/icon primitives.
- Remove global element-level `main` layout and Arial ownership.

Exit gate:

- One asset load and one initializer per page.
- Tokens pass contrast checks.
- Focus, reduced motion, and container tests pass.

### Phase 3: Navigation and global responsiveness

Scope:

- Build `PublicShell` and `AppShell`.
- Implement drawer/rail breakpoint policy, top bar, profile menu, message/notification entry points, and skip link.
- Eliminate all page-owned sidebar offsets.
- Add 403/500/session-expired states.

Exit gate:

- Every role can reach every allowed route at 320-2560 and 200% zoom.
- No root horizontal overflow.
- Keyboard/focus and sticky-header tests pass.

### Phase 4: High-priority pages and modules

Scope:

- Renter HomiScore, landlord dashboard/HomiScore, renter dashboard.
- Auth and role selection.
- Onboarding complete and admin skeletal screens.
- Introduce `PageHeader`, KPI/score/chart primitives, and async state boundaries.

Exit gate:

- Critical clipping and off-canvas failures are eliminated.
- Loading/empty/error/success fixtures render correctly.
- Dashboard and auth visual baselines pass.

### Phase 5: Tables, forms, maps, charts, and complex screens

Scope:

- Applicants/applications, properties, documents, payments.
- Add-property wizard, onboarding, verification, profile, settings.
- Messages, notifications, dialogs, calendar, property gallery.
- There is no map module today; add map-specific work only if product scope introduces one.

Exit gate:

- Each data surface uses its approved card/table/expandable-row strategy.
- Forms have persistence, validation, feedback, and unsaved-change behavior.
- Dialog, chart, calendar, and upload accessibility gates pass.

### Phase 6: Mobile and tablet optimization

Scope:

- Tune 320-1023 layouts, content order, sticky actions, safe areas, virtual keyboards, long labels, and landscape behavior.
- Validate card density and table-column decisions with realistic long data.
- Add container queries where page breakpoints are insufficient.

Exit gate:

- No clipped content or inaccessible action at the full mobile/tablet matrix.
- All touch targets meet 44x44px.
- Tablet portrait/landscape workflows require no desktop-only interaction.

### Phase 7: Accessibility improvements and content quality

Scope:

- Complete labels, names, landmarks, headings, dialogs, live regions, contrast, reduced motion, forced colors, and screen-reader copy.
- Replace placeholder/dead routes and ambiguous action labels.
- Normalize date, currency, status, validation, and error copy.

Exit gate:

- Zero critical/serious automated accessibility issues.
- Keyboard and screen-reader acceptance paths pass.
- No `href="#"`, unnamed icon command, or outline removal without replacement.

### Phase 8: Cross-browser and visual regression testing

Scope:

- Run full browser, viewport, zoom, slow-network, and state matrices.
- Stabilize screenshots and component contracts.
- Remove legacy CSS/JS paths only after parity is proven.
- Record remaining product/backend limitations explicitly.

Exit gate:

- Route, visual, accessibility, and interaction suites pass on supported browsers.
- All Critical and High items are closed or explicitly waived by product/engineering owners.
- Rollback plan and release monitoring are documented.

## 13. Recommended implementation order within each phase

For each component or page family:

1. Define supported states and responsive contract.
2. Add failing route/component tests and visual baselines.
3. Implement the shared primitive.
4. Migrate one renter and one landlord example where both exist.
5. Validate keyboard, accessibility, viewport, zoom, and browser behavior.
6. Roll out to remaining pages in that family.
7. Remove replaced legacy markup/CSS/JS only after parity checks.

This order keeps the application usable during migration and prevents new shared components from merely reproducing the current page-specific inconsistencies.

## 14. Definition of done

The UI/UX responsiveness program is complete when:

- All explicit routes, role states, fallbacks, modal/drawer states, and async states are inventoried and tested.
- No page has root horizontal overflow or masked clipped content at supported widths/zoom levels.
- Navigation and primary tasks are available with mouse, touch, keyboard, and screen reader.
- Tables have an approved per-module mobile strategy.
- Forms have labels, validation, persistence, pending/success/error states, and recovery.
- Shared shell, page headers, filters, states, forms, tables, dialogs, status badges, KPIs, cards, and toasts are used consistently.
- WCAG 2.2 AA, cross-browser, visual-regression, and performance gates pass.
- No duplicate asset initialization, dead link, prototype-only critical action, or skeletal production route remains.
