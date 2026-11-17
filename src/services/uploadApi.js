import api from "./api";

export async function uploadLogo(file) {
  const formData = new FormData();

  formData.append("file", file);

  const response = await api.post("/upload/logo", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
}
