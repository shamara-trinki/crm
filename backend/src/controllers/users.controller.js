import { db } from "../db.js";
import { hashPassword } from "../utils/password.js";

export async function createUser(req, res) {
  const { username, password, roleId } = req.body;

  const passwordHash = await hashPassword(password);

  await db.query(
    `INSERT INTO users (username, password_hash, role_id, is_active, must_change_password)
     VALUES (?, ?, ?, 1, 1)`,
    [username, passwordHash, roleId]
  );

  return res.status(201).json({ message: "User created" });
}

export async function updateUser(req, res) {
  const { userId } = req.params; // user ID to update
  const { username, password } = req.body;

  // Prepare SQL parts dynamically
  const updates = [];
  const params = [];

  if (username) {
    updates.push("username = ?");
    params.push(username);
  }

  if (password) {
    const passwordHash = await hashPassword(password);
    updates.push("password_hash = ?");
    params.push(passwordHash);
  }

  if (updates.length === 0) {
    return res.status(400).json({ message: "No data provided to update" });
  }

  params.push(userId);

  await db.query(
    `UPDATE users SET ${updates.join(", ")} WHERE id = ?`,
    params
  );

  return res.json({ message: "User updated successfully" });
}

export async function listUsers(req, res) {
  const [rows] = await db.query(
    `SELECT u.id, u.username, u.role_id AS roleId, r.name AS role, u.is_active, u.created_at
     FROM users u LEFT JOIN roles r ON r.id=u.role_id
     ORDER BY u.id DESC`
  );
  return res.json(rows);
}

export async function updateUserRole(req, res) {
  const { userId } = req.params;        // ID of the user to update
  const { roleId } = req.body;          // New role ID to assign

  // Update the user's role
  await db.query(
    `UPDATE users SET role_id = ? WHERE id = ?`,
    [roleId, userId]
  );

  return res.json({ message: "User role updated successfully" });
}

export async function deleteUser(req, res) {
  try {
    const userId = req.params.id;

    // optional safety: prevent deleting yourself
    if (Number(userId) === req.user.userId) {
      return res.status(400).json({ message: "You cannot delete your own account" });
    }

    const [result] = await db.query(
      `DELETE FROM users WHERE id = ?`,
      [userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json({ message: "User deleted successfully" });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to delete user" });
  }
}

