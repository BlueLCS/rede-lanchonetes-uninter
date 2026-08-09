import cors from "cors";
import express from "express";
import helmet from "helmet";
import { errorHandler } from "./api/middlewares/error-handler";
import { notFound } from "./api/middlewares/not-found";
import { requestId } from "./api/middlewares/request-id";
import { healthRoutes } from "./api/routes/health.routes";

const app = express();

app.use(helmet());
app.use(cors());
app.use(requestId);
app.use(express.json());

app.use(healthRoutes);

app.use(notFound);
app.use(errorHandler);

export { app };