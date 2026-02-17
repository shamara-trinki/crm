import { db } from "../db.js";

// Create a new role
export async function createRole(req, res) {
  const { name } = req.body;

  if (!name) return res.status(400).json({ message: "Role name is required" });

  const [existing] = await db.query(`SELECT id FROM roles WHERE name=?`, [name]);
  if (existing.length > 0)
    return res.status(400).json({ message: "Role already exists" });

  await db.query(`INSERT INTO roles (name) VALUES (?)`, [name]);
  return res.status(201).json({ message: "Role created" });
}

// Assign permissions to a role
// E:\SVG\crm\backend\src\controllers\roles.controller.js

export async function assignPermissions(req, res) {
  const { roleId } = req.params;
  const { permissions } = req.body; // array of permission IDs

  console.log('=== Assign Permissions Debug ===');
  console.log('roleId:', roleId);
  console.log('permissions:', permissions);
  console.log('type of permissions:', typeof permissions);
  console.log('is array:', Array.isArray(permissions));

  try {
    // Validate input
    if (!permissions || !Array.isArray(permissions)) {
      console.log('Validation failed: permissions is not an array');
      return res.status(400).json({ message: "Permissions array is required" });
    }

    // Check if role exists
    console.log('Checking if role exists...');
    const [roleCheck] = await db.query(`SELECT id FROM roles WHERE id=?`, [roleId]);
    console.log('Role check result:', roleCheck);
    
    if (roleCheck.length === 0) {
      console.log('Role not found');
      return res.status(404).json({ message: "Role not found" });
    }

    // Start a transaction for better data integrity
    console.log('Starting transaction...');
    await db.query('START TRANSACTION');

    // Remove old permissions
    console.log('Deleting old permissions...');
    const deleteResult = await db.query(`DELETE FROM role_permissions WHERE role_id=?`, [roleId]);
    console.log('Delete result:', deleteResult);

    // Insert new permissions
    if (permissions.length > 0) {
      console.log('Inserting new permissions...');
      
      // Verify permissions exist
      if (permissions.length > 0) {
        const [existingPerms] = await db.query(
          `SELECT id FROM permissions WHERE id IN (?)`,
          [permissions]
        );
        console.log('Existing permissions found:', existingPerms);
        
        if (existingPerms.length !== permissions.length) {
          const missingPerms = permissions.filter(
            p => !existingPerms.some(ep => ep.id === p)
          );
          console.log('Missing permissions:', missingPerms);
          await db.query('ROLLBACK');
          return res.status(400).json({ 
            message: "Some permissions do not exist",
            missingPermissions: missingPerms
          });
        }
      }

      // Insert one by one with error checking
      for (const permId of permissions) {
        console.log(`Inserting permission ${permId} for role ${roleId}`);
        const insertResult = await db.query(
          `INSERT INTO role_permissions (role_id, permission_id) VALUES (?, ?)`,
          [roleId, permId]
        );
        console.log(`Insert result for perm ${permId}:`, insertResult);
      }
    }

    // Commit transaction
    console.log('Committing transaction...');
    await db.query('COMMIT');
    
    console.log('Permissions assigned successfully');
    return res.status(200).json({ message: "Permissions assigned successfully" });

  } catch (error) {
    // Rollback on error
    console.log('Error occurred, rolling back...');
    await db.query('ROLLBACK');
    
    console.error('=== Error in assignPermissions ===');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error code:', error.code);
    console.error('Error sql:', error.sql);
    console.error('Error sqlMessage:', error.sqlMessage);
    console.error('Full error:', error);
    
    return res.status(500).json({ 
      message: "Failed to assign permissions",
      error: error.message,
      sqlError: error.sqlMessage 
    });
  }
}

// List all roles with permissions
export async function listRoles(req, res) {
  const [roles] = await db.query(`SELECT * FROM roles ORDER BY id DESC`);
  const result = [];

  for (const role of roles) {
    const [perms] = await db.query(
      `SELECT p.id, p.code FROM permissions p
       JOIN role_permissions rp ON rp.permission_id=p.id
       WHERE rp.role_id=?`,
      [role.id]
    );
    result.push({ ...role, permissions: perms });
  }

  return res.json(result);
}

export async function getRoleById(req, res) {
  const { id } = req.params;

  // get role info
  const [[role]] = await db.query(
    `SELECT id, name, created_at FROM roles WHERE id=?`,
    [id]
  );

  if (!role) {
    return res.status(404).json({ message: "Role not found" });
  }

  // get permissions for this role
  const [permissions] = await db.query(
    `SELECT p.id, p.code, p.description
     FROM role_permissions rp
     JOIN permissions p ON p.id = rp.permission_id
     WHERE rp.role_id=?`,
    [id]
  );

  role.permissions = permissions;

  return res.json(role);
}
