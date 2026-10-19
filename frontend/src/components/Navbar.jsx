
import { Link } from "react-router-dom";

function Navbar() {
  return (
    <nav className="navbar">
      <h2>CampusEvents</h2>

      <div className="nav-links">
        <Link to="/">Home</Link>
        <Link to="/events">Events</Link>
        <Link to="/register">Register</Link>
        <Link to="/my-registrations">My Registrations</Link>
        <Link to="/login">Admin Login</Link>
      </div>
    </nav>
  );
}

export default Navbar;
