const installButton = document.querySelector("#install-button");
const appMessage = document.querySelector("#app-message");
const navButtons = [...document.querySelectorAll("[data-view-target]")];
let deferredInstallPrompt = null;

function openView(viewId) {
  document.querySelectorAll(".app-view").forEach((view) => {
    view.hidden = view.id !== viewId;
  });
  navButtons.forEach((button) => {
    const isActive = button.dataset.viewTarget === viewId;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });
  appMessage.textContent = "";
  window.scrollTo({ top: 0, behavior: "smooth" });
}

navButtons.forEach((button) => {
  button.addEventListener("click", () => openView(button.dataset.viewTarget));
});
document.querySelectorAll("[data-open-view]").forEach((button) => {
  button.addEventListener("click", () => openView(button.dataset.openView));
});

function isIosDevice() {
  return /iphone|ipad|ipod/i.test(navigator.userAgent)
    || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
}

function isStandalone() {
  return window.matchMedia("(display-mode: standalone)").matches || navigator.standalone === true;
}

window.addEventListener("beforeinstallprompt", (event) => {
  event.preventDefault();
  deferredInstallPrompt = event;
  installButton.hidden = isStandalone();
});

window.addEventListener("appinstalled", () => {
  deferredInstallPrompt = null;
  installButton.hidden = true;
  appMessage.textContent = "Pocket Pay has been added to your home screen.";
});

installButton.hidden = isStandalone() || !isIosDevice();
installButton.addEventListener("click", async () => {
  if (deferredInstallPrompt) {
    try {
      await deferredInstallPrompt.prompt();
      const { outcome } = await deferredInstallPrompt.userChoice;
      appMessage.textContent = outcome === "accepted"
        ? "Pocket Pay is being installed."
        : "You can install Pocket Pay whenever you’re ready.";
    } catch (error) {
      console.error("Could not open the app install prompt.", error);
      appMessage.textContent = "The install prompt could not be opened. Please try your browser’s install option.";
    } finally {
      deferredInstallPrompt = null;
      installButton.hidden = true;
    }
    return;
  }

  appMessage.textContent = "On iPhone or iPad: tap Share in Safari, then choose Add to Home Screen.";
});

if ("serviceWorker" in navigator && window.isSecureContext) {
  navigator.serviceWorker.register("./service-worker.js").catch((error) => {
    console.error("Could not register the app service worker.", error);
    appMessage.textContent = "Offline support could not be enabled. You can still use the app while online.";
  });
}
