import api from "./api";

export async function getInfrastructureTargets() {
  const response = await api.get("/infrastructure/targets");
  return response.data;
}

export async function getInfrastructureTarget(id) {
  const response = await api.get(`/infrastructure/targets/${id}`);
  return response.data;
}

export async function createInfrastructureTarget(target) {
  const response = await api.post("/infrastructure/targets", target);
  return response.data;
}

export async function updateInfrastructureTarget(id, target) {
  const response = await api.patch(`/infrastructure/targets/${id}`, target);
  return response.data;
}

export async function deleteInfrastructureTarget(id) {
  const response = await api.delete(`/infrastructure/targets/${id}`);
  return response.data;
}

export async function createMonitoredItem(targetId, item) {
  const response = await api.post(
    `/infrastructure/targets/${targetId}/items`,
    item,
  );
  return response.data;
}

export async function updateMonitoredItem(id, item) {
  const response = await api.patch(`/infrastructure/items/${id}`, item);
  return response.data;
}

export async function deleteMonitoredItem(id) {
  const response = await api.delete(`/infrastructure/items/${id}`);
  return response.data;
}
