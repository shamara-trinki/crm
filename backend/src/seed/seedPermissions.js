// E:\SVG\crm\backend\src\seed\seedPermissions.js
import { db } from "../db.js";

// Add your CRM permissions here
const PERMISSIONS = [

  
  // User Management
  { code: "USER_CREATE", description: "Create users" },
  { code: "USER_VIEW", description: "View users" },
  { code: "USER_CREDENTIAL_UPDATE", description: "Update user credentials" },
  { code: "USER_ROLE_UPDATE", description: "Update user roles" },
  { code: "USER_DELETE", description: "Delete users" },
  
  // Role Management
  { code: "ROLE_VIEW", description: "View roles" },
  { code: "ROLE_CREATE", description: "Create roles" },
  { code: "ROLE_DELETE", description: "Delete roles" },
  { code: "ROLE_PERMISSION_UPDATE", description: "Update role permissions" },
  
  // Customer Module - General Actions
  { code: "CUSTOMER_CREATE", description: "Create customers" },
  { code: "CUSTOMER_DELETE", description: "Delete customers" },
  // Customer Module - Field Level Permissions
  { code: "CUSTOMER_COMPANY_VIEW", description: "View customer company name" },
  { code: "CUSTOMER_COMPANY_UPDATE", description: "Update customer company name" },
  { code: "CUSTOMER_PHONENUMBER_VIEW", description: "View customer phone number" },
  { code: "CUSTOMER_PHONENUMBER_UPDATE", description: "Update customer phone number" },
  { code: "CUSTOMER_CITY_VIEW", description: "View customer city" },
  { code: "CUSTOMER_CITY_UPDATE", description: "Update customer city" },
  { code: "CUSTOMER_ADDRESS_VIEW", description: "View customer address" },
  { code: "CUSTOMER_ADDRESS_UPDATE", description: "Update customer address" },
  { code: "CUSTOMER_STATUS_VIEW", description: "View customer status" },
  { code: "CUSTOMER_STATUS_UPDATE", description: "Update customer status" },
  { code: "CUSTOMER_TYPE_VIEW", description: "View customer type" },
  { code: "CUSTOMER_TYPE_UPDATE", description: "Update customer type" },
  { code: "CUSTOMER_ACTIVE_VIEW", description: "View customer active status" },
  { code: "CUSTOMER_ACTIVE_UPDATE", description: "Update customer active status" },
  { code: "CUSTOMER_NOTE_VIEW", description: "View customer notes" },
  { code: "CUSTOMER_NOTE_UPDATE", description: "Update customer notes" },
  { code: "CUSTOMER_DATECREATED_VIEW", description: "View customer creation date" },

  { code: "INTRODUCER_VIEW", description: "View introducer information" },
  { code: "INTRODUCER_CREATE", description: "Create introducer" },
  { code: "INTRODUCER_UPDATE", description: "Update introducer" },
  { code: "INTRODUCER_DELETE", description: "Delete introducer" },


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