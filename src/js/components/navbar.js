import auth from "../utils/middleware";
import {
  initPushNotification,
  unsubscribeFromPushNotification,
} from "../utils/notification-manager.js";

class Navbar {
  static isInitialized = false;
  static notificationStatus = null;

  static init() {
    this._updateNavigation();

    if (!this.isInitialized) {
      window.addEventListener("hashchange", () => {
        this._updateNavigation();
      });
      this.isInitialized = true;
    }
  }

  static async _updateNavigation() {
    const navList = document.getElementById("nav-list");
    if (!navList) return;

    const isLoggedIn = auth.checkLoggedIn();

    navList.innerHTML = `
      <ul class="nav-list">
      ${
        isLoggedIn
          ? `
        <li><a href="#/story"><i class="fa-solid fa-icons"></i> Story</a></li>
        <li><a href="#/story/add"><i class="fa-solid fa-circle-plus"></i> Add Story</a></li>
        <li><a href="#/saved-stories"><i class="fa-solid fa-bookmark"></i> Saved Stories</a></li>
        <li><a href="#/about"><i class="fa-solid fa-user"></i> About</a></li>
        <li><button id="notification-toggle" class="nav-button notification-btn">
              <i class="fa-solid fa-bell"></i> 
              <span id="notification-status">Notifications</span>
            </button>
        </li>
        <li><a href="#" id="logoutButton"><i class="fas fa-sign-out-alt"></i> Logout</a></li>
      `
          : `
        <li><a href="#/login"><i class="fas fa-sign-in-alt"></i> Login</a></li>
        <li><a href="#/signin"><i class="fa-regular fa-user-plus"></i> Signin</a></li>
        <li><a href="#/about"><i class="fa-solid fa-user"></i></i> About</a></li>
      `
      }
      </ul>
    `;

    if (isLoggedIn) {
      // Set up logout button
      const logoutButton = document.getElementById("logoutButton");
      if (logoutButton) {
        logoutButton.addEventListener("click", (e) => {
          e.preventDefault();
          localStorage.removeItem("token");
          window.location.hash = "#/login";
        });
      }

      // Set up notification toggle
      await this._initNotificationToggle();
    }
  }

  static async _initNotificationToggle() {
    const toggleButton = document.getElementById("notification-toggle");
    const statusText = document.getElementById("notification-status");

    if (!toggleButton || !statusText) return;

    const status = await this._checkNotificationStatus();
    this.notificationStatus = status;

    this._updateNotificationUI(statusText, toggleButton, status);

    // Add event listener
    toggleButton.addEventListener("click", async () => {
      toggleButton.disabled = true;

      try {
        if (this.notificationStatus.isSubscribed) {
          // Disable notifications
          const success = await unsubscribeFromPushNotification();
          if (success) {
            this.notificationStatus.isSubscribed = false;
            this._updateNotificationUI(
              statusText,
              toggleButton,
              this.notificationStatus
            );
          }
        } else {
          // Enable notifications
          const success = await initPushNotification();
          if (success) {
            this.notificationStatus.isSubscribed = true;
            this._updateNotificationUI(
              statusText,
              toggleButton,
              this.notificationStatus
            );
          }
        }
      } catch (error) {
        console.error("Error toggling notifications:", error);
      } finally {
        toggleButton.disabled = false;
      }
    });
  }

  static async _checkNotificationStatus() {
    try {
      if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
        return { isSupported: false, isSubscribed: false };
      }

      const registration = await navigator.serviceWorker.getRegistration();
      if (!registration) {
        return { isSupported: true, isSubscribed: false };
      }

      const subscription = await registration.pushManager.getSubscription();
      return { isSupported: true, isSubscribed: !!subscription };
    } catch (error) {
      console.error("Error checking notification status:", error);
      return { isSupported: false, isSubscribed: false };
    }
  }

  static _updateNotificationUI(statusElement, buttonElement, status) {
    if (!status.isSupported) {
      statusElement.textContent = "Notifications not supported";
      buttonElement.disabled = true;
      buttonElement.classList.add("disabled");
    } else if (status.isSubscribed) {
      statusElement.textContent = "Notifications On";
      buttonElement.classList.add("active");
    } else {
      statusElement.textContent = "Notifications Off";
      buttonElement.classList.remove("active");
    }
  }
}

export default Navbar;
