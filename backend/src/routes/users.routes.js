import { Router } from "express";
import { authenticate } from "../middleware/authenticate.js";
import { authorize } from "../middleware/authorize.js";
import { createUser, listUsers, updateUserRole,updateUser,deleteUser } from "../controllers/users.controller.js";

const router = Router();

router.post("/", authenticate, authorize("USER_CREATE"), createUser);
router.get("/", authenticate, authorize("USER_VIEW"), listUsers);
router.delete("/:id", authenticate, authorize("USER_DELETE"), deleteUser);
router.put("/:userId/role", authenticate, authorize("USER_ROLE_UPDATE"), updateUserRole);
router.put("/:userId", authenticate, authorize("USER_CREDENTIAL_UPDATE"), updateUser); 


export default router;
