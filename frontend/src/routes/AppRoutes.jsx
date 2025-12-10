import React from "react";
import { Routes, Route } from "react-router-dom";
import ClerkProtected from "../components/Auth/ClerkProtected";


import Home from "../pages/Home";
import Explore from "../pages/Explore";
import Notifications from "../pages/Notifications";
import Messages from "../pages/Messages";
import Saved from "../pages/Saved";
import Network from "../pages/Network";

// ...existing code...
import Signup from "../components/Auth/Signup";
import AddPost from "../pages/AddPost";
import Profile from "../pages/Profile";

const AppRoutes = () => (
  <Routes>
    {/* Public */}
    <Route path="/signup" element={<Signup />} />
    <Route path="/" element={<Home />} />

    {/* Protected */}
  <Route path="/add-post" element={<ClerkProtected><AddPost /></ClerkProtected>} />
  <Route path="/explore" element={<ClerkProtected><Explore /></ClerkProtected>} />
  <Route path="/notifications" element={<ClerkProtected><Notifications /></ClerkProtected>} />
  <Route path="/messages" element={<ClerkProtected><Messages /></ClerkProtected>} />
  <Route path="/saved" element={<ClerkProtected><Saved /></ClerkProtected>} />
  <Route path="/network" element={<ClerkProtected><Network /></ClerkProtected>} />
  {/* /posts now redirects to Home for backward compatibility */}
  <Route path="/posts" element={<Home />} />
// ...existing code...
  <Route path="/profile" element={<ClerkProtected><Profile /></ClerkProtected>} />
  </Routes>
);

export default AppRoutes;
