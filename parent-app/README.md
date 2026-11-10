# Pocket Pay Parent

This folder contains the website-installable Pocket Pay Parent app shell. Its visual design uses the supplied Pocket Pay logo, the website typography, and consistent line icons.

## Important

The app does not yet have a parent sign-in or a connection to live student accounts. It shows an empty account state and links to the existing Pocket Pay portal. Before displaying balances or transactions here, connect a secure authenticated API and review account access, privacy, and data handling. Do not add fictional student or financial data.

## Install and test

Serve this folder over HTTPS (or localhost during development), then visit `/parent-app/`:

- Android: open the page in a supported browser and choose **Install app** or **Add to Home screen**.
- iPhone/iPad: open the page in Safari, tap **Share**, then **Add to Home Screen**.

The service worker caches only the static app shell for offline loading. When deployed beneath the website root, the app and service worker stay scoped to `/parent-app/`.

## Files

- `index.html`, `styles.css`, and `app.js`: responsive app shell and navigation.
- `manifest.webmanifest`, `pocket-pay-logo.png`, and app icons: installation metadata and brand assets for supported platforms.
- `service-worker.js`: offline caching for static app files only.
