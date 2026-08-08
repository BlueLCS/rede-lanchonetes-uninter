import { Router } from "express";

const healthRoutes = Router();

healthRoutes.get("/health", (_request, response) => {
  return response.status(200).json({
    status: "ok",
    message: "API da rede de lanchonetes funcionando"
  });
});

export { healthRoutes };