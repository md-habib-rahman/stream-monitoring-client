import axios from "axios";
import api from "./api";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

export async function login(username, password) {
  const response = await API.post("/auth/login", {
    username,
    password,
  });

  return response.data;
}

export async function getCurrentUser() {
  const response = await api.get("/auth/me");
  return response.data;
}