import { Router } from "express";
import { authenticate } from "../middleware/authenticate.js";
import { authorize } from "../middleware/authorize.js";
import { listPermissions } from "../controllers/permissions.controller.js";

const router = Router();

// Only authorized users can view permissions
router.get("/", authenticate, authorize("ROLE_VIEW"), listPermissions);

export default router;
