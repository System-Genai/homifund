# HomiFund Screen-by-Screen UI/UX Re-analysis

Date: 2026-07-30

## Working Method

Each screen is inspected, corrected, and verified before the next screen begins. A screen is complete only after its source review, live responsive matrix, interaction checks, accessibility checks, and regression tests pass.

Required viewport matrix: 320, 375, 480, 640, 768, 1024, 1440, and 2560 CSS pixels. The 640 and 768 checks also cover zoom-equivalent constrained desktop layouts.

## Progress

| Order | Route | Screen | Status |
| ---: | --- | --- | --- |
| 1 | `/` | Home | Complete |
| 2 | `/about` | About | Complete |
| 3 | `/contact` | Contact | Complete |
| 4 | `/faqs` | FAQ | Complete |
| 5 | `/pricing` | Pricing | Complete |
| 6 | `/renters` | Renters | Complete |
| 7 | `/landlords` | Landlords | Complete |
| 8 | `/signup` | Signup | Complete |
| 9 | `/login` | Login | Complete |
| 10 | `/forget-password` | Forgot password | Complete |
| 11 | `/reset-password/:token` | Reset password | Complete |
| 12 | `/role-selection` | Role selection | Complete |
| 13 | `/onboarding-landlord` | Landlord onboarding | Complete |
| 14 | `/onboarding-tenant` | Renter onboarding | Complete |
| 15 | `/onboarding-complete` | Onboarding completion | Complete |
| 16 | `/landlord-verification` | Landlord verification | Complete |
| 17 | `/tenant-verification` | Renter verification | Complete |
| 18 | `/user/landlord/dashboard` | Landlord dashboard | Complete |
| 19 | `/user/landlord/homiscore` | Landlord HomiScore | Complete |
| 20 | `/user/landlord/properties` | Landlord properties | Complete |
| 21 | `/user/landlord/applicants` | Landlord applicants | Complete |
| 22 | `/user/landlord/documents` | Landlord documents | Complete |
| 23 | `/user/landlord/payments` | Landlord payments | Complete |
| 24 | `/user/landlord/messages` | Landlord messages | Complete |
| 25 | `/user/landlord/notification-bell` | Landlord notifications | Complete |
| 26 | `/user/landlord/settings` | Landlord settings | Complete |
| 27 | `/user/landlord/support` | Landlord support | Complete |
| 28 | `/user/landlord/user-profile` | Landlord profile | Complete |
| 29 | `/user/landlord/view-profile` | Applicant profile detail | Complete |
| 30 | `/user/landlord/view-calendar` | Landlord calendar | Complete |
| 31 | `/user/landlord/review-application` | Application review | Complete |
| 32 | `/user/landlord/properties/add/address` | Add property: address | Complete |
| 33 | `/user/landlord/properties/add/listing-details` | Add property: listing details | Complete |
| 34 | `/user/landlord/properties/add/rent` | Add property: rent and availability | Complete |
| 35 | `/user/landlord/properties/add/photos` | Add property: photos and documents | Complete |
| 36 | `/user/landlord/properties/add/review` | Add property: review and publish | Complete |
| 37 | `/user/renter/dashboard` | Renter dashboard | Complete |
| 38 | `/user/renter/homiscore` | Renter HomiScore | Complete |
| 39 | `/user/renter/applications` | Renter applications | Complete |
| 40 | `/user/renter/documents` | Renter documents | Complete |
| 41 | `/user/renter/payments` | Renter payments | Complete |
| 42 | `/user/renter/messages` | Renter messages | Complete |
| 43 | `/user/renter/notification-bell` | Renter notifications | Complete |
| 44 | `/user/renter/profile` | Renter profile | Complete |
| 45 | `/user/renter/settings` | Renter settings | Complete |
| 46 | `/user/renter/support` | Renter support | Complete |
| 47 | `/user/renter/view-detail` | Renter viewing detail | Complete |
| 48 | `/user/renter/view-property` | Renter property detail | Complete |
| 49 | `/admin/management` | Admin management | Complete |
| 50 | `/admin/verification-review` | Admin verification review | Complete |
| 51 | Role-denied state (`main/403`) | Authorization failure | Complete |
| 52 | Not-found state (`main/404`) | Missing route or resource | Complete |
| 53 | Unexpected-error state (`main/500`) | Server failure and recovery | Complete |

## Cross-Screen Correction: Public Collapsible Navigation

### User-reported failure

- The open public drawer compressed `Menu` into a vertical letter stack, stretched the Close control across the header, and exposed a horizontal scrollbar.
- At fractional browser widths just below 768 CSS pixels, the desktop navigation could remain hidden while the mobile menu button also remained hidden.

### Root causes and resolution

| Priority | Affected component | Exact problem and root cause | Implemented solution | Verification |
| --- | --- | --- | --- | --- |
| Critical | Drawer header | `.hf-mobile-drawer button { width: 100% }` applied the action-layout rule to the header Close icon. The full-width button consumed the flex row, reduced the title to a few pixels, and widened the scroll area. | Scoped full-width rules to drawer-body links and drawer-action controls. Converted the header to `minmax(0, 1fr) 2.75rem`, fixed Close at 44 by 44px, kept the title on one line, and hid horizontal overflow. | At 320, 375, 480, 640, and 767px, `Menu` is 24px high, Close is 44 by 44px, and both drawer and page report zero horizontal overflow. |
| High | Mobile/desktop breakpoint | The custom `max-width: 767px` rule and Tailwind's 768px desktop rule left a fractional-width gap where both queries could be false. | Changed the mobile threshold to `max-width: 767.98px`, matching the practical boundary below Tailwind's 768px minimum. | The menu is available through 767px and the desktop nav takes over at 768px with no missing-navigation state. |
| Medium | Drawer width and scrolling | The previous percentage width was harder to reason about on very narrow devices and the drawer could expose horizontal scrolling when a child overflowed. | Uses `min(calc(100vw - 3rem), 20rem)`, caps at the viewport, contains overscroll, and explicitly hides horizontal overflow. | Drawer is 272px at 320px and capped at 320px from 375 through 767px. |

### Regression result

- Breakpoint matrix passed at 320, 375, 480, 640, 767, 768, 1024, and 1440 CSS pixels.
- Shared-route interaction passed on `/`, `/about`, `/contact`, `/faqs`, `/pricing`, `/renters`, `/landlords`, `/signup`, `/login`, and `/forget-password`.
- Opening transfers focus to Close; Close and Escape hide the drawer, unlock body scrolling, clear `aria-expanded`, and restore focus to Open.
- Drawer title remains one line; drawer actions remain full width; no page or drawer horizontal overflow occurs.
- Browser console: 0 warnings, 0 errors.
- Node contract suite: 68 passed, 0 failed.

## Cross-Screen Correction: Public Navigation Active State

### User-reported failure

- Login retained a blue active underline on every public route, including About and Renters.
- The exact current route received `aria-current` only inside the desktop `nav`, but no shared visual-current style; auth actions and mobile drawer clones did not share one route-state contract.

### Root cause and resolution

| Priority | Affected component | Exact problem and root cause | Implemented solution | Verification |
| --- | --- | --- | --- | --- |
| High | Public Login action | Login's template classes permanently included the active border, independent of the current URL. | Removed the hard-coded border and made all public active styling derive from exact normalized `window.location.pathname` matching. | Login has no `aria-current`, current class, underline, or drawer highlight on Home, About, Contact, Renters, Landlords, FAQ, and Pricing; it is active only on `/login`. |
| High | Desktop public navigation | Route matching added `aria-current` to exact `nav` links but provided no visible shared style and did not clear stale public-header state. | Added one `syncCurrentRouteLinks` helper that owns `aria-current` and `hf-current-route`, removes stale state, and applies a visible inset underline. | About, Contact, Renters, and Landlords each expose only their route as current in the visible desktop header. An About-to-Renters click updated the active state after navigation. |
| High | Mobile drawer clones | Drawer links were cloned after the original accessibility pass, so cloned links could miss current-route state. | Synchronizes the completed header and drawer after cloning; the drawer uses a contained background and left-edge indicator. | At 320px, About is the only current drawer item, Login is neutral, focus moves to Close, and neither drawer nor page overflows. Clicking Contact updates both drawer and header current state. |

### Regression result

- Public route matrix passed for `/`, `/about`, `/contact`, `/renters`, `/landlords`, `/login`, `/signup`, `/faqs`, and `/pricing`.
- Exact active route, stale-state removal, desktop styling, and drawer styling passed.
- Desktop and mobile click-navigation tests passed.
- Page and drawer horizontal overflow: 0.
- Browser console: 0 warnings, 0 errors.
- Production CSS build: passed; only the pre-existing non-blocking Browserslist data-age notice remains.
- Node contract suite: 74 passed, 0 failed.

## Cross-Screen Correction: Centered Status Icons

### User-reported failure

- Material Symbols used as status tiles appeared in the upper-left corner of their 48 by 48px colored containers instead of being centered.
- The same pattern appeared in 31 renter, landlord, add-property, and admin templates, so a page-specific adjustment would have left equivalent screens inconsistent.

### Root cause and resolution

| Priority | Affected component | Exact problem and root cause | Implemented solution | Verification |
| --- | --- | --- | --- | --- |
| High | Shared Material Symbol status tiles | The Google Material Symbols stylesheet loads after Tailwind and changed `.material-symbols-outlined` to `display: block`. That overrode the templates' `flex` utility, making `items-center` and `justify-center` ineffective. | Added a narrowly scoped `.material-symbols-outlined.flex` rule in the shared stylesheet that restores flex layout, centers both axes, normalizes line height, and centers glyph text. No per-template offsets or duplicated fixes were introduced. | Static inventory confirms all 31 affected templates use the corrected selector. Rendered renter, landlord, add-property, and admin representatives report `display: flex`, centered axes, a stable 48 by 48px tile, centered text, and zero page overflow. |

### Regression result

- Renter mobile at 320px: visual crop confirms the unavailable-calendar glyph is centered.
- Landlord mobile at 375px, add-property tablet at 768px, and admin desktop at 1440px: computed centering contract passed.
- Production CSS build: passed; only the pre-existing non-blocking Browserslist data-age notice remains.
- Node contract suite: 82 passed, 0 failed.

## Cross-Screen Correction: Dashboard Session and Route Stability

### User-reported failure

- Renter and landlord sessions appeared to log out intermittently while navigating dashboard routes.
- Dashboard shells visibly shifted or flickered during full-page route changes.

### Root cause and resolution

| Priority | Affected component | Exact problem and root cause | Implemented solution | Verification |
| --- | --- | --- | --- | --- |
| Critical | Authentication cookie lifetime | `.env` used `MAX_AGE=86400`, but Express treats `maxAge` as milliseconds. The browser cookie expired after 86.4 seconds while the JWT was configured for 24 hours. | Replaced the ambiguous value with `COOKIE_MAX_AGE_MS=86400000`, added validated millisecond parsing and a seven-day fallback, and documented the explicit unit in `.env.example`. | Runtime configuration resolves to `86400000`; focused duration tests cover explicit, legacy, invalid, and negative values. |
| Critical | Authentication lookup failures | `attachUser` caught JWT and MongoDB errors in one block and cleared the cookie for both. A temporary Atlas lookup failure therefore became a silent logout. | Separated JWT verification from user lookup. Invalid/expired tokens and deleted users clear stale cookies; database failures preserve the cookie and propagate to the 500 handler. | Middleware tests cover transient lookup failure, malformed token, and deleted-user behavior. |
| High | Dashboard first paint | The shared shell declared a 280px width while the rendered rail was 240px, added `.hf-sidebar` only after DOM ready, and inserted the mobile menu after first paint. The shell shifted on desktop and flashed a visible sidebar between 768 and 1023px. | Uses a 240px token, renders stable sidebar classes/IDs/labels in EJS, applies tablet drawer geometry before JavaScript, reserves the 44px menu slot, and marks the shell ready after initialization. | Repeated renter/landlord routes at 800px keep main/header at `x=0` with the drawer at `x=-320`; at 1440px they keep main/header at `x=240` with a 240px rail. All checks report zero overflow. |

### Regression result

- Eight renter and eight landlord protected routes return `200`, with no Login redirect or cookie-clearing response.
- Renter and landlord dashboard, applications/properties, and messages maintain stable geometry at tablet and desktop widths.
- Shared JavaScript syntax and production CSS builds pass.
- Node contract suite: 95 passed, 0 failed.

## Cross-Screen Correction: Dashboard Layout and Control Consistency

### User-reported failure

- Dashboard header actions looked unrelated across pages because some were fully filled while others were transparent.
- Landlord Profile appeared selected on unrelated routes, and cross-role page spacing depended on repeated local utility combinations instead of a shared layout contract.

### Root cause and resolution

| Priority | Affected component | Exact problem and root cause | Implemented solution | Verification |
| --- | --- | --- | --- | --- |
| High | Dashboard header actions | Repeated EJS headers mixed transparent controls, fully filled controls, false Profile states, and one missing current-page semantic. | Added one shared 44px bordered control treatment. Exact current routes use a subtle primary tint and inset indicator. Removed six false landlord Profile fills and restored renter Messages semantics. | Static contracts reject any filled header action without `aria-current="page"`; computed renter, landlord, and admin controls are all 44x44 with identical neutral colors and borders. |
| High | Content spacing | Main gutters, maximum width, section margins, and top-level grid gaps were distributed across utility strings and a conflicting ultra-wide override. | Added shared tokens for a 1280px content cap, fluid 16-32px gutters, and 24-32px section/grid rhythm. The initializer marks content, heading, and top-level grids with semantic classes. | At each tested width, all three roles report the same gutter and gap values; ultra-wide content caps at 1280px. |
| High | Responsive grid containment | Page grids used valid but independently authored ratios, while children could still expand from long content and spacing was difficult to compare across roles. | Preserved useful page-specific ratios, standardized top-level gaps and top alignment, and enforced `min-width: 0` for all grid children. | Renter Dashboard, landlord Properties, and admin Management pass at 320, 375, 768, 1024, 1440, and 2560px with zero horizontal overflow. |

### Regression result

- Full Node suite: 95 passed, 0 failed.
- Production CSS build: passed; only the pre-existing Browserslist data-age notice remains.
- Header actions remain 44x44 across all tested roles and widths.
- Mobile header bottom and main top both resolve to 129px at 320px; desktop resolves to 64px with no overlap.
- MongoDB returned to connected status after one transient health probe and then passed three consecutive checks; the server error log remained empty.

## Cross-Screen Correction: Dashboard Micro-Consistency

### Second-pass findings and resolutions

| Priority | Affected component | Small inconsistency | Implemented resolution | Verification |
| --- | --- | --- | --- | --- |
| Medium | Header controls | Profile used an extra 4px margin, and selected actions retained different filled source classes even after the shared visual fix. | Removed the one-off margin from all role templates and made current appearance depend only on `aria-current` or exact-route state. | Every renter and landlord header action reports `margin-left: 0`, 44x44 geometry, and the same scoped transition. |
| Medium | Sidebar rows and icons | Main links were 44px, footer links were 48px, icons resolved to 24px despite 20px utilities, transitions differed, and role labels were only 11px. | Standardized non-CTA rows at 44px, icons at 20px, role labels at 12px, and transitions to color/background/border properties. | Computed renter, landlord, and admin navigation rows are 44px and icon sets report only `20px`. |
| Medium | Landlord navigation parity | Settings existed as a landlord header action and route but was absent from the landlord sidebar. | Added a Settings row with the same exact current-page contract as renter Settings. | Static rendering and current-page regression pass; the final mobile drawer exposes Settings before Support and Log out. |
| Medium | Action components | Primary and outlined actions mixed 44px and 48px heights, different hover surfaces, opacity behavior, and font weights. | Standardized content actions at 48px with shared radius, scoped transition, hover, pressed, and weight behavior. | Representative renter, landlord, and admin pages report only 48px visible content action heights. |
| Medium | Short mobile drawer | At 320x720, the expanded landlord navigation required about 80px of internal scrolling. | Added a height-aware compact spacing mode that reduces shell gaps, padding, and CTA separation without shrinking touch targets. | Landlord drawer reports `clientHeight=720`, `scrollHeight=720`, 44px rows, and zero page overflow. |
| Low | Command-label casing | Similar commands mixed title case and sentence case, including Add Property, Log Out, Open Applicants, and Review Applications. | Normalized commands to sentence case while preserving product names such as HomiScore. | Static contract rejects the old command variants across dashboard templates. |

### Regression result

- Full Node suite: 95 passed, 0 failed.
- Production CSS build: passed with only the pre-existing Browserslist data-age notice.
- Responsive computed checks pass at 320, 768, 1440, and 2560px with zero horizontal overflow.
- Restarted local server connected to MongoDB and passed three consecutive health checks.

## Screen 1: Home (`/`)

### Scope exercised

- Public header, mobile navigation drawer, hero, ecosystem cards, renter/landlord paths, reputation visualization, final CTA, and footer.
- Anonymous visitor state on the real Express application with MongoDB connected.
- Viewports: 320, 375, 480, 640, 768, 1024, 1440, and 2560 CSS pixels.
- Keyboard Escape handling, focus restoration, CTA navigation, content containment, heading structure, contrast, and target sizing.

### Findings and resolutions

| Priority | Affected component | Exact problem and root cause | Implemented solution | Responsive behavior and reusable opportunity | Verification |
| --- | --- | --- | --- | --- | --- |
| High | Renter and landlord path cards | `Create Tenant Profile` and `List Your Property` were inert buttons made navigable by shared JavaScript that matched their visible text. Copy changes could silently break routing and native link behavior was unavailable. | Replaced both controls with real `/signup` links and removed the Home-specific text-routing binding. | Links retain the existing desktop appearance, expose native browser behavior, and provide at least a 44px target at every width. Use explicit `href` contracts for equivalent CTAs on later screens. | Both controls appear as links in the accessibility tree. `Create Tenant Profile` navigated to `/signup` and browser Back returned to `/`. |
| High | Reputation detail card | The fixed two-column mobile grid and 32px gap left about 92 to 120px per cell at 320 to 375px. Long values broke inside words and the five-star row was clipped. | Stacked detail rows below 640px, restored two columns from 640px, reduced narrow padding, allowed the profile heading row to stack, and made the star row wrap with an accessible summary. | One column at 320 to 480px; two columns from 640px upward; desktop card composition remains unchanged. The same stack-first metric pattern should be reused for dense profile summaries. | No clipping or page overflow across the full matrix. The star row remains contained and readable at 320px. |
| Medium | Score ring | `Excellent Reputation` had no width constraint and pressed into the score ring at narrow widths. | Constrained and centered the label with compact line height so it wraps inside the ring. | Stable inside the fixed ring at mobile, tablet, desktop, and ultra-wide widths. | Visual browser check passed at 320px; no clipped descendants were detected. |
| Medium | Section semantics | Profile and feature titles used `h4`, `h5`, and `h6` without corresponding parent heading levels; the hero mock profile also introduced an unnecessary `h3`. | Normalized section card titles to `h3` and changed the mock profile name to a styled paragraph. | No visual desktop change; document structure now follows `h1` to `h2` to `h3`. Apply the same semantic rule to later card grids. | Live accessibility snapshot shows one `h1` followed by correctly nested `h2` and `h3` headings. |
| Medium | Public CTA destinations | Several public CTAs pointed to protected `/role-selection`, which sent anonymous users through an avoidable login redirect; the partner CTA did not lead to a partnership contact path. | Routed profile creation actions directly to `/signup` and `Partner with HomiFund` to `/contact`. | Destinations are stable at all breakpoints and work with keyboard, browser history, and link context menus. | All primary CTA hrefs were inspected in the live DOM; signup navigation was exercised end to end. |
| Medium | Final secondary CTA | `Partner with HomiFund` rendered as a 21.6px-high text target. | Added an inline-flex 44px minimum target while preserving its underline treatment. | Meets the mobile touch-target gate without changing desktop placement. This treatment can become the shared text-link action style. | Final target-size matrix passes after reload. |
| High | CSS delivery shared by Home | Tailwind was generated at runtime by `cdn.tailwindcss.com`, producing a production warning and making rendering depend on an unversioned external script. | Added pinned Tailwind 3 tooling, moved the complete token configuration into `tailwind.config.js`, generated `/css/tailwind.css`, and added repeatable build scripts. | The compiled stylesheet covers all EJS and shared JavaScript class sources. The Home layout is visually unchanged from 320 through 2560px and no longer waits for runtime class generation. | Local CSS returns 200, the Home HTML contains no Tailwind CDN reference, the clean browser console has zero warnings/errors, and the post-migration responsive matrix passes. |
| High | Trust messaging | The final CTA presented an unsupported `250,000+ members` claim and the landlord path promised guaranteed payments without an implemented guarantee. | Replaced both statements with accurate platform-purpose language and an automated-payments description. | Copy wraps cleanly at every tested width and preserves the original hierarchy. Public screens should use verifiable statements or neutral capability language. | Static-content scan confirms the unsupported audience count and guarantee are absent; the 320px visual check remains clean. |

### Accessibility and visual checks

- Mobile drawer opens with `aria-expanded=true`, closes with Escape, becomes `aria-hidden=true`, and restores focus to `Open menu`.
- The reputation summary reports `5 out of 5 stars` instead of relying on five visible glyphs alone.
- Tested card text contrast ratios are 4.56:1 or higher; standard text meets WCAG AA.
- No horizontal page scrolling or clipped main content occurs at any tested viewport.
- Primary commands maintain stable layout and at least 44px touch targets.

### Regression result

- Node contract suite: 5 passed, 0 failed.
- Production CSS build: passed; generated stylesheet is served locally and contains the scanned application classes.
- Template render gate: passed.
- Shared script parse and duplicate-initialization gate: passed.
- Live route and browser interaction checks: passed.

## Screen 2: About (`/about`)

### Scope exercised

- Public header, hero, story and media, principle cards, platform-foundations band, CTA, and footer.
- Anonymous visitor state on the real Express application.
- Viewports: 320, 375, 480, 640, 768, 1024, 1440, and 2560 CSS pixels.
- Lazy-loaded media, breakpoint visibility, CTA navigation, browser history, content trust, heading structure, touch targets, and console state.

### Findings and resolutions

| Priority | Affected component | Exact problem and root cause | Implemented solution | Responsive behavior and reusable opportunity | Verification |
| --- | --- | --- | --- | --- | --- |
| High | Story and foundations media | Both visuals depended on long external Googleusercontent URLs; the story image initially reported `naturalWidth: 0`, carried only generated `data-alt` copy in source, and depicted an office rather than rental housing. | Generated two rental-specific assets, stored optimized JPEGs under `/public/images/about`, added concise `alt`, intrinsic dimensions, lazy loading, and async decoding, and removed all external main-content assets. | Story image uses a 4:5 mobile ratio, 5:4 from 640px, and the established 480px desktop frame. The dashboard is hidden below 1024px and rendered as a real image at larger widths. Reuse the local responsive-image contract on later marketing screens. | Both assets return 200. Story image reports 1122x1402 natural pixels; dashboard reports 1568x1003 and renders at the 1024px breakpoint. Clean console has no asset errors. |
| High | About CTA | `Get Started` and `View Pricing` were buttons routed by shared JavaScript matching visible text. | Replaced them with native `/signup` and `/pricing` links and removed the About text-routing branch. | Links stack and span the mobile content width, become an inline pair from 640px, and remain at least 52px high. Use explicit links for all navigation commands. | Both journeys were clicked in the live browser; each reached the correct route and Back restored `/about#get-started`. |
| High | Platform claims | The screen claimed rapid expansion across thousands of agreements and guaranteed security outcomes without supporting data or an implemented guarantee. | Replaced growth and outcome claims with capability-accurate statements about clearer decisions, controlled information, consent, and accountability. | Revised text wraps without clipping at all breakpoints and preserves the section hierarchy. Apply the same evidence rule to remaining public copy. | Static scan confirms the unsupported phrases are absent; responsive matrix remains clean. |
| Medium | Foundations grid | A fixed two-column grid forced long verification headings and descriptions into narrow phone columns. Titles were generic `div` elements rather than section headings. | Stacked foundations below 640px, restored two columns at 640px, and promoted each title to `h3`. | One readable column at 320 to 480px; two balanced columns at 640px and above. This is the reusable pattern for dense feature summaries. | Computed grid is one column on all mobile widths and two columns from 640px; no clipped descendants occur. |
| Medium | Story caption | The caption card computed to a fully transparent background over the image, making navy and gray copy unreliable against dark areas. | Added a 95% white surface, blur, border, shadow, compact mobile insets, and 8px radius. | Caption remains inside the image at every width and expands its padding from 640px. | Mobile screenshot and geometry check confirm full containment; computed background is `rgba(255, 255, 255, 0.95)`. |
| Medium | CTA composition and decoration | The CTA was a floating 32px-radius page-section card with two blurred decorative circles, creating unnecessary nesting and mobile padding. | Converted it to a full-width surface band with constrained copy, removed the decorative circles, and standardized controls to 8px radius. | Full-width band provides stable spacing and simpler stacking at all viewport and zoom-equivalent widths. Reuse the band treatment for later page-level CTAs. | No overflow or clipped content through 2560px; both actions maintain stable dimensions. |
| Low | Principle-card motion | Pointer-only inline JavaScript directly mutated transforms and shadows, duplicating styling concerns and offering no reduced-motion ownership. | Removed the script and expressed the restrained hover state in classes covered by the shared reduced-motion rule. | Static layout remains unchanged for touch and keyboard users; hover enhancement applies only where supported. | Shared-script count and parse tests pass; clean browser console has zero warnings/errors. |
| Low | Deep-link validation | Major sections had no stable fragment identifiers, making direct validation and future in-page navigation brittle. | Added `about-story`, `principles`, `platform-foundations`, and `get-started` section IDs. | Fragment navigation works across screen sizes without custom JavaScript. | Direct fragment checks loaded the story asset, desktop dashboard, and CTA states deterministically. |

### Regression result

- Responsive matrix: 8 widths passed with zero page overflow and zero clipped main descendants.
- Route and two optimized assets: 200 responses.
- Browser console: 0 warnings, 0 errors.
- CTA interaction journeys: passed.
- Node contract suite: 5 passed, 0 failed.

## Screen 3: Contact (`/contact`)

### Scope exercised

- Public header, contact methods, quick resources, support form, support actions, location band, and footer.
- Native browser validation, server-side validation, retained form values, pending state, configuration-error feedback, and feedback focus.
- Viewports: 320, 375, 480, 640, 768, 1024, 1440, and 2560 CSS pixels.
- Email, phone, address, Help Center, form submission, browser history, heading structure, touch targets, and console state.

### Findings and resolutions

