import express from "express";
import {
  getCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  deleteAllCustomers,
} from "../controllers/customers.controller.js";

const router = express.Router();

// Routes
router.get("/", getCustomers);
router.get("/:id", getCustomerById);
router.post("/", createCustomer);
router.put("/:id", updateCustomer);
router.delete("/:id", deleteCustomer);
router.delete("/", deleteAllCustomers);

export default router;
