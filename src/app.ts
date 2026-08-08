import cors from "cors";
import express from "express";
import helmet from "helmet";
import { healthRoutes } from "./api/routes/health.routes";

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(healthRoutes);

export { app };