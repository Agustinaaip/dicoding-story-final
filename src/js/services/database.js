/**
 * IndexedDB service for story storage
 */
class Database {
  static DB_NAME = "story-app-db";
  static DB_VERSION = 1;
  static STORE_NAME = "saved-stories";

  static async openDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.DB_NAME, this.DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = event.target.result;

        if (!db.objectStoreNames.contains(this.STORE_NAME)) {
          const storyStore = db.createObjectStore(this.STORE_NAME, {
            keyPath: "id",
          });

          storyStore.createIndex("name", "name", { unique: false });
          storyStore.createIndex("createdAt", "createdAt", { unique: false });
        }
      };

      request.onsuccess = (event) => {
        const db = event.target.result;
        resolve(db);
      };

      request.onerror = (event) => {
        reject(`Database error: ${event.target.errorCode}`);
      };
    });
  }

  /**
   * Save a story to IndexedDB
   * @param {Object} story - Story object to save
   * @returns {Promise<boolean>} - Promise that resolves to true if save was successful
   */
  static async saveStory(story) {
    try {
      const db = await this.openDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(this.STORE_NAME, "readwrite");
        const store = transaction.objectStore(this.STORE_NAME);

        const request = store.put(story);

        request.onsuccess = () => {
          resolve(true);
        };

        request.onerror = (event) => {
          reject(`Error saving story: ${event.target.errorCode}`);
        };

        transaction.oncomplete = () => {
          db.close();
        };
      });
    } catch (error) {
      console.error("Failed to save story:", error);
      return false;
    }
  }

  /**
   * Check if a story is already saved
   * @param {string} id - Story ID to check
   * @returns {Promise<boolean>} - Promise that resolves to true if story exists
   */
  static async isStorySaved(id) {
    try {
      const db = await this.openDB();
      return new Promise((resolve) => {
        const transaction = db.transaction(this.STORE_NAME, "readonly");
        const store = transaction.objectStore(this.STORE_NAME);

        const request = store.get(id);

        request.onsuccess = () => {
          resolve(!!request.result);
        };

        request.onerror = () => {
          resolve(false);
        };

        transaction.oncomplete = () => {
          db.close();
        };
      });
    } catch (error) {
      console.error("Failed to check if story is saved:", error);
      return false;
    }
  }

  /**
   * Get all saved stories
   * @returns {Promise<Array>} - Promise that resolves to array of saved stories
   */
  static async getAllStories() {
    try {
      const db = await this.openDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(this.STORE_NAME, "readonly");
        const store = transaction.objectStore(this.STORE_NAME);

        const request = store.getAll();

        request.onsuccess = () => {
          resolve(request.result);
        };

        request.onerror = (event) => {
          reject(`Error getting stories: ${event.target.errorCode}`);
        };

        transaction.oncomplete = () => {
          db.close();
        };
      });
    } catch (error) {
      console.error("Failed to get saved stories:", error);
      return [];
    }
  }

  /**
   * Delete a saved story
   * @param {string} id - ID of story to delete
   * @returns {Promise<boolean>} - Promise that resolves to true if deletion was successful
   */
  static async deleteStory(id) {
    try {
      const db = await this.openDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(this.STORE_NAME, "readwrite");
        const store = transaction.objectStore(this.STORE_NAME);

        const request = store.delete(id);

        request.onsuccess = () => {
          resolve(true);
        };

        request.onerror = (event) => {
          reject(`Error deleting story: ${event.target.errorCode}`);
        };

        transaction.oncomplete = () => {
          db.close();
        };
      });
    } catch (error) {
      console.error("Failed to delete story:", error);
      return false;
    }
  }

  /**
   * Get a single story by ID
   * @param {string} id - Story ID
   * @returns {Promise<Object|null>} - Promise that resolves to story object or null
   */
  static async getStoryById(id) {
    try {
      const db = await this.openDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(this.STORE_NAME, "readonly");
        const store = transaction.objectStore(this.STORE_NAME);

        const request = store.get(id);

        request.onsuccess = () => {
          resolve(request.result || null);
        };

        request.onerror = (event) => {
          reject(`Error getting story: ${event.target.errorCode}`);
        };

        transaction.oncomplete = () => {
          db.close();
        };
      });
    } catch (error) {
      console.error("Failed to get story:", error);
      return null;
    }
  }
}

export default Database;
