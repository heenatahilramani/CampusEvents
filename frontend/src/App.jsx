
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Events from "./pages/Events";
import Register from "./pages/Register";
import MyRegistrations from "./pages/MyRegistrations";
import AdminDashboard from "./pages/AdminDashboard";
import Login from "./pages/Login";


function ProtectedAdminRoute({ children }) {
  const token = sessionStorage.getItem("adminToken");

  if (!token) {
    window.location.replace("/login");
    return null;
  }

  return children;
}


function App() {
  return (
    <BrowserRouter>
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/events" element={<Events />} />
        <Route path="/register" element={<Register />} />
        <Route path="/register/:eventId" element={<Register />} />
<Route
  path="/admin"
  element={
    <ProtectedAdminRoute>
      <AdminDashboard />
    </ProtectedAdminRoute>
  }
/>

        <Route path="/login" element={<Login />} />
        <Route
  path="/my-registrations"
  element={<MyRegistrations />}
/>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
