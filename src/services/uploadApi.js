import axios from "axios";

const API_URL = "http://localhost:3001/api";

export async function uploadLogo(file) {
  const formData = new FormData();

  formData.append("file", file);

  const response = await axios.post(`${API_URL}/upload/logo`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
}
