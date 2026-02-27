import express from "express";
import { authenticate } from "../middleware/authenticate.js";
import { authorize } from "../middleware/authorize.js";

import {
  getContactById,
  createContact,
  updateContact,
  deleteContact,
  deleteAllContactsOfCompany,
  getAllContactsForCompany,
} from "../controllers/contacts.controller.js";

const router = express.Router();

// GET all contacts of a company (paginated + search)
router.get(
  "/company/:userid",
  authenticate,

  getAllContactsForCompany
);

// GET single contact by ID
router.get(
  "/:id",
  authenticate,

  getContactById
);

// CREATE contact
router.post(
  "/",
  authenticate,

  createContact
);

// UPDATE contact
router.put(
  "/:id",
  authenticate,
 
  updateContact
);

// DELETE single contact
router.delete(
  "/:id",
  authenticate,

  deleteContact
);

// DELETE all contacts of a company
router.delete(
  "/company/:userid",
  authenticate,
  
  deleteAllContactsOfCompany
);

export default router;