| Priority | Affected component | Exact problem and root cause | Implemented solution | Responsive behavior and reusable opportunity | Verification |
| --- | --- | --- | --- | --- | --- |
| Critical | Contact form contract | The form had no field-level server validation, accepted arbitrary subject values and lengths, and could fail without preserving actionable field context. | Added an allowlisted subject contract, normalized field validation, length limits, inline errors, an error summary, retained values, and `400` responses for invalid submissions. Added focused controller tests for the contract and limits. | Name and email form a two-column row from 768px and stack below it; errors remain attached to their controls without widening the page. Reuse the validation-error contract for later forms. | Native blank submission focuses the first field. Invalid server submission returns `400` with all expected field errors; three contact validation tests pass. |
| High | Submission and delivery feedback | Submission had no pending state and feedback was not guaranteed to receive focus after the fragment navigation. SMTP is not configured locally, so a generic success state would be misleading. | Added an opt-in submitting state with disabled button, `aria-busy`, stable `Sending...` text, pageshow recovery, and load-aware feedback focus. Preserved the honest configuration fallback that directs users to email support. | The submit control remains at least 44px high and does not resize when disabled. Feedback is placed first inside the form and scrolled into view on every width. This becomes the shared asynchronous-form pattern. | A valid local submission returns `503`, retains all entered values, restores the button, focuses the visible alert, and displays the direct-email fallback. |
| High | Location content | The page embedded an unrelated external San Francisco map while the contact details listed London. The visual depended on a remote image and presented contradictory physical-location information. | Replaced it with an unframed London location band, repeated the matching address, added a contact-first instruction, and provided an explicit external Google Maps link. | Location copy and actions stack on phones and use two columns from 768px. The section has no external background or image dependency. | Static and live checks confirm no San Francisco text and no external content images; the location grid remains contained across the full matrix. |
| High | Resource and support actions | Quick-resource and support actions used `/FAQs` and some behavior depended on text-driven JavaScript routing. This caused a redirect to the canonical lowercase route and weakened native link semantics. | Converted navigation actions to real links, changed Contact and the shared footer to `/faqs`, and updated the shared route resolver to the canonical path. | Native links preserve keyboard, history, context-menu, and touch behavior at every breakpoint. Use explicit canonical hrefs throughout remaining screens. | `Visit Renter Help Center` was clicked in the live browser and landed directly on `/faqs`; Back restored Contact. |
| Medium | Narrow-screen containment | A fixed 400px decorative element, large card padding, and undersized contact links could cause phone overflow or poor touch ergonomics. | Removed the fixed decoration, reduced mobile padding, standardized card radii to 8px, and made email, phone, address, and primary actions at least 44px tall. | Contact details stack below 1024px, form/support grids stack below 768px, and all content remains readable at 320px. Reuse the compact mobile card spacing on later public forms. | Eight-width matrix passes with no page overflow; the long support email fits at 320px and important controls meet the 44px gate. |
| Medium | Structure and decorative noise | Quick Resources used the wrong heading level, decorative circles and a floating page-section card weakened hierarchy, and inline observer/hover code duplicated shared behavior. | Corrected the heading to `h2`, removed decorative circles and the redundant observer script, converted the location area to a full-width band, and marked icon-only decoration hidden from assistive technology. | A simpler hierarchy remains stable through tablet, desktop, ultra-wide, and zoom-equivalent widths. Apply the same page-band and semantic-heading rules to later public screens. | Live DOM reports one `main` and one `h1`; the clean browser console contains zero warnings or errors. |

### Regression result

- Responsive matrix: 8 widths passed with no horizontal page scrolling or clipped visible main content.
- Route responses: GET `200`, invalid POST `400`, valid unconfigured-delivery POST `503`.
- Browser console: 0 warnings, 0 errors.
- Help Center journey and browser Back: passed.
- Node contract suite: 8 passed, 0 failed.

## Screen 4: FAQ (`/faqs`)

### Scope exercised

- Public header, search, topic filtering, result status, disclosures, empty state, support CTA, and footer.
- Direct query/category URLs, search clearing, filter resetting, disclosure pointer and keyboard behavior, and browser history.
- Viewports: 320, 375, 480, 640, 768, 1024, 1440, and 2560 CSS pixels.
- Labels, live result feedback, focus behavior, target sizing, content accuracy, and console state.

### Findings and resolutions

| Priority | Affected component | Exact problem and root cause | Implemented solution | Responsive behavior and reusable opportunity | Verification |
| --- | --- | --- | --- | --- | --- |
| High | Search and topic discovery | Search had no explicit source label, changed inline display only, exposed no result count or empty state, and category controls had no behavior. Refreshing could not preserve the user's context. | Added a labelled search form, clear action, five working topic filters, a polite result count, a recovery-oriented empty state, and `q`/`category` URL parameters. | Search remains full-width and contained. Topic controls use a visible horizontal rail at 320 to 480px and settle into a centered row from 640px. This is reusable for compact filter sets. | Search, clear, renter filtering, zero-result recovery, direct `?category=security&q=sensitive` loading, and focus restoration all pass live. |
| High | FAQ disclosures | Inline `onclick` code only toggled an `active` class, all answer bodies remained visible, and controls had no expanded/controlled relationship. | Rebuilt all eight entries with native `details`/`summary`, generated stable question/answer IDs, synchronized `aria-expanded` and `aria-controls`, labelled answer regions, and added explicit Enter/Space handling. | Summary rows wrap long questions without moving the chevron and remain at least 56px high. Answers expand in place without changing page width. Reuse this disclosure controller for support FAQs. | Pointer click, Enter, and Space each toggle the disclosure; focus remains on `SUMMARY`; expanded state and answer-region labels stay synchronized. |
| High | Content trust | The original answers asserted proprietary scoring, institutional-grade assessment, AES-256 bank-level encryption, MFA, strict GDPR compliance, 24/7 monitoring/support, and international expansion without implementation evidence. | Replaced claims with capability-bounded guidance, clarified that HomiScore and profile completeness do not guarantee approval, and described role-protected workspaces without inventing certifications or service levels. | Revised answers remain scannable and wrap cleanly at all widths. Apply the evidence-first content rule to pricing and role landing pages. | Source scan finds none of the removed handlers or unsupported claims. |
| Medium | Mobile target and text fit | Category controls and the original accordion affordances were inconsistent, while the long search placeholder clipped at 320px. | Standardized category controls to 44px minimum height, disclosures to 56px minimum height, the clear control to 44px square, and shortened the search hint. | The 320px search field fits without clipped text. Horizontal topic overflow is contained within its own rail and never creates page scrolling. | Full viewport matrix reports no page overflow, no clipped visible main content, and a 44px minimum interactive target. |
| Medium | Support CTA | The CTA promised 24/7 support and used inert text-routed buttons, including a redundant Help Center action on the Help Center page. | Replaced it with an unframed full-width support band, availability-neutral copy, and a native `/contact#contact-form` link. | The single primary command stays prominent and 48px high from mobile through ultra-wide layouts. | Live click lands on `/contact#contact-form`; browser Back returns to FAQ. |
| Low | Page-local behavior | Inline search and accordion scripts duplicated shared interaction ownership and were harder to test consistently. | Removed all inline scripts and moved the opt-in FAQ explorer controller into the guarded shared UI script. Added a static FAQ contract test. | No layout dependency is introduced; absent FAQ markup causes an immediate no-op on every other screen. | FAQ has zero inline scripts, shared script parses, and the clean console contains zero warnings or errors. |

### Regression result

- Responsive matrix: 8 widths passed with component-level topic scrolling only on mobile.
- Route response: `200`.
- Browser console: 0 warnings, 0 errors.
- Search, category, empty/reset, direct URL, pointer, keyboard, and support-link journeys: passed.
- Production CSS build: passed.
- Node contract suite: 9 passed, 0 failed.

## Screen 5: Pricing (`/pricing`)

### Scope exercised

- Public header, hero, three landlord plan cards, mobile comparison disclosures, desktop comparison table, final CTA, and footer.
- Signup and contact journeys, disclosure pointer/keyboard behavior, table discovery, sticky-column behavior, and browser history.
- Viewports: 320, 375, 480, 640, 768, 1024, 1440, and 2560 CSS pixels.
- Content consistency, claims, semantic table/disclosure structure, touch targets, and console state.

### Findings and resolutions

| Priority | Affected component | Exact problem and root cause | Implemented solution | Responsive behavior and reusable opportunity | Verification |
| --- | --- | --- | --- | --- | --- |
| High | Plan actions | All plan and final actions were inert buttons, with some destinations inferred from visible text in shared JavaScript. The page also advertised a free trial without an implemented trial flow. | Replaced standard-plan actions with native `/signup` links and sales actions with `/contact#contact-form`; removed Pricing text-route bindings and changed the unsupported trial language to account creation. | Actions fill each card width, remain pinned to aligned card bottoms, and stay at least 48px high. Use the native plan-action contract for future billing integration. | Individual signup reaches `/signup`; Institutional sales reaches `/contact#contact-form`; Back returns to Pricing. |
| High | Plan and comparison consistency | Card features contradicted the comparison table, including payment automation being excluded in one place and marked standard in another. | Defined plan cards and comparison rows from two explicit EJS data structures with one coherent scope vocabulary. | All cards share equal desktop height and CTA alignment; mobile comparison values are generated from the same rows as the desktop table. | Desktop card heights and CTA baselines match exactly; rendered values agree across both comparison modes. |
| High | Trust and endorsement claims | The page asserted institutional-grade verification, response-time guarantees, predictive tenant modeling, 15,000+ landlords, and five unverified security partners. | Removed fabricated partner marks and audience counts, replaced guarantees/predictions with bounded workflow descriptions, and clarified that availability and final scope are confirmed during setup. | Shorter, evidence-bounded copy improves scanability without changing the plan hierarchy. Apply the same claims audit to Renters and Landlords. | Source and live-content scans find none of the removed claims, logos, or handlers. |
| High | Comparison responsiveness | A wide table was the only comparison experience. On smaller screens it required horizontal scrolling without a mobile-optimized alternative or clear tablet discovery. | Added three compact mobile plan disclosures below 768px. Kept a semantic desktop table from 768px, with caption, row/column headers, an accessible scroll region, a sticky feature column, and contextual hint. | Mobile uses stacked disclosures; the 768px table scrolls inside its component with a visible hint; the table fits without scrolling from 1024px. Reuse both responsive comparison patterns where data density warrants them. | Mobile disclosures pass Enter/Space and synchronize ARIA state. Tablet region exposes label/description, scrolls internally, and keeps the first column sticky. |
| Medium | Tablet card layout | The previous three-column layout began at 768px and scaled the featured card to 105%, risking overlap and cramped text. | Removed transform scaling, retained a restrained featured border, kept one column through tablets, and moved to three columns at 1024px. | Cards are 282px or wider at all tested sizes and use stable 8px radii. | Eight-width matrix reports no card clipping, overlap, or page overflow. |
| Medium | Page composition | Large top padding, floating decoration, a fake trust-logo section, and page-local hover JavaScript added space and noise without supporting the decision task. | Tightened the hero, removed empty decoration and endorsement blocks, removed inline scripts, and made plan comparison the next clear decision layer. | The page reads as a focused pricing workflow on phone, tablet, desktop, and ultra-wide layouts. | One `main`, one `h1`, zero inline scripts, and zero browser warnings/errors. |

### Regression result

- Responsive matrix: 8 widths passed with no page overflow or clipped visible main content.
- Mobile comparison: 3 disclosures; desktop comparison: semantic table; 768px component scroll is intentional and announced.
- Route response: `200`.
- Browser console: 0 warnings, 0 errors.
- Signup, contact, pointer, keyboard, and browser-history journeys: passed.
- Production CSS build: passed.
- Node contract suite: 10 passed, 0 failed.

## Screen 6: Renters (`/renters`)

### Scope exercised

- Public header, outcome-led hero, local media, renter-profile benefits, application workflow, payment-record guidance, renter FAQs, final CTA, and footer.
- Signup, filtered FAQ, contact, pointer and keyboard disclosure journeys, image loading, and browser history.
- Viewports: 320, 375, 480, 640, 768, 1024, 1440, and 2560 CSS pixels.
- Hero continuation, heading structure, content trust, local media delivery, target sizing, and console state.

### Findings and resolutions

| Priority | Affected component | Exact problem and root cause | Implemented solution | Responsive behavior and reusable opportunity | Verification |
| --- | --- | --- | --- | --- | --- |
| High | Renter hero and media | A fixed 870px hero, desktop-only visual, broken remote portrait, decorative orb, and protected `/role-selection` CTA created slow entry and an avoidable login redirect. | Rebuilt the hero around a direct `/signup` journey and a locally generated renter-workflow image with alt text, intrinsic dimensions, high-priority loading, and a canonical filtered FAQ link. | One column with 16:9 capped media below 1024px; two columns with 4:3 media from 1024px. Hero height is tuned so the next section is visible at every tested width. | Image reports 1448x1086 natural pixels and route `200`; hero continuation, no overflow, and no clipping pass across all eight widths. |
| Critical | Adoption and outcome claims | The page claimed 50,000+ renters, 12,000+ institutional landlords, four-times higher success within 48 hours, priority treatment, and guaranteed profile effects without evidence. | Removed all audience/outcome statistics and rewrote the value proposition around organizing existing profile, application, message, document, and payment context. Explicitly stated that HomiScore does not guarantee approval. | Shorter copy keeps the same outcome-first hierarchy and wraps cleanly at phone, tablet, desktop, and ultra-wide sizes. Apply the same trust audit to Landlords. | Static and live scans find none of the removed counts, timing, or priority claims. |
| High | Application workflow | A fake `Submit Application` button implied a real mutation, while copy promised one-click applications, automatic references, instant trust, and bank-grade verification. | Replaced the mock mutation with a four-step readiness workflow and a real account-creation link. Each step describes available preparation and review behavior without claiming submission automation. | Steps use one column on phones, two from 640px, and pair with explanatory copy from 1024px. Reuse this numbered workflow for onboarding guidance. | CTA reaches `/signup`; the rendered workflow has no inert action or inline handler. |
| High | Security and credit content | FAQs asserted AES-256 storage, no hard credit impact, major-bureau integration, data-sale policy, and permission behavior without published evidence. | Replaced them with bounded guidance: HomiScore is separate from consumer credit, this page promises no bureau reporting, sensitive documents belong in relevant workflows, and application decisions remain external. | Three compact disclosures keep answers optional and readable at every width. | Removed-claim scan passes; each disclosure exposes controlled region state and toggles with Enter and Space. |
| Medium | Payment section | Decorative cards, a second broken background image, point awards, and bulletproof-reputation copy mixed unsupported scoring outcomes with payment UI. | Reframed the section around schedule, status, and related-record context; added an availability/provider caveat and removed score-award and guarantee language. | One column on phones; summary and three record types scale to desktop without fixed-height media or overlays. | No external content assets, overlap, or clipped descendants across the full matrix. |
| Medium | Page-local interaction and navigation | Page JavaScript closed disclosures by click and hid the global header on scroll; CTA buttons and uppercase FAQ paths weakened predictable browser behavior. | Removed all inline scripts, adopted the shared disclosure controller, and converted every journey to canonical native links. | Header remains stable while scrolling and actions retain native history/focus behavior at all breakpoints. | Zero inline scripts and console warnings/errors; FAQ lands on `/faqs?q=HomiScore` with one result; contact lands on `/contact#contact-form`. |

### Regression result

- Responsive matrix: 8 widths passed with no page overflow or clipped visible main content.
- Hero continuation: next section visible at every tested width in a 900px viewport.
- Route and local image: `200`.
- Browser console: 0 warnings, 0 errors.
- Signup, filtered FAQ, contact, pointer, keyboard, and browser-history journeys: passed.
- Production CSS build: passed.
- Node contract suite: 11 passed, 0 failed.

## Screen 7: Landlords (`/landlords`)

### Scope exercised

- Public header, outcome-led hero, local property media, applicant review, property workflow, operations summary, landlord-profile context, FAQs, final CTA, and footer.
- Signup, pricing, filtered FAQ, contact, pointer and keyboard disclosure journeys, image loading, and browser history.
- Viewports: 320, 375, 480, 640, 768, 1024, 1440, and 2560 CSS pixels.
- Mutation honesty, claims, semantic example data, hero continuation, target sizing, and console state.

### Findings and resolutions

| Priority | Affected component | Exact problem and root cause | Implemented solution | Responsive behavior and reusable opportunity | Verification |
| --- | --- | --- | --- | --- | --- |
| Critical | Applicant and payment mockups | The public page presented a working-looking `Approve Applicant` mutation, fictional applicant identity/income/history, guaranteed Direct Debit status, revenue totals, and interactive chart bars without backend state or confirmation. | Replaced the mutation with a clearly labelled illustrative review summary and moved decision actions to the authenticated-workspace explanation. Reframed payments around available schedule, status, property, and follow-up context with provider/setup caveats. | Example rows wrap and reflow without fixed chart dimensions; operations use a one-column phone grid, two columns from 640px, and a split section from 1024px. Reuse the explicit `Example workspace` labelling for later static previews. | Main content contains zero buttons, fake mutation handlers, hover chart controls, or fabricated financial totals. |
| Critical | Platform and outcome claims | Copy claimed instant proprietary verification, open-banking income checks, thousands of renters, matching algorithms, perfect collections, 80% less admin, three-times listing views, and faster placement. | Rewrote the screen around existing routes and visible workspace categories, made HomiScore supporting context only, and removed all numerical outcomes and unverified integrations. | Evidence-bounded copy preserves the operator-first hierarchy and remains readable across the full matrix. | Static and live scans find none of the removed claims. |
| High | Property media and listing cards | Two listing cards depended on broken remote images, used pointer-only card affordances, and displayed invented prices, applicant counts, and match percentages. | Replaced them with one local rental-building hero image and a three-step property workflow grounded in the existing add-property routes and fields. Added alt text, intrinsic dimensions, and high-priority loading. | Hero media is capped at 300px below desktop and becomes 4:3 in the desktop split. Workflow steps stack, then form three equal columns from 768px. | Image reports 1122x1402 natural pixels; route and asset return `200`; no external content images remain. |
| High | CTA destinations | Hero and profile/final CTAs used protected `/role-selection` or inert buttons routed by text, causing anonymous friction and brittle navigation. | Routed account creation directly to `/signup`, plans to `/pricing`, landlord FAQs to `/faqs?category=landlords`, and sales to `/contact#contact-form`. | Native links are 48px high and stack on phones before becoming inline pairs. | All four journeys were clicked live and reached the correct path/query/fragment; the FAQ reports two landlord results. |
| High | Testimonials and trust scores | Fabricated names, five-star testimonials, placement speed, property counts, landlord score, Top 5%, and retention metrics presented social proof as fact. | Removed the testimonial and score mockups. Replaced them with neutral landlord-profile guidance covering completeness and communication without promising views or tenant quality. | The unframed profile section uses a clean two-column desktop layout and compact reusable information items. | Removed-content scan passes; no star-rating or named endorsement remains. |
| Medium | Page visibility and decoration | IntersectionObserver code first made every section transparent, scroll code mutated the shared header, and large gradient/orb decorations complicated rendering. | Removed all page-local scripts, animation ownership, gradient/orb decoration, and oversized nested CTA card. Adopted shared disclosures for the added landlord questions. | Content is immediately visible with stable header behavior and reduced-motion compatibility at every breakpoint. | Zero inline scripts, one `main`, one `h1`, and zero console warnings/errors. |
| Medium | Hero continuation | The first 320px pass ended nine pixels below the 900px viewport, hiding the next-section cue. | Reduced only the narrow-screen vertical hero padding while preserving tablet and desktop spacing. | The next section is visible from 320px through 2560px; media keeps stable aspect and cap rules. | Eight-width hero matrix passes after the adjustment. |

### Regression result

- Responsive matrix: 8 widths passed with no page overflow or clipped visible main content.
- Hero continuation: next section visible at every tested width in a 900px viewport.
- Route and local image: `200`.
- Browser console: 0 warnings, 0 errors.
- Pricing, signup, filtered FAQ, contact, pointer, keyboard, and browser-history journeys: passed.
- Production CSS build: passed.
- Node contract suite: 12 passed, 0 failed.

## Screen 8: Signup (`/signup`)

### Scope exercised

- Public header, account form, error summary, field errors, password visibility, pending state, policy contact, sign-in journey, and footer.
- Native validation, server validation, retained values, focus behavior, password privacy, and browser history.
- Viewports: 320, 375, 480, 640, 768, 1024, 1440, and 2560 CSS pixels.
- Autocomplete, target sizing, control labels, ultra-wide constraints, error semantics, and console state.

### Findings and resolutions

| Priority | Affected component | Exact problem and root cause | Implemented solution | Responsive behavior and reusable opportunity | Verification |
| --- | --- | --- | --- | --- | --- |
| Critical | Signup server contract | Backend validation only checked for non-empty fields, returned `200` on invalid data, dropped entered values, and exposed no field-level context. | Added normalized name/email handling, email format and length checks, 2-120 character name rules, an 8-128 character password contract, field-specific errors, retained safe values, `400` validation responses, `409` duplicate responses, and `500` unexpected-error responses. | Errors render immediately below controls without widening the form. The same render contract should be applied to Login and role selection. | Invalid POST returns `400`, renders all three expected errors, retains normalized name/email, and never returns the password. Three pure validation tests pass. |
| High | Password control | The visibility icon was an unnamed 24px inline-handler button that changed only icon text. | Added a shared opt-in password-toggle controller, a 44px control, explicit show/hide labels and title, `aria-controls`, `aria-pressed`, icon hiding, and focus restoration to the password input. | Control remains contained inside the field at all widths and cannot resize the form. Reuse on Login and reset-password screens. | Live show and hide actions update input type, icon, accessible label, pressed state, and preserve password focus. |
| High | Unavailable authentication and legal actions | Google and Apple buttons had no integration. The form required agreement to unpublished Terms and Privacy documents represented by disabled-looking text. | Removed unavailable social authentication and the false agreement. Added an honest policy-publication notice with a 44px mailto support action. | Removing the two-column social row shortens the phone form; the policy action remains reachable without a tiny inline target. | No social controls, legal agreement checkbox, placeholder policies, or inline handlers remain. |
| High | Form semantics and state | Errors were not announced or focused, controls lacked a complete autocomplete/length contract, and submit had no pending protection. | Added a focused `role=alert` summary, inline `aria-invalid`/`aria-describedby` errors, name/email/new-password autocomplete, maxlength/minlength, and shared submit-disabled/label/`aria-busy` behavior. | All controls are at least 48px high and the error summary stays within the 480px form column. | Native blank submit focuses `full_name` and reports the browser message; static and server tests confirm the error/pending hooks. |
| Medium | Trust copy | The page claimed institutional-grade tools and encrypted registration without presenting implementation evidence. | Replaced it with role-selection guidance and the verifiable statement that passwords are stored as one-way hashes, matching the bcrypt model hook. | Compact copy preserves a quiet account-creation hierarchy at every size. | Source confirms bcrypt hashing and the removed unsupported phrases are absent. |
| High | Ultra-wide form width | A global 1600px rule overwrote every direct `main > div` max-width and stretched the 480px account form to 1440px. | Restricted the ultra-wide shared cap to section containers so deliberate direct form widths remain authoritative. | Signup stays 480px from 640 through 2560px while narrower widths use available space. This repairs other compact auth screens using the same structure. | At 2560px the wrapper and card both compute to 480px; inputs remain 414.4px wide. |

### Regression result

- Responsive matrix: 8 widths passed with no page overflow or clipped visible main content.
- Form width: fluid on phones, 480px maximum from tablet through ultra-wide.
- GET `200`; invalid POST `400` with retained safe values and field errors.
- Browser console: 0 warnings, 0 errors.
- Native validation, password toggle, sign-in link, focus, and browser-history journeys: passed.
- Production CSS build: passed.
- Node contract suite: 16 passed, 0 failed.

## Screen 9: Login (`/login`)

### Scope exercised

- Public header, session notice, credential form, validation states, password visibility, forgot-password journey, signup return link, and footer.
- Native validation, malformed input, unknown credentials, retained email, cleared password, safe return path, focus behavior, and pending recovery.
- Viewports: 320, 375, 480, 640, 768, 1024, 1440, and 2560 CSS pixels.
- Generic credential errors, autocomplete, target sizing, compact form width, and console state.

### Findings and resolutions

| Priority | Affected component | Exact problem and root cause | Implemented solution | Responsive behavior and reusable opportunity | Verification |
| --- | --- | --- | --- | --- | --- |
| Critical | Login response contract | Missing and invalid credentials rendered with `200`, email was dropped, and controls had no field-level validation contract. | Added normalized email handling, format/length checks, password presence/length checks, retained email, `400` malformed responses, generic `401` credential failures, and `500` unexpected errors. | Error rows remain attached to fields inside the compact card without changing width. | Malformed POST returns `400`; a unique unknown credential returns `401`, preserves email, clears password, and exposes only `Invalid email or password.` |
| High | Credential-error safety | Error and notice surfaces were present but not focused, and the server contract did not distinguish validation from authentication failure. | Added focused alert/status feedback, generic authentication copy, field ARIA only for malformed input, and shared pageshow recovery for the submit button. | Feedback appears first in the form and stays visible on all widths. | Session notice receives focus and preserves `/pricing` in the hidden return field; the credential alert receives focus after POST. |
| High | Password and unavailable social controls | Google/Apple buttons had no provider integration, the Google logo was a remote asset, and the password button was unnamed and driven by inline JavaScript. | Removed unavailable social login and remote media; adopted the shared 44px password toggle with ARIA state, dynamic label, icon update, and password-focus restoration. | Removing the social row shortens mobile flow; toggle remains contained inside the 48px input through ultra-wide. | Live show/hide actions pass; zero external images and zero inline scripts remain. |
| Medium | Form and recovery ergonomics | Inputs lacked autocomplete and limits; Forgot Password and Signup were small inline targets; submit had no pending state. | Added email/current-password autocomplete, maxlength, shared pending state, and 44px Forgot/Create-account link targets. | Card is fluid on phones and fixed at 448px from 640 through 2560px. | Eight-width matrix passes with 44px minimum targets, 49.6px fields, and no clipping or page overflow. |
| Medium | Trust and hierarchy | Duplicate in-card branding and `Secure, encrypted login` copy competed with the page heading and asserted an unspecified transport/storage outcome. | Removed duplicate branding, atmospheric decoration, and security badge; used direct account-access copy and one `h1`. | The simplified card keeps a clear title-form-recovery order on every screen size. | Live DOM reports one `main`, one `h1`, no social copy, and a clean browser console. |

### Regression result

- Responsive matrix: 8 widths passed with no page overflow or clipped visible main content.
- Form width: fluid on phones, 448px maximum from tablet through ultra-wide.
- GET `200`; malformed POST `400`; unknown credential POST `401` with generic feedback.
- Browser console: 0 warnings, 0 errors.
- Native validation, password toggle, session notice/return path, credential error, and forgot-password journey: passed.
- Signup href: source-verified; the reverse click was not repeated after a browser-policy block.
- Production CSS build: passed.
- Node contract suite: 18 passed, 0 failed.

## Screen 10: Forgot Password (`/forget-password`)

### Scope exercised

