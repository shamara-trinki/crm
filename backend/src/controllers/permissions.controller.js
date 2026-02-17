import { db } from "../db.js";

// Get all permissions
export async function listPermissions(req, res) {
  try {
    const [rows] = await db.query(
      `SELECT id, code, description FROM permissions ORDER BY id ASC`
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch permissions" });
  }
}

