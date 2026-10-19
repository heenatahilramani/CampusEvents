
import { useEffect, useState } from "react";

import { useParams } from "react-router-dom";
function Register() {
  const { eventId } = useParams();
  const [events, setEvents] = useState([]);
  const [studentName, setStudentName] = useState("");
  const [email, setEmail] = useState("");
  const [rollNumber, setRollNumber] = useState("");
  const [department, setDepartment] = useState("");
  const [event, setEvent] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("http://localhost:5000/api/events")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Could not load events");
        }
        return response.json();
      })
      .then((data) => {
  setEvents(data);

  if (eventId) {
    const selectedEvent = data.find((item) => item._id === eventId);

    if (selectedEvent) {
      setEvent(selectedEvent._id);
    }
  }
})
      .catch(() => setMessage("Unable to load events. Check the backend."));
  }, [eventId]);

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage("");

    if (!event) {
      setMessage("Please select an event.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        "http://localhost:5000/api/registrations",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            studentName,
            email,
            rollNumber,
            department,
            event,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Registration failed.");
      }

      setMessage("Registration successful! Your details have been saved.");

      setStudentName("");
      setEmail("");
      setRollNumber("");
      setDepartment("");
      setEvent("");
    } catch (error) {
      setMessage(error.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ padding: "30px", maxWidth: "550px", margin: "auto" }}>
      <h1>Event Registration</h1>
      <p>Enter your details to register for a college event.</p>

      <form onSubmit={handleSubmit}>
        <label>Student Name</label>
        <input
          style={inputStyle}
          type="text"
          value={studentName}
          onChange={(e) => setStudentName(e.target.value)}
          required
        />

        <label>Email</label>
        <input
          style={inputStyle}
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <label>Roll Number</label>
        <input
          style={inputStyle}
          type="text"
          value={rollNumber}
          onChange={(e) => setRollNumber(e.target.value)}
          required
        />

        <label>Department</label>
        <input
          style={inputStyle}
          type="text"
          value={department}
          onChange={(e) => setDepartment(e.target.value)}
          required
        />

        <label>Select Event</label>
        <select
          style={inputStyle}
          value={event}
          onChange={(e) => setEvent(e.target.value)}
          required
        >
          <option value="">Choose an event</option>
          {events.map((item) => (
            <option key={item._id} value={item._id}>
              {item.title}
            </option>
          ))}
        </select>

        <button type="submit" disabled={loading}>
          {loading ? "Registering..." : "Register Now"}
        </button>
      </form>

      {message && <p role="status">{message}</p>}
    </div>
  );
}

const inputStyle = {
  display: "block",
  width: "100%",
  boxSizing: "border-box",
  padding: "10px",
  margin: "8px 0 18px",
  border: "1px solid #ccc",
  borderRadius: "6px",
};

export default Register;
