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

    setupHeaderDropdowns(header, role);

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

    const profileCandidates = header.querySelectorAll(".cursor-pointer, button");
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

  function setupHeaderDropdowns(header, role) {
    const notificationLink = header.querySelector(
      `a[href="/user/${role}/notification-bell"]`,
    );
    const messageLink = header.querySelector(`a[href="/user/${role}/messages"]`);

    enhanceHeaderDropdown(
      notificationLink,
      "Notifications",
      buildNotificationsDropdown(role),
    );
    enhanceHeaderDropdown(messageLink, "Messages", buildMessagesDropdown(role));
  }

  function enhanceHeaderDropdown(link, label, dropdownHtml) {
    if (!link || link.dataset.hfDropdownBound) {
      return;
    }

    const wrapper = document.createElement("div");
    wrapper.className = "relative";
    link.parentNode.insertBefore(wrapper, link);
    wrapper.appendChild(link);

    const dropdown = document.createElement("div");
    dropdown.className =
      "hidden absolute right-0 top-12 w-[calc(100vw-2rem)] max-w-[450px] sm:w-[450px] bg-surface-container-lowest border border-outline-variant rounded-xl shadow-lg overflow-hidden z-50";
    dropdown.setAttribute("role", "dialog");
    dropdown.setAttribute("aria-label", label);
    dropdown.dataset.hfHeaderDropdown = label.toLowerCase();
    dropdown.innerHTML = dropdownHtml;
    wrapper.appendChild(dropdown);

    if (label === "Messages") {
      setupHeaderMessageActions(dropdown, roleFromLink(link));
    }

    if (label === "Notifications") {
      setupHeaderNotificationActions(dropdown);
    }

    link.dataset.hfDropdownBound = "true";
    link.setAttribute("aria-haspopup", "dialog");
    link.setAttribute("aria-expanded", "false");

    function setOpen(open) {
      closeHeaderDropdowns(dropdown);
      dropdown.classList.toggle("hidden", !open);
      link.setAttribute("aria-expanded", String(open));
      link.classList.toggle("bg-secondary-container", open);
      link.classList.toggle("text-primary", open);
    }

    link.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      setOpen(dropdown.classList.contains("hidden"));
    });

    dropdown.addEventListener("click", (event) => {
      event.stopPropagation();
    });

    document.addEventListener("click", () => setOpen(false));
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    });
  }

  function roleFromLink(link) {
    return link.getAttribute("href")?.includes("/user/renter/")
      ? "renter"
      : "landlord";
  }

  function closeHeaderDropdowns(exceptDropdown) {
    document.querySelectorAll("[data-hf-header-dropdown]").forEach((dropdown) => {
      if (dropdown === exceptDropdown) {
        return;
      }

      dropdown.classList.add("hidden");
      const trigger = dropdown.parentElement?.querySelector(
        "[data-hf-dropdown-bound]",
      );
      if (trigger) {
        trigger.setAttribute("aria-expanded", "false");
        trigger.classList.remove("bg-secondary-container", "text-primary");
      }
    });
  }

  function buildNotificationsDropdown(role) {
    const viewAllHref = `/user/${role}/notification-bell`;
    const primaryHref =
      role === "renter" ? "/user/renter/applications" : "/user/landlord/applicants";
    const secondaryHref =
      role === "renter" ? "/user/renter/dashboard" : "/user/landlord/view-calendar";
    const documentHref =
      role === "renter" ? "/user/renter/documents" : "/user/landlord/documents";

    return `
      <div class="px-4 sm:px-5 py-4 border-b border-outline-variant flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
        <div>
          <h3 class="text-sm font-bold text-on-surface">Notifications</h3>
          <p class="text-xs text-on-surface-variant mt-1">Recent updates from HomiFund</p>
        </div>
        <button type="button" data-action="header-dropdown-preview" class="text-xs text-primary font-bold hover:underline whitespace-nowrap">Mark all as read</button>
      </div>
      <div class="divide-y divide-outline-variant">
        <a href="${primaryHref}" class="flex gap-3 px-5 py-4 hover:bg-surface-container-low transition-colors">
          <span class="w-9 h-9 rounded-full bg-secondary-container text-primary flex items-center justify-center shrink-0"><span class="material-symbols-outlined text-[18px]">assignment</span></span>
          <span class="min-w-0">
            <span class="block text-sm font-semibold text-on-surface">${role === "renter" ? "Application update" : "New application received"}</span>
            <span class="block text-xs text-on-surface-variant mt-1">${role === "renter" ? "You have an update in your Applications workspace." : "A renter submitted an application for one of your properties."}</span>
          </span>
          <span data-notification-unread class="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0"></span>
        </a>
        <a href="${secondaryHref}" class="flex gap-3 px-5 py-4 hover:bg-surface-container-low transition-colors">
          <span class="w-9 h-9 rounded-full bg-secondary-container text-primary flex items-center justify-center shrink-0"><span class="material-symbols-outlined text-[18px]">${role === "renter" ? "search" : "event"}</span></span>
          <span class="min-w-0">
            <span class="block text-sm font-semibold text-on-surface">${role === "renter" ? "Property match" : "Viewing update"}</span>
            <span class="block text-xs text-on-surface-variant mt-1">${role === "renter" ? "A property may match your rental preferences." : "There is an update for one of your scheduled viewings."}</span>
          </span>
          <span data-notification-unread class="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0"></span>
        </a>
        <a href="${documentHref}" class="flex gap-3 px-5 py-4 hover:bg-surface-container-low transition-colors">
          <span class="w-9 h-9 rounded-full bg-secondary-container text-primary flex items-center justify-center shrink-0"><span class="material-symbols-outlined text-[18px]">description</span></span>
          <span class="min-w-0">
            <span class="block text-sm font-semibold text-on-surface">Document reminder</span>
            <span class="block text-xs text-on-surface-variant mt-1">${role === "renter" ? "Review any documents needed for your active applications." : "A document related to a property or application may need your attention."}</span>
          </span>
        </a>
      </div>
      <div class="px-5 py-3 bg-surface-container-low border-t border-outline-variant">
        <a href="${viewAllHref}" class="text-xs text-primary font-bold hover:underline">View all notifications</a>
      </div>
    `;
  }

  function buildMessagesDropdown(role) {
    const conversations =
      role === "renter"
        ? [
            ["sapphire", "TS", "The Sapphire Suites", "Landlord: The viewing is confirmed for Tuesday at 2:00 PM.", "Now"],
            ["bricklane", "BL", "Brick Lane Lofts", "Lettings agent: Thanks for your application. We will be in touch soon.", "Yesterday"],
            ["regents", "RP", "Regent's Park Estate", "Property team: Your application is currently under review.", "Mon"],
          ]
        : [
            ["james", "JC", "James Carter", "Applicant: Thank you, I can attend the viewing tomorrow.", "Now"],
            ["elena", "ER", "Elena Rossi", "Applicant: I have uploaded the requested application document.", "Yesterday"],
            ["agent", "LA", "Lettings agent", "Agent: A viewing request has been added to your calendar.", "Mon"],
          ];

    return `
      <div class="px-4 sm:px-5 py-4 border-b border-outline-variant flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
        <div>
          <h3 class="text-sm font-bold text-on-surface">Messages</h3>
          <p class="text-xs text-on-surface-variant mt-1">${role === "renter" ? "Conversations about your applications and viewings" : "Conversations with renters and letting agents"}</p>
        </div>
        <button type="button" data-message-open class="text-xs text-primary font-bold hover:underline whitespace-nowrap">Open messages</button>
      </div>
      <div class="divide-y divide-outline-variant">
        ${conversations
          .map(
            ([id, initials, title, text, time], index) => `
              <button type="button" data-action="header-dropdown-preview" data-message-conversation="${id}" class="w-full text-left flex gap-3 px-5 py-4 hover:bg-surface-container-low transition-colors">
                <span class="w-10 h-10 rounded-full bg-secondary-container text-primary flex items-center justify-center shrink-0 font-bold text-xs">${initials}</span>
                <span class="min-w-0 flex-1">
                  <span class="flex items-center justify-between gap-3">
                    <span class="text-sm font-semibold text-on-surface truncate">${title}</span>
                    <span class="text-[11px] text-on-surface-variant shrink-0">${time}</span>
                  </span>
                  <span class="block text-xs text-on-surface-variant mt-0.5 truncate">${text}</span>
                </span>
                ${index === 0 ? '<span class="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0"></span>' : ""}
              </button>
            `,
          )
          .join("")}
      </div>
      <div class="px-5 py-3 bg-surface-container-low border-t border-outline-variant">
        <button type="button" data-message-open class="text-xs text-primary font-bold hover:underline">View all messages</button>
      </div>
    `;
  }

  function setupHeaderNotificationActions(dropdown) {
    dropdown
      .querySelector("[data-action='header-dropdown-preview']")
      ?.addEventListener("click", () => {
        dropdown
          .querySelectorAll("[data-notification-unread]")
          .forEach((dot) => dot.classList.add("hidden"));
      });
  }

  function setupHeaderMessageActions(dropdown, role) {
    dropdown.querySelectorAll("[data-message-open]").forEach((button) => {
      button.addEventListener("click", () => openHeaderMessagesWorkspace(role));
    });

    dropdown.querySelectorAll("[data-message-conversation]").forEach((button) => {
      button.addEventListener("click", () =>
        openHeaderMessagesWorkspace(role, button.dataset.messageConversation),
      );
    });
  }

  function openHeaderMessagesWorkspace(role, conversationId) {
    closeHeaderDropdowns();

    const existingWorkspace = document.getElementById(
      role === "renter" ? "messages-workspace" : "landlord-messages-workspace",
    );

    if (existingWorkspace) {
      existingWorkspace.classList.remove("hidden");
      document.body.classList.add("overflow-hidden");
      const targetRow = existingWorkspace.querySelector(
        `[data-conversation="${conversationId || ""}"]`,
      );
      if (targetRow) {
        targetRow.click();
      }
      return;
    }

    const workspace = ensureHeaderMessagesWorkspace(role);
    workspace.classList.remove("hidden");
    document.body.classList.add("overflow-hidden");
    setHeaderWorkspaceConversation(workspace, role, conversationId);
  }

  function ensureHeaderMessagesWorkspace(role) {
    let workspace = document.getElementById("hf-header-messages-workspace");

    if (workspace) {
      return workspace;
    }

    workspace = document.createElement("div");
    workspace.id = "hf-header-messages-workspace";
    workspace.className =
      "hidden fixed inset-0 z-[70] bg-on-surface/20 backdrop-blur-[1px]";
    workspace.innerHTML = buildHeaderMessagesWorkspace(role);
    document.body.appendChild(workspace);

    workspace
      .querySelector("[data-message-close]")
      ?.addEventListener("click", () => closeHeaderMessagesWorkspace(workspace));
    workspace.addEventListener("click", (event) => {
      if (event.target === workspace) {
        closeHeaderMessagesWorkspace(workspace);
      }
    });
    workspace.querySelectorAll("[data-conversation]").forEach((row) => {
      row.addEventListener("click", () =>
        setHeaderWorkspaceConversation(
          workspace,
          role,
          row.dataset.conversation,
        ),
      );
    });
    workspace
      .querySelector("[data-message-send]")
      ?.addEventListener("click", () => sendHeaderWorkspaceMessage(workspace));
    workspace
      .querySelector("[data-message-input]")
      ?.addEventListener("keydown", (event) => {
        if (event.key === "Enter" && !event.shiftKey) {
          event.preventDefault();
          sendHeaderWorkspaceMessage(workspace);
        }
      });

    return workspace;
  }

  function closeHeaderMessagesWorkspace(workspace) {
    workspace.classList.add("hidden");
    document.body.classList.remove("overflow-hidden");
  }

  function getHeaderConversations(role) {
    return role === "renter"
      ? {
          sapphire: {
            initials: "TS",
            title: "The Sapphire Suites",
            subtitle: "Landlord - Application and viewing messages",
            preview: "Landlord - Viewing confirmed",
            time: "Now",
            messages: [
              ["them", "Hello Marcus, thanks for your interest in The Sapphire Suites.", "Today, 10:12"],
              ["me", "Thank you. I would like to confirm the viewing details.", "Today, 10:18"],
              ["them", "The viewing is confirmed for Tuesday at 2:00 PM. Please let us know if anything changes.", "Now"],
            ],
          },
          bricklane: {
            initials: "BL",
            title: "Brick Lane Lofts",
            subtitle: "Lettings agent - Application messages",
            preview: "Lettings agent - Application update",
            time: "Yesterday",
            messages: [
              ["them", "Thanks for your application for Brick Lane Lofts.", "Yesterday, 15:42"],
              ["me", "Thank you. Please let me know if you need anything else from me.", "Yesterday, 16:05"],
            ],
          },
          regents: {
            initials: "RP",
            title: "Regent's Park Estate",
            subtitle: "Property team - Application messages",
            preview: "Property team - Application under review",
            time: "Mon",
            messages: [
              ["them", "Your application is currently under review.", "Monday, 11:26"],
              ["me", "Thank you for the update.", "Monday, 11:31"],
            ],
          },
        }
      : {
          james: {
            initials: "JC",
            title: "James Carter",
            subtitle: "Applicant - Canary Wharf Suite",
            preview: "Canary Wharf Suite - Viewing",
            time: "Now",
            messages: [
              ["me", "Hello James, thank you for your application for Canary Wharf Suite.", "Today, 09:52"],
              ["them", "Thank you. I can attend the viewing tomorrow.", "Today, 10:01"],
              ["me", "Great. The viewing is confirmed for tomorrow at 2:00 PM.", "Now"],
            ],
          },
          elena: {
            initials: "ER",
            title: "Elena Rossi",
            subtitle: "Applicant - Shoreditch Warehouse Loft",
            preview: "Shoreditch Warehouse Loft - Application",
            time: "Yesterday",
            messages: [
              ["me", "Thank you for your application for Shoreditch Warehouse Loft.", "Yesterday, 14:18"],
              ["them", "I have uploaded the requested application document.", "Yesterday, 14:34"],
            ],
          },
          agent: {
            initials: "LA",
            title: "Lettings agent",
            subtitle: "Portfolio updates and viewing requests",
            preview: "Portfolio updates and viewing requests",
            time: "Mon",
            messages: [
              ["them", "A viewing request has been added to your calendar.", "Monday, 09:20"],
              ["me", "Thanks. Please confirm the prospective renter has received the viewing details.", "Monday, 09:26"],
            ],
          },
        };
  }

  function buildHeaderMessagesWorkspace(role) {
    const conversations = getHeaderConversations(role);
    const firstConversation = Object.keys(conversations)[0];
    const intro =
      role === "renter"
        ? "Chat with landlords and letting agents about your properties and applications."
        : "Chat with renters and letting agents about applications, viewings and properties.";

    return `
      <div class="absolute right-0 top-0 h-full w-full max-w-[940px] bg-surface-container-lowest border-l border-outline-variant shadow-2xl flex flex-col">
        <div class="h-auto min-h-16 py-3 px-4 sm:px-6 border-b border-outline-variant flex items-start sm:items-center justify-between gap-3 shrink-0">
          <div>
            <p class="text-sm font-bold text-on-surface">Messages</p>
            <p class="text-xs text-on-surface-variant mt-0.5">${intro}</p>
          </div>
          <button type="button" data-message-close class="p-2 rounded-full hover:bg-surface-container-low text-on-surface-variant" aria-label="Close messages">
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>
        <div class="min-h-0 flex flex-1">
          <aside class="w-full md:w-[300px] lg:w-[310px] border-r border-outline-variant bg-surface shrink-0 flex flex-col min-h-0">
            <div class="p-4 border-b border-outline-variant">
              <div class="relative">
                <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">search</span>
                <input class="w-full pl-9 pr-3 py-2 bg-surface-container-low border border-outline-variant rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" placeholder="Search messages" type="text" />
              </div>
            </div>
            <div class="overflow-y-auto">
              ${Object.entries(conversations)
                .map(
                  ([id, conversation], index) => `
                    <button type="button" data-conversation="${id}" class="w-full text-left p-4 border-b border-outline-variant ${index === 0 ? "bg-secondary-container" : "hover:bg-surface-container-low"}">
                      <span class="flex gap-3">
                        <span class="w-10 h-10 rounded-full ${index === 0 ? "bg-primary text-white" : "bg-secondary-container text-primary"} flex items-center justify-center shrink-0 font-bold text-xs">${conversation.initials}</span>
                        <span class="min-w-0 flex-1">
                          <span class="flex justify-between gap-2">
                            <span class="text-sm font-semibold ${index === 0 ? "text-primary" : "text-on-surface"} truncate">${conversation.title}</span>
                            <span class="text-[11px] text-on-surface-variant shrink-0">${conversation.time}</span>
                          </span>
                          <span class="block text-xs text-on-surface-variant mt-0.5 truncate">${conversation.preview}</span>
                        </span>
                      </span>
                    </button>
                  `,
                )
                .join("")}
            </div>
          </aside>
          <section class="hidden md:flex min-w-0 flex-1 flex-col">
            <div class="p-4 sm:p-5 border-b border-outline-variant flex items-center gap-3 shrink-0">
              <span data-active-avatar class="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold text-xs"></span>
              <span class="min-w-0">
                <span data-active-title class="block text-sm font-bold text-on-surface"></span>
                <span data-active-subtitle class="block text-xs text-on-surface-variant mt-0.5"></span>
              </span>
            </div>
            <div data-message-thread class="flex-1 overflow-y-auto p-4 sm:p-6 bg-surface space-y-4"></div>
            <div class="p-4 border-t border-outline-variant bg-surface-container-lowest shrink-0">
              <div class="flex items-end gap-3">
                <button type="button" class="p-2 rounded-full hover:bg-surface-container-low text-on-surface-variant" aria-label="Attach document">
                  <span class="material-symbols-outlined">attach_file</span>
                </button>
                <textarea data-message-input class="flex-1 min-h-[44px] max-h-28 px-3 py-2.5 bg-surface border border-outline-variant rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/20" placeholder="Write a message..." rows="1"></textarea>
                <button type="button" data-message-send class="bg-primary text-white p-2.5 rounded-lg hover:bg-primary-container" aria-label="Send message">
                  <span class="material-symbols-outlined">send</span>
                </button>
              </div>
              <p class="text-[11px] text-on-surface-variant mt-2">
                Messages are for property and application communication. Do not share sensitive information unless it is needed for your application.
              </p>
            </div>
          </section>
        </div>
      </div>
      <span data-default-conversation="${firstConversation}" hidden></span>
    `;
  }

  function setHeaderWorkspaceConversation(workspace, role, conversationId) {
    const conversations = getHeaderConversations(role);
    const id = conversationId && conversations[conversationId]
      ? conversationId
      : Object.keys(conversations)[0];
    const conversation = conversations[id];

    workspace.querySelectorAll("[data-conversation]").forEach((row) => {
      const selected = row.dataset.conversation === id;
      row.classList.toggle("bg-secondary-container", selected);
      row.classList.toggle("hover:bg-surface-container-low", !selected);
      row.querySelector(".rounded-full")?.classList.toggle("bg-primary", selected);
      row.querySelector(".rounded-full")?.classList.toggle("text-white", selected);
      row.querySelector(".rounded-full")?.classList.toggle("bg-secondary-container", !selected);
      row.querySelector(".rounded-full")?.classList.toggle("text-primary", !selected);
      row.querySelector(".font-semibold")?.classList.toggle("text-primary", selected);
      row.querySelector(".font-semibold")?.classList.toggle("text-on-surface", !selected);
    });

    workspace.querySelector("[data-active-avatar]").textContent =
      conversation.initials;
    workspace.querySelector("[data-active-title]").textContent =
      conversation.title;
    workspace.querySelector("[data-active-subtitle]").textContent =
      conversation.subtitle;
    workspace.dataset.activeConversation = id;
    renderHeaderWorkspaceThread(workspace, conversation.messages);
    setTimeout(() => workspace.querySelector("[data-message-input]")?.focus(), 60);
  }

  function renderHeaderWorkspaceThread(workspace, messages) {
    const thread = workspace.querySelector("[data-message-thread]");
    thread.innerHTML = messages
      .map(([side, text, time]) => {
        const own = side === "me";
        return `
          <div class="flex ${own ? "justify-end" : "justify-start"}">
            <div class="max-w-[75%]">
              <div class="${own ? "bg-primary text-white" : "bg-surface-container-lowest border border-outline-variant text-on-surface"} rounded-xl px-4 py-3 text-sm">${text}</div>
              <p class="text-[11px] text-on-surface-variant mt-1 ${own ? "text-right" : ""}">${time}</p>
            </div>
          </div>
        `;
      })
      .join("");
    thread.scrollTop = thread.scrollHeight;
  }

  function sendHeaderWorkspaceMessage(workspace) {
    const input = workspace.querySelector("[data-message-input]");
    const value = input.value.trim();
    if (!value) {
      return;
    }

    const thread = workspace.querySelector("[data-message-thread]");
    thread.insertAdjacentHTML(
      "beforeend",
      `
        <div class="flex justify-end">
          <div class="max-w-[75%]">
            <div class="bg-primary text-white rounded-xl px-4 py-3 text-sm">${value}</div>
            <p class="text-[11px] text-on-surface-variant mt-1 text-right">Just now</p>
          </div>
        </div>
      `,
    );
    input.value = "";
    thread.scrollTop = thread.scrollHeight;
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
      const nestedLink = event.target.closest && event.target.closest("a[href]");

      if (nestedLink && nestedLink !== element && element.contains(nestedLink)) {
        return;
      }

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
