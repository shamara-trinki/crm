import { db } from "../db.js"; // your mysql connection

// 🔹 GET ALL JOBS
export const getJobs = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT j.*, s.staff_name
      FROM jobs j
      LEFT JOIN staff s ON j.staff_id = s.id
      ORDER BY j.created_at DESC
    `);

    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// 🔹 GET SINGLE JOB
export const getJobById = async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT * FROM jobs WHERE id = ?",
      [req.params.id]
    );

    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// 🔹 CREATE JOB
export const createJob = async (req, res) => {
  const { customer_id, jobno, req_date, schedule_date, staff_id, reason } = req.body;

  try {
    const [result] = await db.query(
      `INSERT INTO jobschedule 
      (customer_id, jobno, req_date, schedule_date, staff_id, reason, status, created_at)
      VALUES (?, ?, ?, ?, ?, ?, 'OPEN', NOW())`,
      [customer_id, jobno, req_date, schedule_date, staff_id, reason]
    );

    res.status(201).json({ message: "Job created", id: result.insertId });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// 🔹 UPDATE JOB STATUS
export const updateJobStatus = async (req, res) => {
  const { status } = req.body;

  try {
    await db.query(
      "UPDATE jobs SET status = ? WHERE id = ?",
      [status, req.params.id]
    );

    res.json({ message: "Status updated" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// 🔹 RESCHEDULE JOB
export const rescheduleJob = async (req, res) => {
  const jobId = req.params.id;
  const { new_schedule_date, staff_id, reason } = req.body;

  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const [job] = await connection.query(
      "SELECT schedule_date FROM jobs WHERE id = ?",
      [jobId]
    );

    const oldDate = job[0].schedule_date;

    await connection.query(
      `INSERT INTO job_reschedule
       (job_id, old_schedule_date, new_schedule_date, staff_id, reason)
       VALUES (?, ?, ?, ?, ?)`,
      [jobId, oldDate, new_schedule_date, staff_id, reason]
    );

    await connection.query(
      `UPDATE jobs
       SET schedule_date = ?, staff_id = ?, status = 'RESCHEDULE'
       WHERE id = ?`,
      [new_schedule_date, staff_id, jobId]
    );

    await connection.commit();

    res.json({ message: "Job rescheduled successfully" });

  } catch (error) {
    await connection.rollback();
    res.status(500).json({ message: error.message });
  } finally {
    connection.release();
  }
};


// 🔹 DELETE JOB
export const deleteJob = async (req, res) => {
  try {
    await db.query("DELETE FROM jobs WHERE id = ?", [req.params.id]);
    res.json({ message: "Job deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};