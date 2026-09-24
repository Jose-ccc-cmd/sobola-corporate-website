(() => {
  const m = document.querySelector(".menu"),
    n = document.querySelector("nav"),
    d = document.querySelector(".drop"),
    b = d?.querySelector("button");
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
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      n?.classList.remove("open");
      d?.classList.remove("open");
    }
  });
})();
