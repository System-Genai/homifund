const fs = require("fs");
const path = require("path");
const test = require("node:test");
const assert = require("node:assert/strict");
const ejs = require("ejs");

const projectRoot = path.resolve(__dirname, "..");
const viewsRoot = path.join(projectRoot, "views");

function collectFiles(directory, extension) {
  const files = [];

  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const fullPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      files.push(...collectFiles(fullPath, extension));
    } else if (entry.name.endsWith(extension)) {
      files.push(fullPath);
    }
  }

  return files;
}

const allTemplates = collectFiles(viewsRoot, ".ejs");
const screenTemplates = allTemplates.filter(
  (file) => !file.split(path.sep).includes("partials"),
);

test("all screen templates render with shared locals", async () => {
  assert.equal(screenTemplates.length, 53);

  for (const file of screenTemplates) {
    await assert.doesNotReject(() =>
      ejs.renderFile(file, {
        title: "UI contract test",
        currentPage: "dashboard",
        role: "renter",
        userRole: "renter",
        requestedUrl: "/",
        returnTo: null,
        notice: null,
        error: null,
        success: null,
        email: "",
        form: {},
        fieldErrors: {},
        token: "test-token",
        invalid: false,
        currentUser: null,
        selectedRole: null,
      }),
    );
  }
});

test("every screen owns one main landmark, one h1, and one shared script", () => {
  for (const file of screenTemplates) {
    const source = fs.readFileSync(file, "utf8");
    const relativePath = path.relative(projectRoot, file);

    assert.equal(
      (source.match(/<main\b/gi) || []).length,
      1,
      `${relativePath} must contain one main landmark`,
    );
    assert.equal(
      (source.match(/<h1\b/gi) || []).length,
      1,
      `${relativePath} must contain one h1`,
    );
    assert.equal(
      (source.match(/<script src="\/js\/main\.js"><\/script>/g) || []).length,
      1,
      `${relativePath} must load the shared script once`,
    );
  }
});

