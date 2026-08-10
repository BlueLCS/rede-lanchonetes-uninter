const bearerSecurity = [
  {
    bearerAuth: []
  }
];

function jsonResponse(
  description: string,
  example: unknown
) {
  return {
    description,
    content: {
      "application/json": {
        example
      }
    }
  };
}

function jsonBody(
  required: string[],
  properties: Record<string, unknown>,
  example: Record<string, unknown>
) {
  return {
    required: true,
    content: {
      "application/json": {
        schema: {
          type: "object",
          required,
          properties,
          additionalProperties: false
        },
        example
      }
    }
  };
}

function errorResponse(name: string) {
  return {
    $ref: `#/components/responses/${name}`
  };
}

function uuidParameter(
  name: string,
  description: string
) {
  return {
    name,
    in: "path",
    required: true,
    description,
    schema: {
      type: "string",
      format: "uuid"
    }
  };
}

const orderStatusValues = [
  "AGUARDANDO_PAGAMENTO",
  "PAGAMENTO_APROVADO",
  "EM_PREPARO",
  "PRONTO",
  "ENTREGUE",
  "CANCELADO"
];

const orderItemSchema = {
  type: "object",
  required: ["produtoId", "quantidade"],
  properties: {
    produtoId: {
      type: "string",
      format: "uuid"
    },
    quantidade: {
      type: "integer",
      minimum: 1
    }
  },
  additionalProperties: false
};

