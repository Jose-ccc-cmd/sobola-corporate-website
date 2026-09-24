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

  blockContextMenu();

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
