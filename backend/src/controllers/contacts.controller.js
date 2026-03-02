import { db } from "../db.js";

// GET all contacts of a company
export const getAllContactsForCompany = async (req, res) => {
  try {
    const { userid } = req.params; // company userid
    let page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 20;
    let offset = (page - 1) * limit;

    const { search } = req.query;
    
    // Base query
    let query = "SELECT * FROM tblcontacts WHERE userid = ?";
    let countQuery = "SELECT COUNT(*) as total FROM tblcontacts WHERE userid = ?";
    
    // Arrays for parameters
    let queryParams = [userid];
    let countParams = [userid];

    // Add search conditions if search term exists
    if (search) {
      const searchCondition = ` AND (firstname LIKE ? OR lastname LIKE ? OR email LIKE ? OR phonenumber LIKE ? OR title LIKE ?)`;
      query += searchCondition;
      countQuery += searchCondition;
      
      const searchPattern = `%${search}%`;
      // Add 5 search parameters for each query
      const searchParams = Array(5).fill(searchPattern);
      queryParams.push(...searchParams);
      countParams.push(...searchParams);
    }

    // Add pagination to main query
    query += " ORDER BY id DESC LIMIT ? OFFSET ?";
    queryParams.push(limit, offset);

    // Execute main query
    const [rows] = await db.query(query, queryParams);

    // Execute count query
    const [countRows] = await db.query(countQuery, countParams);
    const total = countRows[0].total;
    const totalPages = Math.ceil(total / limit);

    res.json({ 
      data: rows, 
      total, 
      page, 
      limit, 
      totalPages 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch contacts" });
  }
};

// GET single contact
export const getContactById = async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await db.query("SELECT * FROM tblcontacts WHERE id = ?", [id]);
    if (rows.length === 0) return res.status(404).json({ message: "Contact not found" });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch contact" });
  }
};

// CREATE contact
export const createContact = async (req, res) => {
  const { userid, is_primary, firstname, lastname, email, phonenumber, title } = req.body;
  try {
    const [result] = await db.query(
      `INSERT INTO tblcontacts
       (userid, is_primary, firstname, lastname, email, phonenumber, title, datecreated, active)
       VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), 1)`,
      [userid, is_primary ?? 1, firstname, lastname, email, phonenumber, title]
    );
    res.json({ id: result.insertId, message: "Contact created successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to create contact" });
  }
};

// UPDATE contact
export const updateContact = async (req, res) => {
  const { id } = req.params;
  const { userid, is_primary, firstname, lastname, email, phonenumber, title, active } = req.body;
  try {
    await db.query(
      `UPDATE tblcontacts SET userid=?, is_primary=?, firstname=?, lastname=?, email=?, phonenumber=?, title=?, active=? WHERE id=?`,
      [userid, is_primary ?? 1, firstname, lastname, email, phonenumber, title, active ?? 1, id]
    );
    res.json({ message: "Contact updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update contact" });
  }
};

// DELETE contact
export const deleteContact = async (req, res) => {
  const { id } = req.params;
  try {
    await db.query("DELETE FROM tblcontacts WHERE id = ?", [id]);
    res.json({ message: "Contact deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete contact" });
  }
};

// DELETE all contacts of a company
export const deleteAllContactsOfCompany = async (req, res) => {
  const { userid } = req.params;
  try {
    await db.query("DELETE FROM tblcontacts WHERE userid = ?", [userid]);
    res.json({ message: "All contacts of company deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete contacts" });
  }
};