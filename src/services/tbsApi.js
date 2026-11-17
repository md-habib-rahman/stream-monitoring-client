import api from "./api";

export async function getTbsDevices() {
  const response = await api.get("/tbs");
  return response.data.devices;
}

export async function createTbsDevice(device) {
  const response = await api.post("/tbs/devices", device);
  return response.data;
}

export async function updateTbsDevice(id, device) {
  const response = await api.patch(
    `/tbs/devices/${encodeURIComponent(id)}`,
    device,
  );
  return response.data;
}

export async function deleteTbsDevice(id) {
  const response = await api.delete(`/tbs/devices/${encodeURIComponent(id)}`);
  return response.data;
}

export async function getTbsStreams(id, mod, options = {}) {
  const response = await api.get(
    `/tbs/${encodeURIComponent(id)}/streams`,
    {
      params: { mods: mod },
      signal: options.signal,
    },
  );
  return response.data;
}

export async function getTbsStream(id, mid, mod, options = {}) {
  const response = await api.get(
    `/tbs/${encodeURIComponent(id)}/streams/${encodeURIComponent(mid)}`,
    {
      params: { mod },
      signal: options.signal,
    },
  );
  return response.data;
}

export async function restartTbsStream(
  id,
  mid,
  mod = "cdn",
  channelId,
  mappingLabel,
) {
  const response = await api.post(
    `/tbs/${encodeURIComponent(id)}/streams/${encodeURIComponent(mid)}/restart`,
    { mod, channelId, mappingLabel },
  );
  return response.data;
}
