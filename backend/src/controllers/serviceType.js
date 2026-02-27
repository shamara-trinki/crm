import { db } from "../db.js";

// GET all payment methods (no pagination)
export const getAllPaymentMethods= async (req, res) => {
  try {
    const query = `
      SELECT pm.*, 
             u1.username as created_by_name,
             u2.username as updated_by_name
      FROM service_type pm
      LEFT JOIN users u1 ON pm.created_by = u1.id
      LEFT JOIN users u2 ON pm.updated_by = u2.id
      ORDER BY pm.created_at DESC
    `;
    
    const [rows] = await db.query(query);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch payment methods" });
  }
};


// GET single payment method by ID
export const getPaymentMethodById = async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await db.query(`
      SELECT pm.*, 
             u1.username as created_by_name,
             u2.username as updated_by_name
      FROM service_type pm
      LEFT JOIN users u1 ON pm.created_by = u1.id
      LEFT JOIN users u2 ON pm.updated_by = u2.id
      WHERE pm.id = ?
    `, [id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ message: "Payment method not found" });
    }
    
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch payment method" });
  }
};

// CREATE payment method
export const createPaymentMethod = async (req, res) => {
  
  const { name } = req.body;
  const userId = req.user?.userId;  // Get from auth middleware
  
  if (!userId) {
    return res.status(401).json({ message: "User not authenticated" });
  }

  try {
    // Check if payment method with same name already exists
    const [existing] = await db.query(
      "SELECT id FROM service_type WHERE name = ?",
      [name]
    );

    if (existing.length > 0) {
      return res.status(400).json({ message: "Payment method with this name already exists" });
    }

    const [result] = await db.query(
      `INSERT INTO service_type (name, created_by, updated_by, created_at, updated_at)
       VALUES (?, ?, ?, NOW(), NOW())`,
      [name, userId, userId]
    );
    
    res.json({ 
      id: result.insertId, 
      message: "Payment method created successfully" 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to create payment method" });
  }
};

// UPDATE payment method
export const updatePaymentMethod = async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  const userId = req.user?.userId; // Get from auth middleware

  if (!userId) {
    return res.status(401).json({ message: "User not authenticated" });
  }

  try {
    // Check if payment method exists
    const [existing] = await db.query(
      "SELECT id FROM service_type WHERE id = ?",
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json({ message: "Payment method not found" });
    }

    // Check if another payment method with same name exists (excluding current)
    const [duplicate] = await db.query(
      "SELECT id FROM service_type WHERE name = ? AND id != ?",
      [name, id]
    );

    if (duplicate.length > 0) {
      return res.status(400).json({ message: "Payment method with this name already exists" });
    }

    await db.query(
      `UPDATE service_type SET name = ?, updated_by = ?, updated_at = NOW() WHERE id = ?`,
      [name, userId, id]
    );
    
    res.json({ message: "Payment method updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update payment method" });
  }
};

// DELETE payment method
export const deletePaymentMethod = async (req, res) => {
  const { id } = req.params;

  try {
    // Check if payment method exists
    const [existing] = await db.query(
      "SELECT id FROM service_type WHERE id = ?",
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json({ message: "Payment method not found" });
    }

    // Optional: Check if payment method is being used in any transactions
    // You might want to add this check if you have a payments table
    // const [inUse] = await db.query("SELECT id FROM payments WHERE payment_method_id = ?", [id]);
    // if (inUse.length > 0) {
    //   return res.status(400).json({ message: "Cannot delete payment method that is in use" });
    // }

    await db.query("DELETE FROM service_type WHERE id = ?", [id]);
    
    res.json({ message: "Payment method deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete payment method" });
  }
};

// DELETE all payment methods
export const deleteAllPaymentMethods = async (req, res) => {
  try {
    // Optional: Check if any payment methods are in use
    // const [inUse] = await db.query("SELECT id FROM payments WHERE payment_method_id IS NOT NULL LIMIT 1");
    // if (inUse.length > 0) {
    //   return res.status(400).json({ message: "Cannot delete payment methods that are in use" });
    // }

    await db.query("DELETE FROM service_type");
    
    res.json({ message: "All payment methods deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete payment methods" });
  }
};