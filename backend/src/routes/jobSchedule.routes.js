import express from "express";
import { authenticate } from "../middleware/authenticate.js";
import { authorize } from "../middleware/authorize.js";

import {
  getJobs,
  getJobById,
  createJob,
  updateJobStatus,
  rescheduleJob,
  deleteJob,
} from "../controllers/jobSchedule.controller.js";

const router = express.Router();

// VIEW ALL JOBS
router.get(
  "/",
  authenticate,
  authorize("JOB_VIEW"),
  getJobs
);

// VIEW SINGLE JOB
router.get(
  "/:id",
  authenticate,
  authorize("JOB_VIEW"),
  getJobById
);

// CREATE JOB
router.post(
  "/",
  authenticate,
  authorize("JOB_CREATE"),
  createJob
);

// UPDATE STATUS (Done / Cancelled)
router.put(
  "/:id/status",
  authenticate,
  authorize("JOB_UPDATE"),
  updateJobStatus
);

// RESCHEDULE JOB
router.post(
  "/:id/reschedule",
  authenticate,
  authorize("JOB_UPDATE"),
  rescheduleJob
);

// DELETE JOB
router.delete(
  "/:id",
  authenticate,
  authorize("JOB_DELETE"),
  deleteJob
);

export default router;