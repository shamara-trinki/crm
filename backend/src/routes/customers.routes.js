import express from "express";
import { authenticate } from "../middleware/authenticate.js";
import { authorize } from "../middleware/authorize.js";

import {
  getCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  deleteAllCustomers,
  getAllCustomersForExport,
} from "../controllers/customers.controller.js";

const router = express.Router();

// VIEW ALL CUSTOMERS - REMOVE authorize middleware
router.get(
  "/",
  authenticate,  // Keep authentication
  // authorize("CUSTOMER_VIEW"),  // REMOVE THIS LINE
  getCustomers
);

// EXPORT CUSTOMERS (must come BEFORE "/:id")
router.get(
  "/export/all",
  authenticate,
  authorize("CUSTOMER_VIEW"),  // You might want to keep this or remove based on your needs
  getAllCustomersForExport
);

// VIEW SINGLE CUSTOMER
router.get(
  "/:id",
  authenticate,
  // authorize("CUSTOMER_VIEW"),  // Remove if not needed
  getCustomerById
);

// CREATE CUSTOMER
router.post(
  "/",
  authenticate,
  authorize("CUSTOMER_CREATE"),
  createCustomer
);

// UPDATE CUSTOMER
router.put(
  "/:id",
  authenticate,
  // authorize("CUSTOMER_UPDATE"),
  updateCustomer
);

// DELETE ONE CUSTOMER
router.delete(
  "/:id",
  authenticate,
  authorize("CUSTOMER_DELETE"),
  deleteCustomer
);

// DELETE ALL CUSTOMERS
router.delete(
  "/",
  authenticate,
  authorize("CUSTOMER_DELETE"),
  deleteAllCustomers
);

export default router;