- Public header, reset-request explanation, email form, validation/error/success surfaces, sign-in recovery, support journey, and footer.
- Native validation, invalid-email server validation, unconfigured-mail delivery, retained email, focused feedback, and pending recovery.
- Viewports: 320, 375, 480, 640, 768, 1024, 1440, and 2560 CSS pixels.
- Anti-enumeration copy, touch targets, compact width, field semantics, and console state.

### Findings and resolutions

| Priority | Affected component | Exact problem and root cause | Implemented solution | Responsive behavior and reusable opportunity | Verification |
| --- | --- | --- | --- | --- | --- |
| High | Request meaning and feedback | Heading implied an immediate reset while the action only requests email. Errors/status were not focused and invalid email had no field association. | Renamed the task to `Request a password reset`, explained the conditional time-limited link, added a focused alert/status, inline email error, `aria-invalid`, and `aria-describedby`. | Feedback remains first inside the 448px form and wraps without widening it. | Native blank submit focuses email; invalid POST returns `400`; feedback hooks and field error are present. |
| Critical | Delivery honesty | A UI-only success would mislead users when mail is not configured. The backend already had an SMTP gate that needed to remain visible and recoverable. | Preserved the `503` configuration response, retained the submitted email, restored the submit control, and displayed the direct support fallback. Preserved neutral success copy for configured delivery to avoid account enumeration. | Alert remains visible and focused on phones through ultra-wide sizes. | Valid local request returns `503`, shows the exact mail-not-configured message, retains email, focuses the alert, and re-enables submit. |
| Medium | Form and navigation ergonomics | Submit had no pending state, email length was unconstrained, Back/Contact links were small, and a security badge asserted an unspecified encrypted connection. | Added maxlength/autocomplete, shared pending state, 44px recovery links, canonical contact fragment, and removed the unsupported badge. | Form is fluid on phones and fixed at 448px from 640 through 2560px; all controls remain at least 44px. | Eight-width matrix passes; Back reaches `/login` and Contact reaches `/contact#contact-form`. |
| Medium | Visual hierarchy | A large circular reset icon and elevated 12px-radius card added height and visual weight to a short recovery task. | Reduced the icon to a compact 48px square, standardized the card to 8px, and aligned spacing with Login and Signup. | The screen remains vertically compact without losing task identity. | Mobile error-state screenshot and computed geometry pass; no clipped content or page overflow. |

### Regression result

- Responsive matrix: 8 widths passed with no page overflow or clipped visible main content.
- Form width: fluid on phones, 448px maximum from tablet through ultra-wide.
- GET `200`; invalid POST `400`; valid unconfigured-delivery POST `503`.
- Browser console: 0 warnings, 0 errors.
- Native validation, focused SMTP fallback, login/contact links, and browser history: passed.
- Production CSS build: passed.
- Node contract suite: 20 passed, 0 failed.

## Screen 11: Reset Password (`/reset-password/:token`)

### Scope exercised

- Public header, valid-token form, validation summary, field errors, invalid/expired-token recovery, success confirmation, sign-in journey, and footer.
- Native validation, server validation, password confirmation, two independent visibility controls, focused feedback, and invalid-token response behavior.
- Viewports: 320, 375, 480, 640, 768, 1024, 1440, and 2560 CSS pixels.
- Input privacy, touch targets, compact width, ARIA state, browser console, and non-mutating success/error fixture rendering.

### Findings and resolutions

| Priority | Affected component | Exact problem and root cause | Implemented solution | Responsive behavior and reusable opportunity | Verification |
| --- | --- | --- | --- | --- | --- |
| Critical | New-password server contract | The reset action lacked the same explicit length and confirmation contract as Signup, so malformed input could reach token/database work and error rendering had no field detail. | Added required, 8-128 character, confirmation-required, and exact-match validation before token lookup. Invalid form data and invalid/expired tokens now return `400` with distinct recoverable states. | Inline errors remain attached to their controls without widening the compact card. Reuse the shared auth validation/render contract for later sensitive forms. | Pure validator tests pass; short/mismatched POST returns both field errors with `400`; valid-shaped input against a fake token returns the invalid-link state with `400`. |
| High | Password visibility controls | Both password fields needed independent, accurately named reveal actions. A generic label would create ambiguity in the accessibility tree and could target the wrong input. | Applied the shared password-toggle controller to both fields and added `data-password-name` for the confirmation control. Each 44px button maintains its own `aria-controls`, `aria-pressed`, dynamic Show/Hide label, and input focus. | Controls remain contained inside 49.6px fields across every tested width and cannot shift the form. | Exact-label browser interactions changed each corresponding input to text, updated pressed/label state, and restored focus to the correct input. |
| High | Invalid and completion states | Expired links and successful resets lacked a consistently focused, single-purpose recovery state. | Added focused alert/status regions, removed the form when the token is invalid or reset is complete, and exposed native Request-new-link and Sign-in actions. | Both states use the same fluid phone and 448px desktop constraint as the form, with actions at least 48px high. | Real invalid route focuses its alert and recovers to `/forget-password`; the non-mutating success fixture focuses its status and exposes `/login`. |
| High | Field semantics and privacy | Inputs did not expose a complete new-password autocomplete/length/error contract, and failed submissions risked retaining secret values. | Added `autocomplete=new-password`, `minlength=8`, `maxlength=128`, inline error descriptions, `aria-invalid`, shared pending state, and empty password values on every rendered error. | Native blank submission focuses the first password field; feedback wraps within the card at all widths. | Error fixture exposes both inline messages and invalid states while both values remain empty; native blank validation focuses `password`. |
| Medium | Visual hierarchy and width | The reset task did not consistently match the compact authentication family and was vulnerable to the earlier ultra-wide direct-child override. | Rebuilt the screen around one 448px, 8px-radius card with one `h1`, concise security guidance, and the shared public shell. | Fluid from 320-480px and capped at 448px from 640-2560px; no page overflow or clipped visible elements. | Eight-width matrix passes; computed card width reaches but never exceeds 448px; mobile viewport screenshot is clean. |

### Regression result

- Responsive matrix: 8 widths passed with no page overflow or clipped visible content.
- Form width: fluid on phones, 448px maximum from tablet through ultra-wide.
- Invalid GET `400`; malformed POST `400`; valid-shaped POST with invalid token `400`.
- Browser console: 0 warnings, 0 errors.
- Native validation, both password toggles, focused error/status states, and recovery navigation: passed.
- Success rendering was validated through the local non-mutating EJS audit renderer; no user account was created or changed.
- Production CSS build: passed.
- Node contract suite: 22 passed, 0 failed.

## Screen 12: Role Selection (`/role-selection`)

### Scope exercised

- Authenticated header state, workspace explanation, renter and landlord choices, validation feedback, submit action, sign-out recovery, footer, and protected-route redirect.
- Native required-state behavior, focus visibility, pointer selection, selected-state communication, pending-state contract, server validation, and one-time role assignment.
- Viewports: 320, 375, 480, 640, 768, 1024, 1440, and 2560 CSS pixels.
- Card sizing, copy accuracy, touch targets, unauthenticated return path, console state, and non-mutating fixture rendering.

### Findings and resolutions

| Priority | Affected component | Exact problem and root cause | Implemented solution | Responsive behavior and reusable opportunity | Verification |
| --- | --- | --- | --- | --- | --- |
| Critical | Role assignment guard | Any authenticated renter or landlord could revisit and POST the route to overwrite their role, even though no supported role-change workflow exists. | Redirect accounts with an assigned role to their existing workspace before rendering or mutating. New assignments continue to the matching onboarding route; established destinations remain centralized through `getRoleHome`. | Behavior is server-owned and consistent at every viewport. A future role-management feature must be a distinct confirmed workflow. | Controller tests prove a new renter reaches `/onboarding-tenant`; an existing renter remains a renter and is redirected to `/user/renter/dashboard`. |
| High | Choice semantics | Clickable `div` elements simulated radios through inline handlers. They required custom Enter/Space handling, did not provide native required validation, and silently preselected landlord. | Replaced them with two required native radio inputs inside a labelled `fieldset`, paired with full-card labels and no default selection or inline JavaScript. | Cards stack through 640px and become equal two-column choices from 768px. The pattern is reusable for small mutually exclusive setup choices. | Blank submit focuses the renter radio, exposes the native validation message, and renders a visible focus outline. Pointer selection switches checked state and a check indicator correctly. |
| High | Invalid submission contract | Invalid or unsupported roles rendered with `200`, used a generic message, and did not focus feedback. Unexpected save errors also returned `200`. | Added normalized allow-list validation, a specific recoverable message, `400` invalid responses, `500` unexpected responses, and focused alert feedback. | The alert sits above the fieldset and wraps without affecting the grid width. | Pure validation and controller response tests pass; fixture error receives focus and preserves a valid selected choice for retry. |
| High | Authenticated navigation context | The public header showed Login and Sign Up even though the route requires an authenticated account. | Added an opt-in authenticated state to the shared header, showing the escaped account email on large screens and a 44px Sign out action. Role Selection passes the current user explicitly. | Email is hidden before 1024px; Sign out remains visible on phones and the mobile drawer remains available. Reuse this header state during later onboarding repairs. | Fixture header exposes Sign out and no Login action at 320px and 1440px; mobile and desktop screenshots are clean. |
| Medium | Claims and choice clarity | Copy promised multi-role account management, verified listings, faster placement, institutional precision, and automation without corresponding workflows. The consequence of choosing a role was vague. | Reframed the decision as one primary workspace and described the actual dashboard categories available to each role. | Short, parallel descriptions maintain equal card height and readable line lengths across all widths. | Removed-claim source test passes; computed cards are equal height at every breakpoint. |
| Medium | Selection and submit feedback | Selected state relied on a page-specific class and inline script; submit offered no pending protection. | Added shared CSS for checked, hover, focus-visible, and forced-colors states, plus the existing shared submitting-form contract. Selection is communicated through border, surface, native checked state, and a check icon. | Stable dimensions prevent state changes from shifting either card; Continue is 48px high and sign-out recovery is 44px. | Selected styling and indicator were inspected for both choices; no page overflow or clipped main content occurs. |

### Regression result

- Responsive matrix: 8 widths passed with no page overflow or clipped visible main content.
- Layout: one column through 640px; two equal columns from 768px; content capped at 768px on large and ultra-wide screens.
- Anonymous live GET redirects to `/login?reason=session&returnTo=%2Frole-selection`, with focused notice and preserved return path.
- Real role assignment was not performed; successful, invalid, and already-assigned controller paths were verified with isolated request/user doubles.
- Browser console: 0 warnings, 0 errors.
- Native required focus, visible focus state, both pointer choices, selected styling, and auth-header state: passed.
- Production CSS build: passed.
- Node contract suite: 26 passed, 0 failed.

## Screen 13: Landlord Onboarding (`/onboarding-landlord`)

### Scope exercised

- Authenticated header, three-step progress, account details, portfolio details, workspace preferences, draft and continue actions, next-step summary, footer, and protected-route behavior.
- Native required validation, server validation, retained values, field errors, draft confirmation, multi-submit pending behavior, model compatibility, and role authorization.
- Viewports: 320, 375, 480, 640, 768, 1024, 1440, and 2560 CSS pixels.
- Form labels, input modes, grouped checkbox/radio choices, sticky summary, touch targets, claims, console state, and non-mutating fixture rendering.

### Findings and resolutions

| Priority | Affected component | Exact problem and root cause | Implemented solution | Responsive behavior and reusable opportunity | Verification |
| --- | --- | --- | --- | --- | --- |
| Critical | Persistence and routing | The form had no method, action, names, or backend handler. Continue was an anchor overridden by inline JavaScript to a broken relative route, while Save and Finish Later navigated home without saving. | Added a landlord-profile subdocument, normalized/validated controller contract, protected GET and POST routes, resumable draft save, complete-profile continuation to `/landlord-verification`, and role-specific authorization. | Persistence is independent of viewport. The controller and profile schema form a reusable pattern for renter onboarding and settings. | Controller tests cover normalization, invalid continue, partial draft, successful continue, and both redirect targets. Anonymous GET/POST return `302` to Login with the onboarding return path. |
| Critical | Draft edge cases | The proposed draft path initially mapped empty select/radio values to enum fields, which Mongoose would reject even though partial drafts are meant to be valid. | Omitted empty optional enum and numeric values from persistence while retaining completed text and choice values. Kept full requirements only for Continue. | Save draft can leave required UI fields incomplete without weakening the complete-profile gate. | Partial draft request double saves and redirects to `?saved=1`; the resulting draft shape passes asynchronous Mongoose validation. |
| High | Form accessibility | Visible labels were not associated with controls, controls lacked names and required/error semantics, preference radios were hidden, and checkbox groups had no legend or error relationship. | Added explicit labels/IDs or wrapping labels, complete names, autocomplete/inputmode/limits, required indicators, fieldsets/legends, inline errors, `aria-invalid`, descriptions, and a focused summary. | Controls stack on phones, account/portfolio pairs use two columns from 768px, and grouped choices move from one to two/three columns without losing labels. | Blank Continue focuses Legal name with the native message; error fixture focuses its alert, retains values, and exposes six specific inline errors. |
| High | Truth and privacy | The sidebar fabricated a named landlord passport, member ID, 25% score, verification badges, tenant-quality outcomes, priority visibility, AES-256, AML/KYC, and SOC 2 claims. | Removed the mock identity, score, badges, security assertions, and outcome promises. Replaced them with a plain three-step explanation of saving, reviewing verification, and opening the workspace. | Summary follows the form on smaller screens and becomes sticky from 1024px without crowding the form. | Removed-content contract test passes; mobile and desktop renders contain no fake identity or trust marks. |
| High | Save and submit feedback | The page had no loading, success, failure, duplicate-submit, or resume state. Shared form behavior supported only one submitter. | Added focused draft status and error states, two explicit submit intents, `formnovalidate` for draft, and enhanced the shared submit controller to use `event.submitter`, distinct pending labels, and disable/reset all submit buttons. | Both actions are 48px high, stack on phones, and share a row from 640px. The multi-submit behavior is reusable for long forms with draft actions. | Shared script parses and asserts `event.submitter`/`formNoValidate`; success fixture focuses `Draft saved`; both submit buttons expose the correct intent. |
| Medium | Progress and hierarchy | A dense four-step bar treated HomiScore as a required setup step and risked clipping long labels. The page used 12px-radius surfaces and oversized empty spacing. | Reduced progress to the three implemented stages, added semantic current-step navigation, tightened spacing, standardized 8px surfaces, and preserved one `h1` with section `h2`s. | Three compact columns fit at 320px; content is capped at 1152px on large and ultra-wide screens. | Eight-width matrix reports zero overflow or clipped main descendants; mobile and desktop screenshots are clean. |
| Medium | Profile questions | Tenant-profile preferences and high-yield/capital-stability choices introduced unclear and potentially discriminatory or financial categorization without a product contract. | Replaced them with neutral management-style and first-workspace-task choices tied to visible product modules. | Parallel card labels keep 49.6px minimum choice targets and wrap safely. | All checkbox, select, and radio interactions were exercised in one valid browser form state. |

### Regression result

- Responsive matrix: 8 widths passed with no page overflow or clipped visible main content.
- Layout: one-column fields through 640px; two-column field groups from 768px; form/summary split with sticky summary from 1024px.
- Controls: text/select controls at least 44px; grouped choices at least 49.6px; submit actions 48px.
- Anonymous live GET and POST both redirect to Login with `/onboarding-landlord` preserved.
- Real database mutation was intentionally not performed; persistence paths were verified with request/user doubles plus Mongoose schema validation.
- Browser console: 0 warnings, 0 errors.
- Native validation, grouped choices, error retention/focus, draft status, and authenticated header state: passed.
- Production CSS build: passed.
- Node contract suite: 34 passed, 0 failed.

## Screen 14: Renter Onboarding (`/onboarding-tenant`)

### Scope exercised

- Authenticated header, three-step progress, account/household, current-situation and home-search sections, draft and continue actions, privacy guidance, footer, and protected-route behavior.
- Native required validation, server validation, retained values, field errors, draft confirmation, model compatibility, and renter-only authorization.
- Viewports: 320, 375, 480, 640, 768, 1024, 1440, and 2560 CSS pixels.
- Labels, autocomplete/input modes, numeric/date constraints, privacy boundaries, sticky guidance, touch targets, console state, and non-mutating fixture rendering.

### Findings and resolutions

| Priority | Affected component | Exact problem and root cause | Implemented solution | Responsive behavior and reusable opportunity | Verification |
| --- | --- | --- | --- | --- | --- |
| Critical | Persistence and route contract | Eleven controls existed outside a real form contract: no names, action, method, backend handler, draft state, or error recovery. Continue was an anchor overridden by a relative client redirect and Save navigated home. | Added a renter-profile subdocument, normalized/validated controller contract, renter-only GET/POST routes, partial draft persistence, complete-profile continuation to `/tenant-verification`, and resumable `?saved=1` confirmation. | Matches the proven landlord onboarding form/controller pattern while keeping role-specific fields isolated. | Controller tests cover valid normalization, malformed input, partial draft, complete continue, redirects, date/number mapping, and Mongoose validation. Anonymous GET/POST preserve the Login return path. |
| Critical | Income and scoring privacy | The page collected annual income before a working consent/verification flow, projected a HomiScore, claimed a 40% score increase, and said the profile was trust-verified and institution-grade. | Removed income evidence and all live score/verification theater from profile setup. Added explicit guidance that supporting documents belong to the next reviewed verification step. | Removing the mock passport makes the phone flow shorter and leaves a calm, truthful desktop guidance panel. | Static contract rejects all removed score, trust, income-control, malformed-currency, and observer content; browser confirms no income control exists. |
| High | Form accessibility | Every visible control failed programmatic-label checks, selects had implicit first values instead of placeholders, and no required, help, error, autocomplete, or range semantics existed. | Added associated labels, stable IDs/names, placeholder options, required markers, autocomplete, inputmode, min/max/step/maxlength, inline errors, ARIA relationships, and focused summary/status states. | Field pairs stack through 640px and use two columns from 768px. All controls remain at least 44px high and actions remain 48px. | Blank Continue focuses Legal name; error fixture focuses its alert, retains three malformed values, exposes eight inline errors, and marks all related controls invalid. |
| High | Data validation and draft safety | Household, pet, employment, property, phone, budget, and date values had no server allow lists or bounds. Empty optional enum values would also make drafts fail model validation. | Added enum allow lists, 7-15 digit optional phone validation, text limits, bounded decimal budget, strict date shape, and omission of empty optional schema values. | Draft can remain partial; Continue enforces the complete profile consistently at every screen size. | Partial and complete renter shapes both pass asynchronous Mongoose validation; malformed contract test covers every field family. |
| Medium | Content and regional consistency | The screen mixed UK phone/currency with Manhattan/Brooklyn examples, used corrupted pound symbols, and implied automatic matching/score calculation. | Standardized currency labelling to ASCII `GBP`, replaced examples with neutral location guidance, and described only workspace organization and verification review. | Copy wraps cleanly without currency-glyph encoding issues on phones and desktops. | Source contains no malformed currency characters or unsupported matching/scoring copy; live rendered fields retain values correctly. |
| Medium | Layout and motion | Four dense progress steps clipped on narrow screens, three separate cards lengthened the form, the sticky passport applied on all sizes, and IntersectionObserver faded sections during reading. | Used the shared three-step progress pattern, one coherent 8px form surface with section dividers, a guidance panel that becomes sticky only at 1024px, and removed all page-local scripts/motion. | Content caps at 1152px; one-column form through 640px, two-column groups from 768px, split layout from 1024px. | Eight-width matrix reports zero overflow or clipped main descendants; mobile and desktop screenshots are clean; console has no warnings/errors. |

### Regression result

- Responsive matrix: 8 widths passed with no page overflow or clipped visible main content.
- Layout: one-column fields through 640px; two-column field groups from 768px; form/summary split with sticky summary from 1024px.
- Controls: all form controls at least 44px; submit actions 48px.
- Anonymous live GET and POST both redirect to Login with `/onboarding-tenant` preserved.
- Real database mutation was intentionally not performed; persistence paths were verified with request/user doubles and both partial/complete Mongoose schema validation.
- Browser console: 0 warnings, 0 errors.
- Native validation, complete control interaction, error retention/focus, draft status, and authenticated header state: passed.
- Production CSS build: passed.
- Node contract suite: 39 passed, 0 failed.

## Screen 15: Onboarding Completion (`/onboarding-complete`)

### Scope exercised

- Authenticated header, success identity, role-aware summary, next-step guidance, dashboard/profile/help actions, footer, and protected-route behavior.
- Incomplete-profile recovery, renter and landlord destinations, unsupported-role protection, heading hierarchy, target sizing, and console state.
- Viewports: 320, 375, 480, 640, 768, 1024, 1440, and 2560 CSS pixels.

### Findings and resolutions

| Priority | Affected component | Exact problem and root cause | Implemented solution | Responsive behavior and reusable opportunity | Verification |
| --- | --- | --- | --- | --- | --- |
| Critical | Completion eligibility | Any authenticated account could open the route. A roleless account generated `/user/null/dashboard`, admin was incorrectly treated as an onboarding role, and no saved profile was required. | Restricted the route to renter/landlord roles and added controller checks that validate the saved role-specific profile. Incomplete accounts resume the matching onboarding form. | Eligibility is server-owned and independent of display size. Reuse this guarded completion pattern for other multi-step flows. | Controller tests redirect an incomplete renter to `/onboarding-tenant` and render a complete landlord with exact dashboard/profile destinations. Anonymous live GET preserves `/onboarding-complete` through Login. |
| High | Success accuracy | The page said the workspace and verification details were ready without checking setup, and directed users to account settings even though role-specific profile routes exist. | Scoped the success statement to saved profile setup, described verification as a status that may still need attention, and added explicit role-aware dashboard and profile links. | Dynamic role text remains the same length class and wraps safely on phones. | Renter fixture resolves `/user/renter/dashboard` and `/user/renter/profile`; landlord resolves `/user/landlord/dashboard` and `/user/landlord/user-profile`. |
| High | Unsupported score language | `Build your HomiScore` implied a required next step and inherited unsupported scoring promises from the onboarding screens. | Replaced it with `Check verification` and bounded copy that points to information shown in the dashboard. | Three items stack on phones and become equal columns from 640px. | Source contract finds no HomiScore, admin branch, null route, inline script, or handler. |
| Medium | Action hierarchy and accessibility | The secondary help link was a small text target, only dashboard had clear command styling, and the authenticated screen still used the public anonymous header state. | Added 48px primary, secondary, and help actions; passed current user to the shared authenticated header; preserved one `main` and one `h1`. | Actions stack full-width on phones and become an inline group from 640px; content caps at 768px through ultra-wide. | Eight-width matrix reports zero overflow/clipping and 48px minimum actions; mobile screenshot and both role states are clean. |

### Regression result

- Responsive matrix: 8 widths passed with no page overflow or clipped visible main content.
- Next steps: one column through 480px; three columns from 640px.
- Anonymous live GET redirects to Login with `/onboarding-complete` preserved.
- Renter and landlord route/copy fixtures passed; incomplete-profile controller recovery passed.
- Browser console: 0 warnings, 0 errors.
- Production CSS build: passed.
- Node contract suite: 42 passed, 0 failed.

## Screen 16: Landlord Verification (`/landlord-verification`)

### Scope exercised

- Authenticated header, progress state, security notice, identity/address/property-authority/business requirements, preparation guidance, profile/summary/help journeys, footer, and protected-route behavior.
- Complete-profile eligibility, unsupported upload/banking removal, content safety, target sizing, responsive stacking, sticky guidance, and console state.
- Viewports: 320, 375, 480, 640, 768, 1024, 1440, and 2560 CSS pixels.

### Findings and resolutions

| Priority | Affected component | Exact problem and root cause | Implemented solution | Responsive behavior and reusable opportunity | Verification |
| --- | --- | --- | --- | --- | --- |
| Critical | Sensitive document controls | Passport, address, ownership, and multi-file upload controls were entirely inert; no multipart endpoint, secure storage, malware scanning, access policy, retention policy, or deletion flow exists. | Removed all file controls and reframed the route as a preparation checklist. Added a prominent warning that secure upload is not configured and that sensitive documents must not be sent through Contact. | Requirements remain readable as compact information rows without fake drop zones on every device. Reuse this explicit unavailable-capability state until secure document infrastructure is implemented. | Live DOM contains zero inputs, selects, buttons, or external images; contract test rejects file controls and unsupported handlers. |
| Critical | Banking and verification claims | The page presented a working-looking Open Banking connection, official verification statuses, HomiScore processing, institutional credentials, automated payouts, and fake trust outcomes without integrations. | Removed the bank control, score workflow, external portrait/passport, and verification assertions. Statuses now say `Not submitted`, and business requirements are clearly conditional. | Shorter truthful content removes large nested cards and keeps scanning consistent from phone to ultra-wide. | Static contract rejects Open Banking, HomiScore, institutional, external-image, and inline-script content. |
| High | Eligibility and role isolation | A landlord could open verification with no complete saved profile, and the route rendered through an anonymous header despite requiring authentication. | Added a controller guard that validates the saved landlord profile, redirects incomplete accounts to onboarding, and passes the current user. Retained landlord-only route middleware. | Server behavior is breakpoint-independent and mirrors the completion/onboarding guard pattern. | Controller test covers incomplete redirect and complete render; anonymous live GET returns to Login with `/landlord-verification` preserved. |
| High | Requirement clarity | Four dense cards mixed document types, actions, financial setup, fabricated progress, and benefit marketing without explaining what was actually required. | Organized the screen into four bounded requirement groups with accepted examples, conditional business guidance, and a separate preparation checklist. | Example lists stack on phones and use two/three columns from 640px; guidance follows content until becoming sticky at 1024px. | Four semantic sections and the safety note were inspected live; mobile and desktop screenshots are clean. |
| Medium | Progress and actions | The four-step horizontal bar scrolled on phones and treated HomiScore as a required stage. Back, save, and score links had inconsistent targets and destinations. | Adopted the three-step onboarding progress pattern and replaced actions with 48px Edit Profile and Continue to Setup Summary links plus a 44px verification-help link. | Actions stack on phones and share a row from 640px; no horizontal stepper scroll remains. | Eight-width matrix reports zero overflow/clipped descendants and 44px minimum actions. |

### Regression result

- Responsive matrix: 8 widths passed with no page overflow or clipped visible main content.
- Layout: single column through 768px; checklist split with sticky guidance from 1024px.
- Anonymous live GET redirects to Login with `/landlord-verification` preserved.
- Complete/incomplete saved-profile controller paths passed; no sensitive upload or bank mutation was performed.
- Browser console: 0 warnings, 0 errors.
- Production CSS build: passed.
- Node contract suite: 44 passed, 0 failed.

## Screen 17: Renter Verification (`/tenant-verification`)

### Scope exercised

- Authenticated header, progress state, security notice, identity/address/affordability/rental-history requirements, consent guidance, profile/summary/help journeys, footer, and protected-route behavior.
- Complete-profile eligibility, sensitive-data boundaries, unsupported upload/bank/reference removal, target sizing, sticky guidance, responsive stacking, and console state.
- Viewports: 320, 375, 480, 640, 768, 1024, 1440, and 2560 CSS pixels.

