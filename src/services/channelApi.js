import axios from "axios";

const API =
  "http://localhost:3001/api/channels";

export async function getChannels() {
  const res =
    await axios.get(API);

  return res.data;
}

export async function createChannel(
  channel
) {
  const res =
    await axios.post(
      API,
      channel
    );

  return res.data;
}

export async function updateChannel(
  id,
  channel
) {
  const res =
    await axios.put(
      `${API}/${id}`,
      channel
    );

  return res.data;
}

export async function deleteChannel(
  id
) {
  const res =
    await axios.delete(
      `${API}/${id}`
    );

  return res.data;
}