// E:\SVG\crm\backend\src\routes\paymentMethods.routes.js
import express from "express";
import { authenticate } from "../middleware/authenticate.js";
import { authorize } from "../middleware/authorize.js";

import {
  getAllPaymentMethods,
  getPaymentMethodById,
  createPaymentMethod,
  updatePaymentMethod,
  deletePaymentMethod,
  deleteAllPaymentMethods,
} from "../controllers/serviceType.js";

const router = express.Router();

// GET all payment methods (paginated + search)
router.get("/all", authenticate, getAllPaymentMethods);

// GET single payment method by ID
router.get("/:id", authenticate, getPaymentMethodById);

// CREATE payment method
router.post("/", authenticate, createPaymentMethod);

// UPDATE payment method
router.put("/:id", authenticate, updatePaymentMethod);

// DELETE single payment method
router.delete("/:id", authenticate, deletePaymentMethod);

// DELETE all payment methods
router.delete("/", authenticate, deleteAllPaymentMethods);

export default router;