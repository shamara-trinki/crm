import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import permissionsRoutes from "./routes/permissions.routes.js";
import authRoutes from "./routes/auth.routes.js";
import rolesRoutes from "./routes/roles.routes.js";
import usersRoutes from "./routes/users.routes.js";
import { bootstrapSuperAdmin } from "./seed/bootstrapSuperAdmin.js";

dotenv.config();

const app = express();

app.use(express.json());
app.use(cookieParser());

const allowedOrigins = ["http://localhost:3000", "http://localhost:8080"];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
}));


// Limit brute force login
app.use("/auth/login", rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 30,
}));

app.use("/auth", authRoutes);
app.use("/users", usersRoutes);
app.use("/roles", rolesRoutes);
app.use("/permissions", permissionsRoutes);

app.get("/health", (req, res) => res.json({ ok: true }));

// Bootstrap seed
await bootstrapSuperAdmin();

app.listen(process.env.PORT || 5000, () => {
  console.log(`Server running on port ${process.env.PORT || 5000}`);
});
