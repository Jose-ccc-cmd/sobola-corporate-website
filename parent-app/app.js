const installButton = document.querySelector("#install-button");
const appMessage = document.querySelector("#app-message");
const launchScreen = document.querySelector("#launch-screen");
const previewApp = document.querySelector("#preview-app");
const navButtons = [...document.querySelectorAll("[data-view-target]")];
let deferredInstallPrompt = null;

function showLaunchScreen() {
  launchScreen.hidden = false;
  previewApp.hidden = true;
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function showPreview() {
  launchScreen.hidden = true;
  previewApp.hidden = false;
  openView("overview");
}

function setAppMessage(message, state = "info") {
  appMessage.textContent = message;
  appMessage.dataset.state = state;
}

function openView(viewId) {
  document.querySelectorAll(".app-view").forEach((view) => {
    view.hidden = view.id !== viewId;
  });
  navButtons.forEach((button) => {
    const isActive = button.dataset.viewTarget === viewId;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });
  if (appMessage.dataset.state !== "error") setAppMessage("");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

navButtons.forEach((button) => {
  button.addEventListener("click", () => openView(button.dataset.viewTarget));
});
document.querySelectorAll("[data-open-view]").forEach((button) => {
  button.addEventListener("click", () => openView(button.dataset.openView));
});
document.querySelector("#preview-button").addEventListener("click", showPreview);
document.querySelector("#exit-preview").addEventListener("click", showLaunchScreen);

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
  setAppMessage("Pocket Pay has been added to your home screen.", "success");
});

installButton.hidden = isStandalone() || !isIosDevice();
installButton.addEventListener("click", async () => {
  if (deferredInstallPrompt) {
    try {
      await deferredInstallPrompt.prompt();
      const { outcome } = await deferredInstallPrompt.userChoice;
      setAppMessage(
        outcome === "accepted"
          ? "Pocket Pay is being installed."
          : "Installation was cancelled. You can try again from your browser menu.",
        outcome === "accepted" ? "success" : "info",
      );
    } catch (error) {
      console.error("Could not open the app install prompt.", error);
      setAppMessage(
        "The install prompt could not be opened. Please try your browser’s install option.",
        "error",
      );
    } finally {
      deferredInstallPrompt = null;
      installButton.hidden = true;
    }
    return;
  }

  setAppMessage(
    "On iPhone or iPad: tap Share in Safari, then choose Add to Home Screen.",
  );
});

window.addEventListener("offline", () => {
  setAppMessage(
    "You’re offline. Reconnect to the internet to check for Pocket Pay Parent updates.",
    "error",
  );
});
window.addEventListener("online", () => {
  if (appMessage.dataset.state === "error") setAppMessage("");
});

if ("serviceWorker" in navigator && window.isSecureContext) {
  navigator.serviceWorker.register("./service-worker.js").catch((error) => {
    console.error("Could not register the app service worker.", error);
    setAppMessage(
      "Offline support could not be enabled. Check your connection and reload the app.",
      "error",
    );
  });
} else if (!window.isSecureContext) {
  setAppMessage(
    "Secure app features require HTTPS. Open Pocket Pay from its secure website address.",
    "error",
  );
} else {
  setAppMessage(
    "Offline support is unavailable in this browser. You can use Pocket Pay while online.",
    "info",
  );
}
