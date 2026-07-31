// HomiFund shared responsive behavior
(function () {
  document.addEventListener("DOMContentLoaded", () => {
    setupResponsiveTables();
    setupSteppers();
    setupGalleryLayouts();
    setupPrototypeNavigation();
  });

  function setupResponsiveTables() {
    const tables = Array.from(document.querySelectorAll("table"));

    tables.forEach((table) => {
      let wrapper = table.parentElement;

      if (!wrapper) {
        return;
      }

      if (!wrapper.classList.contains("hf-table-scroll")) {
        if (wrapper.classList.contains("overflow-x-auto")) {
          wrapper.classList.add("hf-table-scroll");
        } else {
          const scrollWrapper = document.createElement("div");
          scrollWrapper.className = "hf-table-scroll";
          wrapper.insertBefore(scrollWrapper, table);
          scrollWrapper.appendChild(table);
          wrapper = scrollWrapper;
        }
      }

      if (
        !wrapper.nextElementSibling ||
        !wrapper.nextElementSibling.classList.contains("hf-table-hint")
      ) {
        const hint = document.createElement("p");
        hint.className = "hf-table-hint";
        hint.textContent = "Swipe horizontally to view all columns.";
        wrapper.insertAdjacentElement("afterend", hint);
      }
    });
  }



  function setupSteppers() {
    const candidates = Array.from(document.querySelectorAll("div")).filter(
      (element) => {
        const text = element.textContent || "";
        return (
          text.includes("Profile Setup") &&
          text.includes("Dashboard") &&
          element.querySelector(".rounded-full")
        );
      },
    );

    candidates.forEach((element) => {
      if (element.classList.contains("hf-stepper-track")) {
        return;
      }

      // already handled in the template (Tailwind overflow-x-auto wrapper)
      if (
        element.closest(".overflow-x-auto") ||
        element.classList.contains("overflow-x-auto")
      ) {
        return;
      }

      if (element.children.length < 4) {
        return;
      }

      const wrapper = document.createElement("div");
      wrapper.className = "hf-stepper-scroll";
      element.classList.add("hf-stepper-track");
      element.parentElement.insertBefore(wrapper, element);
      wrapper.appendChild(element);
    });
  }

  function setupGalleryLayouts() {
    document.querySelectorAll(".gallery-thumb").forEach((thumb) => {
      const grid = thumb.parentElement;

      if (grid) {
        grid.classList.add("hf-gallery-grid");
      }

      const hero = grid && grid.previousElementSibling;

      if (hero) {
        hero.classList.add("hf-gallery-hero");
      }
    });
  }

  function setupPrototypeNavigation() {
    const path = getCurrentPath();

    if (path.includes("/user/renter/")) {
      setupHeaderNavigation("renter");
      setupRenterNavigation(path);
      return;
    }

    if (path.includes("/user/landlord/properties/add/")) {
      setupHeaderNavigation("landlord");
      setupLandlordAddPropertyNavigation(path);
      return;
    }

    if (path.includes("/user/landlord/")) {
      setupHeaderNavigation("landlord");
      setupLandlordNavigation(path);
      return;
    }

    if (path.includes("/admin/")) {
      setupAdminNavigation();
      return;
    }

    setupPublicNavigation(path);
  }

  function setupPublicNavigation(path) {
    bindTextRoutes(["get started"], "signup");
    bindTextRoutes(["log in"], "login");

    if (path === "/" || path.endsWith("/index")) {
      bindTextRoutes(["create tenant profile", "list your property"], "signup");
    }

    if (path.endsWith("/about")) {
      bindTextRoutes(["get started"], "signup");
      bindTextRoutes(["view pricing"], "pricing");
    }

    if (path.endsWith("/contact")) {
      bindTextRoutes(
        [
          "visit renter help center",
          "visit landlord support",
          "view help center",
        ],
        "faqs",
      );
    }

    if (path.endsWith("/pricing")) {
      bindTextRoutes(["start free trial"], "signup");
      bindTextRoutes(["schedule demo"], "contact");
    }

    if (path.endsWith("/tenant-verification")) {
      bindTextRoutes(["back"], "onboarding-tenant");
      bindTextRoutes(["save and finish later"], "home");
    }

    if (path.endsWith("/landlord-verification")) {
      bindTextRoutes(["back"], "onboarding-landlord");
      bindTextRoutes(["save and finish later"], "home");
      bindTextRoutes(["continue to homiscore"], "landlord-homiscore-root", {
        allowHashAnchors: true,
      });
    }
  }

  function setupRenterNavigation(path) {
    bindTextRoutes(["view homiscore", "view assessment"], "renter-homiscore");
    bindTextRoutes(
      [
        "manage payments",
        "payment methods",
        "make a payment",
        "change payment method",
      ],
      "renter-payments",
    );
    bindTextRoutes(
      ["manage applications", "view all matches"],
      "renter-applications",
    );
    bindTextRoutes(
      [
        "update budget",
        "preview profile",
        "save changes",
        "manage application profile",
      ],
      "renter-profile",
    );
    bindTextRoutes(["contact support", "go to support"], "renter-support");

    if (path.endsWith("/dashboard")) {
      bindTextRoutes(["view details"], "renter-view-detail");
      bindActiveApplicationChevronRoutes();
    }

    if (path.endsWith("/applications")) {
      bindTextRoutes(["view"], "renter-view-property");
      bindTextRoutes(["apply"], "renter-applications");
    }
  }

  function setupLandlordNavigation(path) {
    bindTextRoutes(
      ["view full homiscore", "view full analytics", "view score details"],
      "landlord-homiscore",
    );
    bindTextRoutes(["message"], "landlord-messages");
    bindTextRoutes(["add property"], "landlord-add-start");
    bindTextRoutes(["review applicants"], "landlord-applicants");
    bindTextRoutes(["manage portfolio"], "landlord-properties");
    bindTextRoutes(
      ["manage payments", "payment methods", "payout settings"],
      "landlord-payments",
    );
    bindTextRoutes(["view calendar"], "landlord-calendar");
    bindTextRoutes(["contact support", "go to support"], "landlord-support");
    bindTextRoutes(["view all documents", "review"], "landlord-documents");

    if (path.endsWith("/properties")) {
      bindTextRoutes(
        ["add new property", "list new property"],
        "landlord-add-start",
      );
    }
  }

  function setupLandlordAddPropertyNavigation(path) {
    bindTextRoutes(["save draft"], "landlord-properties");
    bindTextRoutes(["continue to listing details"], "add-property-listing");
    bindTextRoutes(["back to address & property type"], "add-property-start");
    bindTextRoutes(["continue to rent & availability"], "add-property-rent");
    bindTextRoutes(["back to listing details"], "add-property-listing");
    bindTextRoutes(["continue to photos & documents"], "add-property-photos");
    bindTextRoutes(["back to rent & availability"], "add-property-rent");
    bindTextRoutes(["continue to review & publish"], "add-property-review");
    bindTextRoutes(["back to photos & documents"], "add-property-photos");

    if (path.endsWith("/review")) {
      bindNthTextRoute("edit", 0, "add-property-start");
      bindNthTextRoute("edit", 1, "add-property-listing");
      bindNthTextRoute("edit", 2, "add-property-rent");
      bindNthTextRoute("edit", 3, "add-property-photos");
    }
  }

  function setupAdminNavigation() {
    // Admin pages are simple static pages with no additional clickable controls yet.
  }

  function setupHeaderNavigation(role) {
    const header = document.querySelector("header");

    if (!header) {
      return;
    }

    header.querySelectorAll("button").forEach((button) => {
      if (!shouldBindElement(button)) {
        return;
      }

      const icon = button.querySelector(".material-symbols-outlined");
      const label = normalizeText(icon ? icon.textContent : button.textContent);

      if (label === "notifications") {
        bindRoute(
          button,
          role === "renter" ? "renter-notifications" : "landlord-notifications",
        );
      } else if (label === "settings") {
        bindRoute(
          button,
          role === "renter" ? "renter-settings" : "landlord-settings",
        );
      } else if (label === "chat_bubble") {
        bindRoute(
          button,
          role === "renter" ? "renter-messages" : "landlord-messages",
        );
      }
    });

    const profileCandidates = header.querySelectorAll(
      ".cursor-pointer, button, div",
    );
    Array.from(profileCandidates).forEach((element) => {
      if (
        element.querySelector(".text-right") &&
        element.querySelector("img, .rounded-full")
      ) {
        if (shouldBindElement(element)) {
          bindRoute(
            element,
            role === "renter" ? "renter-profile" : "landlord-profile",
          );
        }
      }
    });
  }

  function bindActiveApplicationChevronRoutes() {
    document.querySelectorAll("button").forEach((button) => {
      const label = normalizeText(button.textContent);
      const icon = button.querySelector(".material-symbols-outlined");
      const iconLabel = normalizeText(icon ? icon.textContent : "");

      if (
        label ||
        iconLabel !== "chevron_right" ||
        !shouldBindElement(button)
      ) {
        return;
      }

      const card = button.closest(".bg-surface-container-lowest");
      const cardText = normalizeText(card ? card.textContent : "");
      bindRoute(
        button,
        cardText.includes("viewing scheduled")
          ? "renter-view-detail"
          : "renter-applications",
      );
    });
  }

  function bindTextRoutes(labels, routeKey, options) {
    const normalizedLabels = Array.isArray(labels) ? labels : [labels];
    queryNavigableElements().forEach((element) => {
      const text = normalizeText(element.textContent);
      if (
        normalizedLabels.some(
          (label) =>
            text === label ||
            text.startsWith(label + " ") ||
            text.endsWith(" " + label),
        ) &&
        shouldBindElement(element, options)
      ) {
        bindRoute(element, routeKey, options);
      }
    });
  }

  function bindNthTextRoute(label, index, routeKey) {
    const matches = queryNavigableElements().filter(
      (element) =>
        normalizeText(element.textContent) === label &&
        shouldBindElement(element),
    );
    if (matches[index]) {
      bindRoute(matches[index], routeKey);
    }
  }

  function bindRoute(element, routeKey, options) {
    const target = resolveRoute(routeKey);

    if (!target || element.dataset.hfNavBound === target) {
      return;
    }

    if (element.tagName === "A") {
      const href = element.getAttribute("href");
      if (href === "#" || (options && options.allowHashAnchors)) {
        element.setAttribute("href", target);
      }
    } else if (element.tagName === "BUTTON" && !element.getAttribute("type")) {
      element.type = "button";
    }

    element.dataset.hfNavBound = target;
    element.addEventListener("click", (event) => {
      const tagName = element.tagName;
      if (tagName !== "A") {
        event.preventDefault();
      }
      window.location.href = target;
    });
  }

  function queryNavigableElements() {
    return Array.from(
      document.querySelectorAll('button, a, [role="button"], .cursor-pointer'),
    );
  }

  function shouldBindElement(element, options) {
    if (!element || element.dataset.hfNavBound) {
      return false;
    }

    if (element.closest("#modal, #action-modal, #calendar-modal")) {
      return false;
    }

    if (element.disabled || element.hasAttribute("data-action")) {
      return false;
    }

    if (
      element.id &&
      /^(message-host|reschedule|cancel-viewing|gallery-next|save-button|modal-close|modal-cancel|modal-confirm|today-button|prev-month|next-month|new-viewing-button|application-stage)$/.test(
        element.id,
      )
    ) {
      return false;
    }

    if (!(options && options.allowHashAnchors)) {
      if (element.getAttribute && element.getAttribute("onclick")) {
        return false;
      }

      if (element.tagName === "A") {
        const href = element.getAttribute("href");
        if (href && href !== "#") {
          return false;
        }
      }
    }

    return true;
  }

  function resolveRoute(routeKey) {
    const path = getCurrentPath();
    const rootRoutes = {
      home: "/",
      login: "/login",
      signup: "/signup",
      contact: "/contact",
      about: "/about",
      faqs: "/FAQs",
      pricing: "/pricing",
      "onboarding-tenant": "/onboarding-tenant",
      "onboarding-landlord": "/onboarding-landlord",
      "landlord-homiscore-root": "/user/landlord/homiscore",
    };

    if (path.includes("/user/renter/")) {
      return (
        {
          "renter-dashboard": "/user/renter/dashboard",
          "renter-homiscore": "/user/renter/homiscore",
          "renter-applications": "/user/renter/applications",
          "renter-documents": "/user/renter/documents",
          "renter-payments": "/user/renter/payments",
          "renter-profile": "/user/renter/profile",
          "renter-settings": "/user/renter/settings",
          "renter-support": "/user/renter/support",
          "renter-messages": "/user/renter/messages",
          "renter-notifications": "/user/renter/notification-bell",
          "renter-view-property": "/user/renter/view-property",
          "renter-view-detail": "/user/renter/view-detail",
        }[routeKey] || rootRoutes[routeKey]
      );
    }

    if (path.includes("/user/landlord/properties/add/")) {
      return (
        {
          "landlord-dashboard": "/user/landlord/dashboard",
          "landlord-properties": "/user/landlord/properties",
          "landlord-applicants": "/user/landlord/applicants",
          "landlord-documents": "/user/landlord/documents",
          "landlord-payments": "/user/landlord/payments",
          "landlord-homiscore": "/user/landlord/homiscore",
          "landlord-support": "/user/landlord/support",
          "landlord-settings": "/user/landlord/settings",
          "landlord-messages": "/user/landlord/messages",
          "landlord-notifications": "/user/landlord/notification-bell",
          "landlord-profile": "/user/landlord/user-profile",
          "landlord-calendar": "/user/landlord/view-calendar",
          "landlord-view-profile": "/user/landlord/view-profile",
          "landlord-add-start": "/user/landlord/properties/add/address",
          "add-property-start": "/user/landlord/properties/add/address",
          "add-property-listing":
            "/user/landlord/properties/add/listing-details",
          "add-property-rent": "/user/landlord/properties/add/rent",
          "add-property-photos": "/user/landlord/properties/add/photos",
          "add-property-review": "/user/landlord/properties/add/review",
        }[routeKey] || rootRoutes[routeKey]
      );
    }

    if (path.includes("/user/landlord/")) {
      return (
        {
          "landlord-dashboard": "/user/landlord/dashboard",
          "landlord-homiscore": "/user/landlord/homiscore",
          "landlord-properties": "/user/landlord/properties",
          "landlord-applicants": "/user/landlord/applicants",
          "landlord-documents": "/user/landlord/documents",
          "landlord-payments": "/user/landlord/payments",
          "landlord-support": "/user/landlord/support",
          "landlord-settings": "/user/landlord/settings",
          "landlord-messages": "/user/landlord/messages",
          "landlord-notifications": "/user/landlord/notification-bell",
          "landlord-profile": "/user/landlord/user-profile",
          "landlord-calendar": "/user/landlord/view-calendar",
          "landlord-view-profile": "/user/landlord/view-profile",
          "landlord-add-start": "/user/landlord/properties/add/address",
        }[routeKey] || rootRoutes[routeKey]
      );
    }

    if (path.includes("/admin/")) {
      return (
        {
          "admin-home": "/admin/management",
          "admin-review": "/admin/verification-review",
        }[routeKey] || rootRoutes[routeKey]
      );
    }

    return rootRoutes[routeKey];
  }

  function getCurrentPath() {
    return window.location.pathname.replace(/\\/g, "/").toLowerCase();
  }

  function normalizeText(text) {
    return (text || "").replace(/\s+/g, " ").trim().toLowerCase();
  }







})();
