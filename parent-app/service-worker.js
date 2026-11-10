const CACHE_NAME = "pocket-pay-parent-shell-v4";
const APP_SHELL = [
  "./",
  "./index.html",
  "./styles.css",
  "./app.js",
  "./manifest.webmanifest",
  "./pocket-pay-logo.png",
  "./icon-180.png",
  "./icon-192.png",
  "./icon-512.png",
];
const APP_SHELL_URLS = new Map(APP_SHELL.map((file) => {
  const url = new URL(file, self.registration.scope);
  return [`${url.origin}${url.pathname}`, url.href];
}));

self.addEventListener("install", (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    await Promise.all(APP_SHELL.map(async (file) => {
      const url = new URL(file, self.registration.scope);
      url.searchParams.set("precache", CACHE_NAME);
      const response = await fetch(url.href, { cache: "reload" });
      if (!response.ok) {
        throw new Error(`Could not cache app file: ${file} (${response.status})`);
      }
      await cache.put(new URL(file, self.registration.scope).href, response);
    }));
    await self.skipWaiting();
  })());
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys
          .filter((key) => key.startsWith("pocket-pay-parent-shell-") && key !== CACHE_NAME)
          .map((key) => caches.delete(key)),
      ))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);
  const cacheUrl = APP_SHELL_URLS.get(`${url.origin}${url.pathname}`);
  if (request.method !== "GET" || !cacheUrl) return;

  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);
    const cachedResponse = await cache.match(cacheUrl);
    if (cachedResponse) return cachedResponse;

    const response = await fetch(request);
    return response;
  })());
});
