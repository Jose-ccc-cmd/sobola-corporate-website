(() => {
  const m = document.querySelector(".menu"),
    n = document.querySelector("nav"),
    d = document.querySelector(".drop"),
    b = d?.querySelector("button");

  const lockDownContent = () => {
    document.addEventListener("contextmenu", (event) => {
      const target = event.target;
      if (target instanceof Element) {
        if (
          target.closest("img, svg, canvas, video, audio, picture") ||
          target.tagName === "IMG"
        ) {
          event.preventDefault();
        }
      }
    });

    document.addEventListener("dragstart", (event) => {
      const target = event.target;
      if (target instanceof Element && target.closest("img, svg, canvas")) {
        event.preventDefault();
      }
    });

    document.addEventListener("keydown", (event) => {
      const key = event.key.toLowerCase();
      const blockedKeys = [
        "f12",
        "s",
        "u",
        "i",
        "j",
        "c",
        "g",
      ];

      if (event.key === "Escape") {
        n?.classList.remove("open");
        d?.classList.remove("open");
        return;
      }

      const inspectCombo =
        (event.ctrlKey || event.metaKey) &&
        (event.shiftKey || event.altKey) &&
        key === "i";

      const saveCombo = (event.ctrlKey || event.metaKey) && key === "s";
      const viewSourceCombo = (event.ctrlKey || event.metaKey) && key === "u";
      const devtoolsCombo = event.key === "F12";
      const blockedCombo =
        inspectCombo || saveCombo || viewSourceCombo || devtoolsCombo;

      if (blockedCombo) {
        event.preventDefault();
        return;
      }

      if ((event.ctrlKey || event.metaKey) && blockedKeys.includes(key)) {
        event.preventDefault();
      }
    });

    document.querySelectorAll("img").forEach((img) => {
      img.setAttribute("draggable", "false");
      img.oncontextmenu = () => false;
    });
  };

  lockDownContent();

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
