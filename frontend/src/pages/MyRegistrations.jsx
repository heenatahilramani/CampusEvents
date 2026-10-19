
import { useState } from "react";

const API = "http://localhost:5000/api/student-access";

function MyRegistrations() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [token, setToken] = useState("");
  const [registrations, setRegistrations] = useState([]);
  const [step, setStep] = useState("email");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function sendOtp(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch(`${API}/request-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.message || "Could not request code.");

      setStep("otp");
      setMessage(data.message);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function verifyOtp(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch(`${API}/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.message || "Verification failed.");

      setToken(data.token);

      const registrationsResponse = await fetch(
        `${API}/my-registrations`,
        {
          headers: { Authorization: `Bearer ${data.token}` },
        }
      );

      const registrationsData = await registrationsResponse.json();

      if (!registrationsResponse.ok) {
        throw new Error(registrationsData.message || "Could not load registrations.");
      }

      setRegistrations(registrationsData);
      setStep("results");
      setMessage("Email verified successfully.");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ maxWidth: 850, margin: "0 auto", padding: 30 }}>
      <h1>My Registrations</h1>
      <p>Verify your registered email to view your event registrations.</p>

      {error && <p role="alert" style={{ color: "crimson" }}>{error}</p>}
      {message && <p role="status" style={{ color: "green" }}>{message}</p>}

      {step === "email" && (
        <form onSubmit={sendOtp}>
          <label htmlFor="email">Registered email address</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={inputStyle}
          />
          <button disabled={loading} style={buttonStyle}>
            {loading ? "Sending..." : "Send Verification Code"}
          </button>
        </form>
      )}

      {step === "otp" && (
        <form onSubmit={verifyOtp}>
          <label htmlFor="otp">Six-digit verification code</label>
          <input
            id="otp"
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="[0-9]{6}"
            maxLength={6}
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            required
            style={inputStyle}
          />
          <button disabled={loading} style={buttonStyle}>
            {loading ? "Verifying..." : "Verify and View Registrations"}
          </button>
          <button
            type="button"
            onClick={() => {
              setStep("email");
              setOtp("");
              setError("");
              setMessage("");
            }}
            style={{ ...buttonStyle, background: "#eee", color: "#222" }}
          >
            Change Email
          </button>
        </form>
      )}

      {step === "results" && (
        <>
          <h2>Your Registered Events</h2>

          {registrations.length === 0 ? (
            <p>No registrations found for this email.</p>
          ) : (
            registrations.map((registration) => (
              <article key={registration._id} style={cardStyle}>
                <h3>{registration.event?.title || "Event details unavailable"}</h3>
                <p><strong>Student:</strong> {registration.studentName}</p>
                <p><strong>Email:</strong> {registration.email}</p>
                <p><strong>Roll Number:</strong> {registration.rollNumber}</p>
                <p><strong>Department:</strong> {registration.department}</p>
                {registration.event && (
                  <>
                    <p><strong>Date:</strong> {new Date(registration.event.date).toLocaleString()}</p>
                    <p><strong>Venue:</strong> {registration.event.venue}</p>
                  </>
                )}
                <p style={{ color: "#18794e" }}>Registration confirmed</p>
              </article>
            ))
          )}

          <button
            style={buttonStyle}
            onClick={() => {
              setToken("");
              setOtp("");
              setRegistrations([]);
              setStep("email");
              setMessage("");
              setError("");
            }}
          >
            Finish
          </button>
        </>
      )}
    </main>
  );
}

const inputStyle = {
  display: "block",
  width: "100%",
  boxSizing: "border-box",
  padding: 12,
  margin: "8px 0 16px",
  border: "1px solid #ccc",
  borderRadius: 8,
};

const buttonStyle = {
  padding: "11px 16px",
  margin: "8px 8px 8px 0",
  border: "none",
  borderRadius: 8,
  background: "#283593",
  color: "white",
  cursor: "pointer",
};

const cardStyle = {
  border: "1px solid #ddd",
  borderRadius: 10,
  padding: 20,
  margin: "16px 0",
};

export default MyRegistrations;
