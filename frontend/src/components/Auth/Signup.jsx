import { SignIn, SignUp, SignUpButton, UserButton, useUser } from "@clerk/clerk-react";
import { useEffect } from "react";

function Signup() {
  const { user } = useUser();

  // When user signs up → send user data to backend
useEffect(() => {
  if (user) {
    fetch("http://localhost:5000/api/auth/save-user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        clerkId: user.id,
        email: user.primaryEmailAddress.emailAddress,
        name: user.fullName,
        username: user.username || user.primaryEmailAddress.emailAddress.split("@")[0]
      }),
    });
  }
}, [user]);


  return (
    <div>
      {!user ? (
        <SignIn />
      ) : (
        <div>
          <h2>Welcome {user.fullName}! ✅ Data stored in DB ✅</h2>
          <UserButton />
        </div>
      )}
    </div>
  );
}

export default Signup;

