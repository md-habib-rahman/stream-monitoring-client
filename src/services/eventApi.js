import api from "./api";

export async function getEvents(page = 1, limit = 50, filters = {}) {
  const params = new URLSearchParams({
    page,
    limit,
  });

  Object.entries(filters).forEach(([key, value]) => {
    if (value) {
      params.append(key, value);
    }
  });

  const res = await api.get(`/events?${params.toString()}`);

  return res.data;
}

export async function createEvent(event) {
  const res = await api.post("/events", event);

  return res.data;
}

export async function updateEvent(id, event) {
  const res = await api.put(`/events/${id}`, event);

  return res.data;
}

export async function deleteEvent(id) {
  const res = await api.delete(`/events/${id}`);

  return res.data;
}
