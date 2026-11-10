(() => {
  const siteScript = document.currentScript;
  const m = document.querySelector(".menu"),
    n = document.querySelector("nav"),
    launcher = document.querySelector(".product-launcher"),
    launcherButton = launcher?.querySelector(".launcher-toggle"),
    launcherPanel = launcher?.querySelector(".dropmenu"),
    loginMenu = document.querySelector(".login-menu"),
    loginButton = loginMenu?.querySelector(".login-toggle"),
    loginPanel = loginMenu?.querySelector(".login-options");

  const showAppInstallPrompt = () => {
    const installedMedia = window.matchMedia("(display-mode: standalone)");
    const isInstalled = () =>
      installedMedia.matches || navigator.standalone === true;
    const isIosDevice = () =>
      /iphone|ipad|ipod/i.test(navigator.userAgent) ||
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
    const dismissedKey = "sobola-app-install-dismissed";
    const wasDismissed = () => {
      try {
        return sessionStorage.getItem(dismissedKey) === "true";
      } catch (error) {
        console.warn("Could not read the app install prompt preference.", error);
        return false;
      }
    };
    const setDismissed = () => {
      try {
        sessionStorage.setItem(dismissedKey, "true");
      } catch (error) {
        console.warn("Could not save the app install prompt preference.", error);
      }
    };

    let deferredPrompt = null;
    let promptElement = null;
    let promptTimeout;

    const closePrompt = (rememberDismissal) => {
      window.clearTimeout(promptTimeout);
      promptElement?.remove();
      promptElement = null;
      if (rememberDismissal) setDismissed();
    };

    const showPrompt = () => {
      if (
        promptElement ||
        isInstalled() ||
        wasDismissed()
      ) {
        return;
      }

      const appUrl = new URL("../parent-app/", siteScript.src);
      const prompt = document.createElement("aside");
      prompt.className = "app-install-prompt";
      prompt.setAttribute("role", "region");
      prompt.setAttribute("aria-label", "Install Pocket Pay Parent");
      prompt.setAttribute("aria-live", "polite");
      prompt.innerHTML = `
        <img class="app-install-logo" src="${appUrl.href}pocket-pay-logo.png" alt="" width="42" height="52">
        <div class="app-install-copy">
          <strong>Get Pocket Pay on your phone</strong>
          <p>Install Pocket Pay Parent and sign in to view linked student accounts.</p>
        </div>
        <div class="app-install-actions">
          <button class="app-install-dismiss" type="button" aria-label="Dismiss install prompt">Not now</button>
          <button class="app-install-action" type="button">Install app</button>
        </div>
      `;

      const dismissButton = prompt.querySelector(".app-install-dismiss");
      const actionButton = prompt.querySelector(".app-install-action");
      dismissButton.addEventListener("click", () => closePrompt(true));
      actionButton.addEventListener("click", async () => {
        if (deferredPrompt) {
          try {
            await deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            if (outcome === "accepted") {
              closePrompt(true);
              return;
            }
          } catch (error) {
            console.error("Could not open the app install prompt.", error);
          }
          deferredPrompt = null;
          actionButton.textContent = "Open parent app";
          prompt.querySelector(".app-install-copy p").textContent =
            "Use your browser menu to install the app or add it to your home screen.";
          return;
        }

        if (isIosDevice()) {
          actionButton.textContent = "Got it";
          actionButton.addEventListener(
            "click",
            () => closePrompt(true),
            { once: true },
          );
          prompt.querySelector(".app-install-copy p").textContent =
            "In Safari, tap Share, then choose Add to Home Screen.";
          return;
        }

        window.location.assign(appUrl.href);
      });

      document.body.append(prompt);
      promptElement = prompt;
    };

    window.addEventListener("beforeinstallprompt", (event) => {
      event.preventDefault();
      deferredPrompt = event;
    });

    window.addEventListener("appinstalled", () => closePrompt(true));
    installedMedia.addEventListener?.("change", (event) => {
      if (event.matches) closePrompt(true);
    });

    promptTimeout = window.setTimeout(showPrompt, 10000);
  };

  const closeLauncher = (restoreFocus = false) => {
    if (!launcher || !launcherButton || !launcherPanel) return;

    launcher.classList.remove("open");
    launcherButton.setAttribute("aria-expanded", "false");
    launcherPanel.hidden = true;

    if (restoreFocus) launcherButton.focus();
  };

  const closeLoginMenu = (restoreFocus = false) => {
    if (!loginMenu || !loginButton || !loginPanel) return;

    loginMenu.classList.remove("open");
    loginButton.setAttribute("aria-expanded", "false");
    loginPanel.hidden = true;

    if (restoreFocus) loginButton.focus();
  };

  const blockContextMenu = () => {
    document.addEventListener(
      "contextmenu",
      (event) => {
        event.preventDefault();
        event.stopPropagation();
      },
      { capture: true }
    );

    document.addEventListener(
      "mousedown",
      (event) => {
        if (event.button === 2) {
          event.preventDefault();
          event.stopPropagation();
        }
      },
      { capture: true }
    );

    document.addEventListener(
      "dragstart",
      (event) => {
        if (event.target instanceof Element && event.target.closest("img, svg, canvas")) {
          event.preventDefault();
          event.stopPropagation();
        }
      },
      { capture: true }
    );

    document.addEventListener(
      "keydown",
      (event) => {
        const key = event.key.toLowerCase();
        const blockedCombo =
          event.key === "F12" ||
          (event.ctrlKey && event.shiftKey && ["i", "j", "c"].includes(key)) ||
          (event.ctrlKey && ["u", "s"].includes(key)) ||
          (event.metaKey && event.altKey && key === "i");

        if (blockedCombo) {
          event.preventDefault();
          event.stopPropagation();
          event.stopImmediatePropagation();
        }

        if (event.key === "Escape") {
          const menuOpen = n?.classList.contains("open");
          const launcherOpen = launcherPanel && !launcherPanel.hidden;
          const loginOpen = loginPanel && !loginPanel.hidden;

          n?.classList.remove("open");
          m?.setAttribute("aria-expanded", "false");

          if (launcherOpen) closeLauncher(!menuOpen);
          if (loginOpen) closeLoginMenu(!menuOpen && !launcherOpen);
          if (menuOpen) m?.focus();
        }
      },
      { capture: true }
    );

    document.querySelectorAll("img, canvas, svg").forEach((element) => {
      element.setAttribute("draggable", "false");
      element.oncontextmenu = () => false;
    });
  };

  const protectContactForm = () => {
    document.querySelectorAll("form").forEach((form) => {
      const trapField = form.querySelector(
        'input[name="company_website"], input[name="_honey"]'
      );
      const tokenField = form.querySelector('input[name="form_token"]');
      const startedField = form.querySelector('input[name="form_started"]');

      if (!trapField || !tokenField || !startedField) return;

      const makeToken = () => {
        if (typeof crypto !== "undefined" && crypto.getRandomValues) {
          const values = new Uint32Array(4);
          crypto.getRandomValues(values);
          return Array.from(values)
            .map((value) => value.toString(16).padStart(8, "0"))
            .join("");
        }
        return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
      };

      const setStarted = () => {
        if (!startedField.value) {
          startedField.value = String(Date.now());
        }
      };

      if (!tokenField.value) tokenField.value = makeToken();
      setStarted();

      form.addEventListener("focusin", () => setStarted());

      form.addEventListener("input", (event) => {
        const target = event.target;
        if (!(target instanceof HTMLElement)) return;

        if (target instanceof HTMLInputElement && target.required) {
          target.setCustomValidity(
            target.value.trim() ? "" : "Please complete this field."
          );
        }

        if (target === trapField && trapField.value.trim().length > 0) {
          form.dataset.botFlag = "true";
        }

        if (target.name && !["company_website", "_honey", "form_token", "form_started"].includes(target.name)) {
          setStarted();
        }
      });

      form.addEventListener("submit", async (event) => {
        const submitButton = form.querySelector("#sendButton, #account-submit");
        const buttonText = form.querySelector("#buttonText, .button-label");
        const spinner = form.querySelector(".loading-spinner");
        const statusBox = form.querySelector("#formStatus, #accountFormStatus");
        const trapFilled = trapField.value.trim().length > 0;
        const timeDelta = startedField.value ? Date.now() - Number(startedField.value) : 0;
        const tooFast = timeDelta > 0 && timeDelta < 1500;
        const suspicious = trapFilled || tooFast || form.dataset.botFlag === "true";

        event.preventDefault();
        event.stopPropagation();

        if (suspicious) {
          if (statusBox) {
            statusBox.textContent =
              "Your request could not be submitted. Please check the form and try again.";
            statusBox.className = "error";
          }
          return false;
        }

        const blankRequiredField = [...form.querySelectorAll("[required]")].find(
          (field) => field instanceof HTMLInputElement && !field.value.trim()
        );
        if (blankRequiredField) {
          blankRequiredField.setCustomValidity("Please complete this field.");
          blankRequiredField.reportValidity();
          return false;
        }

        if (submitButton) submitButton.disabled = true;
        submitButton?.setAttribute("aria-busy", "true");
        if (buttonText) buttonText.textContent = "Sending...";
        if (spinner) spinner.hidden = false;
        if (statusBox) {
          statusBox.textContent = "Submitting your request...";
          statusBox.className = "";
        }

        try {
          const formData = new FormData(form);
          const clientName = String(
            formData.get("name") || formData.get("parent_name") || "Client"
          ).trim();
          const clientEmail = String(
            formData.get("email") || formData.get("parent_email") || ""
          ).trim();

          for (const [key, value] of formData.entries()) {
            if (typeof value === "string" && key !== "_honey") {
              formData.set(key, value.trim());
            }
          }

          formData.delete("company_website");
          formData.delete("form_token");
          formData.delete("form_started");

          if (clientEmail) formData.set("_replyto", clientEmail);
          if (clientEmail && form.id === "contact-form") {
            formData.set(
              "_subject",
              `Service inquiry from ${clientName || "Client"} (${clientEmail})`
            );
          }

          const response = await fetch(form.action, {
            method: "POST",
            headers: {
              Accept: "application/json",
            },
            body: formData,
          });

          const result = await response.json();
          if (
            !response.ok ||
            result.success === false ||
            result.success === "false"
          ) {
            throw new Error("Submission failed");
          }

          form.reset();
          tokenField.value = makeToken();
          startedField.value = String(Date.now());

          if (statusBox) {
            statusBox.textContent =
              form.dataset.successMessage ||
              "Your message has been sent successfully.";
            statusBox.className = "success";
          }
        } catch (error) {
          if (statusBox) {
            statusBox.textContent =
              "Your request could not be sent. Please try again or email support@sobola.org.";
            statusBox.className = "error";
          }
        } finally {
          if (submitButton) submitButton.disabled = false;
          submitButton?.removeAttribute("aria-busy");
          if (buttonText) {
            buttonText.textContent =
              form.id === "account-request-form"
                ? "Submit account request"
                : "Send Email";
          }
          if (spinner) spinner.hidden = true;
        }

        return false;
      });
    });
  };

  blockContextMenu();
  protectContactForm();
  showAppInstallPrompt();

  m?.addEventListener("click", () => {
    const o = n.classList.toggle("open");
    m.setAttribute("aria-expanded", o);

    if (!o) {
      closeLauncher();
      closeLoginMenu();
    }
  });

  launcherButton?.addEventListener("click", (e) => {
    e.stopPropagation();
    closeLoginMenu();
    const isOpen = launcherPanel && !launcherPanel.hidden;

    if (isOpen) {
      closeLauncher();
      return;
    }

    launcher?.classList.add("open");
    launcherPanel.hidden = false;
    launcherButton.setAttribute("aria-expanded", "true");
  });

  loginButton?.addEventListener("click", (event) => {
    event.stopPropagation();
    closeLauncher();
    const isOpen = loginPanel && !loginPanel.hidden;

    if (isOpen) {
      closeLoginMenu();
      return;
    }

    loginMenu?.classList.add("open");
    if (loginPanel) loginPanel.hidden = false;
    loginButton.setAttribute("aria-expanded", "true");
  });

  document.addEventListener("click", (e) => {
    if (launcher && !launcher.contains(e.target)) closeLauncher();
    if (loginMenu && !loginMenu.contains(e.target)) closeLoginMenu();
  });
})();
