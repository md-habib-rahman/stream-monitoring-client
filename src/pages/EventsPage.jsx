import { useEffect, useState } from "react";

import { getEvents } from "../services/eventApi";

import EventTable from "../components/events/EventTable";

export default function EventsPage() {
  const [events, setEvents] = useState([]);

  const loadEvents = async () => {
    try {
      const data = await getEvents();

      setEvents(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Event History</h1>

      <EventTable events={events} />
    </div>
  );
}
