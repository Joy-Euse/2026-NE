import morgan from "morgan";

morgan.token("request-id", (req) => req.requestId);

export const logging = morgan(":method :url :status :response-time ms request_id=:request-id");
