import axios from "axios";

export const BACKEND_URL = "http://localhost:8080/api/v1";

const instance = axios.create({
  baseURL: BACKEND_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "*/*",
  },
});

export default instance;
