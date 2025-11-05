// Main app component
import React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import AppRoutes from "./routes/AppRoutes";
import Sidebar from "./components/Layout/Sidebar";
import ThemeToggle from "./components/Layout/ThemeToggle";
import './styles/index.css';

const App = () => {
  return (
    <Router>
      <div className="flex bg-gray-900 min-h-screen text-white">
        {/* Sidebar navigation */}
        <Sidebar />
        <main className="flex-1 p-4">
          {/* Theme toggle button */}
          <div className="flex justify-end mb-4">
            <ThemeToggle />
          </div>
          {/* Main app routes */}
          <AppRoutes />
        </main>
      </div>
    </Router>
  );
};

export default App;
