import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

const getBaseURL = () => {
  const envUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
  return envUrl.endsWith("/api") ? envUrl : `${envUrl.replace(/\/+$/, "")}/api`;
};

const apiClient = axios.create({
  baseURL: getBaseURL(),
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (!originalRequest || originalRequest._retry) {
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && originalRequest.url !== "/auth/refresh") {
      originalRequest._retry = true;

      try {
        await apiClient.post("/auth/refresh");
        return apiClient(originalRequest);
      } catch {
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;