import React from "react";
import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./routes/AppRoutes";
import Sidebar from "./components/Layout/Sidebar";
import ThemeToggle from "./components/Layout/ThemeToggle";

const App = () => {
  return (
    <BrowserRouter>
      <div className="flex flex-col md:flex-row bg-gradient-to-br from-[#0a0f1c] via-[#0b1628] to-[#0d1b33] min-h-screen text-white">
        {/* Sidebar navigation */}
        <Sidebar />

        <main className="flex-1 flex flex-col min-h-screen">
          <div className="flex-1 flex items-center justify-center">
            <AppRoutes />
          </div>
        </main>
      </div>
    </BrowserRouter>
  );
};

export default App;
