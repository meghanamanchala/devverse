import { useUser } from "@clerk/clerk-react";
import { use } from "react";
import { Navigate } from "react-router-dom";

export default function ClerkProtected({ children }) {
  const { isSignedIn, isLoaded } = useUser();

  if (!isLoaded) return <div>Loading...</div>;

  return isSignedIn ? children : <Navigate to="/signup" replace />;
}