### Findings and resolutions

| Priority | Affected component | Exact problem and root cause | Implemented solution | Responsive behavior and reusable opportunity | Verification |
| --- | --- | --- | --- | --- | --- |
| Critical | Sensitive verification controls | Identity, address, payslip, bank, and rental-reference controls looked operational but had no endpoints, secure storage, consent record, provider, retention policy, or recovery flow. | Removed all inputs, uploads, and mutation buttons. Reframed the screen as a preparation checklist with a prominent warning not to send sensitive documents through Contact. | Information rows replace fake drop zones and fit cleanly at every width. Shares the explicit unavailable-capability pattern with landlord verification. | Live DOM contains zero inputs, selects, or buttons; contract rejects file, bank, and inline-handler controls. |
| Critical | Bank, score, and outcome claims | The screen claimed government-grade identity checks, secure bank API access, 12 months of payment/income verification, higher HomiScores, and lower deposits without integrations or evidence. | Removed provider/outcome claims and described affordability evidence only as something a final request may explain before submission. | Shorter bounded copy improves scanability and removes oversized marketing callouts. | Static contract rejects Open Banking, Connect Bank, HomiScore, lower-deposit, government-grade, and institutional language. |
| High | Reference consent | The page asked for a previous landlord/agency name and email without stating that the third party should consent or what would be requested. | Removed the unsupported reference form and added an explicit requirement to obtain referee permission before sharing personal contact details. | Consent guidance is a readable full-width note within the rental-history section. | Live content and source contract confirm referee permission guidance. |
| High | Eligibility and role isolation | A renter could open verification without a complete saved profile, and the authenticated route rendered the anonymous header. | Added a complete-profile controller guard, redirect to renter onboarding when incomplete, current-user header state, and retained renter-only middleware. | Server ownership is consistent across all breakpoints and mirrors landlord verification. | Controller test covers incomplete redirect and complete render; anonymous live GET preserves `/tenant-verification` through Login. |
| Medium | Progress, layout, and navigation | The old four-step bar included HomiScore, dense cards faded/shifted through page scripts, and Back/Save/Continue were inert buttons with inconsistent target sizes. | Adopted the three-step progress shell, one stable checklist hierarchy, no page-local scripts, and real Edit Profile, Setup Summary, and Help links. | Single column through 768px; sticky checklist split from 1024px; actions are 44-48px. | Eight-width matrix reports zero overflow/clipping; mobile screenshot and console are clean. |

### Regression result

- Responsive matrix: 8 widths passed with no page overflow or clipped visible main content.
- Layout: single column through 768px; checklist split with sticky guidance from 1024px.
- Anonymous live GET redirects to Login with `/tenant-verification` preserved.
- Complete/incomplete saved-profile controller paths passed; no sensitive upload, bank, or third-party-reference mutation was performed.
- Browser console: 0 warnings, 0 errors.
- Production CSS build: passed.
- Node contract suite: 46 passed, 0 failed.

## Screen 18: Landlord Dashboard (`/user/landlord/dashboard`)

### Scope exercised

- Authenticated dashboard header, landlord sidebar, record-status links, setup workflow, saved-profile summary, activity state, workspace links, and anonymous-route recovery.
- Drawer open/close semantics, focus transfer/restoration, route accuracy, factual data boundaries, heading/landmark structure, target sizing, responsive alignment, and console state.
- Viewports: 320, 375, 480, 640, 768, 1024, 1440, and 2560 CSS pixels.

### Findings and resolutions

| Priority | Affected component | Exact problem and root cause | Implemented solution | Responsive behavior and reusable opportunity | Verification |
| --- | --- | --- | --- | --- | --- |
| Critical | Dashboard data integrity | The screen was a static prototype containing a fictional landlord identity, external portrait, properties, applicants, revenue, occupancy, verification statuses, percentages, charts, and activity. The application has no property, applicant, payment, or document models that could support those records. | Rebuilt the dashboard as an honest operational empty state driven only by the authenticated user and saved landlord onboarding profile. Removed every invented metric, record, chart, image, and status. | Record workspaces are large native links that stack on phones and use three columns from 640px. The truthful empty-state pattern is reusable until each module has a persisted contract. | Source contract rejects the fictional identity, currency, percentages, external images, inline handlers, and page-local scripts. Live DOM has zero images, tables, or canvases. |
| High | Primary journeys | Add Property used an inline click handler, while many prototype controls looked interactive without dependable route ownership. | Connected the primary action, record cards, setup tasks, profile update, notifications, documents, messages, and support to existing native routes. Replaced the shared sidebar Add Property handler with a real link. | Main Add property is full-width on phones and a fixed, non-wrapping action from 640px. Sidebar navigation moves into the existing drawer below the desktop breakpoint. | DOM href inventory matches registered module routes. Anonymous live GET redirects to Login and preserves `/user/landlord/dashboard` as `returnTo`. |
| High | Mobile navigation accessibility | The desktop sidebar had to remain usable as a modal-style mobile drawer without obscuring content permanently or losing keyboard position. | Retained the shared labeled drawer contract with `aria-expanded`, `aria-hidden`, an explicit Close control, backdrop, and focus restoration. | Drawer is off-canvas on constrained widths and fixed at 240px from 1024px. Header controls remain 44px and do not overlap at any tested width. | Open moves focus to `Close navigation`; close sets the drawer hidden and restores focus to `Open navigation`. Mobile drawer screenshot is clean. |
| Medium | Tablet primary action | At exactly 640px, the header switched to a horizontal layout while the action was still allowed to shrink. `property` broke across multiple lines and increased the command from 48px to 72px. | Added `shrink-0` and `whitespace-nowrap` to the primary action. | Action is 48px at all eight widths, full-width below 640px, and 184px from 640px upward. | Final width matrix confirms stable height, no wrapping, no overflow, and zero clipped main descendants. |
| Medium | Information hierarchy | The prototype emphasized fabricated KPIs and dense charts before useful account setup actions. It also mixed dashboard identity with unrelated marketing and verification theater. | Organized the page into Record status, a three-step Get started workflow, saved profile summary, recent activity empty state, and secondary workspace links. | Content is one-column first, uses a three-card record row from 640px, and splits workflow/profile content on desktop while capping the inner surface at 1280px. | Mobile and 1440px visual captures are clean; one `main`, one `h1`, zero header-control overlaps, and zero clipped descendants pass. |

### Regression result

- Responsive matrix: 8 widths passed with no page overflow or clipped visible main content.
- Record cards: one column through 480px; three columns from 640px.
- Navigation: mobile drawer focus and visibility contract passed; fixed 240px desktop sidebar aligns with the header and main content.
- Anonymous live GET redirects to Login with `/user/landlord/dashboard` preserved.
- Browser console: 0 warnings, 0 errors.
- Production CSS build: passed; only the pre-existing non-blocking Browserslist data-age notice remains.
- Node contract suite: 47 passed, 0 failed.

## Screen 19: Landlord HomiScore (`/user/landlord/homiscore`)

### Scope exercised

- Authenticated dashboard header, landlord sidebar, score status, source coverage, handling safeguards, history state, saved-profile context, data boundaries, and protected-route recovery.
- Current-page semantics, drawer focus, factual-data boundaries, heading/landmark structure, action sizing, responsive stacking, and console state.
- Viewports: 320, 375, 480, 640, 768, 1024, 1440, and 2560 CSS pixels.

### Findings and resolutions

| Priority | Affected component | Exact problem and root cause | Implemented solution | Responsive behavior and reusable opportunity | Verification |
| --- | --- | --- | --- | --- | --- |
| Critical | Score and financial data | The 932-line prototype displayed a score, top-5% status, portfolio value, rental income, occupancy, collection rate, tenant averages, trend history, and verification outcome. No score field, scoring service, verification record, property model, tenancy model, or payment model exists. | Replaced the report with an explicit `Score not available` state. The page shows only saved onboarding context and states that it will not estimate a score from self-reported answers. | Status becomes a horizontal band on large screens and remains a readable stack on constrained widths. Reuse this unavailable-data pattern for analytics that lack persisted inputs. | Contract rejects the fictional identity, rankings, percentages, financial values, score/history values, and external media. Live DOM has no images, tables, canvases, or inline scripts. |
| Critical | Sensitive metric and sharing theater | Hidden commercial values could be revealed through a custom modal, and fake download/share actions implied a report and secure link service. The modal also lacked a complete dialog/focus contract. | Removed all reveal controls, modal code, download action, report version, and share link. Added a factual no-history state explaining that no report or share link exists without a score. | Removing the fixed modal eliminates mobile containment and keyboard-trap risk at every breakpoint. | Live DOM contains no modal, buttons, sensitive-value attributes, inline scripts, or report/share commands. |
| High | Source transparency | The old screen did not distinguish saved onboarding estimates from verified operational evidence and described self-reported values as institutional performance. | Added Source coverage for profile details, verification evidence, and operational records with explicit `Available`, `Not submitted`, and `Not connected` states. Saved values are labelled self-reported, not verified inputs. | Coverage cards stack through 480px and use three columns from 640px. Profile context moves into the desktop aside from 1280px. | All state labels and actual profile fixture values were inspected live; no card clips or forces page overflow. |
| High | Fair-use and explanation | The prototype treated the score as proof of quality and trust without a method, effective date, correction route, or decision limitation. | Added safeguards requiring verified source data, factor-level explanation, dates/correction, and accountable human review. HomiScore is explicitly supporting context, not an outcome guarantee. | A numbered list keeps the safeguards scannable without visualization dependencies. | Source and live copy checks confirm the bounded language and absence of guarantee/ranking claims. |
| High | Sidebar current-page semantics | Active navigation was communicated only through color, while icon ligature text leaked into assistive link names. | Added conditional `aria-current="page"` to landlord primary routes and `aria-hidden="true"` to decorative sidebar icons. | Shared semantics apply to fixed desktop navigation and the mobile drawer without visual change. | HomiScore resolves as an exact accessible link name and current page; the dashboard current state was rechecked after the shared edit. |
| Medium | Fixed layout and action targets | Rigid score/gauge geometry and a fixed shell clipped constrained layouts; several report/share controls were below the target-size gate. | Reused the repaired dashboard shell, container-capped layout, responsive grids, native links, and 44–48px action contract. | One column at small sizes, three coverage columns from 640px, and an 8/4 content split at 1280px. | Eight-width matrix has zero page overflow, zero clipped main descendants, zero header overlaps, and 44px header controls. |

### Regression result

- Responsive matrix: 8 widths passed with no page overflow or clipped visible main content.
- Source coverage: one column through 480px; three columns from 640px; content/aside split from 1280px.
- Mobile drawer sets and clears the visibility state, moves focus to Close, restores focus to Open, and exposes HomiScore as the current page.
- Anonymous live GET redirects to Login with `/user/landlord/homiscore` preserved.
- Browser console: 0 warnings, 0 errors.
- Production CSS build: passed; only the pre-existing non-blocking Browserslist data-age notice remains.
- Node contract suite: 48 passed, 0 failed.

## Screen 20: Landlord Properties (`/user/landlord/properties`)

### Scope exercised

- Authenticated dashboard header, current landlord navigation, property status, empty record list, guided setup entry, setup-stage summary, saved portfolio context, boundaries, help links, and protected-route recovery.
- Drawer focus/current-page semantics, data truthfulness, empty-state hierarchy, action sizing, responsive stacking, and console state.
- Viewports: 320, 375, 480, 640, 768, 1024, 1440, and 2560 CSS pixels.

### Findings and resolutions

| Priority | Affected component | Exact problem and root cause | Implemented solution | Responsive behavior and reusable opportunity | Verification |
| --- | --- | --- | --- | --- | --- |
| Critical | Property records and portfolio metrics | The prototype displayed four invented listings, external property images, rent values, portfolio valuation, occupancy, monthly revenue, growth, and verification. The codebase has no Property model or property persistence controller. | Replaced the fake portfolio with an explicit zero-record state and removed all listing rows, values, images, map, progress metrics, and verification statuses. Onboarding count is shown only as a self-reported estimate, never as a saved-listing count. | The empty workspace is readable without a table on phones and uses the desktop app shell without fixed-width data surfaces. Reuse the persisted-record boundary on other unimplemented modules. | Static contract rejects identities, institutional claims, financial/occupancy copy, external media, export, inline scripts, and handlers. Live DOM has no images, tables, forms, main buttons, or inline scripts. |
| Critical | Add-property capability boundary | Five add-property pages exist only as GET-rendered templates; there is no model, POST route, draft store, publication service, or renter-listing feed. The original index implied that listings could be created and managed. | Kept a native entry to the existing guided setup but explicitly states that setup entries are not saved, published, or retained as operational records. Added a five-stage overview so the destination is predictable. | The main action is 48px, full-width on phones, fixed and non-wrapping from 640px. Setup stages remain a simple vertical sequence at all widths. | Both setup links resolve to the registered `/user/landlord/properties/add/address` route; no fake save/publish command remains on the index. |
| High | Search, filters, exports, and bulk UI | Search, occupancy tabs, action-required filters, tuning, and export controls appeared functional against hard-coded rows. They had no data/filter/export implementation. | Removed premature controls and explains that search, filters, bulk actions, and exports become useful only after records can be stored. | Empty state avoids horizontal filter bars and dense table overflow at every constrained width. | Live DOM has zero form controls and zero main buttons; all remaining commands are native links. |
| High | Navigation and shell | The old header nested inside main, duplicated the sidebar offset, clipped on phones, and repeated a fake landlord profile. | Reused the repaired authenticated dashboard header and shell with actual user/profile context and the shared current-page sidebar semantics. | Drawer below 1024px; 240px fixed rail from 1024px; profile controls remain 44px without overlap. | Mobile drawer focus/restore and exact Properties link name pass. Eight-width matrix has zero header overlaps. |
| Medium | Information hierarchy | The prototype led with KPI cards and a visual map before the primary record task, even though no records exist. | Leads with record status, a clear empty property list, the setup path, then self-reported context and capability boundaries. | Main/aside content stacks through 1024px and uses an 8/4 split from 1280px. | Mobile and 1440px captures are clean; no clipped visible main descendants occur. |

### Regression result

- Responsive matrix: 8 widths passed with no page overflow or clipped visible main content.
- Main/aside layout: stacked through 1024px; 8/4 split from 1280px.
- Primary setup action remains 48px and non-wrapping at every tested width.
- Mobile drawer current-page, focus transfer, hidden state, and focus restoration pass.
- Anonymous live GET redirects to Login with `/user/landlord/properties` preserved.
- Browser console: 0 warnings, 0 errors.
- Production CSS build: passed; only the pre-existing non-blocking Browserslist data-age notice remains.
- Node contract suite: 49 passed, 0 failed.

## Screen 21: Landlord Applicants (`/user/landlord/applicants`)

### Scope exercised

- Authenticated dashboard header, current landlord navigation, application status, empty applicant list, property prerequisites, application foundations, fair-review guidance, unavailable actions, support links, and protected-route recovery.
- Drawer focus/current-page semantics, high-risk data boundaries, heading hierarchy, action sizing, responsive stacking, and console state.
- Viewports: 320, 375, 480, 640, 768, 1024, 1440, and 2560 CSS pixels.

### Findings and resolutions

| Priority | Affected component | Exact problem and root cause | Implemented solution | Responsive behavior and reusable opportunity | Verification |
| --- | --- | --- | --- | --- | --- |
| Critical | Applicant identities and records | The prototype displayed fictional renters, portraits, scores, verification states, application counts, and pipeline statuses. No Application model, renter-submission controller, or property relationship exists. | Replaced all rows and metrics with an explicit zero-record application state. No applicant identity, score, affordability, status, or trend is inferred. | A purpose-built empty state replaces the dense comparison table and fits without horizontal scrolling at every width. Reuse this record-availability gate on other person-data modules. | Static contract rejects fictional names, averages, statuses, remote media, tables, buttons, inline handlers, and page scripts. Live DOM has zero images, tables, forms, and main buttons. |
| Critical | Decision actions | Shortlist, decline, compare, review, filter, and export controls appeared available without storage, audit history, reasons, notification delivery, or correction flow. | Removed mutation and export controls. Added explicit unavailable states and a foundations list requiring saved listings, consent-based submission, and accountable review before actions are enabled. | The foundations remain a single readable sequence; no mobile bulk toolbar or action-menu overflow exists. | Live screen contains no decision control. Contract confirms no buttons or inline navigation handlers remain. |
| High | Fairness, consent, and score use | The prototype encouraged selection based on verified HomiScore and renter-readiness summaries without explaining consent, protected characteristics, relevance, or human accountability. | Added fair-review guidance: relevant consented data only, HomiScore never as the sole factor, no protected-characteristic inference/ranking, and explainable status communication. | Guidance follows main content on smaller widths and becomes a desktop aside from 1280px. | Copy is present in source and live DOM; desktop visual shows it alongside the empty list without crowding. |
| High | Property/application dependency | The page showed applications even though property listings cannot be persisted or published. | Makes a saved listing and submission service explicit prerequisites and routes users to the honest Properties workspace or setup overview. | Primary Properties action is 48px, full-width on phones, fixed from 640px. | Both property journeys use registered native routes and preserve link semantics. |
| Medium | Shell and navigation | A fixed 280px page offset, fake account header, desktop search, and narrow action surfaces caused severe constrained-width failure. | Reused the repaired dashboard shell and shared current-page sidebar, removed unsupported search/filter controls, and retained 44px header actions. | Drawer below 1024px; fixed 240px rail from 1024px; main/aside split from 1280px. | Drawer focus/restore and current Applicants link pass. Eight-width matrix has zero overflow, clipping, or header overlap. |

### Regression result

- Responsive matrix: 8 widths passed with no page overflow or clipped visible main content.
- Main/aside layout: stacked through 1024px; 8/4 split from 1280px.
- Primary action remains 48px across all tested widths; header targets remain 44px.
- Mobile drawer current-page, focus transfer, hidden state, and focus restoration pass.
- Anonymous live GET redirects to Login with `/user/landlord/applicants` preserved.
- Browser console: 0 warnings, 0 errors.
- Production CSS build: passed; only the pre-existing non-blocking Browserslist data-age notice remains.
- Node contract suite: 50 passed, 0 failed.

## Screen 22: Landlord Documents (`/user/landlord/documents`)

### Scope exercised

- Authenticated dashboard header, current landlord navigation, storage warning, document-record empty state, storage-control requirements, offline preparation guidance, unavailable actions, verification/property/support links, and protected-route recovery.
- Drawer focus/current-page semantics, sensitive-data boundaries, warning hierarchy, action sizing, responsive grids, and console state.
- Viewports: 320, 375, 480, 640, 768, 1024, 1440, and 2560 CSS pixels.

### Findings and resolutions

| Priority | Affected component | Exact problem and root cause | Implemented solution | Responsive behavior and reusable opportunity | Verification |
| --- | --- | --- | --- | --- | --- |
| Critical | Private document storage | The prototype showed 18 stored documents, property assignments, categories, expiry dates, compliance status, and downloads. No Document model, private object store, tenant-scoped access policy, or download endpoint exists. | Replaced the document table and metrics with an explicit zero-document state and read-only workspace. Search, categories, expiry tracking, and downloads are described as dependent on persisted private records. | Removing the 820px table eliminates constrained-width scrolling and leaves a clear empty state at every size. Reuse this security-bound empty state wherever sensitive records lack backend ownership. | Static contract rejects invented counts/statuses, external media, inputs, selects, tables, buttons, file controls, handlers, and page scripts. Live DOM confirms all are absent. |
| Critical | Upload and sharing controls | Upload, share, access management, and permission controls appeared functional without secure upload, file scanning, retention/deletion, consent, revocation, or audit services. | Removed all upload and sharing controls. Added a prominent warning not to upload or send identity, ownership, tenancy, banking, or compliance documents through Contact or Messages. | Warning stacks safely on phones and becomes a horizontal status band where space permits. | Mobile and desktop screenshots keep the warning visible; action summary marks Upload, Download, Share/revoke, and Expiry reminders unavailable. |
| High | Unsupported security assurance | Copy claimed documents were stored securely and shared only by permission despite the absence of storage and authorization infrastructure. | Replaced assurance language with concrete prerequisites: tenant-scoped private storage, encryption, least privilege, validation/malware checks, retention/deletion, and consent-based sharing controls. | Four control cards use one column through 480px and two columns from 640px. | Responsive matrix confirms the intended 4-to-2 row transition with no clipping. |
| High | Offline preparation safety | The old upload form encouraged sensitive file selection immediately. | Provides a bounded offline preparation list and tells users to keep files in storage they control until an approved HomiFund process exists. | Guidance follows records on constrained screens and becomes a desktop aside from 1280px. | Live copy and warning inspected at 320px and 1440px; no transmission control remains. |
| Medium | Shell and navigation | A fixed 280px page offset, fake account header, inert icon buttons, desktop search, and dense tabs failed on constrained widths. | Reused the repaired dashboard shell and shared current-page navigation; removed unsupported search/tabs and retained native 44–48px links. | Drawer below 1024px; fixed 240px rail from 1024px; main/aside split from 1280px. | Drawer focus/restore and current Documents link pass. Eight widths show zero overflow, clipping, or header overlap. |

### Regression result

- Responsive matrix: 8 widths passed with no page overflow or clipped visible main content.
- Storage-control grid: one column through 480px; two columns from 640px.
- Main/aside layout: stacked through 1024px; 8/4 split from 1280px.
- Mobile drawer current-page, focus transfer, hidden state, and focus restoration pass.
- Anonymous live GET redirects to Login with `/user/landlord/documents` preserved.
- Browser console: 0 warnings, 0 errors.
- Production CSS build: passed; only the pre-existing non-blocking Browserslist data-age notice remains.
- Node contract suite: 51 passed, 0 failed.

## Screen 23: Landlord Payments (`/user/landlord/payments`)

### Scope exercised

- Authenticated dashboard header, current landlord navigation, payment-service warning, empty financial record state, required provider/ledger controls, financial-safety guidance, unavailable actions, property/support links, and protected-route recovery.
- Drawer focus/current-page semantics, financial-data boundaries, warning hierarchy, action sizing, responsive grids, and console state.
- Viewports: 320, 375, 480, 640, 768, 1024, 1440, and 2560 CSS pixels.

### Findings and resolutions

| Priority | Affected component | Exact problem and root cause | Implemented solution | Responsive behavior and reusable opportunity | Verification |
| --- | --- | --- | --- | --- | --- |
| Critical | Payment and tenancy records | The prototype displayed named tenants, properties, expected/received totals, rent/deposit amounts, due dates, receipts, overdue states, and payment methods. No Payment, Tenancy, Ledger, or Deposit model exists. | Replaced the transaction table and metrics with an explicit zero-payment state. No expected, received, overdue, payout, refund, or deposit amount is inferred. | Removing the 900px transaction table eliminates constrained-width scrolling. Reuse this financial record gate until authoritative ledgers exist. | Static contract rejects fictional people/properties, totals, statuses, methods, currency values, forms, tables, buttons, handlers, and page scripts. Live DOM confirms no transaction controls remain. |
| Critical | Provider and payout theater | Payment methods, payout settings, a bank account, direct debit, receipts, and reminders appeared operational without a provider, signed webhooks, idempotency, settlement reconciliation, or step-up confirmation. | Removed all financial mutation controls. Added a prominent warning not to send bank/card/payment/deposit details through Contact or Messages and marks every payment action unavailable. | Warning stacks safely on phones and becomes a horizontal status band where space permits. | Mobile/desktop visuals keep the warning prominent; zero payment records is explicit. |
| High | Financial lifecycle and integrity | The old UI collapsed scheduled, received, overdue, bank transfer, payout, deposit, and reminder states into hard-coded labels without authoritative event ownership. | Added required controls for tenancy obligations, signed provider events, idempotent reconciliation, regulated payout flows, receipts, refunds, corrections, disputes, and audit history. | Four requirement cards use one column through 480px and two columns from 640px. | Responsive matrix confirms 4-to-2 row transition with zero clipping. |
| High | Financial safety | Raw card/account collection boundaries, payout-account change confirmation, status distinction, and separation from notifications were absent. | Added a financial-safety checklist and directs account/payment support through a non-transactional support page only. | Guidance follows records on constrained screens and becomes an aside from 1280px. | All guidance inspected live at mobile and desktop; no input or money-movement action exists. |
| Medium | Shell and navigation | A fixed 280px offset, fake account header, inert icon buttons, search, and dense payment tabs failed on constrained widths. | Reused the repaired dashboard shell and current-page sidebar; removed unsupported search/tabs and retained native 44–48px links. | Drawer below 1024px; fixed 240px rail from 1024px; main/aside split from 1280px. | Drawer focus/restore and current Payments link pass. Eight widths show zero overflow, clipping, or header overlap. |

### Regression result

- Responsive matrix: 8 widths passed with no page overflow or clipped visible main content.
- Payment-control grid: one column through 480px; two columns from 640px.
- Main/aside layout: stacked through 1024px; 8/4 split from 1280px.
- Mobile drawer current-page, focus transfer, hidden state, and focus restoration pass.
- Anonymous live GET redirects to Login with `/user/landlord/payments` preserved.
- Browser console: 0 warnings, 0 errors.
- Production CSS build: passed; only the pre-existing non-blocking Browserslist data-age notice remains.
- Node contract suite: 52 passed, 0 failed.

## Screen 24: Landlord Messages (`/user/landlord/messages`)

### Scope exercised

- Authenticated dashboard header, shared landlord navigation, messaging status, empty conversation list, service requirements, communication-safety guidance, unavailable actions, applicant/property/support links, and protected-route recovery.
- Header and drawer current-page semantics, focus transfer/restoration, sensitive-data boundaries, action sizing, responsive grids, and console state.
- Viewports: 320, 375, 480, 640, 768, 1024, 1440, and 2560 CSS pixels.

### Findings and resolutions

