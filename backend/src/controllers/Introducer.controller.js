import { db } from "../db.js";

// List all introducers with search and pagination
export async function listIntroducers(req, res) {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const search = req.query.search || "";
    const offset = (page - 1) * limit;

    let whereClause = "";
    const params = [];
    const countParams = [];

    if (search) {
      whereClause = `WHERE 
        i.name LIKE ? OR 
        i.phonenumber LIKE ? OR 
        i.email LIKE ?`;
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
      countParams.push(searchTerm, searchTerm, searchTerm);
    }

    // Get total count
    const [countResult] = await db.query(
      `SELECT COUNT(*) as total FROM client_introducer i ${whereClause}`,
      countParams
    );
    const total = countResult[0].total;
    const totalPages = Math.ceil(total / limit);

    // Get paginated data with created_by and updated_by user names
    params.push(limit, offset);
    const [rows] = await db.query(
      `SELECT 
        i.id,
        i.name,
        i.phonenumber,
        i.email,
        i.created_at,
        i.updated_at,
        i.created_by,
        i.updated_by,
        cu.username AS created_by_name,
        uu.username AS updated_by_name
       FROM client_introducer i
       LEFT JOIN users cu ON cu.id = i.created_by
       LEFT JOIN users uu ON uu.id = i.updated_by
       ${whereClause}
       ORDER BY i.id DESC
       LIMIT ? OFFSET ?`,
      params
    );

    return res.json({
      data: rows,
      total,
      page,
      limit,
      totalPages,
    });
  } catch (error) {
    console.error("Error in listIntroducers:", error);
    return res.status(500).json({ message: "Failed to fetch introducers" });
  }
}

// Get single introducer by ID
export async function getIntroducerById(req, res) {
  try {
    const { id } = req.params;

    const [rows] = await db.query(
      `SELECT 
        i.id,
        i.name,
        i.phonenumber,
        i.email,
        i.created_at,
        i.updated_at,
        i.created_by,
        i.updated_by,
        cu.username AS created_by_name,
        uu.username AS updated_by_name
       FROM client_introducer i
       LEFT JOIN users cu ON cu.id = i.created_by
       LEFT JOIN users uu ON uu.id = i.updated_by
       WHERE i.id = ?`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Introducer not found" });
    }

    return res.json(rows[0]);
  } catch (error) {
    console.error("Error in getIntroducerById:", error);
    return res.status(500).json({ message: "Failed to fetch introducer" });
  }
}

// Create introducer
export async function createIntroducer(req, res) {
  try {
    const { name, phonenumber, email } = req.body;
    const currentUserId = req.user?.userId;

    if (!name?.trim()) {
      return res.status(400).json({ message: "Name is required" });
    }

    const [result] = await db.query(
      `INSERT INTO client_introducer (name, phonenumber, email, created_by, updated_by)
       VALUES (?, ?, ?, ?, ?)`,
      [name.trim(), phonenumber || null, email || null, currentUserId, currentUserId]
    );

    return res.status(201).json({
      id: result.insertId,
      message: "Introducer created successfully",
    });
  } catch (error) {
    console.error("Error in createIntroducer:", error);
    return res.status(500).json({ message: "Failed to create introducer" });
  }
}

// Update introducer
export async function updateIntroducer(req, res) {
  try {
    const { id } = req.params;
    const { name, phonenumber, email } = req.body;
    const currentUserId = req.user?.userId;

    // Check exists
    const [existing] = await db.query(
      `SELECT id FROM client_introducer WHERE id = ?`,
      [id]
    );
    if (existing.length === 0) {
      return res.status(404).json({ message: "Introducer not found" });
    }

    const updates = [];
    const params = [];

    if (name !== undefined) {
      if (!name.trim()) {
        return res.status(400).json({ message: "Name cannot be empty" });
      }
      updates.push("name = ?");
      params.push(name.trim());
    }
    if (phonenumber !== undefined) {
      updates.push("phonenumber = ?");
      params.push(phonenumber || null);
    }
    if (email !== undefined) {
      updates.push("email = ?");
      params.push(email || null);
    }

    if (updates.length === 0) {
      return res.status(400).json({ message: "No data provided to update" });
    }

    updates.push("updated_by = ?");
    params.push(currentUserId);
    params.push(id);

    await db.query(
      `UPDATE client_introducer SET ${updates.join(", ")} WHERE id = ?`,
      params
    );

    return res.json({ message: "Introducer updated successfully" });
  } catch (error) {
    console.error("Error in updateIntroducer:", error);
    return res.status(500).json({ message: "Failed to update introducer" });
  }
}

// Delete single introducer
export async function deleteIntroducer(req, res) {
  try {
    const { id } = req.params;

    // Check exists
    const [existing] = await db.query(
      `SELECT id FROM client_introducer WHERE id = ?`,
      [id]
    );
    if (existing.length === 0) {
      return res.status(404).json({ message: "Introducer not found" });
    }

    // Set introducer_id to NULL in tblclients before deleting
    await db.query(
      `UPDATE tblclients SET introducer_id = NULL WHERE introducer_id = ?`,
      [id]
    );

    await db.query(`DELETE FROM client_introducer WHERE id = ?`, [id]);

    return res.json({ message: "Introducer deleted successfully" });
  } catch (error) {
    console.error("Error in deleteIntroducer:", error);
    return res.status(500).json({ message: "Failed to delete introducer" });
  }
}

// Bulk delete introducers
export async function bulkDeleteIntroducers(req, res) {
  try {
    const { ids } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: "No IDs provided" });
    }

    const placeholders = ids.map(() => "?").join(", ");

    // Set introducer_id to NULL in tblclients for all affected clients
    await db.query(
      `UPDATE tblclients SET introducer_id = NULL WHERE introducer_id IN (${placeholders})`,
      ids
    );

    // Delete all selected introducers
    const [result] = await db.query(
      `DELETE FROM client_introducer WHERE id IN (${placeholders})`,
      ids
    );

    return res.json({
      message: `${result.affectedRows} introducer(s) deleted successfully`,
      deletedCount: result.affectedRows,
    });
  } catch (error) {
    console.error("Error in bulkDeleteIntroducers:", error);
    return res.status(500).json({ message: "Failed to delete introducers" });
  }
}