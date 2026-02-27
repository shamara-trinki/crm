import express from "express";
import {
  createRole,
  assignPermissions,
  listRoles,
  getRoleById,
  deleteRole
} from "../controllers/roles.controller.js";
import { authenticate } from "../middleware/authenticate.js";
import { authorize } from "../middleware/authorize.js";

const router = express.Router();

// SUPER_ADMIN only routes
router.post(
  "/",
  authenticate,
  authorize("ROLE_CREATE"),
  createRole
);

router.post(
  "/:roleId/permissions",
  authenticate,
  authorize("ROLE_PERMISSION_UPDATE"),
  assignPermissions
);

router.get("/", authenticate, listRoles);

router.get("/:id",
  authenticate,
  authorize("ROLE_VIEW"),
  getRoleById
);

router.delete("/:roleId",
  authenticate,
  authorize("ROLE_DELETE"),
  deleteRole
);

export default router;
