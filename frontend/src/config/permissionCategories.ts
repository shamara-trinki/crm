export const PERMISSION_CATEGORIES = [
  {
    name: "Users",
    key: "users",
    permissions: [
      { code: "USER_CREATE", description: "Create users" },
      { code: "USER_VIEW", description: "View users" },
      { code: "USER_CREDENTIAL_UPDATE", description: "Update user credentials" },
      { code: "USER_ROLE_UPDATE", description: "Update user roles" },
      { code: "USER_DELETE", description: "Delete users" },
    ],
  },
  {
    name: "Roles",
    key: "roles",
    permissions: [
      { code: "ROLE_VIEW", description: "View roles" },
      { code: "ROLE_CREATE", description: "Create roles" },
      { code: "ROLE_DELETE", description: "Delete roles" },
      { code: "ROLE_PERMISSION_UPDATE", description: "Update role permissions" },
    ],
  },
  {
    name: "Customers",
    key: "customers",
    children: [
      {
        name: "Customer Operations",
        key: "customer_operations",
        permissions: [
          { code: "CUSTOMER_CREATE", description: "Create customers" },
          { code: "CUSTOMER_DELETE", description: "Delete customers" },
        ],
      },
      {
        name: "Customer Fields",
        key: "customer_fields",
        children: [
          {
            name: "Company Name",
            key: "customer_name",
            permissions: [
              { code: "CUSTOMER_NAME_VIEW", description: "View company name" },
              { code: "CUSTOMER_NAME_UPDATE", description: "Update company name" },
            ],
          },
          {
            name: "Phone Number",
            key: "customer_phone",
            permissions: [
              { code: "CUSTOMER_PHONENUMBER_VIEW", description: "View phone number" },
              { code: "CUSTOMER_PHONENUMBER_UPDATE", description: "Update phone number" },
            ],
          },
          {
            name: "City",
            key: "customer_city",
            permissions: [
              { code: "CUSTOMER_CITY_VIEW", description: "View city" },
              { code: "CUSTOMER_CITY_UPDATE", description: "Update city" },
            ],
          },
          {
            name: "Address",
            key: "customer_address",
            permissions: [
              { code: "CUSTOMER_ADDRESS_VIEW", description: "View address" },
              { code: "CUSTOMER_ADDRESS_UPDATE", description: "Update address" },
            ],
          },
          {
            name: "Customer Type",
            key: "customer_type",
            permissions: [
              { code: "CUSTOMER_TYPE_VIEW", description: "View customer type" },
              { code: "CUSTOMER_TYPE_UPDATE", description: "Update customer type" },
            ],
          },
          {
            name: "Status",
            key: "customer_status",
            permissions: [
              { code: "CUSTOMER_STATUS_VIEW", description: "View status" },
              { code: "CUSTOMER_STATUS_UPDATE", description: "Update status" },
            ],
          },
          {
            name: "Notes",
            key: "customer_notes",
            permissions: [
              { code: "CUSTOMER_NOTES_VIEW", description: "View notes" },
              { code: "CUSTOMER_NOTES_UPDATE", description: "Update notes" },
            ],
          },
          {
            name: "Active Status",
            key: "customer_active",
            permissions: [
              { code: "CUSTOMER_ACTIVE_VIEW", description: "View active status" },
              { code: "CUSTOMER_ACTIVE_UPDATE", description: "Update active status" },
            ],
          },
          {
            name: "Created Date",
            key: "customer_created",
            permissions: [
              { code: "CUSTOMER_CREATED_DATE_VIEW", description: "View created date" },
            ],
          },
        ],
      },
    ],
  },
  // Add more categories as needed
];

// Flatten all permissions for easy lookup
export const FLAT_PERMISSIONS = (() => {
  const flatten = (categories) => {
    let result = [];
    categories.forEach(cat => {
      if (cat.permissions) {
        result = [...result, ...cat.permissions];
      }
      if (cat.children) {
        result = [...result, ...flatten(cat.children)];
      }
    });
    return result;
  };
  return flatten(PERMISSION_CATEGORIES);
})();

// Helper to get permission by code
export const getPermissionByCode = (code) => {
  return FLAT_PERMISSIONS.find(p => p.code === code);
};