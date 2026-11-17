import api from "./api";

export async function getAlertRecipients() {
  const response = await api.get("/alert-recipients");
  return response.data;
}

export async function addAlertRecipient(email) {
  const response = await api.post("/alert-recipients", { email });
  return response.data;
}

export async function deleteAlertRecipient(id) {
  const response = await api.delete(`/alert-recipients/${id}`);
  return response.data;
}
