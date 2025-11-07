// Main app component
import React from "react";
import AppRoutes from "./routes/AppRoutes";
import Sidebar from "./components/Layout/Sidebar";
import ThemeToggle from "./components/Layout/ThemeToggle";
import './styles/index.css';

const App = () => {
  return (
    <div className="flex flex-col md:flex-row bg-gradient-to-br from-gray-900 via-gray-800 to-blue-900 min-h-screen text-white">
      {/* Sidebar navigation */}
      <Sidebar />
      <main className="flex-1 flex flex-col min-h-screen">
        <div className="flex justify-end p-2 sm:p-4 md:p-6 lg:p-8">
          <ThemeToggle />
        </div>
        <div className="flex-1 flex items-center justify-center">
          <AppRoutes />
        </div>
      </main>
    </div>
  );
};

export default App;
