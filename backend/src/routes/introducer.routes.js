import express from "express";
import {
  listIntroducers,
  getIntroducerById,
  createIntroducer,
  updateIntroducer,
  deleteIntroducer,
  bulkDeleteIntroducers,
} from "../controllers/Introducer.controller.js";
import { authenticate } from "../middleware/authenticate.js";
import { authorize } from "../middleware/authorize.js";

const router = express.Router();

// All routes require authentication
router.use(authenticate);

router.get("/", authorize("INTRODUCER_VIEW"), 
listIntroducers);
router.get("/:id", authorize("INTRODUCER_VIEW"), getIntroducerById);
router.post("/", authorize("INTRODUCER_CREATE"), createIntroducer);
router.put("/:id", authorize("INTRODUCER_UPDATE"), updateIntroducer);
router.delete("/bulk", authorize("INTRODUCER_DELETE"), bulkDeleteIntroducers);
router.delete("/:id", authorize("INTRODUCER_DELETE"), deleteIntroducer);

export default router;