const openApiPathsPartTwo = {
  "/pedidos": {
    post: {
      tags: ["Pedidos"],
      summary: "Cria um pedido",
      description:
        "Valida o cardápio, reserva o estoque e solicita o pagamento mock. O canalPedido é obrigatório.",
      security: bearerSecurity,

      requestBody: jsonBody(
        [
          "canalPedido",
          "clienteId",
          "unidadeId",
          "itens",
          "formaPagamento"
        ],
        {
          canalPedido: {
            type: "string",
            enum: ["APP", "WEB", "TOTEM"]
          },
          clienteId: {
            type: "string",
            format: "uuid"
          },
          unidadeId: {
            type: "string",
            format: "uuid"
          },
          itens: {
            type: "array",
            minItems: 1,
            items: orderItemSchema
          },
          formaPagamento: {
            type: "string",
            enum: ["MOCK"]
          }
        },
        {
          canalPedido: "TOTEM",
          clienteId:
            "00000000-0000-4000-8000-000000000012",
          unidadeId:
            "00000000-0000-4000-8000-000000000001",
          itens: [
            {
              produtoId:
                "90f4dd96-e10f-4a0b-a2aa-1b579fdb84fd",
              quantidade: 2
            }
          ],
          formaPagamento: "MOCK"
        }
      ),

      responses: {
        "201": {
          description:
            "Pedido criado e pagamento mock processado.",
          content: {
            "application/json": {
              examples: {
                aprovado: {
                  summary: "Pagamento aprovado",
                  value: {
                    id: "49fa53bc-8af8-44e9-a600-d7d7d3c24b87",
                    canalPedido: "TOTEM",
                    status: "PAGAMENTO_APROVADO",
                    valorSubtotal: 37.8,
                    valorDesconto: 0,
                    valorTotal: 37.8,
                    pagamento: {
                      provedor: "MOCK",
                      status: "APROVADO",
                      transacaoExternaId:
                        "MOCK-49FA53BC"
                    }
                  }
                },

                recusado: {
                  summary: "Pagamento recusado",
                  value: {
                    id: "2d080b82-7ef8-498c-b6aa-09ba10aa9bb1",
                    canalPedido: "WEB",
                    status: "CANCELADO",
                    valorSubtotal: 567,
                    valorDesconto: 0,
                    valorTotal: 567,
                    pagamento: {
                      provedor: "MOCK",
                      status: "RECUSADO",
                      transacaoExternaId:
                        "MOCK-2D080B82",
                      mensagem:
                        "Pagamento recusado pelo serviço mock."
                    }
                  }
                }
              }
            }
          }
        },
        "401": errorResponse("UnauthorizedError"),
        "403": errorResponse("ForbiddenError"),
        "404": errorResponse("NotFoundError"),
        "409": errorResponse("ConflictError"),
        "422": errorResponse("ValidationError")
      }
    },

    get: {
      tags: ["Pedidos"],
      summary: "Lista e filtra os pedidos",
      description:
        "Permite filtrar por canal, status, unidade e cliente. O acesso também considera o perfil autenticado.",
      security: bearerSecurity,

      parameters: [
        {
          name: "canalPedido",
          in: "query",
          required: false,
          schema: {
            type: "string",
            enum: ["APP", "WEB", "TOTEM"]
          }
        },
        {
          name: "status",
          in: "query",
          required: false,
          schema: {
            type: "string",
            enum: orderStatusValues
          }
        },
        {
          name: "unidadeId",
          in: "query",
          required: false,
          schema: {
            type: "string",
            format: "uuid"
          }
        },
        {
          name: "clienteId",
          in: "query",
          required: false,
          schema: {
            type: "string",
            format: "uuid"
          }
        },
        {
          name: "page",
          in: "query",
          required: false,
          schema: {
            type: "integer",
            minimum: 1,
            default: 1
          }
        },
        {
          name: "limit",
          in: "query",
          required: false,
          schema: {
            type: "integer",
            minimum: 1,
            maximum: 100,
            default: 10
          }
        }
      ],

      responses: {
        "200": jsonResponse("Pedidos encontrados.", {
          items: [
            {
              id: "49fa53bc-8af8-44e9-a600-d7d7d3c24b87",
              clienteId:
                "00000000-0000-4000-8000-000000000012",
              unidadeId:
                "00000000-0000-4000-8000-000000000001",
              canalPedido: "TOTEM",
              status: "PAGAMENTO_APROVADO",
              valorTotal: 37.8,
              criadoEm: "2026-08-10T12:00:00.000Z"
            }
          ],
          page: 1,
          limit: 10,
          total: 1
        }),
        "401": errorResponse("UnauthorizedError"),
        "403": errorResponse("ForbiddenError"),
        "422": errorResponse("ValidationError")
      }
    }
  },

  "/pedidos/{id}/status": {
    patch: {
      tags: ["Pedidos"],
      summary: "Atualiza o status do pedido",
      description:
        "Aplica as transições PAGAMENTO_APROVADO para EM_PREPARO, depois PRONTO e ENTREGUE.",
      security: bearerSecurity,

      parameters: [
        uuidParameter("id", "UUID do pedido")
      ],

      requestBody: jsonBody(
        ["status"],
        {
          status: {
            type: "string",
            enum: [
              "EM_PREPARO",
              "PRONTO",
              "ENTREGUE"
            ]
          },
          motivo: {
            type: "string",
            maxLength: 255
          }
        },
        {
          status: "EM_PREPARO",
          motivo: "Pedido encaminhado para a cozinha"
        }
      ),

      responses: {
        "200": jsonResponse("Status atualizado.", {
          id: "49fa53bc-8af8-44e9-a600-d7d7d3c24b87",
          status: "EM_PREPARO",
          canceladoEm: null,
          entregueEm: null,
          atualizadoEm: "2026-08-10T12:05:00.000Z"
        }),
        "401": errorResponse("UnauthorizedError"),
        "403": errorResponse("ForbiddenError"),
        "404": errorResponse("NotFoundError"),
        "409": errorResponse("ConflictError"),
        "422": errorResponse("ValidationError")
      }
    }
  },

  "/pedidos/{id}/cancelamento": {
    post: {
      tags: ["Pedidos"],
      summary: "Cancela um pedido",
      description:
        "Cancela pedidos permitidos pela regra e devolve o estoque reservado ou consumido.",
      security: bearerSecurity,

      parameters: [
        uuidParameter("id", "UUID do pedido")
      ],

      requestBody: jsonBody(
        ["motivo"],
        {
          motivo: {
            type: "string",
            minLength: 3,
            maxLength: 255
          }
        },
        {
          motivo: "Cancelamento solicitado pelo cliente"
        }
      ),

      responses: {
        "200": jsonResponse("Pedido cancelado.", {
          id: "49fa53bc-8af8-44e9-a600-d7d7d3c24b87",
          status: "CANCELADO",
          canceladoEm: "2026-08-10T12:08:00.000Z",
          entregueEm: null,
          atualizadoEm: "2026-08-10T12:08:00.000Z"
        }),
        "401": errorResponse("UnauthorizedError"),
        "403": errorResponse("ForbiddenError"),
        "404": errorResponse("NotFoundError"),
        "409": errorResponse("ConflictError"),
        "422": errorResponse("ValidationError")
      }
    }
  },

  "/pedidos/{pedidoId}/pagamento": {
    get: {
      tags: ["Pagamento"],
      summary: "Consulta o pagamento mock",
      description:
        "Retorna o status e os payloads registrados durante a simulação do pagamento.",
      security: bearerSecurity,

      parameters: [
        uuidParameter("pedidoId", "UUID do pedido")
      ],

      responses: {
        "200": jsonResponse("Pagamento encontrado.", {
          id: "550ba9e7-04e3-40ee-9ffc-37b6b0f9f872",
          pedidoId:
            "49fa53bc-8af8-44e9-a600-d7d7d3c24b87",
          provedor: "MOCK",
          status: "APROVADO",
          valor: 37.8,
          transacaoExternaId: "MOCK-49FA53BC",
          payloadEnvio: {
            pedidoId:
              "49fa53bc-8af8-44e9-a600-d7d7d3c24b87",
            valor: 37.8
          },
          payloadRetorno: {
            status: "APROVADO",
            mensagem: "Pagamento aprovado."
          },
          criadoEm: "2026-08-10T12:00:01.000Z"
        }),
        "401": errorResponse("UnauthorizedError"),
        "403": errorResponse("ForbiddenError"),
        "404": errorResponse("NotFoundError"),
        "422": errorResponse("ValidationError")
      }
    }
  },

  "/fidelidade/saldo": {
    get: {
      tags: ["Fidelidade"],
      summary: "Consulta o saldo de pontos",
      description:
        "Disponível para o próprio cliente com consentimento ativo.",
      security: bearerSecurity,

      responses: {
        "200": jsonResponse("Saldo consultado.", {
          usuarioId:
            "00000000-0000-4000-8000-000000000012",
          saldoPontos: 18,
          atualizadoEm: "2026-08-10T12:15:00.000Z"
        }),
        "401": errorResponse("UnauthorizedError"),
        "403": errorResponse("ForbiddenError")
      }
    }
  },

  "/fidelidade/resgates": {
    post: {
      tags: ["Fidelidade"],
      summary: "Resgata pontos",
      description:
        "Deduz pontos da conta do próprio cliente. Exige consentimento e saldo suficiente.",
      security: bearerSecurity,

      requestBody: jsonBody(
        ["pontos"],
        {
          pontos: {
            type: "integer",
            minimum: 1
          }
        },
        {
          pontos: 10
        }
      ),

      responses: {
        "201": jsonResponse("Pontos resgatados.", {
          movimentacao: "RESGATE",
          pontosResgatados: 10,
          saldoPontos: 8,
          atualizadoEm: "2026-08-10T12:16:00.000Z"
        }),
        "401": errorResponse("UnauthorizedError"),
        "403": errorResponse("ForbiddenError"),
        "409": errorResponse("ConflictError"),
        "422": errorResponse("ValidationError")
      }
    }
  },

  "/consentimentos": {
    post: {
      tags: ["LGPD"],
      summary: "Registra o consentimento LGPD",
      description:
        "Registra a aceitação ou recusa do próprio cliente para a finalidade do programa de fidelidade.",
      security: bearerSecurity,

      requestBody: jsonBody(
        ["finalidade", "aceito", "versaoTermo"],
        {
          finalidade: {
            type: "string",
            enum: ["PROGRAMA_FIDELIDADE"]
          },
          aceito: {
            type: "boolean"
          },
          versaoTermo: {
            type: "string",
            minLength: 1,
            maxLength: 20
          }
        },
        {
          finalidade: "PROGRAMA_FIDELIDADE",
          aceito: true,
          versaoTermo: "1.0"
        }
      ),

      responses: {
        "201": jsonResponse("Consentimento registrado.", {
          id: "362c1ff1-f724-4f9a-839b-34b55a3fcd39",
          usuarioId:
            "00000000-0000-4000-8000-000000000012",
          finalidade: "PROGRAMA_FIDELIDADE",
          aceito: true,
          versaoTermo: "1.0",
          registradoEm: "2026-08-10T12:20:00.000Z"
        }),
        "401": errorResponse("UnauthorizedError"),
        "403": errorResponse("ForbiddenError"),
        "422": errorResponse("ValidationError")
      }
    }
  }
};

export { openApiPathsPartTwo };