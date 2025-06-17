import Database from "../../services/database";
import { showFormattedDate } from "../../utils/date-utils";

class SavedStoryView {
  constructor() {
    this._initializeProperties();
  }

  _initializeProperties() {
    this.stories = [];
  }

  async render() {
    return `
      <section id="main-content" class="saved-stories container">
        <h1 class="saved-stories__title">Saved Stories</h1>
        
        <div id="noSavedStories" class="saved-stories__empty" style="display: none;">
          <p>You haven't saved any stories yet.</p>
          <a href="#/story" class="button">Explore Stories</a>
        </div>
        
        <div id="savedStories" class="saved-stories__list"></div>
      </section>
    `;
  }

  async afterRender() {
    const savedStoriesContainer = document.getElementById("savedStories");
    const noSavedStoriesMessage = document.getElementById("noSavedStories");

    try {
      // Load all saved stories from IndexedDB
      this.stories = await Database.getAllStories();

      if (this.stories.length === 0) {
        // Show empty state message if no stories are saved
        noSavedStoriesMessage.style.display = "block";
        savedStoriesContainer.style.display = "none";
      } else {
        // Render the saved stories
        noSavedStoriesMessage.style.display = "none";
        savedStoriesContainer.style.display = "block";

        savedStoriesContainer.innerHTML = "";
        this.stories.forEach((story) => {
          savedStoriesContainer.innerHTML += this._createStoryCard(story);
        });

        // Add event listeners to delete buttons
        this._attachDeleteEventListeners();
      }
    } catch (error) {
      console.error("Failed to load saved stories:", error);
      savedStoriesContainer.innerHTML = `
        <div class="error-message">
          Failed to load saved stories. ${error.message || ""}
        </div>
      `;
    }
  }

  _createStoryCard(story) {
    return `
      <article class="story-item saved-story-item" data-id="${story.id}">
        <img src="${story.photoUrl}" alt="Picture from ${
      story.name
    }" class="story-item__image">
        <div class="story-item__content">
          <h2 class="story-item__title">${story.name}</h2>
          <p class="story-item__description">${story.description}</p>
          <p class="story-item__date"><i class="far fa-calendar-alt"></i> ${showFormattedDate(
            story.createdAt
          )}</p>
          <div class="story-item__actions">
            <a href="#/story/${story.id}" class="read-more-button">
              Read More <i class="fas fa-arrow-right"></i>
            </a>
            <button class="delete-story-button" data-id="${story.id}">
              <i class="fas fa-trash"></i> Remove
            </button>
          </div>
        </div>
      </article>
    `;
  }

  _attachDeleteEventListeners() {
    const deleteButtons = document.querySelectorAll(".delete-story-button");

    deleteButtons.forEach((button) => {
      button.addEventListener("click", async (event) => {
        event.preventDefault();

        const storyId = button.dataset.id;
        const confirmDelete = confirm(
          "Are you sure you want to remove this story from your saved collection?"
        );

        if (confirmDelete) {
          try {
            const success = await Database.deleteStory(storyId);

            if (success) {
              // Remove the story card from the DOM
              const storyCard = document.querySelector(
                `.saved-story-item[data-id="${storyId}"]`
              );
              if (storyCard) {
                storyCard.remove();
              }

              // Update the stories array
              this.stories = this.stories.filter(
                (story) => story.id !== storyId
              );

              // Show empty state if all stories are deleted
              if (this.stories.length === 0) {
                document.getElementById("noSavedStories").style.display =
                  "block";
                document.getElementById("savedStories").style.display = "none";
              }

              // Show success message
              this._showNotification("Story removed from saved collection");
            }
          } catch (error) {
            console.error("Failed to delete story:", error);
            this._showNotification("Failed to remove story", "error");
          }
        }
      });
    });
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
    // Clean up any event listeners or resources if needed
  }
}

export default SavedStoryView;
