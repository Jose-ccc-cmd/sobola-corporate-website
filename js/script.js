(() => {
  const m = document.querySelector(".menu"),
    n = document.querySelector("nav"),
    d = document.querySelector(".drop"),
    b = d?.querySelector("button");

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
          n?.classList.remove("open");
          d?.classList.remove("open");
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
      const trapField = form.querySelector('input[name="company_website"]');
      const tokenField = form.querySelector("#form_token");
      const startedField = form.querySelector("#form_started");

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

      const writeLog = (eventName, payload = {}) => {
        const entry = {
          timestamp: new Date().toISOString(),
          page: window.location.pathname,
          eventName,
          ...payload,
          userAgent: navigator.userAgent,
          referrer: document.referrer || "direct",
        };

        try {
          const key = "sobola_honeypot_log";
          const existing = JSON.parse(localStorage.getItem(key) || "[]");
          existing.push(entry);
          localStorage.setItem(key, JSON.stringify(existing.slice(-100)));
        } catch (error) {
          console.warn("Honeypot log storage not available:", error);
        }

        const logText = `${JSON.stringify(entry)}\n`;
        const blob = new Blob([logText], { type: "text/plain;charset=utf-8" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = "sobola-honeypot-log.txt";
        link.style.display = "none";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);
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

        if (target === trapField && (trapField.value || "").trim().length > 0) {
          writeLog("honeypot-filled", {
            trapFilled: true,
            startedAt: startedField.value || null,
            token: tokenField.value || null,
          });
          form.dataset.botFlag = "true";
        }

        if (target.name && !["company_website", "form_token", "form_started"].includes(target.name)) {
          setStarted();
        }
      });

      form.addEventListener("submit", (event) => {
        const trapFilled = (trapField.value || "").trim().length > 0;
        const timeDelta = startedField.value ? Date.now() - Number(startedField.value) : 0;
        const tooFast = timeDelta > 0 && timeDelta < 1500;

        const suspicious = trapFilled || tooFast || form.dataset.botFlag === "true";

        if (suspicious) {
          event.preventDefault();
          event.stopPropagation();
          writeLog("submit-blocked", {
            trapFilled,
            tooFast,
            startedAt: startedField.value || null,
            token: tokenField.value || null,
            formId: form.id || "unknown",
          });
          form.reset();
          tokenField.value = makeToken();
          startedField.value = String(Date.now());
          return false;
        }
      });
    });
  };

  blockContextMenu();
  protectContactForm();

  m?.addEventListener("click", () => {
    const o = n.classList.toggle("open");
    m.setAttribute("aria-expanded", o);
  });

  b?.addEventListener("click", (e) => {
    e.stopPropagation();
    const o = d.classList.toggle("open");
    b.setAttribute("aria-expanded", o);
  });

  document.addEventListener("click", (e) => {
    if (d && !d.contains(e.target)) d.classList.remove("open");
  });
})();