| Priority | Affected component | Exact problem and root cause | Implemented solution | Responsive behavior and reusable opportunity | Verification |
| --- | --- | --- | --- | --- | --- |
| Critical | Conversations and participant data | The 1,493-line prototype contained fictional applicant/agent conversations, names, unread states, timestamps, properties, scores, and financial data. No Message or Conversation model, participant membership, or delivery service exists. | Replaced the inbox, previews, threads, and dashboards with an explicit zero-conversation state. No renter, applicant, agent, property, delivery, or read-status record is inferred. | Removing the fixed overlay and 380px dropdown eliminates constrained-width and nested-dialog failures. Reuse the communication availability gate for renter messaging. | Static contract rejects fictional people, sample content, scores, currency, inputs, textareas, buttons, conversation attributes, handlers, and page scripts. Live DOM has no forms or message controls. |
| Critical | Client-only sending | The composer appended messages to an in-memory JavaScript object, creating false success with no persistence, authorization, ordering, delivery, retry, or error state. | Removed the send box and all message JavaScript. Added required controls for authorized participants, server timestamps, idempotent delivery, ordering, retry/failure recovery, moderation, and retention. | Four control cards use one column through 480px and two columns from 640px. | Live source contains only the shared application script; responsive matrix confirms 4-to-2 rows with no clipping. |
| High | Sensitive information and attachments | The fake conversation flow invited application-document discussion without secure attachment storage, consent, access revocation, or abuse reporting. | Warns users not to send identity documents, banking details, passwords, or other sensitive information through Contact. Adds attachment scanning, access, retention, deletion, report/block, and moderation prerequisites. | Safety guidance stacks after content on constrained screens and becomes an aside from 1280px. | Mobile and desktop visuals keep the warning and action boundary readable. |
| High | Navigation context | Messages existed only as a header icon; the mobile drawer had no current destination when this route was active. | Added Messages to the shared landlord navigation with conditional `aria-current="page"`, decorative icon hiding, and a current header action. | The new item fits the desktop rail and appears in the mobile drawer without resizing the shell. | Drawer exposes exactly one Messages link and marks it current; focus open/close/restore passes. |
| Medium | Dashboard duplication | The route duplicated the fictional dashboard, HomiScore, applicant pipeline, and revenue surfaces before opening an overlay, weakening task focus. | Rebuilt it as a dedicated communication workspace with one status, one empty list, service foundations, and safety/actions guidance. | Main/aside stacks through 1024px and uses an 8/4 split from 1280px. | Eight widths show zero overflow, clipping, or header overlap; 44px header targets and 48px primary action pass. |

### Regression result

- Responsive matrix: 8 widths passed with no page overflow or clipped visible main content.
- Messaging-control grid: one column through 480px; two columns from 640px.
- Main/aside layout: stacked through 1024px; 8/4 split from 1280px.
- Header and mobile drawer both expose Messages as current; drawer focus and hidden-state contracts pass.
- Anonymous live GET redirects to Login with `/user/landlord/messages` preserved.
- Browser console: 0 warnings, 0 errors.
- Production CSS build: passed; only the pre-existing non-blocking Browserslist data-age notice remains.
- Node contract suite: 53 passed, 0 failed.

## Screen 25: Landlord Notifications (`/user/landlord/notification-bell`)

### Scope exercised

- Authenticated dashboard header, landlord navigation, notification service status, empty inbox, event/delivery requirements, notification-quality guidance, unavailable actions, settings/dashboard/support links, and protected-route recovery.
- Header current-page semantics, drawer focus, false-urgency removal, action sizing, responsive grids, and console state.
- Viewports: 320, 375, 480, 640, 768, 1024, 1440, and 2560 CSS pixels.

### Findings and resolutions

| Priority | Affected component | Exact problem and root cause | Implemented solution | Responsive behavior and reusable opportunity | Verification |
| --- | --- | --- | --- | --- | --- |
| Critical | Notification events and inbox state | The prototype displayed fictional application, viewing, document, score, revenue, and applicant events with unread state. No Notification model, source events, recipient inbox, read state, or delivery channel exists. | Replaced the dropdown and duplicated dashboard with an explicit zero-notification inbox. No sample event, unread badge, or account update is inferred. | Removing the fixed 360px dropdown eliminates narrow-screen clipping and nested dialog behavior. Reuse this event-availability gate for renter notifications. | Static contract rejects fictional people/events, dashboard content, unread controls, inputs, buttons, dropdown IDs, handlers, and page scripts. Live DOM has no notification controls or fake dot. |
| Critical | Mark-read and linked actions | Mark all read and destination links appeared operational without persisted notification IDs, read/archive state, authorization, or durable source records. | Marks read/archive/filter/email actions unavailable. Requires authoritative event references, persisted created/delivered/read/archived/failed state, idempotency, and re-authorization at linked destinations. | Action state is a compact definition list rather than a mobile bulk toolbar. | No mutation control exists in live DOM; linked navigation is limited to Settings, Dashboard, and Support. |
| High | Preferences and channel ownership | The old UI implied recent HomiFund updates without category preferences, mandatory service rules, verified destinations, or delivery status. | Added requirements for category-level in-app/email preferences, channel ownership, verified destinations, and separation between source records and delivery. | Four requirement cards use one column through 480px and two columns from 640px. | Matrix confirms the 4-to-2 row transition without clipping. |
| High | False urgency and sensitive previews | An unread dot, “new” events, and applicant/document details created urgency and exposed potentially sensitive context without real state. | Explicitly prohibits unread dots without persisted records, requires clear language without false urgency, and excludes sensitive personal/financial details from previews. | Guidance remains readable in the stacked mobile flow and moves into the desktop aside from 1280px. | Mobile and desktop visuals confirm no alert dot or sensitive preview is present. |
| Medium | Shell and current state | The old route duplicated the dashboard shell and opened the notification dropdown by default. | Reused the repaired shell and marks the header Notifications link with `aria-current="page"`; drawer open/close focus behavior remains consistent. | Header icon targets remain 44px with no overlap; main/aside uses an 8/4 desktop split. | Eight widths show zero overflow/clipping; drawer focus and header-current checks pass. |

### Regression result

- Responsive matrix: 8 widths passed with no page overflow or clipped visible main content.
- Notification-control grid: one column through 480px; two columns from 640px.
- Main/aside layout: stacked through 1024px; 8/4 split from 1280px.
- Header marks Notifications current; mobile drawer focus and hidden-state contracts pass.
- Anonymous live GET redirects to Login with `/user/landlord/notification-bell` preserved.
- Browser console: 0 warnings, 0 errors.
- Production CSS build: passed; only the pre-existing non-blocking Browserslist data-age notice remains.
- Node contract suite: 54 passed, 0 failed.

## Screen 26: Landlord Settings (`/user/landlord/settings`)

### Scope exercised

- Authenticated dashboard header, landlord navigation, settings capability summary, real account email/role, password recovery, profile/onboarding journeys, preference availability, privacy-request guidance, account boundaries, sign out, and protected-route recovery.
- Header current-page semantics, drawer focus, false-persistence removal, long-email wrapping, action sizing, responsive cards, and console state.
- Viewports: 320, 375, 480, 640, 768, 1024, 1440, and 2560 CSS pixels.

### Findings and resolutions

| Priority | Affected component | Exact problem and root cause | Implemented solution | Responsive behavior and reusable opportunity | Verification |
| --- | --- | --- | --- | --- | --- |
| Critical | Preferences and save actions | Dozens of listing, application, document, HomiScore, payment, product, in-app, and email controls appeared editable. No settings schema, validation, or POST route exists, so every change disappeared. | Removed all selects, toggles, and save buttons. Preference categories now explicitly say unavailable until the server can store and enforce values. | Definition rows stack safely and avoid dense toggle grids on phones. Reuse this server-ownership rule on renter and admin settings. | Static contract rejects all original save labels, control classes, inputs, selects, buttons, handlers, and page scripts. Live DOM has zero forms or controls. |
| Critical | Account lifecycle theater | Change password/email, data export, account deletion, and request-information buttons had no verified workflow, re-authentication, confirmation, task orchestration, or lifecycle cleanup. | Keeps only the real email-based password recovery route. Email/role changes are unavailable; privacy requests point to Contact with a warning not to send identity documents initially; deletion/export are clearly not automated. | Account rows become one-column on phones and align label/action from 640px. | Live authenticated fixture renders the actual account email; registered Reset Password, Contact, and Sign Out links are present. |
| High | Profile settings ownership | Profile and portfolio settings were mixed into unsaved page controls even though onboarding already persists landlord context. | Routes account profile and onboarding details to their existing dedicated journeys, preserving single ownership. | Two profile cards stack through 480px and use two columns from 640px. | Matrix confirms 2-to-1 row transition with zero clipping. |
| High | Destructive action safety | Delete/deactivate controls lacked consequence details, identity confirmation, recovery, and deletion-status feedback. | Removes destructive commands and explains that deletion requires confirmation, re-authentication, and lifecycle cleanup before it can be exposed. | The boundary appears in the guidance aside without a sticky destructive footer. | Source/live checks confirm no delete or deactivate control remains. |
| Medium | Shell and account context | A fixed 280px offset, fake landlord, desktop search, and inert header buttons obscured real account context. | Reused the repaired shell, passes the authenticated user, renders their email, and marks Settings current in the header. | Drawer below 1024px; fixed 240px rail from 1024px; main/aside split from 1280px. | Eight widths show zero overflow/clipping/header overlap; drawer and protected-route checks pass. |

### Regression result

- Responsive matrix: 8 widths passed with no page overflow or clipped visible main content.
- Profile cards: one column through 480px; two columns from 640px.
- Main/aside layout: stacked through 1024px; 8/4 split from 1280px.
- Authenticated email renders and wraps safely; no form controls or unsaved mutations remain.
- Header marks Settings current; mobile drawer focus and hidden-state contracts pass.
- Anonymous live GET redirects to Login with `/user/landlord/settings` preserved.
- Browser console: 0 warnings, 0 errors.
- Production CSS build: passed; only the pre-existing non-blocking Browserslist data-age notice remains.
- Node contract suite: 55 passed, 0 failed.

## Screen 27: Landlord Support (`/user/landlord/support`)

### Scope exercised

- Authenticated dashboard shell, current Support navigation, capability status, topic navigation, native answer disclosures, contact guidance, sensitive-data warning, urgent-help boundary, and protected-route recovery.
- Drawer focus/current-page semantics, truthful support availability, target sizing, responsive topic cards, desktop guidance placement, and console state.
- Viewports: 320, 375, 480, 640, 768, 1024, 1440, and 2560 CSS pixels.

### Findings and resolutions

| Priority | Affected component | Exact problem and root cause | Implemented solution | Responsive behavior and reusable opportunity | Verification |
| --- | --- | --- | --- | --- | --- |
| Critical | Support request controls | Search, submit-request, view-all, and recent-request controls appeared operational without a SupportRequest model, ticket endpoint, search index, status history, or private support inbox. | Removed inert controls and fake request history. The screen now states that ticket tracking, live chat, and response-time tracking are not connected. | A concise capability band and native help links replace the unsupported toolbar and request widgets at every width. Reuse this service-availability pattern for renter support. | Static contract rejects the prototype controls, fake identity, forms, inputs, buttons, handlers, and inline scripts. Live DOM has zero forms and inputs. |
| Critical | Contact delivery expectations | The prototype promised a support request workflow even though Contact depends on SMTP configuration and can return a recoverable delivery error. | Routes users to the real Contact form and explains that validation is available while delivery depends on configured email service. No response time or acceptance promise is made. | The Contact action remains 48px and full-width in its guidance panel. | Contact route is registered; the live Support page exposes the native `/contact#contact-form` link and transparent delivery copy. |
| High | Help accuracy | Popular guides described saving, publishing, score use, and document updates as available even though those services are not implemented. | Replaced them with links to the authoritative workspaces and answers that describe current saved-record, scoring, storage, and ticket boundaries. | Six topic cards use one column through 480px and two columns from 640px. Native disclosures wrap without truncation. | All topic destinations are registered routes; three disclosures open correctly and preserve readable targets. |
| High | Privacy and urgent-help boundaries | The old page did not clearly prevent sensitive support submissions or distinguish platform support from emergency help. | Added a prominent warning against sending credentials, identity files, financial data, tokens, or full applications, plus an explicit emergency-service boundary. | Safety content remains in the normal document flow and moves into the desktop guidance column from 1280px. | Mobile and desktop visuals keep both boundaries visible with no clipping. |
| Medium | Shell and navigation | The route omitted authenticated account context and current-page state; the shared Support item never announced the active destination. | Passes `currentUser` and `currentPage`, reuses the repaired dashboard shell, and gives Support conditional styling and `aria-current="page"`. | Drawer below 1024px; fixed 240px rail from 1024px; main/guidance split from 1280px. | Drawer open/close focus, hidden state, current Support link, and header targets pass. |

### Regression result

- Responsive matrix: 8 widths passed with no page overflow, clipped visible main content, or header overlap.
- Help topics: one column through 480px; two columns from 640px.
- Main/guidance layout: stacked through 1024px; 8/4 split from 1280px.
- Contact action remains 48px; header targets remain at least 44px.
- Native answer disclosure opens and exposes the current property-publishing boundary.
- Mobile drawer marks Support current, transfers focus to Close, hides on close, and restores focus to Open.
- Anonymous live GET redirects to Login with `/user/landlord/support` preserved.
- Browser console: 0 warnings, 0 errors.
- Production CSS build: passed; only the pre-existing non-blocking Browserslist data-age notice remains.
- Node contract suite: 56 passed, 0 failed.

## Screen 28: Landlord Profile (`/user/landlord/user-profile`)

### Scope exercised

- Authenticated dashboard shell, current profile action, account identity, persisted landlord onboarding fields, profile journeys, privacy boundaries, support path, and protected-route recovery.
- Real-value rendering, long text wrapping, drawer focus, current-page semantics, responsive detail cards, desktop guidance placement, and console state.
- Viewports: 320, 375, 480, 640, 768, 1024, 1440, and 2560 CSS pixels.

### Findings and resolutions

| Priority | Affected component | Exact problem and root cause | Implemented solution | Responsive behavior and reusable opportunity | Verification |
| --- | --- | --- | --- | --- | --- |
| Critical | Profile editing | Full name, email, phone, contact method, and save/cancel controls appeared editable without a profile POST route, validation, or account update service. | Removed unsaved controls. Account name and email now render from the authenticated user; landlord fields render from the persisted onboarding subdocument. | Read-only definition rows stack on phones and align label/value from 640px. Reuse this server-owned field pattern for renter profile. | Static contract rejects inputs, selects, buttons, save controls, and handlers. Live fixture renders `Audit Landlord` and `audit@example.com`. |
| Critical | Photo upload | File selection and removal created a client-only preview with no storage, validation service, access policy, deletion, or persistence. | Removed the upload and page script and explicitly marks profile-photo storage unavailable. | No image control or preview can resize the header or content on constrained widths. | Live DOM has zero forms and inputs; source has no file control or inline script. |
| High | Persisted profile ownership | The screen duplicated onboarding fields but did not load or save the existing landlord profile, creating conflicting ownership. | Passes `currentUser` and `landlordProfile` from the protected route, renders all supported saved fields, and sends updates to `/onboarding-landlord`. | Eight field cards use one column through 480px and two columns from 640px. | Audit fixture renders account type `Individual`, portfolio estimate `3`, and primary location without fictional data. |
| High | Publishing and sharing claims | The prototype implied profile photo/listing sharing and a published landlord identity without a publication or consent service. | Labels the page a private account view and states that it is not a published profile; sharing and contact preferences are not inferred. | Boundaries stay in normal flow and move into the desktop guidance column from 1280px. | Mobile and desktop visuals keep the private-view status and boundaries readable. |
| Medium | Shell and navigation | A fixed 280px offset, fake landlord identity, inert search/header buttons, and client navigation failed responsively. | Reuses the repaired shell, real account context, native links, and marks the profile header action current. | Drawer below 1024px; fixed 240px rail from 1024px; main/guidance split from 1280px. | Eight widths have zero overflow/clipping/header overlap; drawer focus and profile-current state pass. |

### Regression result

- Responsive matrix: 8 widths passed with no page overflow, clipped visible main content, or header overlap.
- Saved detail cards: one column through 480px; two columns from 640px.
- Main/guidance layout: stacked through 1024px; 8/4 split from 1280px.
- Account and onboarding values render from the audit fixture; no editing or file controls remain.
- Profile actions remain at least 44px; header targets remain at least 44px.
- Header profile action is current; mobile drawer focus and hidden-state contracts pass.
- Anonymous live GET redirects to Login with `/user/landlord/user-profile` preserved.
- Browser console: 0 warnings, 0 errors.
- Production CSS build: passed; only the pre-existing non-blocking Browserslist data-age notice remains.
- Node contract suite: 57 passed, 0 failed.

## Screen 29: Applicant Profile Detail (`/user/landlord/view-profile`)

### Scope exercised

- Protected landlord shell, current Applicants navigation, applicant-record status, empty detail state, application prerequisites, action availability, fair-review rules, sensitive-data warning, and protected-route recovery.
- Drawer focus/current-page semantics, person-data boundaries, responsive foundation cards, desktop guidance placement, and console state.
- Viewports: 320, 375, 480, 640, 768, 1024, 1440, and 2560 CSS pixels.

### Findings and resolutions

| Priority | Affected component | Exact problem and root cause | Implemented solution | Responsive behavior and reusable opportunity | Verification |
| --- | --- | --- | --- | --- | --- |
| Critical | Applicant identity and application data | The static route displayed a fictional renter, property, budget, move-in timing, employment, household, introduction, documents, and activity without an Application model or record identifier. | Replaced the dossier with an explicit zero-record detail state. No person, property, application, score, document, or timeline is inferred. | The empty detail state replaces the dense personal-data layout and remains centered without horizontal scrolling. Reuse this record-identity gate for all detail routes. | Static contract rejects all fictional identity and application content. Live DOM reports `0 profile records` and no forms or inputs. |
| Critical | Client-only decisions | Message, shortlist, compare, viewing, information request, offer, decline, notes, document review, and status changes only mutated page JavaScript and displayed false-success toasts. | Removed all mutation controls, modals, dynamic form markup, and page scripts. Five decision categories are marked unavailable until persisted workflows exist. | A compact definition list replaces overflowing action toolbars and modal controls. | Source rejects controls, modal IDs, handlers, and inline scripts; live DOM has only shared drawer buttons. |
| High | Authorization and consent | Applicant details and documents appeared accessible without tenant-scoped authorization, consented field sharing, revocation, or secure document policy. | Added explicit record identity, authorization/consent, source/provenance, and accountable-decision prerequisites. | Four prerequisite cards use one column through 480px and two columns from 640px. | Matrix confirms the 4-to-2 row transition with zero clipping. |
| High | Score and fair-review risk | A fictional score and readiness labels encouraged ranking and high-stakes housing decisions without provenance, correction, or fairness safeguards. | Removed score output and requires relevant consented data, no sole-factor score use, no protected-characteristic inference, and explainable/correctable decisions. | Fair-review guidance stays in normal flow and moves to the desktop aside from 1280px. | Mobile and desktop visuals contain no score or urgency treatment and keep safeguards readable. |
| Medium | Module context and shell | The route title suggested a generic profile, while the screen was an applicant-detail view with fixed offsets and fake header context. | Renamed the rendered title, reuses the repaired shell, passes authenticated context, and marks Applicants current in the shared navigation. | Drawer below 1024px; fixed 240px rail from 1024px; main/boundary split from 1280px. | Current Applicants state, drawer focus, eight-width containment, and protected return path pass. |

### Regression result

- Responsive matrix: 8 widths passed with no page overflow, clipped visible main content, or header overlap.
- Application foundation cards: one column through 480px; two columns from 640px.
- Main/boundary layout: stacked through 1024px; 8/4 split from 1280px.
- Applicants remains current in desktop and drawer navigation; drawer focus and hidden-state contracts pass.
- All five decision categories render as unavailable; no applicant, score, document, or activity record is invented.
- Anonymous live GET redirects to Login with `/user/landlord/view-profile` preserved.
- Browser console: 0 warnings, 0 errors.
- Production CSS build: passed; only the pre-existing non-blocking Browserslist data-age notice remains.
- Node contract suite: 58 passed, 0 failed.

## Screen 30: Landlord Viewing Calendar (`/user/landlord/view-calendar`)

### Scope exercised

- Protected landlord shell, current Applicants navigation, scheduling status, empty viewing state, scheduling prerequisites, action availability, viewing-safety guidance, false-availability boundary, and protected-route recovery.
- Drawer focus/current-page semantics, appointment-data boundaries, responsive foundation cards and actions, desktop aside placement, and console state.
- Viewports: 320, 375, 480, 640, 768, 1024, 1440, and 2560 CSS pixels.

### Findings and resolutions

| Priority | Affected component | Exact problem and root cause | Implemented solution | Responsive behavior and reusable opportunity | Verification |
| --- | --- | --- | --- | --- | --- |
| Critical | Appointment records | The prototype rendered a hard-coded month, fictional applicants, properties, events, next viewing, scores, and monthly counts without an Appointment model or listing/application records. | Replaced the calendar and event summaries with an explicit zero-appointment state. Proposed, confirmed, completed, cancelled, and missed states are not simulated. | Removing the seven-column grid avoids unreadable mobile cells and false empty-date meaning. Reuse this record-availability gate for renter scheduling. | Static contract rejects fictional people/properties/date/score and event markup. Live DOM reports `0 viewing records`. |
| Critical | Client-only scheduling | Month navigation, event details, and schedule-viewing modal only changed browser state and closed with no persistence, conflict detection, delivery, or error recovery. | Removed all calendar controls, modal form generation, and page scripts. Scheduling, confirmation, rescheduling, cancellation, reminders, and sync are marked unavailable. | A compact action summary replaces dense controls and mobile modal input grids. | Source rejects calendar modal, event pills, controls, inputs, handlers, and inline scripts. |
| High | Time and lifecycle integrity | The old flow had no timezone contract, daylight-saving handling, duration/buffers, conflict checks, idempotency, actor/reason, or status history. | Added requirements for UTC instants plus participant timezones, availability rules, conflict checks, invitation delivery, reminders, and auditable lifecycle transitions. | Four foundation cards use one column through 480px and two columns from 640px. | Matrix confirms the 4-to-2 row transition with zero clipping. |
| High | Privacy and safety | Exact locations, applicant details, and scores appeared in calendar previews without stage-based disclosure or participant authorization. | Requires authorized listing/application relationships, consented recipients, safe location disclosure, and keeps contact details out of titles/previews. | Safety guidance remains in normal flow and moves to the desktop aside from 1280px. | Mobile and desktop visuals contain no personal/location event preview and keep safety guidance readable. |
| Medium | Empty-date meaning and shell | The static month implied that blank dates were available and used a fixed layout with fake account controls. | Explicitly states that empty dates do not prove availability, reuses the repaired shell, passes account context, and keeps Applicants current. | Drawer below 1024px; fixed 240px rail from 1024px; main/boundary split from 1280px. | Eight-width containment, current module, drawer focus, and protected return path pass. |

### Regression result

- Responsive matrix: 8 widths passed with no page overflow, clipped visible main content, or header overlap.
- Scheduling foundation cards: one column through 480px; two columns from 640px.
- Empty-state actions remain 48px and stack through 480px before sharing a row from 640px.
- Main/boundary layout: stacked through 1024px; 8/4 split from 1280px.
- Applicants remains current; mobile drawer focus and hidden-state contracts pass.
- All five scheduling action categories are unavailable; no month, appointment, applicant, or property record is invented.
- Anonymous live GET redirects to Login with `/user/landlord/view-calendar` preserved.
- Browser console: 0 warnings, 0 errors.
- Production CSS build: passed; only the pre-existing non-blocking Browserslist data-age notice remains.
- Node contract suite: 59 passed, 0 failed.

## Screen 31: Application Review (`/user/landlord/review-application`)

### Scope exercised

- Protected landlord shell, current Applicants navigation, review status, empty evidence state, review foundations, action availability, review principles, sensitive-evidence warning, and protected-route recovery.
- Drawer focus/current-page semantics, decision-risk boundaries, responsive foundation cards, desktop aside placement, and console state.
- Viewports: 320, 375, 480, 640, 768, 1024, 1440, and 2560 CSS pixels.

### Findings and resolutions

| Priority | Affected component | Exact problem and root cause | Implemented solution | Responsive behavior and reusable opportunity | Verification |
| --- | --- | --- | --- | --- | --- |
| Critical | Review evidence | The screen duplicated a fictional applicant dossier with identity, property, budget, employment, household, documents, score, activity, and status despite no Application model or selected record. | Replaced it with an explicit zero-review state. No applicant, property, evidence, verification, score, note, activity, comparison, or decision is inferred. | The empty evidence state replaces a dense personal-data dashboard and remains contained at every width. Reuse this evidence-availability gate for high-stakes review screens. | Static contract rejects fictional people/data/score/documents. Live DOM reports `0 review records` and no forms or inputs. |
| Critical | Decision mutations | Stage, message, shortlist, viewing, information request, notes, comparison, offer, and decline controls only changed client state and displayed false success. | Removed all controls, generated modal forms, status selectors, toasts, and page scripts. Five review action categories are unavailable until server workflows exist. | A readable action definition list replaces mobile toolbars and modal forms. | Source rejects modal/stage IDs, controls, handlers, and inline scripts; live desktop shows every action unavailable. |
| High | Evidence policy and provenance | The prototype did not expose submission versions, consent scope, criteria policy, missing/conflicting evidence, freshness, correction, or reviewer accountability. | Requires immutable consented submissions, consistent relevant criteria, evidence provenance, and an authorized auditable decision lifecycle. | Four foundation cards use one column through 480px and two columns from 640px. | Matrix confirms the 4-to-2 row transition without clipping. |
| High | Fair and explainable review | Score-led comparison and decisions lacked safeguards for missing data, protected characteristics, sole-factor use, consistency, explanation, and correction. | States that missing data remains unavailable, HomiScore is never the sole factor, comparable applications use consistent criteria, and decisions remain explainable and correctable. | Principles remain in normal flow and move into the desktop aside from 1280px. | Mobile and desktop visuals contain no fictional score or ranking and keep principles readable. |
| Medium | Module context and shell | The duplicate page used fixed offsets, fake account context, and client navigation outside the repaired Applicants module. | Reuses the repaired shell, passes authenticated context, uses native links, and keeps Applicants current. | Drawer below 1024px; fixed 240px rail from 1024px; main/boundary split from 1280px. | Eight-width containment, current module, drawer focus, and protected return path pass. |

### Regression result

- Responsive matrix: 8 widths passed with no page overflow, clipped visible main content, or header overlap.
- Review foundation cards: one column through 480px; two columns from 640px.
- Primary Applicants action remains 48px; header targets remain at least 44px.
- Main/boundary layout: stacked through 1024px; 8/4 split from 1280px.
- Applicants remains current; mobile drawer focus and hidden-state contracts pass.
- All five review action categories are unavailable; no evidence, score, activity, or decision is invented.
- Anonymous live GET redirects to Login with `/user/landlord/review-application` preserved.
- Browser console: 0 warnings, 0 errors.
- Production CSS build: passed; only the pre-existing non-blocking Browserslist data-age notice remains.
- Node contract suite: 60 passed, 0 failed.

## Screen 32: Add Property Address (`/user/landlord/properties/add/address`)

### Scope exercised

- Protected landlord shell, current Properties navigation, property-draft status, first-step boundary, draft foundations, planned five-step sequence, action availability, private-address warning, onboarding context, and protected-route recovery.
- Drawer focus/current-page semantics, address-data boundaries, responsive foundation cards and step list, desktop aside placement, and console state.
- Viewports: 320, 375, 480, 640, 768, 1024, 1440, and 2560 CSS pixels.

### Findings and resolutions

