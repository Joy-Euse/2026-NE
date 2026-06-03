import cors from "cors";
import express from "express";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import swaggerUi from "swagger-ui-express";
import { env } from "./config/env.js";
import routes from "./routes/index.routes.js";
import { errorHandler } from "./middleware/error.middleware.js";
import { logging } from "./middleware/logging.middleware.js";
import { notFound } from "./middleware/not-found.middleware.js";
import { requestId } from "./middleware/request-id.middleware.js";

const app = express();
const __dirname = dirname(fileURLToPath(import.meta.url));
const openApiDocument = JSON.parse(readFileSync(join(__dirname, "../openapi.json"), "utf8"));

app.use(cors());
app.use(express.json({ limit: "1mb" }));
app.use(requestId);
app.use(logging);

app.use("/docs", swaggerUi.serve, swaggerUi.setup(openApiDocument));
app.use("/api", routes);

app.use(notFound);
app.use(errorHandler);

app.listen(env.port, () => {
  console.log(`${env.serviceName} running on port ${env.port}`);
});
