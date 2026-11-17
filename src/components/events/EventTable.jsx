export default function EventTable({ events }) {
//   console.log(events[0]?.created_at);
//   console.log(new Date(events[0]?.created_at));
  return (
    <div className="overflow-x-auto">
      <table className="table table-zebra">
        <thead>
          <tr>
            <th>Time</th>
            <th>Channel</th>
            <th>Event</th>
            <th>Status</th>
            <th>Bitrate</th>
            <th>Message</th>
          </tr>
        </thead>

        <tbody>
          {events.map((event) => (
            <tr key={event.id}>
              <td>
                {new Date(event.created_at).toLocaleString("en-BD", {
                  timeZone: "Asia/Dhaka",
                })}
              </td>

              <td>{event.channel_name}</td>

              <td>
                <span className="badge badge-primary">{event.event_type}</span>
              </td>

              <td>
                {event.previous_status || "-"} → {event.current_status || "-"}
              </td>

              <td>{event.bitrate ? `${event.bitrate} Kbps` : "-"}</td>

              <td>{event.message}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