| Priority | Affected component | Exact problem and root cause | Implemented solution | Responsive behavior and reusable opportunity | Verification |
| --- | --- | --- | --- | --- | --- |
| Critical | Property address form | The form collected a property name, full address, postcode, type, occupancy, and furnishing details without a PropertyDraft model, POST route, validation service, or ownership policy. | Removed all data-entry controls and states that address fields are hidden until private persisted drafts exist. | The unavailable first-step state replaces a long form and avoids silent data loss at every width. Reuse this draft-availability gate for the remaining setup steps. | Static contract rejects form fields, controls, handlers, and inline scripts. Live DOM has zero forms and inputs. |
| Critical | Save and continuation | Save Draft and Continue appeared operational but never persisted data or carried a draft identifier into the next GET-only route. | Marks enter, save, resume, and continue actions unavailable and returns users to the honest Properties workspace. | The return action remains 48px and does not create a mobile sticky footer. | Live desktop shows all four action categories unavailable; route links are native. |
| High | Draft ownership and recovery | The workflow lacked landlord ownership, stable IDs, timestamps, versioning, partial saves, retries, duplicate detection, stale-write conflicts, and recovery. | Added explicit private draft, validation, address privacy, and save/resume foundations. | Four foundation cards use one column through 480px and two columns from 640px. | Matrix confirms the 4-to-2 row transition without clipping. |
| High | Address privacy | The prototype claimed private handling without a storage/access policy and mixed private address entry with future public listing display. | Requires separation between private full address and intentionally public approximate location; warns against sending addresses, access codes, or ownership files through support channels. | Warning stays in normal flow and moves into the desktop aside from 1280px. | Mobile and desktop visuals keep the privacy boundary prominent. |
| Medium | Wizard orientation and shell | A five-column progress control implied saved progress even though every step was an independent GET page with fake account context. | Replaces it with a planned sequence explicitly dependent on one future saved draft ID, reuses the repaired shell, and marks Properties current. | Five steps remain a readable vertical list at every size; main/boundary split begins at 1280px. | Eight-width containment, current module, drawer focus, and protected return path pass. |

### Regression result

- Responsive matrix: 8 widths passed with no page overflow, clipped visible main content, or header overlap.
- Draft foundation cards: one column through 480px; two columns from 640px.
- Planned sequence contains five readable steps at every width; no false progress state is shown.
- Primary return action remains 48px; header targets remain at least 44px.
- Main/boundary layout: stacked through 1024px; 8/4 split from 1280px.
- Properties remains current; mobile drawer focus and hidden-state contracts pass.
- Anonymous live GET redirects to Login with `/user/landlord/properties/add/address` preserved.
- Browser console: 0 warnings, 0 errors.
- Production CSS build: passed; only the pre-existing non-blocking Browserslist data-age notice remains.
- Node contract suite: 61 passed, 0 failed.

## Screen 33: Add Property Listing Details (`/user/landlord/properties/add/listing-details`)

### Scope exercised

- Protected landlord shell, current Properties navigation, listing-content status, second-step boundary, listing foundations, planned content groups, action availability, public/private warning, inclusive-language guidance, and protected-route recovery.
- Drawer focus/current-page semantics, publication-data boundaries, responsive foundation cards and content rows, desktop aside placement, and console state.
- Viewports: 320, 375, 480, 640, 768, 1024, 1440, and 2560 CSS pixels.

### Findings and resolutions

| Priority | Affected component | Exact problem and root cause | Implemented solution | Responsive behavior and reusable opportunity | Verification |
| --- | --- | --- | --- | --- | --- |
| Critical | Public listing form | The form collected title, description, amenities, property facts, energy/accessibility claims, pet policy, and entry notes without a saved draft, content schema, validation endpoint, or revision record. | Removed all fields and marks listing content unavailable until one persisted PropertyDraft owns it. | The unavailable step replaces a long form and prevents silent loss on every device. Reuse the draft dependency gate on steps 3-5. | Static contract rejects form controls, original IDs, handlers, and inline scripts. Live DOM has zero forms and inputs. |
| Critical | Save, preview, and continuation | Save Draft and Continue implied persistence and step progress; no preview or publish version existed. | Marks content entry, save, preview, and continuation unavailable and links back to the setup start. | Primary setup-start action remains 48px without a sticky footer. | Live desktop shows all four actions unavailable; registered navigation remains native. |
| High | Fair and accurate listing content | The prototype accepted unrestricted marketing copy and policy language without discrimination, coded-language, misleading-claim, or false-availability controls. | Requires structured validation and a fair-listing policy that rejects protected-characteristic targeting, coded preferences, unverifiable claims, and misleading availability. | Four foundation cards use one column through 480px and two columns from 640px. | Matrix confirms the 4-to-2 transition with no clipping. |
| High | Public/private separation | Building entry details and operational notes could be entered beside public copy without field-level visibility ownership. | Separates public property content from private address, access code, tenant, ownership, contact, and viewing-instruction data. | Privacy warning remains in normal flow and moves into the desktop aside from 1280px. | Mobile and desktop visuals keep the operational-data warning prominent. |
| Medium | Moderation, revision, and shell | The screen showed false completed-step progress with no moderation outcomes, preview state, revisions, rollback, or real account context. | Requires content versions, moderation reasons, correction, draft preview, publish version, rollback, and uses the repaired Properties shell. | Four planned content groups stack safely; main/boundary split begins at 1280px. | Eight-width containment, current Properties state, drawer focus, and protected return path pass. |

### Regression result

- Responsive matrix: 8 widths passed with no page overflow, clipped visible main content, or header overlap.
- Listing foundation cards: one column through 480px; two columns from 640px.
- Four planned content groups remain readable and explicitly unavailable at every width.
- Primary setup-start action remains 48px; header targets remain at least 44px.
- Main/boundary layout: stacked through 1024px; 8/4 split from 1280px.
- Properties remains current; mobile drawer focus and hidden-state contracts pass.
- Anonymous live GET redirects to Login with `/user/landlord/properties/add/listing-details` preserved.
- Browser console: 0 warnings, 0 errors.
- Production CSS build: passed; only the pre-existing non-blocking Browserslist data-age notice remains.
- Node contract suite: 62 passed, 0 failed.

## Screen 34: Add Property Rent and Availability (`/user/landlord/properties/add/rent`)

### Scope exercised

- Protected landlord shell, current Properties navigation, financial-term status, third-step boundary, rent and availability foundations, planned term groups, action availability, financial-data warning, explicit-availability guidance, and protected-route recovery.
- Drawer focus/current-page semantics, tenancy-data boundaries, responsive foundation cards and term rows, desktop aside placement, and console state.
- Viewports: 320, 375, 480, 640, 768, 1024, 1440, and 2560 CSS pixels.

### Findings and resolutions

| Priority | Affected component | Exact problem and root cause | Implemented solution | Responsive behavior and reusable opportunity | Verification |
| --- | --- | --- | --- | --- | --- |
| Critical | Rent and tenancy form | The prototype collected rent, deposits, bills, dates, tenancy lengths, viewing rules, and applicant criteria without a PropertyDraft, currency schema, validation endpoint, or revision history. | Removed all fields and marks financial and tenancy data unavailable until one persisted draft can validate and save the complete terms. | The unavailable step replaces a dense financial form and prevents silent loss at every width. Reuse the draft dependency gate on steps 4-5. | Static contract rejects form controls, original fields, handlers, and inline scripts. Live DOM has zero forms and inputs. |
| Critical | Save and continuation | Save Draft and continuation to media implied persisted progress even though this GET-only route had no draft identifier or mutation service. | Marks financial entry, availability updates, draft saves, and continuation unavailable and links back to the setup start. | The setup-start action remains a 44px accessible target without a sticky footer. | Live desktop shows all four actions unavailable and no client-side success state. |
| High | Money and legal clarity | Raw amounts lacked currency, minor-unit precision, payment period, refundable status, total upfront cost, jurisdiction rules, and required disclosure handling. | Requires an unambiguous money schema and jurisdiction-aware validation for deposits, fees, notices, licensing, and tenancy terms. | Four foundation cards use one column through 480px and two columns from 640px. | Matrix confirms the 4-to-2 transition with no clipping. |
| High | Availability and fair criteria | Blank dates could imply availability, while unrestricted criteria risked inconsistent or discriminatory screening. | Requires authoritative dated availability with lifecycle history and relevant, consistently applied, explainable criteria that exclude protected-characteristic inference. | Availability and fairness guidance remains readable in normal flow and the desktop aside from 1280px. | Mobile and desktop visuals show explicit unavailable states and no false availability. |
| Medium | Financial privacy and shell | Sensitive financial evidence could be confused with listing setup or support channels, and the prototype used fixed offsets and fake context. | Adds a prominent no-financial-data boundary, reuses the repaired shell, passes authenticated account context, and marks Properties current. | Drawer below 1024px; fixed 240px rail from 1024px; main/boundary split from 1280px. | Eight-width containment, current Properties state, drawer focus, and protected return path pass. |

### Regression result

- Responsive matrix: 8 widths passed with no page overflow, clipped visible main content, or header overlap.
- Rent and availability foundation cards: one column through 480px; two columns from 640px.
- Four planned term groups remain readable and explicitly unavailable at every width.
- Setup-start action and mobile drawer target remain at least 44px; header targets remain at least 44px.
- Main/boundary layout: stacked through 1024px; 8/4 split from 1280px.
- Properties remains current; mobile drawer transfers focus to Close, hides on close, and restores focus to Open.
- Anonymous live GET redirects to Login with `/user/landlord/properties/add/rent` preserved.
- Browser console: 0 warnings, 0 errors.
- Production CSS build: passed; only the pre-existing non-blocking Browserslist data-age notice remains.
- Node contract suite: 63 passed, 0 failed.

## Screen 35: Add Property Photos and Documents (`/user/landlord/properties/add/photos`)

### Scope exercised

- Protected landlord shell, current Properties navigation, media-storage status, fourth-step boundary, upload foundations, planned file groups, action availability, sensitive-file warning, private-by-default guidance, and protected-route recovery.
- Drawer focus/current-page semantics, file-data boundaries, responsive foundation cards and file rows, status wrapping, desktop aside placement, and console state.
- Viewports: 320, 375, 480, 640, 768, 1024, 1440, and 2560 CSS pixels.

### Findings and resolutions

| Priority | Affected component | Exact problem and root cause | Implemented solution | Responsive behavior and reusable opportunity | Verification |
| --- | --- | --- | --- | --- | --- |
| Critical | Photo and document uploads | Browser file controls promised photo, floorplan, certificate, licence, and inventory uploads without a PropertyDraft, upload endpoint, object storage, file validation, malware scanning, or recovery. | Removed every upload control and marks media and documents unavailable until secure draft-owned storage exists. | The unavailable state replaces drop zones and file selectors that could silently discard sensitive files on every device. Reuse this storage gate anywhere files are accepted. | Static contract rejects file inputs, form controls, upload copy, handlers, and inline scripts. Live DOM has zero forms and inputs. |
| Critical | Visibility, save, and continuation | Private, applicant, and public visibility options plus draft/review actions implied persisted file state with no authorization, mutation, or draft identifier. | Marks upload, visibility, and continuation actions unavailable and links back to the setup start. Files remain private by default. | A compact definition list replaces an overflowing control footer; status values stay on one line while labels wrap. | Live mobile and desktop show all four actions unavailable with no row overflow or false success. |
| High | File-ingestion security | The prototype relied on `accept` attributes and size copy without signature checks, MIME verification, malware scanning, checksums, processing states, or quarantine. | Requires verified signatures, MIME and extension agreement, limits, dimensions, malware status, checksums, and explicit processing outcomes. | Four foundation cards use one column through 480px and two columns from 640px. | Matrix confirms the 4-to-2 transition without clipping. |
| High | Media privacy and quality | Photos could retain location metadata or expose faces, personal data, access details, and misleading imagery; captions and ordering lacked ownership. | Requires metadata removal, ordered cover selection, useful captions, content review, and explicit handling of people and personal information. | Media guidance remains readable from small mobile through ultra-wide screens. | Mobile and desktop visuals preserve the full privacy and review guidance. |
| High | Document authorization and lifecycle | Document visibility was a browser select with no private default, authorized sharing, expiry, revocation, retention, replacement, deletion, or audit history. | Requires per-file policy and an auditable document lifecycle; warns against sending ownership, identity, tenant, financial, access, or unredacted files through support channels. | The sensitive-file boundary stays in normal flow and moves into the desktop aside from 1280px. | Live visuals keep the warning prominent; no public-sharing state is inferred. |
| Medium | Shell and progress | The screen used fixed offsets, fake account data, and completed-step markers despite no saved progress. | Reuses the repaired shell, passes authenticated account context, marks Properties current, and explicitly labels step 4 unavailable. | Drawer below 1024px; fixed 240px rail from 1024px; main/boundary split from 1280px. | Eight-width containment, current Properties state, drawer focus, and protected return path pass. |

### Regression result

- Responsive matrix: 8 widths passed with no page overflow, clipped visible main content, or header overlap.
- Media and document foundation cards: one column through 480px; two columns from 640px.
- Four planned file groups and four action statuses remain readable and explicitly unavailable at every width.
- Setup-start action and mobile drawer target remain at least 44px; status values stay on one line at mobile and desktop widths.
- Main/boundary layout: stacked through 1024px; 8/4 split from 1280px.
- Properties remains current; mobile drawer transfers focus to Close, hides on close, and restores focus to Open.
- Anonymous live GET redirects to Login with `/user/landlord/properties/add/photos` preserved.
- Browser console: 0 warnings, 0 errors.
- Production CSS build: passed; only the pre-existing non-blocking Browserslist data-age notice remains.
- Node contract suite: 64 passed, 0 failed.

## Screen 36: Add Property Review and Publish (`/user/landlord/properties/add/review`)

### Scope exercised

- Protected landlord shell, current Properties navigation, publication status, fifth-step boundary, publication foundations, planned review groups, action availability, private-data warning, false-public-status guidance, and protected-route recovery.
- Drawer focus/current-page semantics, publication-data boundaries, responsive foundation cards and review rows, status wrapping, desktop aside placement, and console state.
- Viewports: 320, 375, 480, 640, 768, 1024, 1440, and 2560 CSS pixels.

### Findings and resolutions

| Priority | Affected component | Exact problem and root cause | Implemented solution | Responsive behavior and reusable opportunity | Verification |
| --- | --- | --- | --- | --- | --- |
| Critical | Readiness and listing preview | The page invented a `0 of 4 sections complete` score, marked prior steps complete, and showed field-level preview data without a PropertyDraft or authoritative saved version. | Removed simulated completeness, completed-step markers, field previews, and Edit controls. The page now states that no listing version exists to review. | The unavailable state replaces dense preview cards and remains understandable at every width. Reuse this authoritative-version gate for all previews. | Static contract rejects the score, preview fields, fake account, controls, and scripts. Live DOM has zero forms and inputs. |
| Critical | Publish action and renter-facing claims | A disabled browser button and supporting copy implied an available publication/applications lifecycle without a publish endpoint, listing model, status history, or rollback. | Marks review, preview, publishing, pause, and rollback unavailable and makes public status dependent on a server-confirmed lifecycle record. | Four status rows replace the action footer; values stay on one line with no row overflow. | Mobile and desktop show all actions unavailable; no public or success state is inferred. |
| High | Readiness and public/private validation | The prototype did not validate draft ownership, current availability, jurisdiction rules, file processing, disclosure requirements, or exclusion of private data. | Requires one authoritative readiness service and an immutable public preview that excludes private fields and exposes the exact reviewed revision. | Four foundation cards use one column through 480px and two columns from 640px. | Matrix confirms the 4-to-2 transition without clipping. |
| High | Authorization and publication safety | Publishing lacked authorized ownership, version confirmation, idempotency, moderation outcomes, failure recovery, and fair-listing checks. | Requires authorized confirmation of a stable version, idempotent mutation, policy outcomes, and recoverable errors before any public record is created. | Publication safeguards remain readable from small mobile through ultra-wide layouts. | Live mobile and desktop visuals keep the authorization boundary visible. |
| High | Listing lifecycle and privacy | No draft, published, paused, expired, let, archived, or removed state model existed, while full addresses and private documents were not explicitly excluded. | Defines an auditable reversible lifecycle and a prominent prohibition on publishing addresses, access codes, ownership, identity, tenant, applicant, contact, or private-document data. | The privacy boundary stays in normal flow and moves into the desktop aside from 1280px. | No overflow or clipping; public/private warning remains prominent. |
| Medium | Shell and progress | Fixed offsets, fake account context, and completed-step visuals did not match the real unsaved workflow. | Reuses the repaired shell, passes authenticated context, marks Properties current, and explicitly labels step 5 unavailable. | Drawer below 1024px; fixed 240px rail from 1024px; main/boundary split from 1280px. | Eight-width containment, current Properties state, drawer focus, and protected return path pass. |

### Regression result

- Responsive matrix: 8 widths passed with no page overflow, clipped visible main content, or header overlap.
- Publication foundation cards: one column through 480px; two columns from 640px.
- Four planned review groups and four action statuses remain readable and explicitly unavailable at every width.
- Setup-start action and mobile drawer target remain at least 44px; status values stay on one line.
- Main/boundary layout: stacked through 1024px; 8/4 split from 1280px.
- Properties remains current; mobile drawer transfers focus to Close, hides on close, and restores focus to Open.
- Anonymous live GET redirects to Login with `/user/landlord/properties/add/review` preserved.
- Browser console: 0 warnings, 0 errors.
- Production CSS build: passed; only the pre-existing non-blocking Browserslist data-age notice remains.
- Node contract suite: 65 passed, 0 failed.

## Screen 37: Renter Dashboard (`/user/renter/dashboard`)

### Scope exercised

- Protected renter shell, current Dashboard navigation, persisted account and renter-profile values, activity availability, workspace foundations, zero-record summaries, available account journeys, sensitive-evidence warning, no-inference guidance, and protected-route recovery.
- Renter sidebar repair, Messages navigation, drawer focus/current-page semantics, long profile values, responsive profile/foundation/record grids, desktop aside placement, and console state.
- Viewports: 320, 375, 480, 640, 768, 1024, 1440, and 2560 CSS pixels.

### Findings and resolutions

| Priority | Affected component | Exact problem and root cause | Implemented solution | Responsive behavior and reusable opportunity | Verification |
| --- | --- | --- | --- | --- | --- |
| Critical | Dashboard identity and activity | The dashboard hard-coded a fictional premium renter, verification status, HomiScore 874, matches, properties, applications, viewings, payment state, affordability, and landlord outcomes without corresponding models. | Replaced every fictional record with authenticated account context, the persisted renter onboarding profile, and explicit zero linked activity counts. | Dense sample cards were replaced by stable profile and record grids that wrap without overflow. Reuse this real-record gate across renter modules. | Static contract rejects fictional identity, listings, score, activity, remote images, and money text. Audit fixture renders `Audit Renter` and saved profile values. |
| Critical | Client-only applications and controls | Apply, View, Update Budget, assessment, payments, and viewing controls either redirected ambiguously or mutated browser-only state. | Removed all unsupported controls and inline scripts. Only registered account/profile/verification/HomiScore journeys remain as native links. | Actions maintain at least 44px targets and stack safely on mobile. | Live DOM has zero forms and inputs and only the shared drawer buttons. |
| High | Renter profile ownership | Search preferences, employment, household, pets, budget, and move-in information were duplicated as fictional dashboard content instead of using the saved onboarding subdocument. | Passes `currentUser` and `renterProfile` from the protected route and renders supported persisted fields without inferring missing values. The budget explicitly states that currency is not recorded. | Eight saved fields use one column through 480px and two columns from 640px. | Live fixture renders all eight values; long email, phone, location, and budget text remain contained. |
| High | Missing-data meaning | Empty or absent data previously became scores, matches, affordability, payment health, verification, or decisions. | States that zero means no connected record and missing activity remains unavailable, never a risk, rejection, or eligibility result. | Six record cards use one column through 480px, two from 640px, and three from 1024px. | All six values are `0` across the responsive matrix. |
| High | Data-service and privacy boundaries | Discovery, applications, viewings, messages, documents, payments, and notifications lacked ownership, authorization, lifecycle, correction, and audit contracts. | Adds explicit profile, discovery, application, and protected-service foundations plus a sensitive-evidence warning. | Four foundation cards use one column through 480px and two columns from 640px; guidance moves to the desktop aside from 1280px. | Mobile and desktop visuals preserve every boundary with no clipping. |
| Medium | Renter shell and navigation | The sidebar omitted Messages and current-page semantics for settings/support; the dashboard used fake account controls, fixed layout assumptions, and inaccessible decorative icons. | Rebuilt the renter sidebar to match the shared drawer contract, added Messages, conditional current states, and hidden decorative icons; dashboard uses the repaired shell. | Drawer below 1024px; fixed 240px rail from 1024px; main/boundary split from 1280px. | Current Dashboard, drawer focus transfer/restoration, Messages presence, eight-width containment, and protected return path pass. |

### Regression result

- Responsive matrix: 8 widths passed with no page overflow, clipped visible main content, or header overlap.
- Saved profile and foundation cards: one column through 480px; two columns from 640px.
- Linked record cards: one column through 480px; two from 640px; three from 1024px.
- Update-profile action and mobile drawer target remain at least 44px.
- Main/boundary layout: stacked through 1024px; 8/4 split from 1280px.
- Dashboard remains current; mobile drawer transfers focus to Close, hides on close, and restores focus to Open.
- Anonymous live GET redirects to Login with `/user/renter/dashboard` preserved.
- Browser console: 0 warnings, 0 errors.
- Production CSS build: passed; only the pre-existing non-blocking Browserslist data-age notice remains.
- Node contract suite: 66 passed, 0 failed.

## Screen 38: Renter HomiScore (`/user/renter/homiscore`)

### Scope exercised

- Protected renter shell, current HomiScore navigation, score availability, saved profile coverage, verification and operational-source states, scoring safeguards, score-history empty state, data boundaries, support path, and protected-route recovery.
- Persisted renter-profile local contract, self-reported versus verified labeling, drawer focus/current-page semantics, responsive source cards, long profile values, desktop aside placement, and console state.
- Viewports: 320, 375, 480, 640, 768, 1024, 1440, and 2560 CSS pixels.

### Findings and resolutions

| Priority | Affected component | Exact problem and root cause | Implemented solution | Responsive behavior and reusable opportunity | Verification |
| --- | --- | --- | --- | --- | --- |
| Critical | Score and verification claims | The prototype displayed score 874, top-five-percent rank, premium risk labels, biometric/passport identity, open-banking financials, rental history, affordability, and score changes without a scoring or verification service. | Removed all score, rank, factor, verification, risk, and history claims. The screen now reports `Score not available` and never estimates from onboarding answers. | A simple status band replaces the dense score ring and remains readable at every width. Reuse the landlord HomiScore source-readiness pattern. | Static contract rejects fictional scores, rank, positive verification claims, credit activity, and controls. Live DOM contains no score output. |
| Critical | Paid share and improvement controls | The paid share link, score tasks, upload/reference prompts, savings-account linking, and point promises had no payment, consent, verification, storage, or scoring mutation. | Removed paid sharing, tasks, interactive role controls, point promises, inline scripts, and fake activity. No report or share link exists without a real score and consent service. | Native requirements/support links replace action-heavy score widgets. | Live DOM has zero forms and inputs and only shared drawer buttons. |
| High | Profile-source ownership | The first implementation pass used inconsistent route/audit locals and falsely showed the saved renter profile as Missing. | Standardized the protected route and template on `renterProfile`; renders household, employment, budget preference, and location from the persisted onboarding subdocument. | Four profile rows wrap without overflow; source cards stack through 480px and use three columns from 640px. | Live fixture reports Profile preferences `Available` and renders all four saved values. |
| High | Explainability, correction, and fairness | The prototype presented outcomes without method, source scope, freshness, consent, dispute, correction, access record, or sole-factor protections. | Requires consented relevant data, source/freshness disclosure, factor-level explanations, dispute/correction history, and accountable housing decisions that never infer protected characteristics. | Three principles remain a readable ordered list at every width. | Mobile and desktop accessibility snapshots expose a coherent heading/list structure. |
| High | Data and high-stakes boundaries | Credit bureau, background, biometric, banking, income, affordability, rental performance, landlord access, and risk status were treated as present. | Explicitly states that none of those sources or outcomes is connected or inferred and labels saved preferences as self-reported, not verification evidence or score inputs. | Boundaries stay in flow and move into the desktop aside from 1280px. | Mobile and desktop visuals preserve all boundary text without clipping. |
| Medium | Shell and module context | Fixed offsets, fake premium account context, unread notification urgency, and inaccessible controls did not match the renter module. | Reuses the repaired renter shell, passes authenticated context, and marks HomiScore current. | Drawer below 1024px; fixed 240px rail from 1024px; main/information split from 1280px. | Eight-width containment, drawer focus, current HomiScore state, and protected return path pass. |

### Regression result

- Responsive matrix: 8 widths passed with no page overflow, clipped visible main content, profile-row overflow, or header overlap.
- Three source cards stack through 480px and use three columns from 640px.
- Three scoring safeguards and four saved profile rows remain readable at every width.
- Requirements action remains 48px; header and drawer targets remain at least 44px.
- Main/information layout: stacked through 1024px; 8/4 split from 1280px.
- HomiScore remains current; mobile drawer transfers focus to Close, hides on close, and restores focus to Open.
- Anonymous live GET redirects to Login with `/user/renter/homiscore` preserved.
- Browser console: 0 warnings, 0 errors.
- Production CSS build: passed; only the pre-existing non-blocking Browserslist data-age notice remains.
- Node contract suite: 68 passed, 0 failed.

## Screen 39: Renter Applications (`/user/renter/applications`)

### Scope exercised

- Protected renter shell, current Applications navigation, application-service availability, authoritative submission foundations, lifecycle stages, action availability, evidence-sharing warning, automation boundary, and protected-route recovery.
- Drawer focus/current-page semantics, responsive foundation cards and status rows, desktop aside placement, empty state, target sizing, and console state.
- Viewports: 320, 375, 480, 640, 768, 1024, 1440, and 2560 CSS pixels.

### Findings and resolutions

