import DetailStoryPresenter from "../../presenters/detail-story-presenter";
import { showFormattedDate } from "../../utils/date-utils";
import { parseActivePathname } from "../../routes/url-parser";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import Database from "../../services/database";

class DetailStoryView {
  #presenter = null;
  #defaultIcon = L.icon({
    iconUrl: "https://image.flaticon.com/icons/png/512/684/684908.png",
    shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });
  #story = null;
  #isStorySaved = false;

  constructor() {
    this.#presenter = new DetailStoryPresenter(this);
  }

  async render() {
    return `
      <section id="main-content" class="detail-story">
        <a href="#/story" class="back-button">&laquo; Back to Story List</a>
        <div id="storyContent" class="detail-story__content">
          <div class="loading">Loading...</div>
        </div>
      </section>
    `;
  }

  async afterRender() {
    const urlSegments = parseActivePathname();
    const storyId = urlSegments.id;
    const contentContainer = document.getElementById("storyContent");

    if (!storyId) {
      contentContainer.innerHTML = `
        <div class="error-message">
          Story ID not found in URL.
        </div>
      `;
      return;
    }

    try {
      this.#story = await this.#presenter.getStoryDetail(storyId);
      this.#isStorySaved = await Database.isStorySaved(storyId);

      contentContainer.innerHTML = `
        <div class="detail-story__header">
          <h1 class="detail-story__title">${this.#story.name}</h1>
          <div class="detail-story__actions">
            <button id="saveStoryButton" class="save-story-button ${
              this.#isStorySaved ? "saved" : ""
            }">
              <i class="fa-${
                this.#isStorySaved ? "solid" : "regular"
              } fa-bookmark"></i>
              <span>${this.#isStorySaved ? "Saved" : "Save Story"}</span>
            </button>
          </div>
        </div>
        <p class="detail-story__date">${showFormattedDate(
          this.#story.createdAt
        )}</p>
        
        <img 
          src="${this.#story.photoUrl}" 
          alt="Picture from ${this.#story.name}" 
          class="detail-story__image"
        >
        
        <p class="detail-story__description">${this.#story.description}</p>
        
        ${
          this.#story.lat && this.#story.lon
            ? `
          <div class="detail-story__map-container">
            <h2>Location</h2>
            <div id="map" class="detail-story__map"></div>
          </div>
        `
            : ""
        }
      `;

      // Initialize the save/unsave button
      this._initSaveButton();

      if (this.#story.lat && this.#story.lon) {
        const mapContainer = document.getElementById("map");
        this.#presenter.initMap(mapContainer);
        this.#presenter.setMapView(this.#story.lat, this.#story.lon);
        this.#presenter.addMarker(
          this.#story.lat,
          this.#story.lon,
          this._createPopupContent(this.#story),
          this.#defaultIcon
        );
      }
    } catch (error) {
      contentContainer.innerHTML = `
        <div class="error-message">
          Failed to load the story. ${error.message}
        </div>
      `;
    }
  }

  _createPopupContent(story) {
    return `
      <div class="popup-content">
        <h3>${story.name}</h3>
        <img src="${story.photoUrl}" alt="Picture from ${story.name}" style="max-width: 200px;">
        <p>${story.description}</p>
      </div>
    `;
  }

  _initSaveButton() {
    const saveButton = document.getElementById("saveStoryButton");
    if (!saveButton) return;

    saveButton.addEventListener("click", async () => {
      try {
        if (this.#isStorySaved) {
          // Unsave the story
          const success = await Database.deleteStory(this.#story.id);
          if (success) {
            this.#isStorySaved = false;
            this._updateSaveButtonUI(saveButton);
            this._showNotification("Story removed from saved collection");
          }
        } else {
          // Save the story
          const success = await Database.saveStory(this.#story);
          if (success) {
            this.#isStorySaved = true;
            this._updateSaveButtonUI(saveButton);
            this._showNotification("Story saved to your collection");
          }
        }
      } catch (error) {
        console.error("Error toggling save status:", error);
        this._showNotification("Failed to save/unsave story", "error");
      }
    });
  }

  _updateSaveButtonUI(button) {
    const iconElement = button.querySelector("i");
    const textElement = button.querySelector("span");

    if (this.#isStorySaved) {
      button.classList.add("saved");
      iconElement.className = "fa-solid fa-bookmark";
      textElement.textContent = "Saved";
    } else {
      button.classList.remove("saved");
      iconElement.className = "fa-regular fa-bookmark";
      textElement.textContent = "Save Story";
    }
  }

  _showNotification(message, type = "success") {
    // Create notification element
    const notification = document.createElement("div");
    notification.className = `notification ${type}`;
    notification.textContent = message;

    // Append to body
    document.body.appendChild(notification);

    // Remove after 3 seconds
    setTimeout(() => {
      notification.remove();
    }, 3000);
  }

  async destroy() {
    this.#presenter.destroyMap();
  }
}

export default DetailStoryView;
