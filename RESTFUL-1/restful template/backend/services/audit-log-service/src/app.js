import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import morgan from "morgan";
import { fileURLToPath } from "node:url";

import routes from "./routes/index.routes.js";
import { ensureAuditLogTable } from "./config/db.js";
import { errorHandler } from "./middleware/error.middleware.js";

dotenv.config({
  path: fileURLToPath(new URL("../.env", import.meta.url)),
  override: true,
});

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.get("/", (req, res) => {
  res.json({
    message: "Service is running successfully",
  });
});

app.use("/api", routes);

app.use(errorHandler);

const PORT = process.env.PORT || 4007;

ensureAuditLogTable()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Service running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Failed to initialize audit log service:", error);
    process.exit(1);
  });
