import axios from "axios";

const API_URL = "http://localhost:3001/api";

export async function getEvents() {
  const response = await axios.get(
    `${API_URL}/events`,
  );

  return response.data;
}