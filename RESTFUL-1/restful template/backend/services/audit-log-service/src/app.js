import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import morgan from "morgan";

import routes from "./routes/index.routes.js";
import { errorHandler } from "./middleware/error.middleware.js";

dotenv.config();

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

const PORT = process.env.PORT || 4001;

app.listen(PORT, () => {
  console.log(`Service running on port ${PORT}`);
});