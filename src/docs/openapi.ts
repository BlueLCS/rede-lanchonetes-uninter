const openApiDocument = {
  openapi: "3.0.3",

  info: {
    title: "API da Rede de Lanchonetes",
    version: "1.0.0",
    description:
      "API back-end para pedidos, cardápio, estoque, pagamento mock e fidelidade."
  },

  servers: [
    {
      url: "http://localhost:3000",
      description: "Ambiente local"
    }
  ],

  tags: [
    {
      name: "Sistema",
      description: "Verificação da API"
    },
    {
      name: "Autenticação"
    },
    {
      name: "Unidades"
    },
    {
      name: "Produtos e cardápio"
    },
    {
      name: "Estoque"
    },
    {
      name: "Pedidos"
    },
    {
      name: "Pagamento"
    },
    {
      name: "Fidelidade"
    },
    {
      name: "LGPD"
    }
  ],

  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT"
      }
    },

    schemas: {
      StandardError: {
        type: "object",
        properties: {
          timestamp: {
            type: "string",
            format: "date-time"
          },
          status: {
            type: "integer",
            example: 422
          },
          code: {
            type: "string",
            example: "DADOS_INVALIDOS"
          },
          message: {
            type: "string",
            example: "Os dados enviados são inválidos."
          },
          path: {
            type: "string",
            example: "/pedidos"
          },
          details: {
            type: "array",
            items: {
              type: "object"
            }
          },
          requestId: {
            type: "string",
            example: "código da requisição"
          }
        }
      }
    }
  },

  paths: {
    "/health": {
      get: {
        tags: ["Sistema"],
        summary: "Verifica se a API está disponível",

        responses: {
          "200": {
            description: "API disponível",
            content: {
              "application/json": {
                example: {
                  status: "ok"
                }
              }
            }
          }
        }
      }
    }
  }
};

export { openApiDocument };