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
import { stockRoutes } from "./api/routes/stock.routes";
import { orderRoutes } from "./api/routes/order.routes";
import { consentRoutes } from "./api/routes/consent.routes";
import { loyaltyRoutes } from "./api/routes/loyalty.routes";
import { audit } from "./api/middlewares/audit";
import swaggerUi from "swagger-ui-express";
import { openApiDocument } from "./docs/openapi";

const app = express();

app.use(helmet());
app.use(cors());
app.use(requestId);
app.use(express.json());
app.use(audit);

app.get("/openapi.json", (_request, response) => {
  response.status(200).json(openApiDocument);
});

app.use(
  "/docs",
  swaggerUi.serve,
  swaggerUi.setup(openApiDocument, {
    customSiteTitle: "Rede de Lanchonetes - API"
  })
);

app.use(healthRoutes);
app.use("/auth", authRoutes);
app.use("/unidades", unitRoutes);
app.use("/produtos", productRoutes);
app.use("/unidades", menuRoutes);
app.use("/estoque", stockRoutes);
app.use("/pedidos", orderRoutes);
app.use("/consentimentos", consentRoutes);
app.use("/fidelidade", loyaltyRoutes);

app.use(notFound);
app.use(errorHandler);

export { app };