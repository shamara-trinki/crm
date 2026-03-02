import { db } from "../db.js"; // your database connection


// Helper to check if user has permission
const hasPermission = (userPermissions, permissionCode) => {
  return userPermissions?.includes(permissionCode) || false;
};

// GET all customers with field-level filtering based on permissions
export const getCustomers = async (req, res) => {
  try {
    let page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 20;
    let offset = (page - 1) * limit;

    const { search } = req.query;
    
    let query = "SELECT * FROM tblclients";
    let params = [];

    if (search) {
      query += ` WHERE company LIKE ? OR phonenumber LIKE ? OR city LIKE ? OR address LIKE ? OR status LIKE ? OR type LIKE ?`;
      const searchPattern = `%${search}%`;
      params.push(searchPattern, searchPattern, searchPattern, searchPattern, searchPattern, searchPattern);
    }

    query += " ORDER BY userid DESC LIMIT ? OFFSET ?";
    params.push(limit, offset);

    const [rows] = await db.query(query, params);

    // Get user permissions from database
    const [permissions] = await db.query(
      `SELECT p.code 
       FROM role_permissions rp
       JOIN permissions p ON p.id = rp.permission_id
       WHERE rp.role_id = ?`,
      [req.user.roleId]
    );
    
    const userPermissions = permissions.map(p => p.code);

    // Filter each row based on field view permissions
    const filteredRows = rows.map(row => {
      const filteredRow = {};
      
      // Always include ID
      filteredRow.userid = row.userid;
      
      // Check each field's view permission
      if (hasPermission(userPermissions, 'CUSTOMER_COMPANY_VIEW')) {
        filteredRow.company = row.company;
      }
      if (hasPermission(userPermissions, 'CUSTOMER_PHONENUMBER_VIEW')) {
        filteredRow.phonenumber = row.phonenumber;
      }
      if (hasPermission(userPermissions, 'CUSTOMER_CITY_VIEW')) {
        filteredRow.city = row.city;
      }
      if (hasPermission(userPermissions, 'CUSTOMER_ADDRESS_VIEW')) {
        filteredRow.address = row.address;
      }
      if (hasPermission(userPermissions, 'CUSTOMER_STATUS_VIEW')) {
        filteredRow.status = row.status;
      }
      if (hasPermission(userPermissions, 'CUSTOMER_TYPE_VIEW')) {
        filteredRow.type = row.type;
      }
      if (hasPermission(userPermissions, 'CUSTOMER_ACTIVE_VIEW')) {
        filteredRow.active = row.active;
      }
      if (hasPermission(userPermissions, 'CUSTOMER_NOTE_VIEW')) {
        filteredRow.note = row.note;
      }
      if (hasPermission(userPermissions, 'CUSTOMER_DATECREATED_VIEW')) {
        filteredRow.datecreated = row.datecreated;
      }
      
      return filteredRow;
    });

    let countQuery = "SELECT COUNT(*) as total FROM tblclients";
    if (search) countQuery += ` WHERE company LIKE ? OR phonenumber LIKE ? OR city LIKE ? OR address LIKE ? OR status LIKE ? OR type LIKE ?`;
    const [countRows] = await db.query(countQuery, search ? params.slice(0, 6) : []);
    const total = countRows[0].total;
    const totalPages = Math.ceil(total / limit);

    // Also send back which fields are updatable
    const updateableFields = [];
    if (hasPermission(userPermissions, 'CUSTOMER_COMPANY_UPDATE')) updateableFields.push('company');
    if (hasPermission(userPermissions, 'CUSTOMER_PHONENUMBER_UPDATE')) updateableFields.push('phonenumber');
    if (hasPermission(userPermissions, 'CUSTOMER_CITY_UPDATE')) updateableFields.push('city');
    if (hasPermission(userPermissions, 'CUSTOMER_ADDRESS_UPDATE')) updateableFields.push('address');
    if (hasPermission(userPermissions, 'CUSTOMER_STATUS_UPDATE')) updateableFields.push('status');
    if (hasPermission(userPermissions, 'CUSTOMER_TYPE_UPDATE')) updateableFields.push('type');
    if (hasPermission(userPermissions, 'CUSTOMER_ACTIVE_UPDATE')) updateableFields.push('active');
    if (hasPermission(userPermissions, 'CUSTOMER_NOTE_UPDATE')) updateableFields.push('note');

    res.json({ 
      data: filteredRows, 
      total, 
      page, 
      limit, 
      totalPages,
      permissions: {
        canCreate: hasPermission(userPermissions, 'CUSTOMER_CREATE'),
        canDelete: hasPermission(userPermissions, 'CUSTOMER_DELETE'),
        updateableFields
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch customers" });
  }
};

// UPDATE customer with field-level permission checking
export const updateCustomer = async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  try {
    // Get user permissions
    const [permissions] = await db.query(
      `SELECT p.code 
       FROM role_permissions rp
       JOIN permissions p ON p.id = rp.permission_id
       WHERE rp.role_id = ?`,
      [req.user.roleId]
    );
    
    const userPermissions = permissions.map(p => p.code);

    // Check which fields the user can update
    const updateableFields = [];
    const fieldPermissionMap = {
      company: 'CUSTOMER_COMPANY_UPDATE',
      phonenumber: 'CUSTOMER_PHONENUMBER_UPDATE',
      city: 'CUSTOMER_CITY_UPDATE',
      address: 'CUSTOMER_ADDRESS_UPDATE',
      status: 'CUSTOMER_STATUS_UPDATE',
      type: 'CUSTOMER_TYPE_UPDATE',
      active: 'CUSTOMER_ACTIVE_UPDATE',
      note: 'CUSTOMER_NOTE_UPDATE'
    };

    const fieldsToUpdate = [];
    const values = [];

    for (const [field, value] of Object.entries(updateData)) {
      const permissionCode = fieldPermissionMap[field];
      if (permissionCode && hasPermission(userPermissions, permissionCode)) {
        fieldsToUpdate.push(`${field} = ?`);
        values.push(value);
        updateableFields.push(field);
      }
    }

    if (fieldsToUpdate.length === 0) {
      return res.status(403).json({ message: "No fields to update or insufficient permissions" });
    }

    values.push(id);
    const query = `UPDATE tblclients SET ${fieldsToUpdate.join(', ')} WHERE userid = ?`;
    
    await db.query(query, values);
    
    res.json({ 
      message: "Customer updated successfully",
      updatedFields: updateableFields
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update customer" });
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
