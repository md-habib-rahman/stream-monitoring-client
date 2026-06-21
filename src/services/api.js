import axios from "axios";

const API_URL = "http://localhost:3001";

export const getStreams = async () => {
  const response = await axios.get(`${API_URL}/api/streams`);

  return response.data;
};
