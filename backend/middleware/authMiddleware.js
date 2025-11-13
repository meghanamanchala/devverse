const { verifyToken } = require("@clerk/backend");

module.exports = async function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.replace("Bearer ", "");
    if (!token) {
      return res.status(401).json({ error: "No token provided" });
    }

    const payload = await verifyToken(token, {
      secretKey: process.env.CLERK_SECRET_KEY,
      // audience: "your-audience", // optional
    });

    if (!payload || !payload.sub) {
      console.error("❌ Clerk token verification failed: Invalid token payload", payload);
      return res.status(401).json({ error: "Unauthorized" });
    }

    req.user = { id: payload.sub };
    next();
  } catch (err) {
    console.error("❌ Clerk token verification failed:", err);
    return res.status(401).json({ error: "Unauthorized" });
  }
};

