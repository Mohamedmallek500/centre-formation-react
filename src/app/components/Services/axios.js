import axios from "axios";

axios.defaults.baseURL = "http://localhost:9091/api/";
axios.defaults.withCredentials = true;

// ============================
// Request Interceptor
// ============================
axios.interceptors.request.use(
  config => {
    return config;
  },
  error => Promise.reject(error)
);

// ============================
// Response Interceptor
// ============================
axios.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;

    // 🚫 Ne PAS intercepter les routes d'auth
    if (
      originalRequest.url.includes("/auth/signin") ||
      originalRequest.url.includes("/auth/signup") ||
      originalRequest.url.includes("/auth/refreshtoken")
    ) {
      return Promise.reject(error);
    }

    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      try {
        await axios.post("/auth/refreshtoken");
        return axios(originalRequest);
      } catch (err) {
        console.error("Refresh token failed", err);
        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  }
);

export default axios;
