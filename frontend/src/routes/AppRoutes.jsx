import React from "react";
import { Routes, Route } from "react-router-dom";
import ClerkProtected from "../components/Auth/ClerkProtected";


import Home from "../pages/Home";
import Explore from "../pages/Explore";
import Notifications from "../pages/Notifications";
import Messages from "../pages/Messages";
import Saved from "../pages/Saved";
import Network from "../pages/Network";
import Posts from "../pages/Posts";
import Settings from "../pages/Settings";
import Signup from "../components/Auth/Signup";
import AddPost from "../pages/AddPost";

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
  <Route path="/posts" element={<ClerkProtected><Posts /></ClerkProtected>} />
  <Route path="/settings" element={<ClerkProtected><Settings /></ClerkProtected>} />
  </Routes>
);

export default AppRoutes;
