import { db } from "../db.js"; // your database connection

// GET all customers
export const getCustomers = async (req, res) => {
  try {
    let page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 20;
    let offset = (page - 1) * limit;

    // Multi-field search
    const { search } = req.query; // search can be string (we'll search in multiple fields)
    
    let query = "SELECT * FROM tblclients";
    let params = [];

    if (search) {
      query += ` WHERE company LIKE ? OR phonenumber LIKE ? OR city LIKE ? OR address LIKE ? OR status LIKE ? OR type LIKE ?`;
      const searchPattern = `%${search}%`;
      params.push(searchPattern, searchPattern, searchPattern, searchPattern, searchPattern, searchPattern);
    }

    query += " LIMIT ? OFFSET ?";
    params.push(limit, offset);

    const [rows] = await db.query(query, params);

    let countQuery = "SELECT COUNT(*) as total FROM tblclients";
    if (search) countQuery += ` WHERE company LIKE ? OR phonenumber LIKE ? OR city LIKE ? OR address LIKE ? OR status LIKE ? OR type LIKE ?`;
    const [countRows] = await db.query(countQuery, search ? params.slice(0, 6) : []);
    const total = countRows[0].total;
    const totalPages = Math.ceil(total / limit);

    res.json({ data: rows, total, page, limit, totalPages });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch customers" });
  }
};



// GET single customer
export const getCustomerById = async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await db.query("SELECT * FROM tblclients WHERE userid = ?", [id]);
    if (rows.length === 0) return res.status(404).json({ message: "Customer not found" });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch customer" });
  }
};

// CREATE customer
export const createCustomer = async (req, res) => {
  const { company, phonenumber, city, address, active, note, status, type } = req.body;
  try {
    const result = await db.query(
      `INSERT INTO tblclients 
      (company, phonenumber, city, address, datecreated, active, note, status, type) 
      VALUES (?, ?, ?, ?, NOW(), ?, ?, ?, ?)`,
      [company, phonenumber, city, address, active ?? 1, note, status ?? "active", type]
    );
    res.json({ id: result[0].insertId, message: "Customer created successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to create customer" });
  }
};

// UPDATE customer
export const updateCustomer = async (req, res) => {
  const { id } = req.params;
  const { company, phonenumber, city, address, active, note, status, type } = req.body;
  try {
    await db.query(
      `UPDATE tblclients SET company=?, phonenumber=?, city=?, address=?, active=?, note=?, status=?, type=? WHERE userid=?`,
      [company, phonenumber, city, address, active ?? 1, note, status ?? "active", type, id]
    );
    res.json({ message: "Customer updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update customer" });
  }
};

// DELETE customer
export const deleteCustomer = async (req, res) => {
  const { id } = req.params;
  try {
    await db.query("DELETE FROM tblclients WHERE userid = ?", [id]);
    res.json({ message: "Customer deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete customer" });
  }
};

export const deleteAllCustomers = async (req, res) => {
  try {
    await db.query("DELETE FROM tblclients");
    res.json({ message: "All customers deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete customers" });
  }
};

// GET all customers without pagination (for export)
export const getAllCustomersForExport = async (req, res) => {
  try {
    const { search } = req.query;
    
    let query = "SELECT userid, company, phonenumber, city, address, datecreated, active, note, status, type FROM tblclients";
    let params = [];

    if (search) {
      query += ` WHERE company LIKE ? OR phonenumber LIKE ? OR city LIKE ? OR address LIKE ? OR status LIKE ? OR type LIKE ?`;
      const searchPattern = `%${search}%`;
      params.push(searchPattern, searchPattern, searchPattern, searchPattern, searchPattern, searchPattern);
    }

    query += " ORDER BY userid DESC";
    
    const [rows] = await db.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch customers for export" });
  }
};
