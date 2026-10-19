
import { useEffect, useState } from "react";

const API = "http://localhost:5000/api";

const emptyEvent = {
  title: "",
  category: "Workshop",
  description: "",
  date: "",
  venue: "",
  capacity: 50,
};

function AdminDashboard() {
  const [events, setEvents] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [form, setForm] = useState(emptyEvent);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const token = sessionStorage.getItem("adminToken");

  async function request(url, options = {}) {
    const response = await fetch(`${API}${url}`, {
      ...options,
      headers: {
        ...(options.body ? { "Content-Type": "application/json" } : {}),
        Authorization: `Bearer ${token}`,
        ...options.headers,
      },
    });

    const data = await response.json().catch(() => ({}));

    if (response.status === 401 || response.status === 403) {
      sessionStorage.removeItem("adminToken");
      window.location.replace("/login");
      throw new Error("Admin session expired. Please log in again.");
    }

    if (!response.ok) {
      throw new Error(data.message || "Request failed.");
    }

    return data;
  }

  async function loadDashboard() {
    setError("");

    try {
      const [, eventsData, registrationsData] = await Promise.all([
        request("/admin/dashboard"),
        request("/events"),
        request("/registrations"),
      ]);

      setEvents(eventsData);
      setRegistrations(registrationsData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!token) {
      window.location.replace("/login");
      return;
    }

    loadDashboard();
    // Load once when the dashboard opens.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((previous) => ({ ...previous, [name]: value }));
  }

  function startEdit(event) {
    setEditingId(event._id);
    setForm({
      title: event.title || "",
      category: event.category || "Workshop",
      description: event.description || "",
      date: event.date ? new Date(event.date).toISOString().slice(0, 16) : "",
      venue: event.venue || "",
      capacity: event.capacity ?? 50,
    });
    setNotice("");
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function resetForm() {
    setEditingId(null);
    setForm(emptyEvent);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setNotice("");

    try {
      const payload = {
        ...form,
        capacity: Number(form.capacity),
        date: new Date(form.date).toISOString(),
      };

      if (
        !payload.title.trim() ||
        !payload.category.trim() ||
        !payload.description.trim() ||
        !payload.venue.trim() ||
        !Number.isInteger(payload.capacity) ||
        payload.capacity < 1 ||
        !Number.isFinite(new Date(payload.date).getTime())
      ) {
        throw new Error("Please enter valid event details.");
      }

      if (editingId) {
        await request(`/events/${editingId}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
        setNotice("Event updated successfully.");
      } else {
        await request("/events", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        setNotice("Event created successfully.");
      }

      resetForm();
      await loadDashboard();
    } catch (err) {
      setError(err.message || "Could not save event.");
    } finally {
      setSaving(false);
    }
  }

  async function deleteEvent(event) {
    const confirmed = window.confirm(
      `Delete "${event.title}"? This cannot be undone.`
    );

    if (!confirmed) return;

    setError("");
    setNotice("");

    try {
      await request(`/events/${event._id}`, { method: "DELETE" });
      setNotice("Event deleted successfully.");
      if (editingId === event._id) resetForm();
      await loadDashboard();
    } catch (err) {
      setError(err.message || "Could not delete event.");
    }
  }

  const cardStyle = {
    background: "#f3f5ff",
    border: "1px solid #e0e4f0",
    borderRadius: 12,
    padding: 20,
    flex: "1 1 180px",
  };

  const buttonStyle = {
    padding: "10px 16px",
    border: "none",
    borderRadius: 7,
    cursor: "pointer",
    marginRight: 8,
    marginTop: 8,
  };

  if (loading) return <p style={{ padding: 30 }}>Loading dashboard...</p>;

  return (
    <main
      style={{
        maxWidth: 1100,
        margin: "0 auto",
        padding: "30px 20px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h1>Admin Dashboard</h1>
      <p>Manage college events and monitor student registrations.</p>

      {error && (
        <p role="alert" style={{ color: "#b42318" }}>{error}</p>
      )}
      {notice && (
        <p role="status" style={{ color: "#18794e" }}>{notice}</p>
      )}

      <section style={{ display: "flex", gap: 16, flexWrap: "wrap", margin: "24px 0" }}>
        <div style={cardStyle}>
          <h3>Total Events</h3>
          <h2>{events.length}</h2>
        </div>
        <div style={cardStyle}>
          <h3>Total Registrations</h3>
          <h2>{registrations.length}</h2>
        </div>
      </section>

      <section style={{ border: "1px solid #ddd", borderRadius: 12, padding: 22, marginBottom: 32 }}>
        <h2>{editingId ? "Edit Event" : "Add New Event"}</h2>

        <form onSubmit={handleSubmit}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
            <label>
              Event title *
              <input
                name="title"
                value={form.title}
                onChange={handleChange}
                required
                maxLength={120}
                style={inputStyle}
              />
            </label>

            <label>
              Category *
              <select name="category" value={form.category} onChange={handleChange} required style={inputStyle}>
                <option>Workshop</option>
                <option>Technical</option>
                <option>Cultural</option>
                <option>Sports</option>
                <option>Seminar</option>
                <option>Competition</option>
                <option>Other</option>
              </select>
            </label>

            <label>
              Date and time *
              <input
                type="datetime-local"
                name="date"
                value={form.date}
                onChange={handleChange}
                required
                style={inputStyle}
              />
            </label>

            <label>
              Venue *
              <input
                name="venue"
                value={form.venue}
                onChange={handleChange}
                required
                maxLength={200}
                style={inputStyle}
              />
            </label>

            <label>
              Capacity *
              <input
                type="number"
                name="capacity"
                value={form.capacity}
                onChange={handleChange}
                min="1"
                step="1"
                required
                style={inputStyle}
              />
            </label>
          </div>

          <label style={{ display: "block", marginTop: 16 }}>
            Description *
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              required
              maxLength={2000}
              rows={4}
              style={{ ...inputStyle, resize: "vertical" }}
            />
          </label>

          <button type="submit" disabled={saving} style={{ ...buttonStyle, background: "#283593", color: "white" }}>
            {saving ? "Saving..." : editingId ? "Save Changes" : "Create Event"}
          </button>

          {editingId && (
            <button type="button" onClick={resetForm} style={{ ...buttonStyle, background: "#eee" }}>
              Cancel Edit
            </button>
          )}
        </form>
      </section>

      <h2>Event Overview</h2>

      {events.length === 0 ? (
        <p>No events available. Add your first event above.</p>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 18 }}>
          {events.map((event) => {
            const count = registrations.filter((registration) => {
              const eventId =
                typeof registration.event === "string"
                  ? registration.event
                  : registration.event?._id;

              return eventId === event._id;
            }).length;

            return (
              <article key={event._id} style={{ border: "1px solid #ddd", borderRadius: 12, padding: 20 }}>
                <h3>{event.title}</h3>
                <p><strong>Category:</strong> {event.category}</p>
                <p><strong>Date:</strong> {new Date(event.date).toLocaleString()}</p>
                <p><strong>Venue:</strong> {event.venue}</p>
                <p><strong>Capacity:</strong> {event.capacity}</p>
                <p><strong>Registrations:</strong> {count} / {event.capacity}</p>

                <button
                  onClick={() => startEdit(event)}
                  style={{ ...buttonStyle, background: "#e8eaf6" }}
                >
                  Edit
                </button>
                <button
                  onClick={() => deleteEvent(event)}
                  style={{ ...buttonStyle, background: "#ffebee", color: "#b71c1c" }}
                >
                  Delete
                </button>
              </article>
            );
          })}
        </div>
      )}
    </main>
  );
}

const inputStyle = {
  display: "block",
  boxSizing: "border-box",
  width: "100%",
  marginTop: 6,
  padding: 11,
  border: "1px solid #ccc",
  borderRadius: 7,
  font: "inherit",
};

export default AdminDashboard;
