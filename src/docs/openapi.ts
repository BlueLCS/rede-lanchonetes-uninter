import { openApiPathsPartOne } from "./openapi-paths-1";

const errorExample = {
  timestamp: "2026-08-10T12:00:00.000Z",
  status: 422,
  code: "DADOS_INVALIDOS",
  message: "Os dados enviados são inválidos.",
  path: "/pedidos",
  details: [],
  requestId: "39e3693e-ae9d-4cc6-a106-3311155df14f"
};

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
      name: "Sistema"
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
            type: "integer"
          },
          code: {
            type: "string"
          },
          message: {
            type: "string"
          },
          path: {
            type: "string"
          },
          details: {
            type: "array",
            items: {
              type: "object"
            }
          },
          requestId: {
            type: "string"
          }
        }
      }
    },

    responses: {
      ValidationError: {
        description: "Dados inválidos.",
        content: {
          "application/json": {
            schema: {
              $ref: "#/components/schemas/StandardError"
            },
            example: errorExample
          }
        }
      },

      UnauthorizedError: {
        description: "Token ausente, inválido ou expirado.",
        content: {
          "application/json": {
            schema: {
              $ref: "#/components/schemas/StandardError"
            },
            example: {
              ...errorExample,
              status: 401,
              code: "TOKEN_INVALIDO",
              message:
                "O token informado é inválido ou expirou."
            }
          }
        }
      },

      ForbiddenError: {
        description: "Perfil sem permissão.",
        content: {
          "application/json": {
            schema: {
              $ref: "#/components/schemas/StandardError"
            },
            example: {
              ...errorExample,
              status: 403,
              code: "PERFIL_SEM_PERMISSAO",
              message:
                "O usuário não possui permissão para esta ação."
            }
          }
        }
      },

      NotFoundError: {
        description: "Recurso não encontrado.",
        content: {
          "application/json": {
            schema: {
              $ref: "#/components/schemas/StandardError"
            },
            example: {
              ...errorExample,
              status: 404,
              code: "RECURSO_NAO_ENCONTRADO",
              message:
                "O recurso informado não foi encontrado."
            }
          }
        }
      },

      ConflictError: {
        description: "Conflito com uma regra de negócio.",
        content: {
          "application/json": {
            schema: {
              $ref: "#/components/schemas/StandardError"
            },
            example: {
              ...errorExample,
              status: 409,
              code: "CONFLITO_REGRA_NEGOCIO",
              message:
                "A operação não pode ser concluída."
            }
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
            description: "API disponível.",
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
    },

    ...openApiPathsPartOne
  }
};

export { openApiDocument };