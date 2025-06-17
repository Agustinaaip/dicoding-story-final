import CONFIG from "../config";

const API_ENDPOINT = {
  SIGNIN: `${CONFIG.BASE_URL}/signin`,
  LOGIN: `${CONFIG.BASE_URL}/login`,
  GET_STORY: `${CONFIG.BASE_URL}/stories`,
  ADD_STORY: `${CONFIG.BASE_URL}/stories`,
  DETAIL_STORY: (id) => `${CONFIG.BASE_URL}/stories/${id}`,
};

class StoryAPI {
  static async signin({ name, email, password }) {
    const response = await fetch(API_ENDPOINT.SIGNIN, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, email, password }),
    });
    return response.json();
  }

  static async login({ email, password }) {
    const response = await fetch(API_ENDPOINT.LOGIN, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });
    return response.json();
  }

  static async getStory(token, { page, size } = { page: 1, size: 10 }) {
    const url = new URL(API_ENDPOINT.GET_STORY);
    url.searchParams.append("page", page);
    url.searchParams.append("size", size);

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.json();
  }

  static async addStory({ description, photo, lat, lon }, token) {
    const formData = new FormData();
    formData.append("description", description);
    formData.append("photo", photo);
    if (lat !== undefined && lon !== undefined) {
      formData.append("lat", lat.toString());
      formData.append("lon", lon.toString());
    }

    const response = await fetch(API_ENDPOINT.ADD_STORY, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });
    return response.json();
  }

  static async getStoryById(id, token) {
    const response = await fetch(API_ENDPOINT.DETAIL_STORY(id), {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.json();
  }
}

export default StoryAPI;
