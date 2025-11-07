import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ClerkProtected from "../components/Auth/ClerkProtected";

import Home from "../pages/Home";
import Explore from "../pages/Explore";
import Notifications from "../pages/Notifications";
import Messages from "../pages/Messages";
import Saved from "../pages/Saved";
import Network from "../pages/Network";
import Profile from "../pages/Profile";
import Settings from "../pages/Settings";
import Signup from "../components/Auth/Signup";

const AppRoutes = () => (
  <BrowserRouter>
    <Routes>
      {/* Public */}
      <Route path="/signup" element={<Signup />} />

      {/* Protected */}
      <Route path="/" element={<ClerkProtected><Home /></ClerkProtected>} />
      <Route path="/explore" element={<ClerkProtected><Explore /></ClerkProtected>} />
      <Route path="/notifications" element={<ClerkProtected><Notifications /></ClerkProtected>} />
      <Route path="/messages" element={<ClerkProtected><Messages /></ClerkProtected>} />
      <Route path="/saved" element={<ClerkProtected><Saved /></ClerkProtected>} />
      <Route path="/network" element={<ClerkProtected><Network /></ClerkProtected>} />
      <Route path="/profile" element={<ClerkProtected><Profile /></ClerkProtected>} />
      <Route path="/settings" element={<ClerkProtected><Settings /></ClerkProtected>} />
    </Routes>
  </BrowserRouter>
);

export default AppRoutes;

