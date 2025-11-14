"use client";

import { useState } from "react";
import {
  CodeXml,
  Home,
  Search,
  Users,
  MessageCircle,
  Bell,
  Bookmark,
  User,
  Settings,
  Menu,
  X,
  LogIn,
  PlusSquare,
} from "lucide-react";
import { UserButton, useUser } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";

const navItems = [
  { href: "/", label: "Home", icon: <Home size={20} /> },
  { href: "/explore", label: "Explore", icon: <Search size={20} /> },
  { href: "/network", label: "Network", icon: <Users size={20} /> },
  { href: "/messages", label: "Messages", icon: <MessageCircle size={20} /> },
  { href: "/notifications", label: "Notifications", icon: <Bell size={20} /> },
  { href: "/saved", label: "Saved", icon: <Bookmark size={20} /> },
  { href: "/posts", label: "Posts", icon: <User size={20} /> },
  // { href: "/profile", label: "Profile", icon: <User size={20} /> },
  { href: "/settings", label: "Settings", icon: <Settings size={20} /> },
];

const Sidebar = () => {
  const [open, setOpen] = useState(false);
  const { user, isLoaded, isSignedIn } = useUser();
  const navigate = useNavigate();

  let displayName = "Account";
  if (isLoaded && isSignedIn && user) {
    displayName =
      user.firstName ||
      user.username ||
      user.emailAddresses?.[0]?.emailAddress ||
      "User";
  }

  const handleAccountClick = () => {
    if (!isSignedIn) {
      navigate("/signup");
    }
  };

  return (
    <>
      {/* Toggle button for mobile */}
      {!open && (
        <button
          className="lg:hidden fixed top-4 left-4 z-40 bg-[#1b2a49] hover:bg-[#23385c] text-white p-2.5 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#3b5b9a] focus:ring-offset-2 focus:ring-offset-[#0a0f1c]"
          onClick={() => setOpen(true)}
          aria-label="Open sidebar"
        >
          <Menu className="w-6 h-6" />
        </button>
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-screen w-64 bg-[#0d1424] border-r border-[#1a2b4a] shadow-xl transform transition-transform duration-300 ease-in-out flex flex-col z-30
          ${open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
          lg:sticky lg:top-0 lg:left-0 lg:h-[100vh] lg:w-64
        `}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          height: '100vh',
          width: '16rem',
          zIndex: 30,
        }}
      >
        {/* Close button (mobile) */}
        {open && (
          <button
            className="lg:hidden absolute top-4 right-4 z-50 bg-[#1b2a49] hover:bg-[#23385c] text-white p-2 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#3b5b9a]"
            onClick={() => setOpen(false)}
            aria-label="Close sidebar"
          >
            <X className="w-6 h-6" />
          </button>
        )}

        {/* Logo */}
        <div className="flex px-6 py-6 lg:py-8 bg-[#0a0f1c] border-b border-[#1a2b4a]">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-[#2959a6] to-[#1e3c72] p-2 rounded-lg">
              <CodeXml size={24} className="text-white" />
            </div>
            <span className="text-xl lg:text-2xl font-bold text-white tracking-tight">
              DevVerse
            </span>
          </div>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 lg:py-6">
          <div className="space-y-1">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 font-medium transition-all duration-200 hover:bg-[#1b2a49] hover:text-white active:bg-[#23385c] focus:outline-none focus:ring-2 focus:ring-[#3b5b9a] focus:ring-inset group"
                onClick={() => setOpen(false)}
              >
                <span className="flex items-center justify-center flex-shrink-0 w-5 h-5 text-gray-400 group-hover:text-white transition-colors">
                  {item.icon}
                </span>
                <span className="truncate text-sm lg:text-base">
                  {item.label}
                </span>
              </a>
            ))}
          </div>
        </nav>

        {/* User or Account Button */}
        <div className="p-1 lg:p-2 border-t border-[#1a2b4a] bg-[#0a0f1c]">
          {isSignedIn ? (
            <button className="w-full flex items-center gap-3 px-4 py-3 text-white rounded-lg transition-colors duration-200 font-medium text-sm">
              <UserButton size={18} className="flex-shrink-0" />
              <span className="truncate text-md">{displayName}</span>
            </button>
          ) : (
            <button
              onClick={handleAccountClick}
              className="w-full flex items-center gap-3 px-4 py-3 text-gray-300 hover:text-white hover:bg-[#1b2a49] rounded-lg transition-all duration-200 font-medium text-sm cursor-pointer"
            >
              <LogIn size={18} className="text-gray-400" />
              <span className="truncate">Account</span>
            </button>
          )}
        </div>
      </aside>

      {/* Overlay (mobile) */}
      {open && (
        <div
          className="fixed inset-0 bg-black/60 z-20 lg:hidden transition-opacity duration-200"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}
    </>
  );
};

export default Sidebar;
