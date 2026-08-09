import cors from "cors";
import express from "express";
import helmet from "helmet";
import { errorHandler } from "./api/middlewares/error-handler";
import { notFound } from "./api/middlewares/not-found";
import { requestId } from "./api/middlewares/request-id";
import { authRoutes } from "./api/routes/auth.routes";
import { healthRoutes } from "./api/routes/health.routes";
import { unitRoutes } from "./api/routes/unit.routes";
import { menuRoutes } from "./api/routes/menu.routes";
import { productRoutes } from "./api/routes/product.routes";

const app = express();

app.use(helmet());
app.use(cors());
app.use(requestId);
app.use(express.json());

app.use(healthRoutes);
app.use("/auth", authRoutes);
app.use("/unidades", unitRoutes);
app.use("/produtos", productRoutes);
app.use("/unidades", menuRoutes);

app.use(notFound);
app.use(errorHandler);

export { app };