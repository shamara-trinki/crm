import { db } from "../db.js";
import { hashPassword } from "../utils/password.js";
import { seedPermissions } from "./seedPermissions.js";

export async function bootstrapSuperAdmin() {
  // 1) Ensure permissions exist
  await seedPermissions();

  // 2) Ensure SUPER_ADMIN role exists
  await db.query(
    `INSERT INTO roles (name) VALUES ('SUPER_ADMIN')
     ON DUPLICATE KEY UPDATE name=name`
  );

  const [[role]] = await db.query(`SELECT id FROM roles WHERE name='SUPER_ADMIN' LIMIT 1`);
  const superRoleId = role.id;

  // 3) Give SUPER_ADMIN all permissions
  await db.query(
    `
    INSERT IGNORE INTO role_permissions (role_id, permission_id)
    SELECT ?, p.id FROM permissions p
    `,
    [superRoleId]
  );

  // 4) Create SuperAdmin user if not exists
  const username = process.env.SUPERADMIN_USERNAME;
  const password = process.env.SUPERADMIN_PASSWORD;
  if (!username || !password) throw new Error("Missing SUPERADMIN env values");

  const [existing] = await db.query(
    `SELECT id FROM users WHERE username=? LIMIT 1`,
    [username]
  );
  if (existing.length > 0) return;

  const passwordHash = await hashPassword(password);

  await db.query(
    `INSERT INTO users (username, password_hash, role_id, is_active, must_change_password)
     VALUES (?, ?, ?, 1, 0)`,
    [username, passwordHash, superRoleId]
  );

  console.log("✅ SuperAdmin created (only once).");
}
