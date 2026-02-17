import { db } from "../db.js";
import { comparePassword } from "../utils/password.js";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../utils/jwt.js";
import { hashToken, compareToken } from "../utils/tokenHash.js";

function getRefreshExpiryDate() {
  // Simple: 30 days default
  const days = 3;
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d;
}

export async function login(req, res) {
  const { username, password } = req.body;

  const [users] = await db.query(
    `SELECT id, username, password_hash, role_id, is_active FROM users WHERE username=? LIMIT 1`,
    [username]
  );
  if (users.length === 0) return res.status(401).json({ message: "Invalid credentials" });

  const user = users[0];
  if (!user.is_active) return res.status(403).json({ message: "Account disabled" });

  const ok = await comparePassword(password, user.password_hash);
  if (!ok) return res.status(401).json({ message: "Invalid credentials" });

  const accessToken = signAccessToken({ sub: user.id, roleId: user.role_id });
  const refreshToken = signRefreshToken({ sub: user.id });

  // store refresh token hashed in DB
  const tokenHash = await hashToken(refreshToken);
  const expiresAt = getRefreshExpiryDate();

  await db.query(
    `INSERT INTO refresh_tokens (user_id, token_hash, expires_at) VALUES (?, ?, ?)`,
    [user.id, tokenHash, expiresAt]
  );

  // HttpOnly cookie
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: false, // set true in production with HTTPS
    sameSite: "lax",
    expires: expiresAt,
  });

  return res.json({ accessToken });
}

export async function refresh(req, res) {
  const token = req.cookies.refreshToken;
  if (!token) return res.status(401).json({ message: "Missing refresh token" });

  let decoded;
  try {
    decoded = verifyRefreshToken(token);
  } catch {
    return res.status(401).json({ message: "Invalid refresh token" });
  }

  const userId = decoded.sub;

  // Find a matching stored token hash (not revoked, not expired)
  const [rows] = await db.query(
    `SELECT id, token_hash FROM refresh_tokens
     WHERE user_id=? AND revoked=0 AND expires_at > NOW()`,
    [userId]
  );

  let match = null;
  for (const r of rows) {
    if (await compareToken(token, r.token_hash)) {
      match = r;
      break;
    }
  }
  if (!match) return res.status(401).json({ message: "Refresh token not recognized" });

  // Load role_id for access token
  const [[user]] = await db.query(`SELECT role_id FROM users WHERE id=? LIMIT 1`, [userId]);
  const accessToken = signAccessToken({ sub: userId, roleId: user.role_id });

  return res.json({ accessToken });
}

export async function logout(req, res) {
  const token = req.cookies.refreshToken;
  if (token) {
    // Best effort revoke: revoke all valid refresh tokens for this user (simple)
    try {
      const decoded = verifyRefreshToken(token);
      await db.query(
        `UPDATE refresh_tokens SET revoked=1 WHERE user_id=?`,
        [decoded.sub]
      );
    } catch {
      // ignore
    }
  }

  res.clearCookie("refreshToken");
  return res.json({ message: "Logged out" });
}
