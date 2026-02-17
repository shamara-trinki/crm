import { verifyAccessToken } from "../utils/jwt.js";

export function authenticate(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Missing token" });
  }

  const token = header.substring("Bearer ".length);
  try {
    const decoded = verifyAccessToken(token);
    req.user = { userId: decoded.sub, roleId: decoded.roleId };
    next();
  } catch {
    return res.status(401).json({ message: "Invalid/expired token" });
  }
}