| Priority | Affected component | Exact problem and root cause | Implemented solution | Responsive behavior and reusable opportunity | Verification |
| --- | --- | --- | --- | --- | --- |
| Critical | Application records and listings | The prototype displayed fictional properties, landlords, match percentages, application states, saved counts, and HomiScore values without Property or Application models. | Removed every fictional record and reports `0 application records` with no inferred draft, review, viewing, offer, decision, withdrawal, or expiry state. | The empty state remains readable at every width and replaces data-heavy cards that had no authoritative source. Reuse this real-record gate for all record modules. | Static contract rejects the fictional identities, listings, scores, and match claims. Live DOM contains the expected zero-record state. |
| Critical | Submission and automation controls | Apply, profile preview, saved-property actions, and paid Autopilot implied mutations, payment, consent, and background submission that did not exist. | Removed all forms, controls, inline scripts, paid automation, and automatic sharing. Future submission is explicitly dependent on an intentional preview and confirmation. | The only primary action is a native 48px dashboard link; no sticky or overflowing action bar remains. | Live DOM has zero forms and inputs and only shared drawer buttons. Contract rejects the old run/pay, apply, preview, and save controls. |
| High | Submission evidence and consent | The screen lacked an immutable view of the listing, exact shared profile/document version, recipient, purpose, retention, expiry, withdrawal terms, and delivery receipt. | Defines authoritative listing, consented submission version, reliable delivery lifecycle, and fair review as required foundations. | Four foundation cards use one column through 480px and two columns from 640px. | Matrix confirms the 4-to-2 transition with no clipping or horizontal overflow. |
| High | Lifecycle and decision transparency | Browser-only labels presented application progress without idempotent delivery, landlord receipt, timestamps, information requests, decision ownership, correction, or withdrawal. | Replaces false progress with five explicitly unavailable lifecycle stages and requires attributable status history and recoverable delivery. | Stage rows stack labels and values on mobile and align horizontally when space permits. | All five rows remain contained and readable across the full matrix. |
| High | Sensitive evidence and fair housing | The prototype encouraged application activity without a safe channel or protections against irrelevant and protected-characteristic inference. | Adds a prominent no-evidence warning and requires relevant consistent criteria, explainable outcomes, correction, appeal where applicable, and withdrawal. | Safety guidance remains in normal flow and moves into the desktop aside from 1280px. | Mobile and desktop visuals preserve the complete warning and decision boundary. |
| Medium | Shell and account context | The screen used fictional premium-account context and fixed assumptions instead of the repaired renter shell. | Passes the authenticated user to the template, reuses the shared renter shell, and marks Applications current. | Drawer below 1024px; fixed 240px rail from 1024px; main/boundary split from 1280px. | Eight-width containment, active Applications state, drawer focus/Escape behavior, and protected return path pass. |

### Regression result

- Responsive matrix: 8 widths passed with no page overflow, clipped visible content, or header overlap.
- Four application-foundation cards: one column through 480px; two columns from 640px.
- Five lifecycle stages and four action statuses remain readable and explicitly unavailable at every width.
- Return-to-dashboard action remains 48px; header and drawer targets remain at least 44px.
- Main/boundary layout: stacked through 1024px; 8/4 split from 1280px.
- Applications remains current; mobile drawer transfers focus to Close, closes by button or Escape, unlocks body scrolling, and restores focus to Open.
- Anonymous live GET redirects to Login with `/user/renter/applications` preserved.
- Browser console: 0 warnings, 0 errors.
- Production CSS build: passed; only the pre-existing non-blocking Browserslist data-age notice remains.
- Node contract suite: 69 passed, 0 failed.

## Screen 40: Renter Documents (`/user/renter/documents`)

### Scope exercised

- Protected renter shell, current Documents navigation, storage availability, zero-record state, secure-ingestion foundations, lifecycle states, action availability, evidence-minimization guidance, readiness boundary, and protected-route recovery.
- Drawer focus/current-page semantics, responsive foundation cards and status rows, desktop aside placement, target sizing, and console state.
- Viewports: 320, 375, 480, 640, 768, 1024, 1440, and 2560 CSS pixels.

### Findings and resolutions

| Priority | Affected component | Exact problem and root cause | Implemented solution | Responsive behavior and reusable opportunity | Verification |
| --- | --- | --- | --- | --- | --- |
| Critical | Stored document records | The prototype showed four fictional renter files, verification statuses, update dates, expiry dates, readiness counts, and active sharing without a Document model or storage service. | Removed every fictional record and reports `0 stored documents` with no verification, expiry, readiness, or sharing state inferred. | The empty state replaces a wide 780px table and remains readable without horizontal scrolling at every width. Reuse the zero-record pattern for unsupported data modules. | Static contract rejects all original file names, counts, statuses, and sharing claims. Live DOM contains the expected zero-record state. |
| Critical | Upload, preview, update, and sharing controls | Working-looking upload, browse, view, update, share, and manage controls had no endpoint, storage, consent, authorization, or audit ledger. | Removed all file and action controls, category selectors, tabs, tables, and inline scripts. All document actions are explicitly unavailable. | Native verification and support links remain 48px; no dense mobile toolbar or fake drop zone remains. | Live DOM has zero forms and inputs and only shared drawer buttons. Contract rejects form controls, tables, file inputs, and scripts. |
| Critical | Sensitive-file safety | The prototype promised secure storage while the application has no encryption boundary, scoped access, signature validation, MIME checks, malware scanning, checksums, quarantine, or failure recovery. | States storage is not configured, prohibits sending evidence through Contact or Messages, and defines private storage plus verified ingestion as launch gates. | The safety status stays prominent in normal flow at all widths. | Mobile and desktop visuals preserve the complete warning without clipping. |
| High | Consent, retention, and auditability | Sharing copy had no exact recipient/file preview, purpose, duration, download policy, revocation, access history, retention, replacement, correction, or deletion contract. | Defines consented sharing and full document lifecycle requirements, including owner-controlled deletion and recovery policy. | Four foundation cards use one column through 480px and two columns from 640px; four lifecycle rows stack safely on mobile. | Matrix confirms the 4-to-2 transition and zero status overflow. |
| High | Readiness and fairness | `3 of 4 requirements complete` treated hard-coded file categories as universal application readiness and risked disproportionate evidence demands. | Removes readiness scoring and states that missing files do not imply fraud, risk, ineligibility, or an incomplete application; requirements must be relevant and explained per property. | The boundary remains in flow and moves into the desktop aside from 1280px. | Live accessibility snapshot exposes the boundary as a named region. |
| Medium | Shell and account context | The screen used a fictional premium account, remote profile image, fixed offset, and unlabelled icon buttons. | Passes authenticated account context, reuses the repaired renter shell, native account links, and current Documents state. | Drawer below 1024px; fixed 240px rail from 1024px; main/guidance split from 1280px. | Eight-width containment, active Documents state, drawer focus/Escape behavior, and protected return path pass. |

### Regression result

- Responsive matrix: 8 widths passed with no page overflow, clipped visible content, status overflow, or header overlap.
- Four storage-control cards: one column through 480px; two columns from 640px.
- Four lifecycle stages and five action statuses remain readable and explicitly unavailable at every width.
- Requirements and support actions remain 48px; header and drawer targets remain at least 44px.
- Main/guidance layout: stacked through 1024px; 8/4 split from 1280px.
- Documents remains current; mobile drawer transfers focus to Close, closes by Escape, unlocks body scrolling, and restores focus to Open.
- Anonymous live GET redirects to Login with `/user/renter/documents` preserved.
- Browser console: 0 warnings, 0 errors.
- Production CSS build: passed; only the pre-existing non-blocking Browserslist data-age notice remains.
- Node contract suite: 70 passed, 0 failed.

## Screen 41: Renter Payments (`/user/renter/payments`)

### Scope exercised

- Protected renter shell, current Payments navigation, provider/ledger availability, zero-record state, payment-control foundations, lifecycle states, financial-safety guidance, action availability, payment-health boundary, and protected-route recovery.
- Drawer focus/current-page semantics, responsive control cards and status rows, desktop aside placement, monetary-state scan, target sizing, and console state.
- Viewports: 320, 375, 480, 640, 768, 1024, 1440, and 2560 CSS pixels.

### Findings and resolutions

| Priority | Affected component | Exact problem and root cause | Implemented solution | Responsive behavior and reusable opportunity | Verification |
| --- | --- | --- | --- | --- | --- |
| Critical | Payment and deposit records | The prototype invented rent charges, due dates, a property, paid deposits, zero-value fees, methods, receipts, and an `Up to date` outcome without a payment provider, tenancy ledger, or payment model. | Removed every fictional transaction and reports `0 payment records`; no upcoming, paid, pending, failed, overdue, refunded, disputed, or deposit amount is inferred. | The empty state replaces a wide 780px transaction table and remains readable without horizontal scrolling. Reuse this provider-and-ledger gate for all financial records. | Static contract rejects the property, amounts, statuses, Direct Debit, deposit, and receipt claims. Live text contains no currency symbol or formatted amount. |
| Critical | Payment and method controls | Make-payment, method-change, receipt, deposit-record, and support buttons implied live money movement and stored financial data without provider authorization or endpoints. | Removed all forms, controls, tables, and inline scripts. Only native Applications and Payment support links remain; all financial actions are explicitly unavailable. | Main links remain 48px and supporting links at least 44px; no dense action bar remains on mobile. | Live DOM has zero forms and inputs and only shared drawer buttons. Contract rejects the original controls and scripts. |
| Critical | Financial-data collection | The screen implied raw Direct Debit and payment-method ownership with no regulated provider, strong authentication, mandate contract, tokenization, or PCI boundary. | Prohibits entering bank, card, payment, deposit, or transaction information through Contact or Messages and requires provider-owned collection. | The unavailable status remains prominent in normal flow at all widths. | Mobile and desktop visuals preserve the full financial warning without clipping. |
| High | Obligation and reconciliation ownership | Amounts and status were disconnected from a saved tenancy obligation, provider event, settlement, signed webhook, idempotency, retry, and exception handling. | Defines authoritative obligations, regulated provider collection, reliable reconciliation, and receipt/dispute ownership as launch gates. | Four control cards use one column through 480px and two columns from 640px. | Matrix confirms the 4-to-2 transition with no overflow. |
| High | Lifecycle and status meaning | Paid, due, overdue, failed, refund, dispute, and receipt states had no shared lifecycle or audit record. | Defines four explicit lifecycle stages from authorization through provider processing, ledger posting, receipt, failure, retry, refund, correction, and dispute. | Lifecycle and five action rows stack safely; status values remain on one line. | All rows remain readable with zero status overflow across the full matrix. |
| High | Payment-health inference | Hard-coded `Up to date` and `No overdue payments` converted missing records into a positive renter outcome. | States that missing payment data means neither paid nor overdue and only reconciled provider plus ledger records may support status. | The boundary remains in flow and moves into the desktop aside from 1280px. | Live accessibility snapshot exposes the rule as a named region. |
| Medium | Shell and account context | The screen used a fictional premium account, remote image, fixed offset, and unlabelled icon controls. | Passes authenticated context, reuses the repaired renter shell, native account links, and current Payments state. | Drawer below 1024px; fixed 240px rail from 1024px; main/guidance split from 1280px. | Eight-width containment, active Payments state, drawer focus/Escape behavior, and protected return path pass. |

### Regression result

- Responsive matrix: 8 widths passed with no page overflow, clipped visible content, status overflow, or header overlap.
- Four payment-control cards: one column through 480px; two columns from 640px.
- Four lifecycle stages and five action statuses remain readable and explicitly unavailable at every width.
- Live page contains no currency symbol, formatted payment amount, method, receipt, or inferred payment-health status.
- Support and Applications actions remain 48px; header and drawer targets remain at least 44px.
- Main/guidance layout: stacked through 1024px; 8/4 split from 1280px.
- Payments remains current; mobile drawer transfers focus to Close, closes by Escape, unlocks body scrolling, and restores focus to Open.
- Anonymous live GET redirects to Login with `/user/renter/payments` preserved.
- Browser console: 0 warnings, 0 errors.
- Production CSS build: passed; only the pre-existing non-blocking Browserslist data-age notice remains.
- Node contract suite: 71 passed, 0 failed.

## Screen 42: Renter Messages (`/user/renter/messages`)

### Scope exercised

- Protected renter shell, current Messages navigation, messaging-service availability, zero-conversation state, participant/delivery/safety/retention foundations, lifecycle states, action availability, unread/delivery boundary, and protected-route recovery.
- Drawer focus/current-page semantics, responsive control cards and status rows, desktop aside placement, conversation-artifact scan, target sizing, and console state.
- Viewports: 320, 375, 480, 640, 768, 1024, 1440, and 2560 CSS pixels.

### Findings and resolutions

| Priority | Affected component | Exact problem and root cause | Implemented solution | Responsive behavior and reusable opportunity | Verification |
| --- | --- | --- | --- | --- | --- |
| Critical | Conversation and message records | The prototype invented three property conversations, landlords and agents, application/viewing updates, timestamps, unread markers, and message history without a conversation or message model. | Removed every fictional thread and reports `0 conversations`; no sent, delivered, read, ignored, unread, or urgent state is inferred. | The empty state replaces a multi-pane modal workspace and remains readable at every width. Reuse this durable-record gate for all communication surfaces. | Static contract rejects the fictional properties, people, messages, statuses, and conversation data attributes. Live DOM contains zero conversation artifacts. |
| Critical | Compose and client-only send | A textarea and Send action appended messages to an in-memory JavaScript object, creating false success that disappeared on refresh and bypassed recipient authorization. | Removed the compose field, search, conversation controls, modal, client store, and all inline scripts. Messaging actions are explicitly unavailable. | Native Applications and support links remain 48px; no fixed modal or mobile compose bar remains. | Live DOM has zero forms and inputs and only shared drawer buttons. Contract rejects fields, buttons, scripts, and conversation attributes. |
| High | Participant authorization and housing context | Threads were selected by browser IDs without server-owned accounts, role permissions, related listing/application identity, or membership history. | Requires authorized participants and stable housing-record context for every thread. | Four control cards use one column through 480px and two columns from 640px. | Matrix confirms the 4-to-2 transition without overflow. |
| High | Delivery and status ownership | Timestamps, ordering, unread dots, read state, and viewing/application claims lacked durable storage, idempotency, retries, duplicate prevention, failure recovery, and delivery receipts. | Defines durable delivery plus a four-stage lifecycle from thread authorization through storage, delivery/read state, block/report/export, and deletion. | Lifecycle rows stack on mobile; values remain on one line with zero status overflow. | Four lifecycle stages remain readable across the full matrix. |
| High | Safety, abuse, and attachments | The prototype offered attachments and communication without scanning, access revocation, reporting, blocking, moderation, rate limits, retention, or urgent-safety handling. | Defines reporting/moderation and attachment/retention gates; prohibits passwords, login codes, bank/card data, access codes, and sensitive evidence in general channels. | Safety guidance remains in normal flow and moves into the desktop aside from 1280px. | Mobile and desktop visuals preserve all safety guidance without clipping. |
| Medium | Shell and account context | The screen combined unrelated fictional dashboard content, remote media, a fake premium renter, fixed offsets, and unread header urgency. | Passes authenticated context, reuses the repaired renter shell, highlights the Messages link, and marks Messages current. | Drawer below 1024px; fixed 240px rail from 1024px; main/guidance split from 1280px. | Eight-width containment, active Messages state, drawer focus/Escape behavior, and protected return path pass. |

### Regression result

- Responsive matrix: 8 widths passed with no page overflow, clipped visible content, status overflow, or header overlap.
- Four messaging-control cards: one column through 480px; two columns from 640px.
- Four lifecycle stages and five action statuses remain readable and explicitly unavailable at every width.
- Live DOM contains no conversation IDs, fake inbox, unread indicator, compose field, attachment control, or client-only send path.
- Support and Applications actions remain 48px; header and drawer targets remain at least 44px.
- Main/guidance layout: stacked through 1024px; 8/4 split from 1280px.
- Messages remains current; mobile drawer transfers focus to Close, closes by Escape, unlocks body scrolling, and restores focus to Open.
- Anonymous live GET redirects to Login with `/user/renter/messages` preserved.
- Browser console: 0 warnings, 0 errors.
- Production CSS build: passed; only the pre-existing non-blocking Browserslist data-age notice remains.
- Node contract suite: 72 passed, 0 failed.

## Screen 43: Renter Notifications (`/user/renter/notification-bell`)

### Scope exercised

- Protected renter shell, active Notifications header action, notification-service availability, zero-inbox state, source/inbox/preference/link foundations, lifecycle states, quality guidance, action availability, and protected-route recovery.
- Drawer focus semantics, responsive control cards and status rows, desktop aside placement, notification-artifact scan, target sizing, and console state.
- Viewports: 320, 375, 480, 640, 768, 1024, 1440, and 2560 CSS pixels.

### Findings and resolutions

| Priority | Affected component | Exact problem and root cause | Implemented solution | Responsive behavior and reusable opportunity | Verification |
| --- | --- | --- | --- | --- | --- |
| Critical | Notification records and urgency | The prototype opened with an unread dot and fabricated application, property-match, and document alerts without an event source or notification model. | Removed every sample alert and reports `0 notifications`; no application, viewing, document, payment, message, verification, or account event is inferred. | The empty inbox replaces a fixed-width dropdown and remains readable at every width. Reuse this authoritative-event gate for all notification previews and badges. | Static contract rejects the original alert copy, dropdown, unread actions, fictional account, and sample content. Live DOM contains zero notification artifacts. |
| Critical | Read and inbox controls | Mark-all-read, view-all, dropdown toggling, and linked alerts implied persisted inbox state while JavaScript only changed browser presentation. | Removed all dropdown controls and inline scripts. Read, archive/delete, filters, email delivery, and quiet/mandatory rules are explicitly unavailable. | Settings and dashboard actions remain 48px; no 360px dropdown can overflow small mobile screens. | Live DOM has zero forms and inputs and only shared drawer buttons. Contract rejects buttons, dropdown IDs, and scripts. |
| High | Event and recipient ownership | Alerts had no source record, event type, actor, recipient authorization, timestamp, idempotency, or safe destination contract. | Requires authoritative source events and reauthorization at every linked destination. | Four control cards use one column through 480px and two columns from 640px. | Matrix confirms the 4-to-2 transition with no clipping or page overflow. |
| High | Inbox and delivery lifecycle | Unread dots and alert visibility lacked created, delivered, failed, retried, suppressed, read, archived, deleted, and preference-change history. | Defines persisted inbox state and a four-stage notification lifecycle that separates source events, inbox records, channels, and delivery outcomes. | Lifecycle rows stack on mobile; values remain on one line with zero status overflow. | All four lifecycle stages remain readable across the full matrix. |
| High | Preferences, privacy, and quality | The prototype exposed broad alert previews without category preferences, verified channels, mandatory-service rules, quiet handling, or controls against sensitive content and false urgency. | Requires user-owned category/channel preferences and quality rules that prohibit fabricated urgency, unsupported unread dots, and sensitive preview data. | Guidance remains in normal flow and moves into the desktop aside from 1280px. | Mobile and desktop visuals preserve every quality rule without clipping. |
| Medium | Shell and account context | The screen included unrelated fictional dashboard content, a premium account, remote images, and fixed layout assumptions. | Passes authenticated context, reuses the repaired renter shell, and gives the Notifications header link the active state. | Drawer below 1024px; fixed 240px rail from 1024px; main/guidance split from 1280px. | Eight-width containment, active Notifications action, drawer focus/Escape behavior, and protected return path pass. |

### Regression result

- Responsive matrix: 8 widths passed with no page overflow, clipped visible content, status overflow, or header overlap.
- Four notification-control cards: one column through 480px; two columns from 640px.
- Four lifecycle stages and five action statuses remain readable and explicitly unavailable at every width.
- Live DOM contains no notification dropdown, unread marker, sample alert, mark-as-read control, or client-only inbox behavior.
- Settings and dashboard actions remain 48px; header and drawer targets remain at least 44px.
- Main/guidance layout: stacked through 1024px; 8/4 split from 1280px.
- Mobile drawer transfers focus to Close, closes by Escape, unlocks body scrolling, and restores focus to Open.
- Anonymous live GET redirects to Login with `/user/renter/notification-bell` preserved.
- Browser console: 0 warnings, 0 errors.
- Production CSS build: passed; only the pre-existing non-blocking Browserslist data-age notice remains.
- Node contract suite: 73 passed, 0 failed.

## Screen 44: Renter Profile (`/user/renter/profile`)

### Scope exercised

- Protected renter shell, active Profile header action, authenticated identity, persisted renter-onboarding context, account journeys, data provenance, profile boundaries, and protected-route recovery.
- Drawer focus semantics, responsive detail cards, desktop guidance placement, target sizing, unsupported-control scan, and console state.
- Viewports: 320, 375, 480, 640, 768, 1024, 1440, and 2560 CSS pixels.

### Findings and resolutions

| Priority | Affected component | Exact problem and root cause | Implemented solution | Responsive behavior and reusable opportunity | Verification |
| --- | --- | --- | --- | --- | --- |
| Critical | Account identity and profile editing | The prototype rendered a fictional `Alex S.` identity, blank edit fields, browser-only photo preview, and a Save Profile action without an update endpoint or storage contract. | Renders the authenticated name, email, role, and saved renter-onboarding context. Removed every unsupported input, upload, remove, and save control. | Account values stack cleanly on mobile and align as definition rows from 640px. Reuse authenticated account context instead of local profile placeholders. | Static contract rejects the fictional account and all edit controls. Live DOM renders Audit Renter and `audit@example.com` with zero forms and inputs. |
| Critical | Persisted renter context | Account fields ignored `renterProfile`, so the screen could not distinguish saved values from empty placeholders or browser state. | Route passes the saved renter profile; the view renders legal name, phone, household, pets, employment, job, employer, budget, preferred locations, property type, and move-in date with explicit missing states. | Eleven detail cards use one column through 480px and two columns from 640px without text clipping. | Fixture values render from server locals; missing move-in date reports `Not provided`; budget states that currency is not recorded. |
| High | Data provenance and sharing | Prototype copy implied a public profile and application-ready sharing without consent, recipient, scope, or verification state. | Identifies onboarding answers as self-reported, states the page is neither a published profile nor an application preview, and does not infer sharing consent or verification. | Boundaries remain in normal flow and move into the desktop aside from 1440px. | Accessibility snapshot exposes named account and boundary regions; all boundary text remains visible at every width. |
| High | Account journeys | Browser-only controls obscured the supported paths for updating onboarding, preparing verification, resetting a password, and opening support. | Uses native links to Onboarding, Verification, Settings, Password Recovery, and Support; no unsupported mutation is presented. | Primary journeys remain at least 44px and cards stack before the desktop split. | Link targets and touch sizes pass live checks. |
| Medium | Shell and current route | Fixed desktop offsets, fictional header identity, and non-navigation buttons broke mobile layout and current-page semantics. | Reuses the repaired renter shell, authenticated header identity, native header links, and active Profile state. | Drawer below 1024px; fixed 240px rail from 1024px; main/guidance split from 1440px. | Eight-width containment, active Profile state, drawer focus/Escape behavior, and protected return path pass. |

### Regression result

- Responsive matrix: 8 widths passed with no page overflow, clipped visible content, card overflow, or header overlap.
- Eleven saved-detail cards: one column through 480px; two columns from 640px.
- Main/guidance layout: stacked through 1024px; split from 1440px.
- Onboarding and Support actions are 44px; header and drawer targets remain at least 44px.
- Profile remains current; mobile drawer transfers focus to Close, closes by Escape, unlocks body scrolling, and restores focus to Open.
- Anonymous live GET redirects to Login with `/user/renter/profile` preserved.
- Browser console: 0 warnings, 0 errors.
- Production CSS build: passed; only the pre-existing non-blocking Browserslist data-age notice remains.
- Node contract suite: 75 passed, 0 failed.

## Screen 45: Renter Settings (`/user/renter/settings`)

### Scope exercised

- Protected renter shell, active Settings states, authenticated account summary, supported account journeys, unsupported preference boundaries, privacy guidance, sign-out, and protected-route recovery.
- Mobile header action visibility, drawer focus/current-page semantics, responsive journey cards and status rows, desktop guidance placement, target sizing, and console state.
- Viewports: 320, 375, 480, 640, 768, 1024, 1440, and 2560 CSS pixels.

### Findings and resolutions

| Priority | Affected component | Exact problem and root cause | Implemented solution | Responsive behavior and reusable opportunity | Verification |
| --- | --- | --- | --- | --- | --- |
| Critical | Preferences and sharing controls | The prototype exposed rental, household, application-sharing, and notification controls with Save actions but no settings model, endpoints, consent record, or enforcement path. | Removed all 27 inputs, selects, textareas, toggles, and save/clear actions. Reports rental-match, default sharing, and notification preferences as unavailable until persistence exists. | Four compact status rows replace long mobile forms and remain readable at every width. Reuse this server-capability gate on account settings screens. | Static contract rejects every original control and save action; live DOM has zero forms and inputs. |
| Critical | Account and privacy mutations | Password, email, sessions, data requests, and account closure were working-looking buttons without verified handlers, re-authentication, export jobs, deletion lifecycle, or session inventory. | Keeps only the real Password Recovery journey; marks email and role changes unavailable; routes privacy requests to Contact with a sensitive-data warning; documents deletion gates. | Account rows stack below 640px and align horizontally at larger widths without clipped actions. | Source scan rejects Change Password, Update Email, Review Sessions, Request Information, and all buttons. |
| High | Sharing context and sensitive data | Global sharing toggles implied consent outside a specific application, while support copy did not limit sensitive attachments. | States that application sharing must be reviewed per application and warns against sending identity, income, banking, or tenancy documents in the first support message. | Boundaries stay in flow and move into the desktop guidance column from 1440px. | Named regions expose both privacy guidance and boundaries; text is fully visible throughout the matrix. |
| High | Real account journeys | Fictional controls displaced the supported Profile, Onboarding, Password Recovery, Contact, and Sign-out routes. | Presents only native links to those existing journeys and renders the authenticated account email and role. | Two journey cards use one column through 480px and two columns from 640px; every action is at least 44px. | Audit fixture renders `audit@example.com`; all link targets and target sizes pass. |
| High | Small-screen Settings visibility | Shared CSS hid the Settings header action below 480px, including when Settings was the current page, leaving no visible active account action until the drawer opened. | Removed the hide rule. The repaired two-row header displays Notifications, Messages, Settings, and Profile as four stable 44px actions. Added a regression contract against reintroducing the rule. | At 320 and 375px the action row remains contained with zero page overflow; the active Settings action stays visible. Profile was regression-checked with the same four-action header. | Live geometry confirms four 44px actions, 129px header height, zero overlap, and zero overflow at 320px. |
| Medium | Shell and account context | The screen used a fictional account, fixed 280px offset, search placeholder, and non-navigating icon buttons. | Passes authenticated context, reuses the repaired renter shell, and exposes current Settings in both header and sidebar/drawer. | Drawer below 1024px; fixed 240px rail from 1024px; main/guidance split from 1440px. | Eight-width containment, drawer focus/Escape behavior, desktop rail alignment, and protected return path pass. |

### Regression result

- Responsive matrix: 8 widths passed with no page overflow, clipped content, status overflow, or header overlap.
- Two account-journey cards: one column through 480px; two columns from 640px.
- Four preference statuses remain explicit and contained at every width.
- Main/guidance layout: stacked through 1024px; split from 1440px.
- All four account header actions remain visible and 44px at 320px; Settings remains visibly current.
- Mobile drawer transfers focus to Close, closes by Escape, unlocks body scrolling, restores focus to Open, and exposes Settings as current.
- Anonymous live GET redirects to Login with `/user/renter/settings` preserved.
- Browser console: 0 warnings, 0 errors.
- Production CSS build: passed; only the pre-existing non-blocking Browserslist data-age notice remains.
- Node contract suite: 77 passed, 0 failed.

## Screen 46: Renter Support (`/user/renter/support`)

### Scope exercised

