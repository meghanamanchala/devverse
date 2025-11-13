import { useUser } from "@clerk/clerk-react";
import { Navigate } from "react-router-dom";
import { MoonLoader } from "react-spinners";

export default function ClerkProtected({ children }) {
  const { isSignedIn, isLoaded } = useUser();

  if (!isLoaded) {
    return (
      <div className="flex flex-col items-center justify-center h-screen w-full bg-gradient-to-br from-[#0a0f1c] via-[#0b1628] to-[#0d1b33] text-white">
        <div className="relative z-10 flex flex-col items-center space-y-6">
          <MoonLoader color="#3b5b9a" size={80} speedMultiplier={0.8} />
          <p className="text-gray-400 text-lg tracking-wide">Preparing your DevVerse...</p>
        </div>
      </div>
    );
  }

  return isSignedIn ? children : <Navigate to="/signup" replace />;
}
