import api from "./api";

export async function getUsers() {
  const response = await api.get("/users");
  return response.data;
}

export async function createUser(user) {
  const response = await api.post("/users", user);
  return response.data;
}

export async function updateUserRole(id, role) {
  const response = await api.patch(`/users/${id}/role`, { role });
  return response.data;
}

export async function updateUserPassword(id, password) {
  const response = await api.patch(`/users/${id}/password`, { password });
  return response.data;
}

export async function updateUserEnabled(id, enabled) {
  const response = await api.patch(`/users/${id}/enabled`, { enabled });
  return response.data;
}

export async function deleteUser(id) {
  const response = await api.delete(`/users/${id}`);
  return response.data;
}
