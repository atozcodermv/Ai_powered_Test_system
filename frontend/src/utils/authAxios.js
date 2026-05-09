import axios from "axios";
import { clearAuthSession, getActiveJwtToken, isPublicRoute } from "./authSession";

let isConfigured = false;

export const setupAuthAxios = () => {
  if (isConfigured) {
    return;
  }

  axios.interceptors.request.use((requestConfig) => {
    const token = getActiveJwtToken();
    if (token && !requestConfig.headers?.Authorization) {
      requestConfig.headers = requestConfig.headers || {};
      requestConfig.headers.Authorization = `Bearer ${token}`;
    }

    return requestConfig;
  });

  axios.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error?.response?.status === 401 && !isPublicRoute()) {
        clearAuthSession();
        if (window.location.pathname !== "/user/login") {
          window.location.href = "/user/login";
        }
      }

      return Promise.reject(error);
    }
  );

  isConfigured = true;
};
