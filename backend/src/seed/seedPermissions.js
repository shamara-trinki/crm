import { db } from "../db.js";

// Add your CRM permissions here
const PERMISSIONS = [
  { code: "USER_CREATE", description: "Create users" },
  { code: "USER_VIEW", description: "View users" },
  { code: "USER_CREDENTIAL_UPDATE", description: "Update user credentials" },
  { code: "USER_ROLE_UPDATE", description: "Update user roles" },
  { code: "USER_DELETE", description: "Delete users" },
  { code: "ROLE_VIEW", description: "View roles" },
  { code: "ROLE_CREATE", description: "Create roles" },
  { code: "ROLE_PERMISSION_UPDATE", description: "Update role permissions" },
  { code: "CUSTOMER_VIEW", description: "View customers" },
  { code: "CUSTOMER_CREATE", description: "Create customers" },

];

export async function seedPermissions() {
  for (const p of PERMISSIONS) {
    await db.query(
      `INSERT INTO permissions (code, description)
       VALUES (?, ?)
       ON DUPLICATE KEY UPDATE description = VALUES(description)`,
      [p.code, p.description]
    );
  }
}
