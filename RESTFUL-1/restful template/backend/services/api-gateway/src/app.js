import cors from "cors";
import express from "express";
import { env } from "./config/env.js";
import routes from "./routes/index.routes.js";
import { validateAccessToken } from "./middleware/auth.middleware.js";
import { errorHandler } from "./middleware/error.middleware.js";
import { logging } from "./middleware/logging.middleware.js";
import { notFound } from "./middleware/not-found.middleware.js";
import { requestId } from "./middleware/request-id.middleware.js";

const app = express();

app.use(cors());
app.use(requestId);
app.use(logging);
app.use(validateAccessToken);
app.use(routes);
app.use(notFound);
app.use(errorHandler);

app.listen(env.port, () => {
  console.log(`${env.serviceName} running on port ${env.port}`);
});
