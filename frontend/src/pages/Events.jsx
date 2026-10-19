
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
function Events() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("http://localhost:5000/api/events")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch events");
        }
        return response.json();
      })
      .then((data) => {
        setEvents(data);
      })
      .catch((err) => {
        setError(err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div style={{ padding: "40px" }}>Loading events...</div>;
  }

  if (error) {
    return (
      <div style={{ padding: "40px" }}>
        <h2>Unable to load events</h2>
        <p>{error}</p>
        <p>Make sure your backend server is running.</p>
      </div>
    );
  }

  return (
    <div style={{ padding: "40px", fontFamily: "Arial" }}>
      <h1>Upcoming College Events</h1>

      {events.length === 0 ? (
        <p>No events available yet.</p>
      ) : (
        <div>
          {events.map((event) => (
            <div
              key={event._id}
              style={{
                border: "1px solid #ddd",
                borderRadius: "10px",
                padding: "20px",
                marginBottom: "20px",
                maxWidth: "600px",
              }}
            >
              <h2>{event.title}</h2>
              <p><strong>Category:</strong> {event.category}</p>
              <p>{event.description}</p>
              <p>
                <strong>Date:</strong>{" "}
                {new Date(event.date).toLocaleDateString()}
              </p>
              <p><strong>Venue:</strong> {event.venue}</p>
              <p><strong>Capacity:</strong> {event.capacity}</p>
              <Link
  to={`/register/${event._id}`}
  className="primary-btn"
>
  Register Now
</Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Events;
