import React from "react";

import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Home from "./pages/home.jsx";
import EmployerDashboard from "./pages/employerdashboard.jsx";

function App() {
  return (
    <Router>
      <nav style={{ display: "flex", gap: "1rem", padding: "1rem", background: "#f5f5f5" }}>
        <Link to="/">Home</Link>
        <Link to="/employer">Employer</Link>
      </nav>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/employer" element={<EmployerDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
