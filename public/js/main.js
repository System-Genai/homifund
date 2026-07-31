// HomiFund shared responsive behavior
(function () {
  if (window.__homiFundSharedUiLoaded) {
    return;
  }

  window.__homiFundSharedUiLoaded = true;
  const drawerHandlers = [];

  const initialize = () => {
    setupAccessibleFoundation();
    setupDialogSemantics();
    setupResponsiveTables();
    setupDashboardDrawer();
    setupPublicHeaderDrawer();
    setupSteppers();
    setupGalleryLayouts();
    setupPrototypeNavigation();
    setupInteractiveSemantics();
    setupDisclosureSemantics();
    setupFaqExplorer();
    setupPasswordToggles();
    setupSubmittingForms();
    setupFeedbackFocus();
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initialize, { once: true });
  } else {
    initialize();
  }

  function setupPasswordToggles() {
    document.querySelectorAll("[data-password-toggle]").forEach((button) => {
      const input = document.getElementById(button.dataset.passwordToggle);
      const icon = button.querySelector(".material-symbols-outlined");

      if (!input) {
        return;
      }

      button.addEventListener("click", () => {
        const shouldShow = input.type === "password";
        const controlName = button.dataset.passwordName || "password";
        const showLabel = `Show ${controlName}`;
        const hideLabel = `Hide ${controlName}`;
        input.type = shouldShow ? "text" : "password";
        button.setAttribute("aria-pressed", String(shouldShow));
        button.setAttribute("aria-label", shouldShow ? hideLabel : showLabel);
        button.title = shouldShow ? hideLabel : showLabel;
        if (icon) {
          icon.textContent = shouldShow ? "visibility_off" : "visibility";
        }
        input.focus();
      });
    });
  }

  function setupDisclosureSemantics() {
    document.querySelectorAll("details[data-disclosure]").forEach((item, index) => {
      const summary = item.querySelector("summary");
      const panel = summary ? summary.nextElementSibling : null;

      if (!summary || !panel) {
        return;
      }

      summary.id = summary.id || `disclosure-question-${index + 1}`;
      panel.id = panel.id || `disclosure-panel-${index + 1}`;
      summary.setAttribute("aria-controls", panel.id);
      summary.setAttribute("aria-expanded", String(item.open));
      panel.setAttribute("role", "region");
      panel.setAttribute("aria-labelledby", summary.id);

      item.addEventListener("toggle", () => {
        summary.setAttribute("aria-expanded", String(item.open));
      });

      summary.addEventListener("keydown", (event) => {
        if (event.key !== "Enter" && event.key !== " ") {
          return;
        }

        event.preventDefault();
        item.open = !item.open;
      });
    });
  }

  function setupFaqExplorer() {
    const root = document.querySelector("[data-faq-explorer]");

    if (!root) {
      return;
    }

    const form = root.querySelector("[data-faq-search-form]");
    const search = root.querySelector("[data-faq-search]");
    const clear = root.querySelector("[data-faq-clear]");
    const reset = root.querySelector("[data-faq-reset]");
    const status = root.querySelector("[data-faq-status]");
    const empty = root.querySelector("[data-faq-empty]");
    const categoryButtons = Array.from(
      root.querySelectorAll("[data-faq-category]"),
    );
    const items = Array.from(root.querySelectorAll("[data-faq-item]"));
    const validCategories = new Set(
      categoryButtons.map((button) => button.dataset.faqCategory),
    );
    const initialParams = new URLSearchParams(window.location.search);
    let activeCategory = initialParams.get("category") || "all";

    if (!validCategories.has(activeCategory)) {
      activeCategory = "all";
    }

    items.forEach((item, index) => {
      const summary = item.querySelector("summary");
      const panel = summary ? summary.nextElementSibling : null;

      if (!summary || !panel) {
        return;
      }

      summary.id = summary.id || `faq-question-${index + 1}`;
      panel.id = panel.id || `faq-answer-${index + 1}`;
      summary.setAttribute("aria-controls", panel.id);
      summary.setAttribute("aria-expanded", String(item.open));
      panel.setAttribute("role", "region");
      panel.setAttribute("aria-labelledby", summary.id);

      item.addEventListener("toggle", () => {
        summary.setAttribute("aria-expanded", String(item.open));
      });

      summary.addEventListener("keydown", (event) => {
        if (event.key !== "Enter" && event.key !== " ") {
          return;
        }

        event.preventDefault();
        item.open = !item.open;
      });
    });

    search.value = (initialParams.get("q") || "").slice(0, 120);

    const applyFilters = ({ syncUrl = true } = {}) => {
      const query = normalizeText(search.value);
      let visibleCount = 0;

      items.forEach((item) => {
        const categoryMatches =
          activeCategory === "all" ||
          item.dataset.faqTopic === activeCategory;
        const queryMatches = !query || normalizeText(item.textContent).includes(query);
        const isVisible = categoryMatches && queryMatches;

        item.hidden = !isVisible;
        if (isVisible) {
          visibleCount += 1;
          if (query.length >= 2) {
            item.open = true;
          }
        }
      });

      categoryButtons.forEach((button) => {
        button.setAttribute(
          "aria-pressed",
          String(button.dataset.faqCategory === activeCategory),
        );
      });

      clear.hidden = !search.value;
      empty.hidden = visibleCount !== 0;
      status.textContent = `${visibleCount} ${visibleCount === 1 ? "result" : "results"}`;

      if (syncUrl) {
        const params = new URLSearchParams(window.location.search);
        if (search.value.trim()) {
          params.set("q", search.value.trim());
        } else {
          params.delete("q");
        }
        if (activeCategory !== "all") {
          params.set("category", activeCategory);
        } else {
          params.delete("category");
        }
        const queryString = params.toString();
        window.history.replaceState(
          null,
          "",
          `${window.location.pathname}${queryString ? `?${queryString}` : ""}${window.location.hash}`,
        );
      }
    };

    categoryButtons.forEach((button) => {
      button.addEventListener("click", () => {
        activeCategory = button.dataset.faqCategory;
        applyFilters();
      });
    });

    search.addEventListener("input", () => applyFilters());
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      applyFilters();
    });
    clear.addEventListener("click", () => {
      search.value = "";
      applyFilters();
      search.focus();
    });
    reset.addEventListener("click", () => {
      search.value = "";
      activeCategory = "all";
      applyFilters();
      search.focus();
    });

    applyFilters({ syncUrl: false });
  }

  function setupAccessibleFoundation() {
    const contentTarget = document.querySelector("main, body > section");

    if (contentTarget) {
      contentTarget.id = contentTarget.id || "main-content";

      if (!document.querySelector(".hf-skip-link")) {
        const skipLink = document.createElement("a");
        skipLink.className = "hf-skip-link";
        skipLink.href = "#" + contentTarget.id;
        skipLink.textContent = "Skip to main content";
        document.body.insertBefore(skipLink, document.body.firstChild);
      }
    }

    document
      .querySelectorAll("button, a")
      .forEach((element) => addIconControlLabel(element));

    document.querySelectorAll("button:not([type])").forEach((button) => {
      if (!button.closest("form")) {
        button.type = "button";
      }
    });

    document
      .querySelectorAll("input, select, textarea")
      .forEach((control) => addFallbackControlLabel(control));

    document.querySelectorAll("img").forEach((image, index) => {
      if (!image.hasAttribute("alt")) {
        image.alt = image.getAttribute("data-alt") || "";
      }

      if (index > 1 && !image.hasAttribute("loading")) {
        image.loading = "lazy";
      }

      image.decoding = "async";
    });

    syncCurrentRouteLinks(document);
  }

  function setupResponsiveTables() {
    const tables = Array.from(document.querySelectorAll("table"));

    tables.forEach((table) => {
      let wrapper = table.parentElement;
      const headers = Array.from(table.querySelectorAll("thead th")).map(
        (header) => header.textContent.trim(),
      );
      const headerText = normalizeText(headers.join(" "));
      const isComparisonTable =
        headerText.includes("individual") &&
        headerText.includes("professional") &&
        headerText.includes("institutional");

      table.classList.add(
        isComparisonTable ? "hf-comparison-table" : "hf-record-table",
      );

      if (!isComparisonTable && headers.length) {
        table.querySelectorAll("tbody tr").forEach((row) => {
          Array.from(row.children).forEach((cell, index) => {
            if (!cell.hasAttribute("data-label") && headers[index]) {
              cell.setAttribute("data-label", headers[index]);
            }
          });
        });
      }

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

      wrapper.classList.add(
        isComparisonTable
          ? "hf-comparison-table-scroll"
          : "hf-record-table-scroll",
      );

      if (
        !wrapper.nextElementSibling ||
        !wrapper.nextElementSibling.classList.contains("hf-table-hint")
      ) {
        const hint = document.createElement("p");
        hint.className = "hf-table-hint";
        hint.id = "hf-table-hint-" + Math.random().toString(36).slice(2, 9);
        hint.textContent = isComparisonTable
          ? "Scroll horizontally to compare all plans."
          : "Scroll horizontally to view all columns.";
        wrapper.insertAdjacentElement("afterend", hint);
        wrapper.setAttribute("tabindex", "0");
        wrapper.setAttribute("role", "region");
        wrapper.setAttribute("aria-label", "Scrollable data table");
        wrapper.setAttribute("aria-describedby", hint.id);
      }

      const hint = wrapper.nextElementSibling;

      if (hint && hint.classList.contains("hf-table-hint")) {
        const updateOverflowState = () => {
          const hasOverflow = wrapper.scrollWidth > wrapper.clientWidth + 1;
          wrapper.classList.toggle("has-overflow", hasOverflow);
          hint.hidden = !hasOverflow;
        };

        requestAnimationFrame(updateOverflowState);

        if ("ResizeObserver" in window) {
          const observer = new ResizeObserver(updateOverflowState);
          observer.observe(wrapper);
          observer.observe(table);
        }
      }
    });
  }

  function setupDashboardDrawer() {
    const sidebar = document.querySelector("aside.fixed.left-0.top-0");
    const main = document.querySelector("main");

    if (!sidebar || !main || !sidebar.querySelector("nav a")) {
      return;
    }

    let header =
      main.querySelector("header") ||
      Array.from(document.querySelectorAll("body > header")).find(
        (candidate) => !sidebar.contains(candidate),
      );

    if (!header) {
      header = createDashboardHeader(sidebar, main);
    }

    document.body.classList.add("hf-dashboard");
    document.body.style.setProperty(
      "--hf-sidebar-width",
      Math.max(240, Math.round(sidebar.getBoundingClientRect().width)) + "px",
    );
    sidebar.id = sidebar.id || "dashboard-navigation";
    sidebar.setAttribute("aria-label", "Dashboard navigation");
    sidebar.classList.add("hf-sidebar");
    main.classList.add("hf-dashboard-main");
    header.classList.add("hf-dashboard-header");

    const contentContainer = Array.from(main.children).find(
      (element) => element !== header,
    );

    if (contentContainer) {
      contentContainer.classList.add("hf-dashboard-content");

      if (contentContainer.firstElementChild) {
        contentContainer.firstElementChild.classList.add("hf-dashboard-page-header");
      }

      Array.from(contentContainer.children)
        .filter((element) => element.classList.contains("grid"))
        .forEach((element) => element.classList.add("hf-dashboard-grid"));
    }

    if (
      Array.from(main.classList).some((className) =>
        className.startsWith("pl-["),
      )
    ) {
      main.classList.add("hf-dashboard-main-offset-padding");
    }

    if (!main.contains(header)) {
      header.classList.add("hf-dashboard-header-outside");
    } else {
      main.classList.add("hf-dashboard-main-header-inside");
    }

    const searchContainer = findContainerWithSelector(
      header,
      'input[type="text"], input[type="search"]',
    );
    const controlsContainer = findControlsContainer(header, searchContainer);
    const profileText = controlsContainer
      ? controlsContainer.querySelector(".text-right")
      : null;

    if (searchContainer) {
      searchContainer.classList.add("hf-header-search");
    }

    const emptySearchContainer = Array.from(header.children).find(
      (element) =>
        element.querySelector &&
        element.querySelector('[data-icon="search"], .material-symbols-outlined') &&
        !element.querySelector("input"),
    );

    if (emptySearchContainer && normalizeText(emptySearchContainer.textContent) === "search") {
      emptySearchContainer.classList.add("hf-header-empty-search");
    }

    if (controlsContainer) {
      controlsContainer.classList.add("hf-header-controls");
    }

    if (profileText) {
      profileText.classList.add("hf-profile-text");
    }

    let menuButton = header.querySelector(".hf-menu-button");

    if (!menuButton) {
      menuButton = createIconButton(
        "menu",
        "Open navigation",
        "hf-menu-button",
      );
      header.insertBefore(menuButton, header.firstElementChild);
    }

    menuButton.setAttribute("aria-controls", sidebar.id);
    menuButton.setAttribute("aria-expanded", "false");

    let closeButton = sidebar.querySelector(".hf-drawer-close");

    if (!sidebar.querySelector(".hf-sidebar-header")) {
      const sidebarHeader = document.createElement("div");
      sidebarHeader.className = "hf-sidebar-header";
      const title = document.createElement("strong");
      title.textContent = "Menu";
      closeButton = createIconButton(
        "close",
        "Close navigation",
        "hf-drawer-close",
      );
      sidebarHeader.appendChild(title);
      sidebarHeader.appendChild(closeButton);
      sidebar.insertBefore(sidebarHeader, sidebar.firstChild);
    }

    const overlay = createOverlay();
    let returnFocus = null;

    menuButton.addEventListener("click", openDrawer);
    closeButton.addEventListener("click", () => closeDrawer(true));
    overlay.addEventListener("click", closeDrawer);
    document.addEventListener("keydown", handleDrawerKeydown);

    sidebar.querySelectorAll("a, button").forEach((element) => {
      element.addEventListener("click", () => {
        if (window.innerWidth < 1024) {
          closeDrawer(false);
        }
      });
    });

    drawerHandlers.push({ breakpoint: 1024, close: closeDrawer });
    syncSidebarState();
    document.body.classList.add("hf-dashboard-ready");

    function openDrawer() {
      returnFocus = document.activeElement;
      document.body.classList.add("hf-drawer-open", "hf-no-scroll");
      overlay.classList.add("is-open");
      overlay.removeAttribute("aria-hidden");
      sidebar.setAttribute("aria-hidden", "false");
      menuButton.setAttribute("aria-expanded", "true");
      closeButton.focus();
    }

    function closeDrawer(restoreFocus) {
      document.body.classList.remove("hf-drawer-open", "hf-no-scroll");
      overlay.classList.remove("is-open");
      overlay.setAttribute("aria-hidden", "true");
      menuButton.setAttribute("aria-expanded", "false");
      syncSidebarState();

      if (restoreFocus && returnFocus && returnFocus.focus) {
        returnFocus.focus();
      }
    }

    function syncSidebarState() {
      sidebar.setAttribute(
        "aria-hidden",
        window.innerWidth < 1024 ? "true" : "false",
      );
    }

    function handleDrawerKeydown(event) {
      if (!document.body.classList.contains("hf-drawer-open")) {
        return;
      }

      if (event.key === "Escape") {
        closeDrawer(true);
      } else if (event.key === "Tab") {
        keepFocusInside(sidebar, event);
      }
    }
  }

  function setupPublicHeaderDrawer() {
    if (document.body.classList.contains("hf-dashboard")) {
      return;
    }

    const header = document.querySelector("body > header, body > nav");

    if (!header) {
      return;
    }

    const nav = header.querySelector("nav") || findPublicNavGroup(header);

    if (!nav || !nav.querySelector("a")) {
      return;
    }

    document.body.classList.add("hf-public-page");
    header.classList.add("hf-site-header");

    const inner =
      header.firstElementChild && header.firstElementChild.children.length
        ? header.firstElementChild
        : header;
    inner.classList.add("hf-site-header-inner");
    nav.classList.add("hf-site-nav");

    const actionContainer = findPublicActionsContainer(inner, nav);
    const overlay = createOverlay();
    const drawer = document.createElement("div");
    drawer.className = "hf-mobile-drawer";
    drawer.id = "mobile-site-navigation";
    drawer.setAttribute("role", "dialog");
    drawer.setAttribute("aria-modal", "true");
    drawer.setAttribute("aria-label", "Site navigation");
    drawer.setAttribute("aria-hidden", "true");

    const drawerHeader = document.createElement("div");
    drawerHeader.className = "hf-mobile-drawer-header";
    const drawerTitle = document.createElement("strong");
    drawerTitle.textContent = "Menu";
    const closeButton = createIconButton(
      "close",
      "Close menu",
      "hf-drawer-close",
    );
    drawerHeader.appendChild(drawerTitle);
    drawerHeader.appendChild(closeButton);

    const drawerBody = document.createElement("div");
    drawerBody.className = "hf-mobile-drawer-body";
    nav
      .querySelectorAll("a")
      .forEach((link) => drawerBody.appendChild(link.cloneNode(true)));

    const drawerActions = document.createElement("div");
    drawerActions.className = "hf-mobile-drawer-actions";

    if (actionContainer) {
      actionContainer.classList.add("hf-site-actions");
      Array.from(actionContainer.children).forEach((child, index) => {
        if (index < actionContainer.children.length - 1) {
          child.classList.add("hf-hide-mobile");
        }

        if (child.matches("a, button")) {
          drawerActions.appendChild(child.cloneNode(true));
        } else {
          child
            .querySelectorAll("a, button")
            .forEach((action) =>
              drawerActions.appendChild(action.cloneNode(true)),
            );
        }
      });
    }

    drawer.appendChild(drawerHeader);
    drawer.appendChild(drawerBody);

    if (drawerActions.children.length) {
      drawer.appendChild(drawerActions);
    }

    document.body.appendChild(drawer);
    syncCurrentRouteLinks(header, true);
    syncCurrentRouteLinks(drawer, true);

    let menuButton = inner.querySelector(".hf-menu-button");

    if (!menuButton) {
      menuButton = createIconButton(
        "menu",
        "Open menu",
        "hf-menu-button",
      );
      inner.appendChild(menuButton);
    }

    menuButton.setAttribute("aria-controls", drawer.id);
    menuButton.setAttribute("aria-expanded", "false");

    menuButton.addEventListener("click", openDrawer);
    overlay.addEventListener("click", closeDrawer);
    closeButton.addEventListener("click", () => closeDrawer(true));
    drawer
      .querySelectorAll("a, button")
      .forEach((element) =>
        element.addEventListener("click", () => closeDrawer(false)),
      );
    document.addEventListener("keydown", handleDrawerKeydown);
    drawerHandlers.push({ breakpoint: 768, close: closeDrawer });

    let returnFocus = null;

    function openDrawer() {
      returnFocus = document.activeElement;
      drawer.classList.add("is-open");
      overlay.classList.add("is-open");
      document.body.classList.add("hf-no-scroll");
      drawer.setAttribute("aria-hidden", "false");
      overlay.removeAttribute("aria-hidden");
      menuButton.setAttribute("aria-expanded", "true");
      closeButton.focus();
    }

    function closeDrawer(restoreFocus) {
      drawer.classList.remove("is-open");
      overlay.classList.remove("is-open");
      document.body.classList.remove("hf-no-scroll");
      drawer.setAttribute("aria-hidden", "true");
      overlay.setAttribute("aria-hidden", "true");
      menuButton.setAttribute("aria-expanded", "false");

      if (restoreFocus && returnFocus && returnFocus.focus) {
        returnFocus.focus();
      }
    }

    function handleDrawerKeydown(event) {
      if (!drawer.classList.contains("is-open")) {
        return;
      }

      if (event.key === "Escape") {
        closeDrawer(true);
      } else if (event.key === "Tab") {
        keepFocusInside(drawer, event);
      }
    }
  }

  function syncCurrentRouteLinks(root, clearStaleState) {
    const currentPath = getCurrentPath().replace(/\/$/, "") || "/";

    root.querySelectorAll("a[href]").forEach((link) => {
      const url = new URL(link.href, window.location.origin);

      if (url.origin !== window.location.origin) {
        return;
      }

      const linkPath = url.pathname.toLowerCase().replace(/\/$/, "") || "/";
      const isCurrent = linkPath === currentPath && !url.hash;

      link.classList.toggle("hf-current-route", isCurrent);

      if (isCurrent) {
        link.setAttribute("aria-current", "page");
      } else if (clearStaleState) {
        link.removeAttribute("aria-current");
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

  function setupDialogSemantics() {
    document
      .querySelectorAll("#modal, #action-modal, #calendar-modal")
      .forEach((dialog, index) => {
        let wasOpen = false;
        let returnFocus = null;

        dialog.setAttribute("role", "dialog");
        dialog.setAttribute("aria-modal", "true");
        dialog.setAttribute("tabindex", "-1");

        if (!dialog.hasAttribute("aria-label") && !dialog.hasAttribute("aria-labelledby")) {
          const heading = dialog.querySelector("h1, h2, h3, [data-dialog-title]");

          if (heading) {
            heading.id = heading.id || "hf-dialog-title-" + (index + 1);
            dialog.setAttribute("aria-labelledby", heading.id);
          }
        }

        const syncDialogState = () => {
          const isOpen = !dialog.hidden && !dialog.classList.contains("hidden");
          dialog.setAttribute("aria-hidden", isOpen ? "false" : "true");

          if (isOpen && !wasOpen) {
            returnFocus = document.activeElement;
            document.body.classList.add("hf-no-scroll");
            dialog
              .querySelectorAll("button, a")
              .forEach((element) => addIconControlLabel(element));
            dialog
              .querySelectorAll("input, select, textarea")
              .forEach((control) => addFallbackControlLabel(control));

            const focusTarget = dialog.querySelector(
              '[data-autofocus], input:not([type="hidden"]), textarea, select, button, a[href]',
            );
            (focusTarget || dialog).focus();
          } else if (!isOpen && wasOpen) {
            document.body.classList.remove("hf-no-scroll");

            if (returnFocus && returnFocus.focus) {
              returnFocus.focus();
            }
          }

          wasOpen = isOpen;
        };

        const observer = new MutationObserver(syncDialogState);
        observer.observe(dialog, {
          attributes: true,
          attributeFilter: ["class", "hidden"],
        });
        syncDialogState();

        dialog.addEventListener("keydown", (event) => {
          if (event.key === "Escape") {
            const closeButton = dialog.querySelector(
              '#modal-close, #modal-cancel, [data-dialog-close]',
            );

            if (closeButton) {
              closeButton.click();
            }
          } else if (event.key === "Tab") {
            keepFocusInside(dialog, event);
          }
        });
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

  function setupInteractiveSemantics() {
    document
      .querySelectorAll(".cursor-pointer, [onclick]")
      .forEach((element) => {
        if (
          element.matches(
            "a, button, input, label, select, textarea, summary, details, [role]",
          )
        ) {
          return;
        }

        const hasAction =
          element.hasAttribute("onclick") || element.dataset.hfNavBound;

        if (!hasAction) {
          element.classList.remove("cursor-pointer");
          return;
        }

        element.setAttribute(
          "role",
          element.dataset.hfNavBound ? "link" : "button",
        );
        element.setAttribute("tabindex", "0");
        element.addEventListener("keydown", (event) => {
          if (
            event.key === "Enter" ||
            (event.key === " " && element.getAttribute("role") === "button")
          ) {
            event.preventDefault();
            element.click();
          }
        });
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
    faqs: "/faqs",
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

  function createOverlay() {
    const overlay = document.createElement("div");
    overlay.className = "hf-drawer-overlay";
    overlay.setAttribute("aria-hidden", "true");
    document.body.appendChild(overlay);
    return overlay;
  }

  function createDashboardHeader(sidebar, main) {
    const header = document.createElement("header");
    header.className = "hf-generated-dashboard-header";

    const titleGroup = document.createElement("div");
    titleGroup.className = "hf-generated-dashboard-title";

    const title = document.createElement("strong");
    title.textContent =
      (sidebar.querySelector("p") && sidebar.querySelector("p").textContent.trim()) ||
      "Dashboard";

    titleGroup.appendChild(title);
    header.appendChild(titleGroup);
    main.parentElement.insertBefore(header, main);
    return header;
  }

  function createIconButton(iconName, label, className) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = className;
    button.setAttribute("aria-label", label);
    button.innerHTML =
      '<span class="material-symbols-outlined">' + iconName + "</span>";
    return button;
  }

  function addIconControlLabel(element) {
    if (element.hasAttribute("aria-label") || element.hasAttribute("aria-labelledby")) {
      return;
    }

    const icon = element.querySelector(".material-symbols-outlined");

    if (!icon) {
      return;
    }

    const visibleText = Array.from(element.childNodes)
      .filter((node) => node !== icon)
      .map((node) => node.textContent || "")
      .join(" ")
      .replace(/\s+/g, " ")
      .trim();

    if (visibleText) {
      icon.setAttribute("aria-hidden", "true");
      return;
    }

    const iconLabels = {
      notifications: "Notifications",
      settings: "Settings",
      chat_bubble: "Messages",
      search: "Search",
      chevron_left: "Previous",
      chevron_right: "Next",
      more_vert: "More actions",
      close: "Close",
      menu: "Menu",
      edit: "Edit",
      delete: "Delete",
      download: "Download",
      visibility: "View details",
    };
    const iconName = normalizeText(icon.textContent);
    const label = iconLabels[iconName] || iconName.replace(/_/g, " ");

    if (label) {
      element.setAttribute("aria-label", label.charAt(0).toUpperCase() + label.slice(1));
      icon.setAttribute("aria-hidden", "true");
    }
  }

  function addFallbackControlLabel(control) {
    const nearbyLabel =
      control.parentElement &&
      Array.from(control.parentElement.children).find(
        (element) => element.tagName === "LABEL",
      );

    if (nearbyLabel && !nearbyLabel.contains(control)) {
      control.id =
        control.id || "hf-control-" + Math.random().toString(36).slice(2, 9);
      nearbyLabel.setAttribute("for", control.id);
    }

    if (
      control.hasAttribute("aria-label") ||
      control.hasAttribute("aria-labelledby") ||
      (control.id && document.querySelector('label[for="' + control.id + '"]')) ||
      control.closest("label")
    ) {
      return;
    }

    const label =
      control.getAttribute("placeholder") ||
      control.getAttribute("name") ||
      control.id ||
      (control.tagName === "SELECT" &&
        control.options.length &&
        control.options[0].textContent) ||
      control.getAttribute("type");

    if (label && label !== "hidden") {
      control.setAttribute(
        "aria-label",
        label.replace(/[-_]+/g, " ").replace(/\s+/g, " ").trim(),
      );
    }
  }

  function setupSubmittingForms() {
    document.querySelectorAll("form[data-submit-feedback]").forEach((form) => {
      const submitButtons = Array.from(
        form.querySelectorAll('button[type="submit"]'),
      );

      if (!submitButtons.length || form.dataset.hfSubmitBound === "true") {
        return;
      }

      form.dataset.hfSubmitBound = "true";
      const originalButtons = submitButtons.map((button) => ({
        button,
        html: button.innerHTML,
      }));

      const reset = () => {
        form.removeAttribute("aria-busy");
        originalButtons.forEach(({ button, html }) => {
          button.disabled = false;
          button.innerHTML = html;
        });
      };

      form.addEventListener("submit", (event) => {
        const submitButton = event.submitter || submitButtons[0];
        const bypassesValidation = submitButton.formNoValidate;

        if (!bypassesValidation && !form.checkValidity()) {
          return;
        }

        form.setAttribute("aria-busy", "true");
        submitButtons.forEach((button) => {
          button.disabled = true;
        });
        submitButton.textContent =
          submitButton.dataset.pendingLabel ||
          form.dataset.submitLabel ||
          "Submitting...";
      });

      window.addEventListener("pageshow", reset);
    });
  }

  function setupFeedbackFocus() {
    const feedback = document.querySelector("[data-focus-feedback]");

    if (feedback) {
      const focusFeedback = () => {
        window.requestAnimationFrame(() => feedback.focus());
      };

      if (document.readyState === "complete") {
        focusFeedback();
      } else {
        window.addEventListener("load", focusFeedback, { once: true });
      }
    }
  }

  function keepFocusInside(container, event) {
    const focusable = Array.from(
      container.querySelectorAll(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      ),
    ).filter((element) => element.getClientRects().length > 0);

    if (!focusable.length) {
      event.preventDefault();
      return;
    }

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  function findContainerWithSelector(root, selector) {
    return (
      Array.from(root.querySelectorAll("div")).find((element) =>
        element.querySelector(selector),
      ) || null
    );
  }

  function findControlsContainer(header, searchContainer) {
    const children = Array.from(header.children).filter(
      (element) => element !== searchContainer && element.tagName !== "SCRIPT",
    );
    return (
      children
        .reverse()
        .find((element) => element.querySelector("button, a")) || null
    );
  }

  function findPublicActionsContainer(inner, nav) {
    const children = Array.from(inner.children);
    return (
      children
        .reverse()
        .find(
          (element) =>
            element !== nav &&
            element.querySelector &&
            element.querySelector("a, button"),
        ) || null
    );
  }

  function findPublicNavGroup(header) {
    const inner =
      header.firstElementChild && header.firstElementChild.children.length
        ? header.firstElementChild
        : header;
    return (
      Array.from(inner.children).find((element) => {
        if (!element.querySelectorAll) {
          return false;
        }

        const links = element.querySelectorAll("a");
        return links.length >= 2 && !element.querySelector("button");
      }) || null
    );
  }

  window.addEventListener("resize", () => {
    drawerHandlers.forEach((handler) => {
      if (window.innerWidth >= handler.breakpoint) {
        handler.close(false);
      }
    });
  });
})();