- Protected renter shell, current Support navigation, self-service capability, authoritative topic routes, native current-answer disclosures, contact delivery boundary, sensitive-data guidance, emergency-service boundary, and protected-route recovery.
- Drawer focus/current-page semantics, responsive topic cards and disclosures, desktop guidance placement, target sizing, and console state.
- Viewports: 320, 375, 480, 640, 768, 1024, 1440, and 2560 CSS pixels.

### Findings and resolutions

| Priority | Affected component | Exact problem and root cause | Implemented solution | Responsive behavior and reusable opportunity | Verification |
| --- | --- | --- | --- | --- | --- |
| Critical | Support submission and ticket state | The prototype exposed two Submit Request buttons and promised a recent-request inbox without a support model, endpoint, ticket identifier, ownership rule, or history service. | Removed fake submission and request-history controls. Routes enquiries to the validated Contact form and states that email delivery depends on configuration; no inbox, ticket history, live chat, or response-time tracking is inferred. | A concise capability band replaces search and request toolbars at every width. Reuse this Contact-delivery boundary for role support screens. | Static contract rejects submit controls, recent-request copy, and buttons; live DOM has zero forms and inputs. |
| High | Help guidance accuracy | Mock guides claimed renter-profile completion, application document upload/sharing, HomiScore behavior, and verification timing beyond connected services. | Replaced them with six links to authoritative workspaces and three current-state answers covering application persistence, score readiness, and support-request visibility. | Six cards use one column through 480px and two columns from 640px. Three native disclosures remain contained with 48px targets. | All routes and disclosure counts pass; first disclosure opens and closes by native summary interaction. |
| High | Sensitive data and urgent help | The original contact prompt did not clearly prohibit sensitive evidence or distinguish product support from emergency, property, utility, and legal services. | Adds explicit exclusions for passwords, identity/income documents, financial data, tokens, and full applications; states that HomiFund is not an emergency service. | Safety guidance remains in normal flow and moves into the desktop aside from 1440px. | Named safety and urgent-help regions remain fully visible throughout the matrix. |
| High | Request quality and feedback | The screen implied a request workflow without explaining useful diagnostic context or delivery failure handling. | Lists safe reproduction details and states that Contact surfaces explicit success or delivery-error feedback. | Guidance cards stack below the desktop split and do not require a fixed sidebar. | Contact action remains 48px; no small interactive target is present. |
| Medium | Shell and current route | The screen used a fictional account, unread urgency, search placeholders, fixed 280px offset, and non-navigation icon buttons. | Passes authenticated context, reuses the repaired renter shell, native account links, and active Support sidebar/drawer state. | Drawer below 1024px; fixed 240px rail from 1024px; main/guidance split from 1440px. | Eight-width containment, drawer focus/Escape behavior, desktop rail alignment, and protected return path pass. |

### Regression result

- Responsive matrix: 8 widths passed with no page overflow, clipped visible content, disclosure overflow, or header overlap.
- Six help-topic cards: one column through 480px; two columns from 640px.
- Three native answer disclosures remain contained and toggle correctly.
- Main/guidance layout: stacked through 1024px; split from 1440px.
- All visible links, disclosures, header actions, and drawer controls meet the 44px target floor.
- Mobile drawer transfers focus to Close, closes by Escape, unlocks body scrolling, restores focus to Open, and exposes Support as current.
- Anonymous live GET redirects to Login with `/user/renter/support` preserved.
- Browser console: 0 warnings, 0 errors.
- Production CSS build: passed; only the pre-existing non-blocking Browserslist data-age notice remains.
- Node contract suite: 78 passed, 0 failed.

## Screen 47: Renter Viewing Detail (`/user/renter/view-detail`)

### Scope exercised

- Protected renter shell, current Applications navigation, appointment-record availability, zero-record state, scheduling foundations, lifecycle requirements, action availability, safety guidance, status boundary, and protected-route recovery.
- Drawer focus/current-page semantics, responsive foundation cards and action rows, desktop guidance placement, target sizing, unsupported-data scan, console state, and transient-paint recapture.
- Viewports: 320, 375, 480, 640, 768, 1024, 1440, and 2560 CSS pixels.

### Findings and resolutions

| Priority | Affected component | Exact problem and root cause | Implemented solution | Responsive behavior and reusable opportunity | Verification |
| --- | --- | --- | --- | --- | --- |
| Critical | Viewing and property record | The prototype invented a confirmed viewing, property, date, time, address, host, rent, amenities, remote image, and status without any property, application, viewing, or calendar model. | Removed every fictional appointment and property field and reports `0 scheduled viewings`; no requested, confirmed, changed, cancelled, missed, or completed status is inferred. | The zero-record state remains readable without a desktop-only detail card or remote media. Reuse this authoritative-record gate for calendar and appointment surfaces. | Static contract rejects all original people, property, time, location, price, image, and status claims. Live DOM exposes the expected zero-record state. |
| Critical | Viewing mutation controls | Message, reschedule, cancel, and modal-confirm controls only changed browser presentation and had no recipient authorization, persistence, conflict handling, notification delivery, or failure state. | Removed the dialog, dynamic fields, all action buttons, and inline JavaScript. Message, request/confirm, reschedule, cancel, and calendar export are explicitly unavailable. | Five compact action rows replace the fixed action panel and stay contained at every width. | Live DOM has zero forms and inputs and only shared drawer buttons. Contract rejects controls, modal content, and inline scripts. |
| Critical | Application and score disclosure | The prototype claimed the application was shared, the landlord could view it, and the renter had an excellent 874 score and strong fit without consent, evidence, scoring, or fairness contracts. | Removed every sharing, score, suitability, and application-status claim. Defines a persisted related application as a prerequisite, not an inferred outcome. | Status boundary remains visible in the guidance flow and moves beside the main column on desktop. | Source and live-text scans contain no score, fit, submitted, or shared-profile artifact. |
| High | Scheduling ownership and lifecycle | Appointment changes had no stable participants, property availability, timezone, proposal expiry, transition history, concurrency control, delivery result, or retention policy. | Defines four server-owned foundations and a four-stage lifecycle from proposal through confirmation, change/cancellation, completion, and retention. | Four foundation cards use one column through 480px and two columns from 640px; lifecycle rows stack safely. | Matrix confirms card transition, four lifecycle steps, five contained action rows, and zero status overflow. |
| High | Viewing safety | A fictional confirmation could cause travel to an unverified address, while the page encouraged identity sharing and messaging without verified contacts. | Warns renters not to travel until authoritative property, address, time, host, and status exist; prohibits sensitive data through unverified contacts and redirects urgent safety to local services. | The error guidance stays prominent in normal flow and moves into the desktop aside from 1440px. | Mobile and desktop visuals preserve the complete warning without clipping. |
| Medium | Shell and route ownership | The screen used a fictional premium account, unread urgency, fixed offsets, relative navigation, and unlabeled icon controls. | Passes authenticated context, reuses the repaired renter shell, uses absolute routes, and keeps Applications current as the owning workspace. | Drawer below 1024px; fixed 240px rail from 1024px; main/guidance split from 1440px. | Eight-width containment, active Applications state, drawer focus/Escape behavior, desktop rail alignment, and protected return path pass. |

### Regression result

- Responsive matrix: 8 widths passed with no page overflow, clipped visible content, status overflow, or header overlap.
- Four viewing-foundation cards: one column through 480px; two columns from 640px.
- Four lifecycle stages and five viewing-action statuses remain readable and explicitly unavailable at every width.
- Main/guidance layout: stacked through 1024px; split from 1440px.
- Applications, Support, header, and drawer actions meet the 44px target floor.
- Applications remains current; mobile drawer transfers focus to Close, closes by Escape, unlocks body scrolling, and restores focus to Open.
- Anonymous live GET redirects to Login with `/user/renter/view-detail` preserved.
- Browser console: 0 warnings, 0 errors.
- The first desktop screenshot contained a transient black renderer artifact; reload and an 800ms paint-settle check produced a complete frame with visible computed styles and correct geometry.
- Production CSS build: passed; only the pre-existing non-blocking Browserslist data-age notice remains.
- Node contract suite: 79 passed, 0 failed.

## Screen 48: Renter Property Detail (`/user/renter/view-property`)

### Scope exercised

- Protected renter shell, current Applications navigation, listing-record availability, zero-record state, property foundations, listing lifecycle, action availability, renter safety guidance, listing boundary, and protected-route recovery.
- Drawer focus/current-page semantics, responsive foundation cards and action rows, desktop guidance placement, target sizing, unsupported media/data scan, and console state.
- Viewports: 320, 375, 480, 640, 768, 1024, 1440, and 2560 CSS pixels.

### Findings and resolutions

| Priority | Affected component | Exact problem and root cause | Implemented solution | Responsive behavior and reusable opportunity | Verification |
| --- | --- | --- | --- | --- | --- |
| Critical | Property and listing record | The prototype invented a property, landlord context, price, location, availability, match score, room facts, policies, amenities, and description without a Property model or listing controller. | Removed every fictional listing field and reports `0 available listings`; no property, price, match, location, availability, amenity, or application opportunity is inferred. | The zero-record state replaces a desktop gallery/detail composition and remains readable at every width. Reuse this authoritative-listing gate anywhere property data is referenced. | Static contract rejects all original property, price, match, availability, location, and amenity claims. Live DOM exposes the expected zero-record state. |
| Critical | Remote gallery and browser-only save | Four remote images, thumbnail state, photo cycling, and bookmark state were entirely client-owned, lacked dimensions/provenance, and disappeared on refresh. | Removed all images, gallery controls, data attributes, save state, and inline JavaScript. Media storage, provenance, alternatives, dimensions, moderation, and removal history are explicit foundations. | No media or gallery grid can clip, shift layout, or depend on third-party availability. | Live DOM has zero images, forms, and inputs and only shared drawer buttons. Contract rejects remote URLs, image elements, gallery attributes, and scripts. |
| Critical | Enquiry, viewing, and application actions | Start Application, Request Viewing, and Send Enquiry implied authorized records and persisted workflows while only navigating to unrelated pages. | Lists save, enquiry, viewing, application, and sharing as unavailable until server-owned listing relationships and channels exist. | Five compact status rows stay readable and contained at every width. | Contract positively requires all five unavailable actions and rejects the former working controls. |
| High | Listing ownership and lifecycle | Public facts had no stable property identity, owner authorization, publication state, address privacy, term history, action-time availability, or withdrawal audit. | Defines four listing foundations and a four-stage lifecycle from validation through publication, renter action, update, and withdrawal. | Four foundation cards use one column through 480px and two columns from 640px; lifecycle rows stack safely. | Matrix confirms card transition, four lifecycle stages, five contained action rows, and zero status overflow. |
| High | Renter safety | Fabricated availability could encourage travel, payment, signing, or sensitive evidence disclosure through an unverified contact. | Warns renters not to travel, pay, sign, or provide evidence until property, owner, terms, and channel are authoritative; prohibits sensitive data through unverified contacts. | Safety guidance remains in normal flow and moves into the desktop aside from 1440px. | Mobile and desktop visuals preserve the complete warning without clipping. |
| Medium | Shell and route ownership | The screen used a fictional account, fixed offsets, relative navigation, unlabeled controls, and no current-page state. | Passes authenticated context, reuses the repaired renter shell, uses absolute routes, and keeps Applications current as the owning workspace. | Drawer below 1024px; fixed 240px rail from 1024px; main/guidance split from 1440px. | Eight-width containment, active Applications state, stabilized drawer focus/Escape behavior, desktop rail alignment, and protected return path pass. |

### Regression result

- Responsive matrix: 8 widths passed with no page overflow, clipped visible content, status overflow, or header overlap.
- Four listing-foundation cards: one column through 480px; two columns from 640px.
- Four lifecycle stages and five property-action statuses remain readable and explicitly unavailable at every width.
- Live DOM contains no remote image, gallery, bookmark state, fictional listing, price, match score, or action form.
- Main/guidance layout: stacked through 1024px; split from 1440px.
- Applications, Support, header, and drawer actions meet the 44px target floor.
- Applications remains current; mobile drawer transfers focus to Close, closes by Escape, unlocks body scrolling, and restores focus to Open after the viewport settles.
- Anonymous live GET redirects to Login with `/user/renter/view-property` preserved.
- Browser console: 0 warnings, 0 errors.
- Production CSS build: passed; only the pre-existing non-blocking Browserslist data-age notice remains.
- Node contract suite: 80 passed, 0 failed.

## Screen 49: Admin Management (`/admin/management`)

### Scope exercised

- Protected admin shell, current Management navigation, authenticated admin context, administration-service availability, operational areas, governance foundations, management actions, sensitive-data guidance, data boundary, and protected-route recovery.
- Admin sidebar current semantics, drawer focus/current-page behavior, responsive control cards and status rows, desktop guidance placement, target sizing, and console state.
- Viewports: 320, 375, 480, 640, 768, 1024, 1440, and 2560 CSS pixels.

### Findings and resolutions

| Priority | Affected component | Exact problem and root cause | Implemented solution | Responsive behavior and reusable opportunity | Verification |
| --- | --- | --- | --- | --- | --- |
| Critical | Administration data and actions | The screen had no connected account, property, verification, payment, search, pagination, mutation, or audit service, but did not define which records or actions were unavailable. | Reports `0 actionable records`, names all four operational areas, and marks search/filter, access changes, moderation, exports, and audit history unavailable. | Nine compact status rows stay readable at every width without a placeholder table or fake metrics. Reuse this capability gate on all admin modules. | Static contract rejects form controls and mutation buttons. Live DOM has zero forms and inputs and only shared drawer buttons. |
| High | Administrative authorization | A role check protected the route, but the page did not communicate least privilege, granular permissions, re-authentication, sensitive-field masking, or action-time authorization. | Defines least privilege and data minimization as launch gates, including named permissions, role scope, re-authentication, purpose limitation, and masked fields. | Four governance cards use one column through 480px and two columns from 640px. | Matrix confirms card transition with no clipping or page overflow. |
| High | Auditability and recovery | Management actions had no actor/reason history, before/after state, correlation identifier, confirmation, dual control, correction, appeal, or failure recovery contract. | Defines an immutable audit trail plus review and recovery requirements before any administrative mutation is exposed. | Governance content remains in normal flow and does not depend on a fixed desktop panel. | Accessibility snapshot exposes all governance cards as named articles. |
| High | Sensitive cross-account data | The prior page lacked a clear boundary against passwords, secrets, full payment details, unrestricted identity evidence, and cross-account leakage. | Adds a prominent sensitive-data boundary and requires authorization plus audit events for every sensitive read and mutation. | Error guidance stays visible in flow and moves into the desktop aside from 1440px. | Mobile and desktop visuals preserve the complete warning without clipping. |
| Medium | Admin shell and current route | The header omitted authenticated context, the sidebar had visual selection without `aria-current`, and the mobile drawer could not expose the current admin page semantically. | Passes authenticated context, uses the repaired shared shell, adds exact current semantics to both admin links, labels icons, and uses native Verification/Logout actions. | Drawer below 1024px; fixed 240px rail from 1024px; main/guidance split from 1440px. | Eight-width containment, active Management state, drawer focus/Escape behavior, desktop rail alignment, and protected return path pass. |

### Regression result

- Responsive matrix: 8 widths passed with no page overflow, clipped visible content, status overflow, or header overlap.
- Four administration-control cards: one column through 480px; two columns from 640px.
- Four operational areas and five management actions remain readable and explicitly unavailable at every width.
- Main/guidance layout: stacked through 1024px; split from 1440px.
- Verification Review, Logout, header, and drawer actions meet the 44px target floor.
- Management remains current; mobile drawer transfers focus to Close, closes by Escape, unlocks body scrolling, and restores focus to Open.
- Anonymous live GET redirects to Login with `/admin/management` preserved.
- Browser console: 0 warnings, 0 errors.
- Production CSS build: passed; only the pre-existing non-blocking Browserslist data-age notice remains.
- Node contract suite: 81 passed, 0 failed.

## Screen 50: Admin Verification Review (`/admin/verification-review`)

### Scope exercised

- Protected admin shell, current Verification Review navigation, authenticated admin context, verification-service availability, required case record, review workflow, action availability, sensitive-evidence guidance, decision boundary, and protected-route recovery.
- Admin sidebar current semantics, shared skip-link semantics, drawer focus/current-page behavior, responsive workflow cards and case rows, desktop guidance placement, target sizing, unsupported-control scan, and server state.
- Viewports: 320, 375, 480, 640, 768, 1024, 1440, and 2560 CSS pixels.

### Findings and resolutions

| Priority | Affected component | Exact problem and root cause | Implemented solution | Responsive behavior and reusable opportunity | Verification |
| --- | --- | --- | --- | --- | --- |
| Critical | Verification cases and review actions | No verification provider, case model, evidence store, decision endpoint, appeal record, notification service, or audit history exists, but the sparse placeholder did not define which records and actions were unavailable. | Reports `0 verification cases`, defines the six required case-record areas, and marks search, evidence access, information requests, decisions, appeals, exports, and history unavailable. No fake table, case, filter, drawer, or mutation control is rendered. | Case rows stack their status below the description on phones and align it to the right from 640px. Reuse the authoritative-service gate when a queue has no connected record source. | Static contract requires the zero-case boundary and rejects tables, fields, buttons, inline handlers, and page-local scripts. Live DOM contains no main-content table, form field, or button. |
| High | Sensitive identity evidence | The previous message referenced identity checks without defining purpose limitation, redaction, authorization, retention, audit access, or prohibited data. | Adds a prominent evidence boundary that prohibits passwords, full identity documents, biometric data, provider secrets, and unrelated account records, and requires purpose, authorization, redaction, retention, and audit controls. | The warning remains in normal flow and moves into the desktop guidance column from 1440px. | Mobile and desktop visuals preserve the complete warning without clipping or horizontal overflow. |
| High | Decision provenance and recovery | The placeholder named pending, approved, and declined states without defining signed provider events, assignments, reviewer conflicts, structured reasons, policy versions, notices, corrections, or appeals. | Defines four server-owned workflow stages covering intake/assignment, evidence access, reasoned decisions, and notice/recovery. No state or compliance conclusion is inferred without a connected case. | Four workflow cards use one column through 480px and two columns from 640px. | Matrix confirms the card transition and six case-record rows with no clipped visible content. |
| Medium | Admin context and current route | The route omitted `currentUser`, the header did not identify the authenticated administrator, and shared same-path matching incorrectly marked the skip link as the current page. | Passes `req.user`, renders the authenticated display name, keeps Verification Review current in the sidebar, labels header icon links, and excludes hash links from page-current matching. | Drawer below 1024px; fixed 240px rail from 1024px; main/guidance split from 1440px. | Exactly one element has `aria-current="page"`; the skip link remains neutral. The mobile drawer transfers focus to Close, closes with Escape, unlocks scrolling, and restores focus to Open. |

### Regression result

- Responsive matrix: 8 widths passed with no page overflow, clipped visible content, status overflow, or header overlap.
- Four review-workflow cards: one column through 480px; two columns from 640px.
- Six required case-record areas and six review-action statuses remain readable and explicitly unavailable at every width.
- Main/guidance layout: stacked through 1024px; split from 1440px.
- Management, Logout, header, and drawer actions meet the 44px target floor.
- Verification Review is the sole current page; mobile drawer focus, Escape, scroll lock, and focus restoration pass.
- Anonymous live GET redirects to Login with `/admin/verification-review` preserved.
- Main application and audit renderer return `200`; both server error logs are empty.
- Shared JavaScript syntax check: passed.
- Production CSS build: passed; only the pre-existing non-blocking Browserslist data-age notice remains.
- Node contract suite: 83 passed, 0 failed.

## Screen 51: Role-Denied State (`main/403`)

### Scope exercised

- Renter, landlord, admin, and no-role recovery contracts; authenticated public shell; denied-request privacy; workspace and support journeys; mobile navigation; and exact 403 response behavior.
- Viewports: 320, 375, 480, 640, 768, 1024, 1440, and 2560 CSS pixels.

### Findings and resolutions

| Priority | Affected component | Exact problem and root cause | Implemented solution | Responsive behavior and reusable opportunity | Verification |
| --- | --- | --- | --- | --- | --- |
| Critical | Role-aware recovery | The template concatenated `userRole` into a URL. A signed-in account with no finalized role received `/user/null/dashboard`, and template callers could omit the destination entirely. | Middleware now resolves recovery with the strict `getRoleHome` allowlist; the template validates the supplied local and safely falls back to `/role-selection`. | Both actions stack and fill the phone content width, then become an inline pair from 640px. | Middleware tests pass for renter, landlord, admin, and null roles. All actions remain 48px and contained across the matrix. |
| High | Authenticated context | The 403 renderer omitted `currentUser`, so the shared header showed Login and Sign Up to a user who was already authenticated. | Passes the authenticated user and renders the normal signed-in header with Sign out. | Identity copy is hidden at compact widths while the sign-out and menu controls remain available. | Live renter fixture shows the signed-in state; no anonymous auth action appears. |
| High | Denied-resource privacy | Generic recovery copy did not explain that a denial must not disclose record existence, missing permission details, or sensitive evidence. | Adds a concise permission-privacy boundary and preserves the denied URL server-side without displaying its query values. | Recovery/privacy guidance stacks on phones and forms two equal sections from 768px. | Source and live DOM expose no requested path, permission name, resource identity, field, form, or mutation control. |
| Medium | Error-page interaction | The state used correct links but lacked an explicit no-change reassurance and its recovery hierarchy was weak. | Adds a clear 403 label, no-change message, primary workspace recovery, secondary support link, and named next-step guidance. | Centered error content remains restrained and readable through ultra-wide screens. | H1, two native links, 48px targets, mobile drawer focus/Escape behavior, and zero overflow pass. |

### Regression result

- Responsive matrix: 8 widths passed with no page overflow or clipped visible main content.
- Actions stack through 480px and align in one row from 640px; both remain at least 48px high.
- Public mobile drawer opens without overflow, focuses Close, closes with Escape, and restores focus to Open.
- Role-denial middleware tests: renter, landlord, admin, and no-role recovery passed.
- Production CSS build: passed; only the pre-existing non-blocking Browserslist data-age notice remains.
- Node contract suite: 85 passed, 0 failed.

## Screen 52: Not-Found State (`main/404`)

### Scope exercised

- Anonymous and authenticated recovery, exact 404 status/title/H1, missing-address privacy, help journey, public mobile navigation, target sizing, and real catch-all behavior.
- Viewports: 320, 375, 480, 640, 768, 1024, 1440, and 2560 CSS pixels.

### Findings and resolutions

| Priority | Affected component | Exact problem and root cause | Implemented solution | Responsive behavior and reusable opportunity | Verification |
| --- | --- | --- | --- | --- | --- |
| High | Authenticated recovery | The catch-all omitted `currentUser` and always sent users Home, so authenticated users appeared signed out and lost their workspace context. | Passes authenticated context and a `getRoleHome` destination; anonymous recovery remains Home and no-role recovery remains role selection. The template validates its recovery locals. | Primary and help actions stack through 480px and align from 640px. | Authenticated audit fixture reaches the renter workspace; anonymous live response uses Home. Both links remain 48px. |
| High | Missing-address privacy | The state did not define whether a malformed path or query string could be reflected into the page or support link. | Preserves the original URL server-side but does not render it; warns users to remove sensitive values before sharing a broken link. | Privacy guidance stacks below recovery and forms two sections from 768px. | A live request containing a sample secret query returns 404 while neither the path nor query appears in the HTML. |
| Medium | Recovery hierarchy and semantics | The page used a large text-only code, a single Home action, `transition-all`, and an icon without decorative semantics. | Uses a restrained status icon, exact error label and H1, specific recovery copy, native workspace/Home and Help links, scoped transitions, and hidden decorative icons. | Content remains centered and width-bounded without excessive ultra-wide whitespace. | Eight-width matrix reports zero overflow/clipping, no fields/buttons, and correct 48px links. |

### Regression result

- Live missing URL returns `404`, title `404 | Page Not Found`, and H1 `Page not found`.
- Missing path and query values are not reflected in the response.
- Responsive matrix: 8 widths passed with zero page overflow or clipped visible main content.
- Actions stack through 480px and align from 640px; both remain 48px high.
- Production CSS build: passed; only the pre-existing non-blocking Browserslist data-age notice remains.
- Node contract suite: 86 passed, 0 failed.

## Screen 53: Unexpected-Error State (`main/500`)

### Scope exercised

- Error-middleware status/render contract, anonymous and authenticated recovery, partial-write uncertainty, unsafe retry prevention, support escalation, private diagnostics, mobile navigation, and target sizing.
- Viewports: 320, 375, 480, 640, 768, 1024, 1440, and 2560 CSS pixels.

### Findings and resolutions

| Priority | Affected component | Exact problem and root cause | Implemented solution | Responsive behavior and reusable opportunity | Verification |
| --- | --- | --- | --- | --- | --- |
| Critical | Transaction outcome honesty | The page guaranteed `Your information has not been changed`, which the server cannot know after an unexpected failure; a write may have completed or partially completed. | States that the outcome is unconfirmed and instructs users to inspect authoritative workspace state before repeating payments, submissions, publication, or account changes. | The critical guidance remains visible in normal flow without a modal or dismissible toast. | Static and live-text scans reject the original guarantee and blind-retry wording. |
| High | Unsafe retry behavior | An inline `window.location.reload()` button repeated the request without knowing its method, idempotency, or mutation state. | Removes reload entirely and uses native workspace/Home recovery plus Contact support. No POST or mutation is replayed from the error page. | Actions stack through 480px and align from 640px, each remaining 48px. | Live DOM has zero buttons, fields, inline handlers, or page-local scripts. |
| High | Authenticated recovery and diagnostic privacy | The error renderer omitted the current user and offered only Home; request and stack-detail boundaries were undefined. | Passes signed-in context and strict role-home recovery while keeping the requested URL, exception message, stack, and provider details out of rendered HTML. | Signed-in header remains responsive and consistent with 403/404. | Contract requires the 500 renderer, current user, and role-aware destination; source rejects rendered error internals. |
| Medium | Recovery guidance | The generic message did not tell users what to verify or what support can safely use. | Adds specific state-check guidance and asks for time/action context while prohibiting passwords, payment details, identity documents, and provider secrets. | Guidance stacks on phones and forms two sections from 768px. | Eight-width matrix reports no overflow/clipping and preserves all guidance. |

### Regression result

- Responsive matrix: 8 widths passed with zero page overflow or clipped visible main content.
- Actions stack through 480px and align from 640px; both remain 48px high.
- Error template renders no retry button, mutation control, request URL, exception message, or stack trace.
- Main application health: `ok`, MongoDB connected; audit renderer returns `200`; both error logs are empty.
- Shared JavaScript syntax check: passed.
- Production CSS build: passed; only the pre-existing non-blocking Browserslist data-age notice remains.
- Node contract suite: 95 passed, 0 failed.

## Completion Status

- All 53 inventoried screen templates have completed their screen-by-screen implementation and regression gate.
- The responsive matrix covers 320, 375, 480, 640, 768, 1024, 1440, and 2560 CSS pixels for every rebuilt screen.
- Shared navigation corrections, exact current-route semantics, centered status icons, protected-route recovery, and 403/404/500 states are included in the final regression suite.
