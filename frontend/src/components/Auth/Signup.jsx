// src/pages/Signup.jsx
import { SignUp } from "@clerk/clerk-react";

export default function Signup() {
  return (
    <div className="flex justify-center mt-20">
      <SignUp
        afterSignUpUrl="/"
        afterSignInUrl="/"
      />
    </div>
  );
}