test("templates contain no placeholder or directory-relative links", () => {
  for (const file of allTemplates) {
    const source = fs.readFileSync(file, "utf8");
    const relativePath = path.relative(projectRoot, file);

    assert.doesNotMatch(source, /href=["']#["']/i, relativePath);
    assert.doesNotMatch(
      source,
      /href="(?!\/|#|https?:\/\/|mailto:|tel:|<%)[^"]+"/i,
      relativePath,
    );
  }
});

test("shared UI script parses and guards against duplicate initialization", () => {
  const source = fs.readFileSync(
    path.join(projectRoot, "public", "js", "main.js"),
    "utf8",
  );

  assert.doesNotThrow(() => new Function(source));
  assert.match(source, /__homiFundSharedUiLoaded/);
  assert.match(source, /event\.submitter/);
  assert.match(source, /submitButton\.formNoValidate/);
});

test("public mobile drawer keeps its header controls contained", () => {
  const source = fs.readFileSync(
    path.join(projectRoot, "public", "css", "style.css"),
    "utf8",
  );

  assert.match(source, /grid-template-columns: minmax\(0, 1fr\) 2\.75rem/);
  assert.match(source, /@media \(max-width: 767\.98px\)/);
  assert.match(source, /\.hf-mobile-drawer-header \.hf-drawer-close/);
  assert.match(source, /overflow-x: hidden/);
  assert.match(source, /\.hf-mobile-drawer-body a,[\s\S]*\.hf-mobile-drawer-actions button/);
  assert.doesNotMatch(source, /\.hf-mobile-drawer a,\s*\n\.hf-mobile-drawer button\s*\{/);
});

test("public navigation derives one visible active route from the URL", () => {
  const script = fs.readFileSync(
    path.join(projectRoot, "public", "js", "main.js"),
    "utf8",
  );
  const styles = fs.readFileSync(
    path.join(projectRoot, "public", "css", "style.css"),
    "utf8",
  );
  const header = fs.readFileSync(
    path.join(viewsRoot, "main", "partials", "header.ejs"),
    "utf8",
  );

  assert.match(script, /syncCurrentRouteLinks\(header, true\)/);
  assert.match(script, /syncCurrentRouteLinks\(drawer, true\)/);
  assert.match(script, /link\.classList\.toggle\("hf-current-route", isCurrent\)/);
  assert.match(script, /link\.removeAttribute\("aria-current"\)/);
  assert.match(script, /linkPath === currentPath && !url\.hash/);
  assert.match(styles, /\.hf-site-header \.hf-current-route/);
  assert.match(styles, /\.hf-mobile-drawer a\.hf-current-route/);
  assert.doesNotMatch(header, /href="\/login"[\s\S]{0,180}border-b-2 border-primary/);
});

test("sidebar branding does not compete with the page heading", () => {
  const sidebarFiles = allTemplates.filter((file) =>
    path.basename(file).startsWith("sidebar-"),
  );

  for (const file of sidebarFiles) {
    assert.doesNotMatch(fs.readFileSync(file, "utf8"), /<h1\b/i);
  }
});

test("dashboard settings action remains visible on small screens", () => {
  const styles = fs.readFileSync(
    path.join(projectRoot, "public", "css", "style.css"),
    "utf8",
  );

  assert.doesNotMatch(styles, /hf-header-controls\s+(?:a\[href\$="\/settings"\]|button\[aria-label="Settings"\])[^{]*\{\s*display:\s*none/i);
});

test("dashboard shell has stable geometry before shared JavaScript initializes", () => {
  const styles = fs.readFileSync(
    path.join(projectRoot, "public", "css", "style.css"),
    "utf8",
  );
  const script = fs.readFileSync(
    path.join(projectRoot, "public", "js", "main.js"),
    "utf8",
  );
  const sidebars = [
    path.join(viewsRoot, "user", "partials", "sidebar-renter.ejs"),
    path.join(viewsRoot, "user", "partials", "sidebar-landlord.ejs"),
    path.join(viewsRoot, "admin", "partials", "sidebar-admin.ejs"),
  ].map((file) => fs.readFileSync(file, "utf8"));

  assert.match(styles, /--hf-sidebar-width: 240px/);
  assert.match(styles, /\.hf-dashboard:not\(\.hf-dashboard-ready\) > header::before/);
  assert.match(script, /document\.body\.classList\.add\("hf-dashboard-ready"\)/);

  for (const sidebar of sidebars) {
    assert.match(sidebar, /class="hf-sidebar/);
    assert.match(sidebar, /id="dashboard-navigation"/);
  }
});

test("dashboard roles share one header-control and content-grid contract", () => {
  const styles = fs.readFileSync(
    path.join(projectRoot, "public", "css", "style.css"),
    "utf8",
  );
  const script = fs.readFileSync(
    path.join(projectRoot, "public", "js", "main.js"),
    "utf8",
  );

  assert.match(styles, /--hf-dashboard-max-width: 80rem/);
  assert.match(styles, /--hf-dashboard-gutter: clamp\(1rem, 2\.4vw, 2rem\)/);
  assert.match(styles, /\.hf-dashboard \.hf-dashboard-content\s*\{[\s\S]*?gap: var\(--hf-dashboard-section-gap\)/);
  assert.match(styles, /\.hf-dashboard \.hf-dashboard-grid > \*\s*\{[\s\S]*?min-width: 0/);
  assert.match(styles, /a\[aria-label\]\[aria-current="page"\][\s\S]*?background: var\(--hf-header-control-active-bg\)/);
  assert.match(script, /contentContainer\.classList\.add\("hf-dashboard-content"\)/);
  assert.match(script, /element\.classList\.add\("hf-dashboard-grid"\)/);
});

test("filled dashboard header actions are reserved for the current page", () => {
  const dashboardTemplates = allTemplates.filter((file) => {
    const normalized = file.replace(/\\/g, "/");
    const source = fs.readFileSync(file, "utf8");

    return /\/views\/(?:user|admin)\//.test(normalized) && source.includes("hf-dashboard");
  });

  for (const file of dashboardTemplates) {
    const source = fs.readFileSync(file, "utf8");
    const header = source.match(/<header\b[\s\S]*?<\/header>/i)?.[0] || "";
    const filledActions = header.match(/<a\b[^>]*class="[^"]*bg-primary[^"]*"[^>]*>/gi) || [];

    assert.equal(filledActions.length, 0, `${file} contains a class-filled header action`);
  }
});

test("dashboard micro-components share spacing, icon, and action behavior", () => {
  const styles = fs.readFileSync(
    path.join(projectRoot, "public", "css", "style.css"),
    "utf8",
  );
  const landlordSidebar = fs.readFileSync(
    path.join(viewsRoot, "user", "partials", "sidebar-landlord.ejs"),
    "utf8",
  );

  assert.match(styles, /\.hf-header-controls > a\[aria-label\]\s*\{[\s\S]*?margin-left: 0 !important/);
  assert.match(styles, /\.hf-sidebar \.material-symbols-outlined\s*\{[\s\S]*?font-size: 1\.25rem !important/);
  assert.match(styles, /a:not\(\.bg-primary\)\s*\{[\s\S]*?padding-top: 0\.625rem !important;[\s\S]*?padding-bottom: 0\.625rem !important/);
  assert.match(styles, /a\.bg-primary:not\(\[aria-label\]\)\s*\{[\s\S]*?min-height: 3rem/);
  assert.match(styles, /a\.border-primary:not\(\[aria-label\]\)\s*\{[\s\S]*?min-height: 3rem/);
  assert.match(styles, /@media \(max-width: 1023px\) and \(max-height: 760px\)[\s\S]*?\.hf-dashboard \.hf-sidebar[\s\S]*?gap: 1rem !important/);
  assert.match(landlordSidebar, /href="\/user\/landlord\/settings"/);
  assert.match(landlordSidebar, /locals\.currentPage === 'settings'[\s\S]*aria-current="page"/);
  assert.doesNotMatch(landlordSidebar, />Add Property<|>Log Out</);
});

test("dashboard command labels use consistent sentence case", () => {
  const dashboardSource = allTemplates
    .filter((file) => fs.readFileSync(file, "utf8").includes("hf-dashboard"))
    .map((file) => fs.readFileSync(file, "utf8"))
    .join("\n");

  assert.doesNotMatch(
    dashboardSource,
    />(?:Open (?:Applications|Applicants|Documents|Payments|Profile|Properties|Settings|Support)|Review Applications|Return to Properties|Add Property|Log Out)</,
  );
});

test("material symbol status tiles preserve centered flex layout", () => {
  const styles = fs.readFileSync(
    path.join(projectRoot, "public", "css", "style.css"),
    "utf8",
  );

  assert.match(styles, /\.material-symbols-outlined\.flex\s*\{[\s\S]*?display:\s*flex;[\s\S]*?align-items:\s*center;[\s\S]*?justify-content:\s*center;[\s\S]*?line-height:\s*1;/);
});

test("FAQ explorer uses native disclosure and explicit filter contracts", () => {
  const source = fs.readFileSync(
    path.join(viewsRoot, "main", "FAQs.ejs"),
    "utf8",
  );

  assert.equal((source.match(/<details\b/g) || []).length, 8);
  assert.equal((source.match(/data-faq-topic=/g) || []).length, 8);
  assert.match(source, /<label[\s\S]*for="faq-search"/);
  assert.match(source, /data-faq-empty/);
  assert.match(source, /href="\/contact#contact-form"/);
  assert.doesNotMatch(source, /onclick=|toggleAccordion|24\/7|AES-256|bank-level|strictly adhere/i);
});

test("pricing uses consistent responsive comparison and native journeys", () => {
  const source = fs.readFileSync(
    path.join(viewsRoot, "main", "pricing.ejs"),
    "utf8",
  );

  assert.match(source, /const comparisonRows/);
  assert.equal((source.match(/data-disclosure/g) || []).length, 1);
  assert.match(source, /<caption class="sr-only">/);
  assert.match(source, /href="\/signup"/);
  assert.match(source, /href="\/contact#contact-form"/);
  assert.doesNotMatch(source, /15,000|response time guarantees|predictive tenant|secured by industry leaders|start free trial|onclick=/i);
});

test("renter public page uses local media and evidence-bounded journeys", () => {
  const source = fs.readFileSync(
    path.join(viewsRoot, "main", "renters.ejs"),
    "utf8",
  );

  assert.match(source, /src="\/images\/renters\/renter-workflow\.jpg"/);
  assert.match(source, /width="1448"/);
  assert.match(source, /height="1086"/);
  assert.match(source, /href="\/signup"/);
  assert.match(source, /href="\/contact#contact-form"/);
  assert.equal((source.match(/data-disclosure/g) || []).length, 3);
  assert.doesNotMatch(source, /50,000|12,000|4x|within 48 hours|AES-256|bank-grade|major bureaus|priority candidates|onclick=|pageYOffset/i);
  assert.doesNotMatch(source, /\/FAQs/);
});

test("landlord public page removes fictional data and mutation controls", () => {
  const source = fs.readFileSync(
    path.join(viewsRoot, "main", "landlords.ejs"),
    "utf8",
  );

  assert.match(source, /src="\/images\/about\/rental-building\.jpg"/);
  assert.match(source, /href="\/signup"/);
  assert.match(source, /href="\/pricing"/);
  assert.match(source, /href="\/contact#contact-form"/);
  assert.equal((source.match(/data-disclosure/g) || []).length, 3);
  assert.doesNotMatch(source, /approve applicant|on-time collection|admin overhead|increase listing views|3x faster|open banking|zero-touch|all direct debits active|portfolio revenue|trusted by professional landlords|intersectionobserver|pageYOffset|https:\/\/lh3|onclick=/i);
});

test("signup exposes accessible fields and no unavailable auth controls", () => {
  const source = fs.readFileSync(
    path.join(viewsRoot, "main", "signup.ejs"),
    "utf8",
  );

  assert.match(source, /autocomplete="name"/);
  assert.match(source, /autocomplete="email"/);
  assert.match(source, /autocomplete="new-password"/);
  assert.match(source, /data-password-toggle="password"/);
  assert.match(source, /data-submit-feedback/);
  assert.match(source, /data-focus-feedback/);
  assert.doesNotMatch(source, /Google|Apple|togglePasswordVisibility|Terms of Service|Privacy Policy|onclick=/);
});

test("login uses the shared auth form controls", () => {
  const source = fs.readFileSync(
    path.join(viewsRoot, "main", "login.ejs"),
    "utf8",
  );

  assert.match(source, /autocomplete="email"/);
  assert.match(source, /autocomplete="current-password"/);
  assert.match(source, /data-password-toggle="password"/);
  assert.match(source, /data-submit-feedback/);
  assert.match(source, /data-focus-feedback/);
  assert.doesNotMatch(source, /Google|Apple|Secure, encrypted login|toggleBtn|onclick=|https:\/\/lh3/);
});

test("forgot-password uses honest recoverable request states", () => {
  const source = fs.readFileSync(
    path.join(viewsRoot, "main", "forget-password.ejs"),
    "utf8",
  );

  assert.match(source, /autocomplete="email"/);
  assert.match(source, /data-submit-feedback/);
  assert.match(source, /data-focus-feedback/);
  assert.match(source, /href="\/contact#contact-form"/);
  assert.doesNotMatch(source, /Secure, encrypted connection|onclick=/);
});

test("reset-password covers invalid, form, and success states", () => {
  const source = fs.readFileSync(
    path.join(viewsRoot, "main", "reset-password.ejs"),
    "utf8",
  );

  assert.equal((source.match(/data-password-toggle=/g) || []).length, 2);
  assert.match(source, /minlength="8"/);
  assert.match(source, /data-submit-feedback/);
  assert.match(source, /data-focus-feedback/);
  assert.match(source, /href="\/forget-password"/);
  assert.match(source, /href="\/login"/);
});

test("role-selection uses a native one-time workspace choice", () => {
  const source = fs.readFileSync(
    path.join(viewsRoot, "main", "role-selection.ejs"),
    "utf8",
  );

  assert.equal((source.match(/type="radio"/g) || []).length, 2);
  assert.equal((source.match(/name="role"/g) || []).length, 2);
  assert.equal((source.match(/\brequired\b/g) || []).length, 2);
  assert.match(source, /<fieldset>/);
  assert.match(source, /data-submit-feedback/);
  assert.match(source, /data-focus-feedback/);
  assert.match(source, /href="\/logout"/);
  assert.doesNotMatch(source, /onclick=|<script>|role-card-selected|selectedRole = "landlord"|multi-role|institutional precision/i);
});

test("landlord onboarding exposes a persisted accessible form", () => {
  const source = fs.readFileSync(
    path.join(viewsRoot, "main", "onboarding-landlord.ejs"),
    "utf8",
  );

  assert.match(source, /<form action="\/onboarding-landlord" method="POST"/);
  assert.match(source, /name="intent"[\s\S]*value="continue"/);
  assert.match(source, /name="intent"[\s\S]*value="draft"[\s\S]*formnovalidate/);
  assert.match(source, /data-submit-feedback/);
  assert.match(source, /data-focus-feedback/);
  assert.equal((source.match(/name="propertyTypes"/g) || []).length, 1);
  assert.equal((source.match(/name="primaryGoal"/g) || []).length, 1);
  assert.doesNotMatch(source, /onclick=|<script>|Johnathan Doe|AES-256|AML\/KYC|SOC2|Priority Listing|Institutional Trust Score|console\.log/i);
});

test("renter onboarding exposes a privacy-bounded persisted form", () => {
  const source = fs.readFileSync(
    path.join(viewsRoot, "main", "onboarding-tenant.ejs"),
    "utf8",
  );

  assert.match(source, /<form action="\/onboarding-tenant" method="POST"/);
  assert.match(source, /name="intent"[\s\S]*value="continue"/);
  assert.match(source, /name="intent"[\s\S]*value="draft"[\s\S]*formnovalidate/);
  assert.match(source, /data-submit-feedback/);
  assert.match(source, /data-focus-feedback/);
  assert.match(source, /Income evidence is not collected on this screen/);
  assert.doesNotMatch(source, /onclick=|<script>|Projected HomiScore|40%|Trust-Verified|Institutional Grade|input-income|IntersectionObserver|console\.log|Â/i);
});

test("onboarding completion uses safe role-specific journeys", () => {
  const source = fs.readFileSync(
    path.join(viewsRoot, "main", "onboarding-complete.ejs"),
    "utf8",
  );

  assert.match(source, /resolvedDashboardUrl/);
  assert.match(source, /resolvedProfileUrl/);
  assert.match(source, /href="\/contact#contact-form"/);
  assert.equal((source.match(/min-h-12/g) || []).length, 3);
  assert.doesNotMatch(source, /HomiScore|role === 'admin'|\/user\/null|onclick=|<script>/i);
});

test("landlord verification is an honest preparation checklist", () => {
  const source = fs.readFileSync(
    path.join(viewsRoot, "main", "landlord-verification.ejs"),
    "utf8",
  );

  assert.match(source, /Secure document upload is not configured/);
  assert.match(source, /href="\/onboarding-landlord"/);
  assert.match(source, /href="\/onboarding-complete"/);
  assert.match(source, /href="\/contact#contact-form"/);
  assert.doesNotMatch(source, /<input|<select|<button|type="file"|Open Banking|HomiScore|Institutional|AES-256|SOC2|https:\/\/lh3|onclick=|<script>/i);
});

test("renter verification protects sensitive information", () => {
  const source = fs.readFileSync(
    path.join(viewsRoot, "main", "tenant-verification.ejs"),
    "utf8",
  );

  assert.match(source, /Secure document upload is not configured/);
  assert.match(source, /referee's permission/);
  assert.match(source, /href="\/onboarding-tenant"/);
  assert.match(source, /href="\/onboarding-complete"/);
  assert.match(source, /href="\/contact#contact-form"/);
  assert.doesNotMatch(source, /<input|<select|<button|type="file"|Open Banking|Connect Bank|HomiScore|lower rental deposits|government-grade|Institutional|https:\/\/lh3|onclick=|<script>/i);
});

test("landlord dashboard uses real routes and honest empty states", () => {
  const source = fs.readFileSync(
    path.join(viewsRoot, "user", "landlord", "dashboard.ejs"),
    "utf8",
  );
  const sidebar = fs.readFileSync(
    path.join(viewsRoot, "user", "partials", "sidebar-landlord.ejs"),
    "utf8",
  );

  assert.match(source, /href="\/user\/landlord\/properties\/add\/address"/);
  assert.match(source, /No operational records added/);
  assert.match(source, /No activity yet/);
  assert.match(source, /landlordProfile\.propertyCount/);
  assert.match(sidebar, /href="\/user\/landlord\/properties\/add\/address"/);
  assert.match(sidebar, /href="\/user\/landlord\/messages"/);
  assert.match(sidebar, /aria-current="page"/);
  assert.match(sidebar, /aria-hidden="true"/);
  assert.doesNotMatch(source, /Marcus R\.|Verified Landlord|£|\b92%\b|\b96\.4%\b|£3\.2M|IntersectionObserver|https:\/\/lh3|onclick=|<script>/i);
  assert.doesNotMatch(sidebar, /onclick=/i);
});

test("landlord HomiScore exposes source readiness without a fictional score", () => {
  const source = fs.readFileSync(
    path.join(viewsRoot, "user", "landlord", "HomiScore.ejs"),
    "utf8",
  );

  assert.match(source, /Score not available/);
  assert.match(source, /No score history/);
  assert.match(source, /self-reported setup details/);
  assert.match(source, /href="\/landlord-verification"/);
  assert.match(source, /href="\/user\/landlord\/support"/);
  assert.doesNotMatch(source, /Marcus R\.|Top 5%|Excellent Standing|institutional-grade|Â|£|92%|98%|853|secure HomiScore link|Download Report|Share HomiScore|sensitive-metric|onclick=|<script>(?!\s*<)/i);
});

test("landlord properties shows an honest persisted-record boundary", () => {
  const source = fs.readFileSync(
    path.join(viewsRoot, "user", "landlord", "properties.ejs"),
    "utf8",
  );

  assert.match(source, /No properties saved/);
  assert.match(source, /0 operational records/);
  assert.match(source, /href="\/user\/landlord\/properties\/add\/address"/);
  assert.match(source, /self-reported setup context/);
  assert.doesNotMatch(source, /Marcus R\.|Verified Landlord|institutional-grade|Total Portfolio Value|Occupancy Rate|Monthly Revenue|Â|£|background-image|https:\/\/|Export Report|onclick=|<script>(?!\s*<)/i);
});

test("landlord applicants removes fictional people and decision controls", () => {
  const source = fs.readFileSync(
    path.join(viewsRoot, "user", "landlord", "applicants.ejs"),
    "utf8",
  );

  assert.match(source, /No applications received/);
  assert.match(source, /0 applicant records/);
  assert.match(source, /Consent-based submission/);
  assert.match(source, /Do not infer or rank applicants by protected characteristics/);
  assert.doesNotMatch(source, /Alex S\.|Marcus Chen|Average verified HomiScore|Active applications|Needs review|Shortlisted|https:\/\/|<table|<button|onclick=|<script>(?!\s*<)/i);
});

test("landlord documents blocks sensitive upload until storage is real", () => {
  const source = fs.readFileSync(
    path.join(viewsRoot, "user", "landlord", "documents.ejs"),
    "utf8",
  );

  assert.match(source, /Secure document storage is not configured/);
  assert.match(source, /0 stored documents/);
  assert.match(source, /Do not upload or send identity/);
  assert.match(source, /Required storage controls/);
  assert.doesNotMatch(source, /Alex S\.|18 stored|documents expire soon|properties checked|stored securely|https:\/\/|<input|<select|<table|<button|type="file"|onclick=|<script>(?!\s*<)/i);
});

test("landlord payments removes simulated money movement", () => {
  const source = fs.readFileSync(
    path.join(viewsRoot, "user", "landlord", "payments.ejs"),
    "utf8",
  );

  assert.match(source, /Payments are not connected/);
  assert.match(source, /0 payment records/);
  assert.match(source, /Do not enter or send bank account/);
  assert.match(source, /Signed webhooks, idempotency/);
  assert.doesNotMatch(source, /Alex S\.|Sarah Mitchell|Hudson Lofts|Expected this month|Received this month|payment overdue|Direct Debit|Bank transfer|£|Â|<input|<table|<button|onclick=|<script>(?!\s*<)/i);
});

test("landlord messages removes fake conversations and client-only sending", () => {
  const source = fs.readFileSync(
    path.join(viewsRoot, "user", "landlord", "messages.ejs"),
    "utf8",
  );

  assert.match(source, /Messaging is not connected/);
  assert.match(source, /0 conversations/);
  assert.match(source, /Authorized participants/);
  assert.match(source, /Do not send identity documents/);
  assert.doesNotMatch(source, /Marcus R\.|James Carter|Elena Rossi|Your HomiScore is Ready|Top Applicants|Welcome back|£|Â|<input|<textarea|<button|data-conversation|onclick=|<script>(?!\s*<)/i);
});

test("landlord notifications removes false events and unread urgency", () => {
  const source = fs.readFileSync(
    path.join(viewsRoot, "user", "landlord", "notification-bell.ejs"),
    "utf8",
  );

  assert.match(source, /Notifications are not connected/);
  assert.match(source, /0 notifications/);
  assert.match(source, /Authoritative events/);
  assert.match(source, /Do not show unread dots without persisted unread records/);
  assert.doesNotMatch(source, /Marcus R\.|James Carter|Elena Rossi|New application received|Viewing update|Document reminder|Your HomiScore is Ready|£|Â|notification-dropdown|Mark all as read|<input|<button|onclick=|<script>(?!\s*<)/i);
});

test("landlord settings exposes only server-owned account journeys", () => {
  const source = fs.readFileSync(
    path.join(viewsRoot, "user", "landlord", "settings.ejs"),
    "utf8",
  );

  assert.match(source, /Profile and access journeys are available/);
  assert.match(source, /settingsUser\.email/);
  assert.match(source, /href="\/forget-password"/);
  assert.match(source, /href="\/contact#contact-form"/);
  assert.doesNotMatch(source, /Marcus R\.|Save listing preferences|Save application preferences|Change password|Update email|Request information|class="toggle|<input|<select|<button|onclick=|<script>(?!\s*<)/i);
});

test("landlord support uses real help routes without fake ticketing", () => {
  const source = fs.readFileSync(
    path.join(viewsRoot, "user", "landlord", "support.ejs"),
    "utf8",
  );
  const sidebar = fs.readFileSync(
    path.join(viewsRoot, "user", "partials", "sidebar-landlord.ejs"),
    "utf8",
  );

  assert.match(source, /Self-service help is available/);
  assert.match(source, /No ticket tracking/);
  assert.match(source, /delivery depends on configured email service/);
  assert.match(source, /href="\/contact#contact-form"/);
  assert.match(source, /href="\/faqs"/);
  assert.match(source, /Do not send passwords, identity documents/);
  assert.match(sidebar, /locals\.currentPage === 'support'/);
  assert.doesNotMatch(source, /Marcus R\.|Submit a support request|Search support guides|View all guides|recent support requests|24\/7|chat widget|guaranteed response|<input|<textarea|<button|onclick=|<script>(?!\s*<)/i);
});

test("landlord profile renders authenticated and persisted account context", () => {
  const source = fs.readFileSync(
    path.join(viewsRoot, "user", "landlord", "user-profile.ejs"),
    "utf8",
  );

  assert.match(source, /Saved account context is available/);
  assert.match(source, /profileUser\.fullName/);
  assert.match(source, /profileUser\.email/);
  assert.match(source, /landlordProfile\.propertyCount/);
  assert.match(source, /href="\/onboarding-landlord"/);
  assert.match(source, /href="\/landlord-verification"/);
  assert.match(source, /This account context is not a published landlord profile/);
  assert.doesNotMatch(source, /Marcus R\.|Upload photo|Remove|Save profile|Preferred contact method|active sessions|This prototype previews|type="file"|<input|<select|<textarea|<button|onclick=|<script>(?!\s*<)/i);
});

test("landlord applicant profile blocks fictional records and decisions", () => {
  const source = fs.readFileSync(
    path.join(viewsRoot, "user", "landlord", "view-profile.ejs"),
    "utf8",
  );

  assert.match(source, /No application record selected/);
  assert.match(source, /0 profile records/);
  assert.match(source, /Authorization and consent/);
  assert.match(source, /Do not infer or rank protected characteristics/);
  assert.match(source, /href="\/user\/landlord\/applicants"/);
  assert.doesNotMatch(source, /James Carter|Canary Wharf|921|Excellent|Verified renter|Full-time employment|Proof of income|Application submitted|Shortlist applicant|Make offer|Decline application|Â£|Ã‚|<input|<select|<textarea|<button|action-modal|onclick=|<script>(?!\s*<)/i);
});

test("landlord calendar removes simulated appointments and scheduling", () => {
  const source = fs.readFileSync(
    path.join(viewsRoot, "user", "landlord", "view-calendar.ejs"),
    "utf8",
  );

  assert.match(source, /Viewing scheduling is not connected/);
  assert.match(source, /0 viewing records/);
  assert.match(source, /Availability and timezones/);
  assert.match(source, /No false availability/);
  assert.match(source, /href="\/user\/landlord\/applicants"/);
  assert.doesNotMatch(source, /James Carter|Elena Rossi|Canary Wharf|Hudson Lofts|October 2026|HomiScore 921|Create viewing|new-viewing-button|calendar-modal|event-pill|<input|<select|<textarea|<button|onclick=|<script>(?!\s*<)/i);
});

test("landlord application review requires authoritative evidence", () => {
  const source = fs.readFileSync(
    path.join(viewsRoot, "user", "landlord", "review-application.ejs"),
    "utf8",
  );

  assert.match(source, /No application record to review/);
  assert.match(source, /0 review records/);
  assert.match(source, /Evidence provenance/);
  assert.match(source, /Treat missing information as unavailable, not negative/);
  assert.match(source, /href="\/user\/landlord\/applicants"/);
  assert.doesNotMatch(source, /James Carter|Canary Wharf|921|Excellent|Verified renter|Full-time employment|Proof of income|Application submitted|Shortlist applicant|Make offer|Decline application|action-modal|application-stage|Â£|Ã‚|<input|<select|<textarea|<button|onclick=|<script>(?!\s*<)/i);
});

test("add property address blocks unsaved private address collection", () => {
  const source = fs.readFileSync(
    path.join(viewsRoot, "user", "landlord", "Add-Properties", "address-and-type.ejs"),
    "utf8",
  );

  assert.match(source, /Property drafts are not connected/);
  assert.match(source, /0 property drafts/);
  assert.match(source, /Address privacy/);
  assert.match(source, /Keep addresses private/);
  assert.match(source, /href="\/user\/landlord\/properties"/);
  assert.doesNotMatch(source, /Enter a valid UK postcode|Continue to listing details|id="property-name"|id="address-1"|id="postcode"|name="property-type"|<form|<input|<select|<textarea|<button|onclick=|<script>(?!\s*<)/i);
});

test("add property listing details blocks unsaved public content", () => {
  const source = fs.readFileSync(
    path.join(viewsRoot, "user", "landlord", "Add-Properties", "listing-details.ejs"),
    "utf8",
  );

  assert.match(source, /Listing content cannot be saved/);
  assert.match(source, /Step 2 unavailable/);
  assert.match(source, /Fair listing policy/);
  assert.match(source, /Keep operational details private/);
  assert.match(source, /href="\/user\/landlord\/properties\/add\/address"/);
  assert.doesNotMatch(source, /Continue to rent &amp; availability|id="listing-title"|id="description"|id="accessibility"|id="additional-notes"|<form|<input|<select|<textarea|<button|onclick=|<script>(?!\s*<)/i);
});

test("add property rent blocks unsaved financial and availability terms", () => {
  const source = fs.readFileSync(
    path.join(viewsRoot, "user", "landlord", "Add-Properties", "rent-and-availabilty.ejs"),
    "utf8",
  );

  assert.match(source, /Rent and availability cannot be saved/);
  assert.match(source, /Step 3 unavailable/);
  assert.match(source, /Jurisdiction-aware terms/);
  assert.match(source, /Availability must be explicit/);
  assert.match(source, /href="\/user\/landlord\/properties\/add\/address"/);
  assert.doesNotMatch(source, /Continue to photos &amp; documents|id="monthly-rent"|id="deposit"|id="holding-deposit"|id="availability-notes"|<form|<input|<select|<textarea|<button|onclick=|<script>(?!\s*<)/i);
});

test("add property media blocks unsafe browser-only uploads", () => {
  const source = fs.readFileSync(
    path.join(viewsRoot, "user", "landlord", "Add-Properties", "photos-and-documents.ejs"),
    "utf8",
  );

  assert.match(source, /Photos and documents cannot be stored/);
  assert.match(source, /Step 4 unavailable/);
  assert.match(source, /Safe file ingestion/);
  assert.match(source, /Private is the default/);
  assert.match(source, /href="\/user\/landlord\/properties\/add\/address"/);
  assert.doesNotMatch(source, /Continue to review &amp; publish|id="document-category"|id="document-visibility"|Upload photos|Upload document|type="file"|<form|<input|<select|<textarea|<button|onclick=|<script>(?!\s*<)/i);
});

test("add property review blocks simulated readiness and publishing", () => {
  const source = fs.readFileSync(
    path.join(viewsRoot, "user", "landlord", "Add-Properties", "review-and-publish.ejs"),
    "utf8",
  );

  assert.match(source, /Review and publication are not connected/);
  assert.match(source, /Step 5 unavailable/);
  assert.match(source, /Immutable public preview/);
  assert.match(source, /No false public status/);
  assert.match(source, /href="\/user\/landlord\/properties\/add\/address"/);
  assert.doesNotMatch(source, /0 of 4 sections complete|Your listing is not ready to publish|Publish property|Renter view|Marcus R\.|Monthly rent|0 added|<form|<input|<select|<textarea|<button|onclick=|<script>(?!\s*<)/i);
});

test("renter dashboard uses persisted profile and honest empty activity", () => {
  const source = fs.readFileSync(
    path.join(viewsRoot, "user", "renter", "dashboard.ejs"),
    "utf8",
  );
  const sidebar = fs.readFileSync(
    path.join(viewsRoot, "user", "partials", "sidebar-renter.ejs"),
    "utf8",
  );

  assert.match(source, /Renter activity is not connected/);
  assert.match(source, /0 linked activity records/);
  assert.match(source, /savedProfile\.preferredLocations/);
  assert.match(source, /currency not recorded/);
  assert.match(source, /No inferred outcomes/);
  assert.match(sidebar, /locals\.currentPage === 'messages'/);
  assert.match(sidebar, /aria-current="page"/);
  assert.doesNotMatch(source, /Marcus R\.|Marcus Reed|Premium Member|874|Excellent|top 5%|Sapphire Suites|Brick Lane Lofts|Regent's Park Estate|Penthouse|Direct Debit|Viewing Scheduled|Apply Now|https:\/\/|Â£|Ã‚|<input|<button|onclick=|<script>(?!\s*<)/i);
});

test("renter HomiScore exposes source readiness without a fictional score", () => {
  const source = fs.readFileSync(
    path.join(viewsRoot, "user", "renter", "HomiScore.ejs"),
    "utf8",
  );

  assert.match(source, /Score not available/);
  assert.match(source, /No score history/);
  assert.match(source, /consented, relevant source data/);
  assert.match(source, /No credit-bureau, open-banking, biometric/);
  assert.match(source, /self-reported search preferences/);
  assert.match(source, /savedRenterProfile\.preferredLocations/);
  assert.doesNotMatch(source, /Marcus R\.|Premium Member|874|842|top 5%|Trusted Renter|Excellent|TransUnion data successfully updated|Verified \(Passport|Verified \(Open Banking|Share HomiScore Link|£5|Â£|Ã‚|hard credit check|<input|<button|role="button"|onclick=|<script>(?!\s*<)/i);
});

test("renter applications removes fictional listings and automated submission", () => {
  const source = fs.readFileSync(
    path.join(viewsRoot, "user", "renter", "applications.ejs"),
    "utf8",
  );

  assert.match(source, /Applications are not connected/);
  assert.match(source, /0 application records/);
  assert.match(source, /Consented submission version/);
  assert.match(source, /No automated applications/);
  assert.match(source, /href="\/user\/renter\/dashboard"/);
  assert.doesNotMatch(source, /Marcus R\.|Premium Member|Sapphire Suites|Brick Lane Lofts|Dockside Residence|Southbank Collection|Canary Wharf|874|912|98% Match|Run Autopilot|Configure now, pay to run|£25|Â£|Ã‚|Apply now|Save Changes|Preview Profile|https:\/\/|<input|<select|<textarea|<button|onclick=|<script>(?!\s*<)/i);
});

test("renter documents blocks sensitive files until storage is real", () => {
  const source = fs.readFileSync(
    path.join(viewsRoot, "user", "renter", "documents.ejs"),
    "utf8",
  );

  assert.match(source, /Secure document storage is not configured/);
  assert.match(source, /0 stored documents/);
  assert.match(source, /Verified file ingestion/);
  assert.match(source, /No readiness inference/);
  assert.match(source, /href="\/user\/renter\/support"/);
  assert.doesNotMatch(source, /Marcus R\.|Premium Member|Employment Letter|Bank Statements|Previous Landlord Reference|Proof of Address|4 stored for applications|expires soon|3 of 4|Secure sharing enabled|stored securely|Upload document|Browse files|https:\/\/|<input|<select|<textarea|<table|<button|type="file"|onclick=|<script>(?!\s*<)/i);
});

test("renter payments removes fictional money movement", () => {
  const source = fs.readFileSync(
    path.join(viewsRoot, "user", "renter", "Payments.ejs"),
    "utf8",
  );

  assert.match(source, /Payments are not connected/);
  assert.match(source, /0 payment records/);
  assert.match(source, /Provider-owned collection/);
  assert.match(source, /Signed webhooks, idempotency/);
  assert.match(source, /No payment-health inference/);
  assert.doesNotMatch(source, /Marcus R\.|Premium Member|The Glass House|Up to date|No overdue payments|Direct Debit|ending 4821|Deposit paid|View receipt|Change payment method|£|Â|Ã‚|https:\/\/|<input|<select|<textarea|<table|<button|onclick=|<script>(?!\s*<)/i);
});

test("renter messages removes fake conversations and client-only sending", () => {
  const source = fs.readFileSync(
    path.join(viewsRoot, "user", "renter", "messages.ejs"),
    "utf8",
  );

  assert.match(source, /Messaging is not connected/);
  assert.match(source, /0 conversations/);
  assert.match(source, /Authorized participants/);
  assert.match(source, /Durable delivery/);
  assert.match(source, /No unread or delivery inference/);
  assert.doesNotMatch(source, /Marcus R\.|Marcus Reed|Premium Member|The Sapphire Suites|Brick Lane Lofts|Regent's Park Estate|viewing is confirmed|application is currently under review|HomiScore is active|£|Â|Ã‚|https:\/\/|<input|<select|<textarea|<button|data-conversation|onclick=|<script>(?!\s*<)/i);
});

test("renter notifications removes false events and unread urgency", () => {
  const source = fs.readFileSync(
    path.join(viewsRoot, "user", "renter", "notification-bell.ejs"),
    "utf8",
  );

  assert.match(source, /Notifications are not connected/);
  assert.match(source, /0 notifications/);
  assert.match(source, /Authoritative events/);
  assert.match(source, /Do not show unread dots without persisted unread records/);
  assert.match(source, /Required notification lifecycle/);
  assert.doesNotMatch(source, /Marcus R\.|Marcus Reed|Premium Member|Application update|Property match|Document reminder|Mark all as read|View all notifications|HomiScore performance|£|Â|Ã‚|https:\/\/|notification-dropdown|<input|<select|<textarea|<button|onclick=|<script>(?!\s*<)/i);
});

test("renter profile renders authenticated and persisted account context", () => {
  const source = fs.readFileSync(
    path.join(viewsRoot, "user", "renter", "profile.ejs"),
    "utf8",
  );

  assert.match(source, /Saved account context is available/);
  assert.match(source, /profileUser\.fullName/);
  assert.match(source, /profileUser\.email/);
  assert.match(source, /savedRenterProfile\.preferredLocations/);
  assert.match(source, /currency not recorded/);
  assert.match(source, /href="\/onboarding-tenant"/);
  assert.match(source, /href="\/tenant-verification"/);
  assert.match(source, /not a published renter profile or application preview/);
  assert.doesNotMatch(source, /Alex S\.|Upload photo|Remove|Save profile|Preferred contact method|active sessions|This prototype previews|type="file"|<input|<select|<textarea|<button|onclick=|<script>(?!\s*<)/i);
});

test("renter settings exposes only server-owned account journeys", () => {
  const source = fs.readFileSync(
    path.join(viewsRoot, "user", "renter", "settings.ejs"),
    "utf8",
  );

  assert.match(source, /Profile and access journeys are available/);
  assert.match(source, /settingsUser\.email/);
  assert.match(source, /href="\/user\/renter\/profile"/);
  assert.match(source, /href="\/onboarding-tenant"/);
  assert.match(source, /href="\/forget-password"/);
  assert.match(source, /href="\/contact#contact-form"/);
  assert.match(source, /Application sharing must be reviewed in the context of a specific application/);
  assert.doesNotMatch(source, /Alex S\.|Save rental preferences|Save application preferences|Change password|Update email|Review sessions|Request information|class="toggle|<input|<select|<textarea|<button|onclick=|<script>(?!\s*<)/i);
});

test("renter support uses real help routes without fake ticketing", () => {
  const source = fs.readFileSync(
    path.join(viewsRoot, "user", "renter", "support.ejs"),
    "utf8",
  );
  const sidebar = fs.readFileSync(
    path.join(viewsRoot, "user", "partials", "sidebar-renter.ejs"),
    "utf8",
  );

  assert.match(source, /Self-service help is available/);
  assert.match(source, /No ticket tracking/);
  assert.match(source, /delivery depends on configured email service/);
  assert.match(source, /href="\/contact#contact-form"/);
  assert.match(source, /href="\/faqs"/);
  assert.match(source, /Do not send passwords, identity or income documents/);
  assert.match(source, /HomiFund support is not an emergency service/);
  assert.match(sidebar, /locals\.currentPage === 'support'/);
  assert.doesNotMatch(source, /Alex S\.|Submit a support request|Search support guides|View all guides|recent support requests|24\/7|chat widget|guaranteed response|Upload, update or share|<input|<textarea|<button|onclick=|<script>(?!\s*<)/i);
});

test("renter viewing detail requires an authoritative appointment record", () => {
  const source = fs.readFileSync(
    path.join(viewsRoot, "user", "renter", "view-detail.ejs"),
    "utf8",
  );

  assert.match(source, /No viewing record is available/);
  assert.match(source, /0 scheduled viewings/);
  assert.match(source, /Required viewing foundations/);
  assert.match(source, /Required viewing lifecycle/);
  assert.match(source, /No appointment record means no viewing status/);
  assert.match(source, /href="\/user\/renter\/applications"/);
  assert.doesNotMatch(source, /The Sapphire Suites|Marcus R\.|Marcus Reed|Premium Member|Viewing confirmed|Canary Wharf|3,200|874|Excellent|Strong fit|application is already shared|Message landlord|Request reschedule|Cancel viewing|https:\/\/|<input|<textarea|<button|onclick=|<script>(?!\s*<)/i);
});

test("renter property detail requires an authoritative listing record", () => {
  const source = fs.readFileSync(
    path.join(viewsRoot, "user", "renter", "View-property.ejs"),
    "utf8",
  );

  assert.match(source, /No property record is available/);
  assert.match(source, /0 available listings/);
  assert.match(source, /Required listing foundations/);
  assert.match(source, /Required listing lifecycle/);
  assert.match(source, /No property record means no price, match score, availability/);
  assert.match(source, /href="\/user\/renter\/applications"/);
  assert.match(source, /Save property[\s\S]*Unavailable[\s\S]*Send enquiry[\s\S]*Unavailable[\s\S]*Request viewing[\s\S]*Unavailable[\s\S]*Start application[\s\S]*Unavailable[\s\S]*Share listing[\s\S]*Unavailable/);
  assert.doesNotMatch(source, /The Sapphire Suites|Alex S\.|Canary Wharf|3,200|98% match|Available to enquire|Request a viewing|Send an enquiry|Bright modern apartment|Furnished|Lift access|Private balcony|https:\/\/|<img|<input|<textarea|<button|onclick=|data-image|<script>(?!\s*<)/i);
});

test("admin management exposes no actions without administration services", () => {
  const source = fs.readFileSync(
    path.join(viewsRoot, "admin", "management.ejs"),
    "utf8",
  );
  const sidebar = fs.readFileSync(
    path.join(viewsRoot, "admin", "partials", "sidebar-admin.ejs"),
    "utf8",
  );

  assert.match(source, /Administration data is not connected/);
  assert.match(source, /0 actionable records/);
  assert.match(source, /Required administration controls/);
  assert.match(source, /Immutable audit trail/);
  assert.match(source, /No connected records means no account, property, verification, payment/);
  assert.match(source, /adminUser\.fullName/);
  assert.match(sidebar, /locals\.currentPage === 'management'[\s\S]*aria-current="page"/);
  assert.doesNotMatch(source, /<input|<select|<textarea|<button|onclick=|<script>(?!\s*<)/i);
});

test("admin verification review requires an authoritative provider case", () => {
  const source = fs.readFileSync(
    path.join(viewsRoot, "admin", "verification-review.ejs"),
    "utf8",
  );
  const sidebar = fs.readFileSync(
    path.join(viewsRoot, "admin", "partials", "sidebar-admin.ejs"),
    "utf8",
  );
  const routes = fs.readFileSync(
    path.join(projectRoot, "routes", "mainRoutes.js"),
    "utf8",
  );

  assert.match(source, /Verification service is not connected/);
  assert.match(source, /0 verification cases/);
  assert.match(source, /Required case record/);
  assert.match(source, /Required review workflow/);
  assert.match(source, /Sensitive identity evidence/);
  assert.match(source, /No connected case means no pending, approved, declined/);
  assert.match(source, /adminUser\.fullName/);
  assert.match(sidebar, /locals\.currentPage === 'verification-review'[\s\S]*aria-current="page"/);
  assert.match(routes, /"\/admin\/verification-review"[\s\S]*currentUser: req\.user/);
  assert.doesNotMatch(source, /<table|<input|<select|<textarea|<button|onclick=|<script>(?!\s*<)/i);
});

test("role-denied state uses safe authenticated recovery", () => {
  const source = fs.readFileSync(
    path.join(viewsRoot, "main", "403.ejs"),
    "utf8",
  );
  const middleware = fs.readFileSync(
    path.join(projectRoot, "middleware", "auth.js"),
    "utf8",
  );

  assert.match(source, /You do not have access to this page/);
  assert.match(source, /No account data or permission setting was changed/);
  assert.match(source, /Return to your workspace/);
  assert.match(source, /Permission privacy/);
  assert.match(source, /dashboardUrl\.startsWith\('\/'\)[\s\S]*href="<%= recoveryUrl %>"/);
  assert.match(middleware, /currentUser: req\.user/);
  assert.match(middleware, /dashboardUrl: getRoleHome\(req\.user\.role\)/);
  assert.doesNotMatch(source, /\/user\/' \+ userRole|\/user\/null|<button|onclick=|<script>(?!\s*<)/i);
});

test("not-found state preserves private role-aware recovery", () => {
  const source = fs.readFileSync(
    path.join(viewsRoot, "main", "404.ejs"),
    "utf8",
  );
  const server = fs.readFileSync(
    path.join(projectRoot, "server.js"),
    "utf8",
  );

  assert.match(source, /The page you requested is unavailable/);
  assert.match(source, /Private request details/);
  assert.match(source, /safeRecoveryUrl/);
  assert.match(source, /Browse help/);
  assert.match(server, /currentUser: req\.user/);
  assert.match(server, /recoveryUrl: req\.user \? getRoleHome\(req\.user\.role\) : "\/"/);
  assert.match(server, /requestedUrl: req\.originalUrl/);
  assert.doesNotMatch(source, /requestedUrl|href="#"|transition-all|<button|onclick=|<script>(?!\s*<)/i);
});

test("server-error state avoids unsafe retry and completion claims", () => {
  const source = fs.readFileSync(
    path.join(viewsRoot, "main", "500.ejs"),
    "utf8",
  );
  const server = fs.readFileSync(
    path.join(projectRoot, "server.js"),
    "utf8",
  );

  assert.match(source, /We could not complete this request/);
  assert.match(source, /cannot confirm from this page whether an earlier step completed or partially changed a record/);
  assert.match(source, /Do not immediately repeat a payment, submission, publication, or account change/);
  assert.match(source, /Report the failure safely/);
  assert.match(source, /safeRecoveryUrl/);
  assert.match(server, /res\.status\(500\)\.render\("main\/500"/);
  assert.match(server, /currentUser: req\.user/);
  assert.match(server, /recoveryUrl: req\.user \? getRoleHome\(req\.user\.role\) : "\/"/);
  assert.doesNotMatch(source, /Your information has not been changed|Try Again|window\.location\.reload|requestedUrl|err\.message|stack|<button|onclick=|<script>(?!\s*<)/i);
});
