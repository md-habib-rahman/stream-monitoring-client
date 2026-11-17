import api from "./api";

export async function getChannels() {
  const res = await api.get("/channels");

  return res.data;
}

export async function createChannel(channel) {
  const res = await api.post("/channels", channel);

  return res.data;
}

export async function updateChannel(id, channel) {
  const res = await api.put(`/channels/${id}`, channel);

  return res.data;
}

export async function setChannelEnabled(id, enabled) {
  const res = await api.patch(`/channels/${id}/enabled`, { enabled });

  return res.data;
}

export async function deleteChannel(id) {
  const res = await api.delete(`/channels/${id}`);

  return res.data;
}
