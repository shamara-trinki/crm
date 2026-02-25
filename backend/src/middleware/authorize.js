import { db } from "../db.js";

export function authorize(permissionCode) {
  return async (req, res, next) => {
    try {
      const roleId = req.user?.roleId;
      if (!roleId) return res.status(403).json({ message: "Forbidden" });

      const [rows] = await db.query(
        `
        SELECT p.code
        FROM role_permissions rp
        JOIN permissions p ON p.id = rp.permission_id
        WHERE rp.role_id = ?
          AND p.code = ?
        LIMIT 1
        `,
        [roleId, permissionCode]
      );

      if (rows.length === 0) {
        return res.status(403).json({ message: "No permission" });
      }

      next();
    } catch (err) {
      return res.status(500).json({ message: "Auth check failed" });
    }
  };
}
