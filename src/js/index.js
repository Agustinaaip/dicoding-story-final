import "../assets/styles/style.css";
import App from "./views/app";
import Navbar from "./components/navbar";
import { registerServiceWorker } from "./utils/notification-manager";

if ("serviceWorker" in navigator) {
  if (!navigator.serviceWorker.controller) {
    registerServiceWorker()
      .then((registration) => {
        console.log(
          "Service Worker berhasil didaftarkan untuk PWA:",
          registration?.scope
        );
      })
      .catch((error) => {
        console.error("Pendaftaran Service Worker gagal:", error);
      });
  } else {
    console.log("Service Worker sudah terdaftar sebelumnya");
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  const skipLinkContainer = document.createElement("div");
  skipLinkContainer.className = "skip-link";

  const skipLink = document.createElement("a");
  skipLink.className = "skip-to-content";
  skipLink.textContent = "Lewati ke konten utama";
  skipLink.href = "#main-content";

  skipLink.addEventListener("click", (e) => {
    e.preventDefault();
    const mainContent = document.querySelector("#main-content");
    if (mainContent) {
      mainContent.setAttribute("tabindex", "-1");
      mainContent.focus();
      mainContent.scrollIntoView({ behavior: "smooth" });
    }
  });

  skipLinkContainer.appendChild(skipLink);
  document.body.insertBefore(skipLinkContainer, document.body.firstChild);

  const mainContent = document.querySelector("#main-content");
  if (mainContent) {
    mainContent.setAttribute("tabindex", "-1");
    mainContent.setAttribute("role", "main");
  }

  const app = new App({
    content: document.querySelector("#main-content"),
    drawerButton: document.querySelector("#drawer-button"),
    navigationDrawer: document.querySelector("#navigation-drawer"),
  });

  Navbar.init();

  await app.renderPage();

  window.addEventListener("hashchange", async () => {
    await app.renderPage();
  });
});
