import axios from "axios";

export const BACKEND_URL = "http://localhost:8080/api/v1";
export const BASE_URL_CHATBOT = "http://localhost:8001";

const instance = axios.create({
  baseURL: BACKEND_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "*/*",
  },
});

// Tự động gắn Authorization header nếu có token
instance.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default instance;
