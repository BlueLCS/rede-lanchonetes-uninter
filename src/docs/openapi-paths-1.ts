const bearerSecurity = [
  {
    bearerAuth: []
  }
];

const pageParameter = {
  name: "page",
  in: "query",
  required: false,
  schema: {
    type: "integer",
    minimum: 1,
    default: 1
  }
};

const limitParameter = {
  name: "limit",
  in: "query",
  required: false,
  schema: {
    type: "integer",
    minimum: 1,
    maximum: 100,
    default: 10
  }
};

function jsonResponse(
  description: string,
  example?: unknown
) {
  if (example === undefined) {
    return {
      description
    };
  }

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

const openApiPathsPartOne = {
  "/auth/cadastro": {
    post: {
      tags: ["Autenticação"],
      summary: "Cadastra um cliente",
      description:
        "Cria um usuário com o perfil CLIENTE. A senha é armazenada com hash.",

      requestBody: jsonBody(
        ["nome", "email", "senha"],
        {
          nome: {
            type: "string",
            minLength: 3,
            maxLength: 120
          },
          email: {
            type: "string",
            format: "email",
            maxLength: 150
          },
          senha: {
            type: "string",
            format: "password",
            minLength: 8,
            maxLength: 72
          }
        },
        {
          nome: "Cliente Exemplo",
          email: "novo.cliente@exemplo.com",
          senha: "Senha123!"
        }
      ),

      responses: {
        "201": jsonResponse("Cliente cadastrado.", {
          id: "c15ced5b-598b-4bf2-af80-bb659e3714cc",
          nome: "Cliente Exemplo",
          email: "novo.cliente@exemplo.com",
          perfil: "CLIENTE",
          unidadeId: null,
          ativo: true
        }),
        "409": {
          $ref: "#/components/responses/ConflictError"
        },
        "422": {
          $ref: "#/components/responses/ValidationError"
        }
      }
    }
  },

  "/auth/login": {
    post: {
      tags: ["Autenticação"],
      summary: "Realiza o login",
      description:
        "Valida e-mail e senha e devolve os tokens da sessão.",

      requestBody: jsonBody(
        ["email", "senha"],
        {
          email: {
            type: "string",
            format: "email"
          },
          senha: {
            type: "string",
            format: "password"
          }
        },
        {
          email: "cliente@exemplo.com",
          senha: "Senha123!"
        }
      ),

      responses: {
        "200": jsonResponse("Login realizado.", {
          accessToken: "token-jwt",
          refreshToken: "refresh-token"
        }),
        "401": {
          $ref: "#/components/responses/UnauthorizedError"
        },
        "422": {
          $ref: "#/components/responses/ValidationError"
        }
      }
    }
  },

  "/auth/refresh": {
    post: {
      tags: ["Autenticação"],
      summary: "Renova os tokens",
      description:
        "Revoga o refresh token anterior e gera uma nova sessão.",

      requestBody: jsonBody(
        ["refreshToken"],
        {
          refreshToken: {
            type: "string",
            minLength: 64
          }
        },
        {
          refreshToken: "refresh-token-recebido-no-login"
        }
      ),

      responses: {
        "200": jsonResponse("Tokens renovados.", {
          accessToken: "novo-token-jwt",
          refreshToken: "novo-refresh-token"
        }),
        "401": {
          $ref: "#/components/responses/UnauthorizedError"
        },
        "422": {
          $ref: "#/components/responses/ValidationError"
        }
      }
    }
  },

  "/auth/logout": {
    post: {
      tags: ["Autenticação"],
      summary: "Encerra a sessão",
      description: "Revoga o refresh token informado.",

      requestBody: jsonBody(
        ["refreshToken"],
        {
          refreshToken: {
            type: "string",
            minLength: 64
          }
        },
        {
          refreshToken: "refresh-token-da-sessao"
        }
      ),

      responses: {
        "204": jsonResponse("Sessão encerrada."),
        "401": {
          $ref: "#/components/responses/UnauthorizedError"
        },
        "422": {
          $ref: "#/components/responses/ValidationError"
        }
      }
    }
  },

  "/unidades": {
    get: {
      tags: ["Unidades"],
      summary: "Lista as unidades",
      description:
        "Rota pública com paginação das unidades ativas.",
      parameters: [
        pageParameter,
        limitParameter
      ],

      responses: {
        "200": jsonResponse("Unidades encontradas.", {
          items: [
            {
              id: "00000000-0000-4000-8000-000000000001",
              nome: "Lanchonete Centro",
              tipo: "MATRIZ",
              cidade: "Brasília",
              uf: "DF",
              ativo: true
            }
          ],
          page: 1,
          limit: 10,
          total: 1
        }),
        "422": {
          $ref: "#/components/responses/ValidationError"
        }
      }
    },

    post: {
      tags: ["Unidades"],
      summary: "Cadastra uma unidade",
      description: "Permitido somente para ADMIN.",
      security: bearerSecurity,

      requestBody: jsonBody(
        [
          "nome",
          "tipo",
          "logradouro",
          "numero",
          "bairro",
          "cidade",
          "uf",
          "cep"
        ],
        {
          unidadeMatrizId: {
            type: "string",
            format: "uuid",
            nullable: true
          },
          nome: {
            type: "string",
            minLength: 3,
            maxLength: 120
          },
          tipo: {
            type: "string",
            enum: ["MATRIZ", "FRANQUIA"]
          },
          logradouro: {
            type: "string",
            maxLength: 150
          },
          numero: {
            type: "string",
            maxLength: 20
          },
          bairro: {
            type: "string",
            maxLength: 100
          },
          cidade: {
            type: "string",
            maxLength: 100
          },
          uf: {
            type: "string",
            minLength: 2,
            maxLength: 2
          },
          cep: {
            type: "string",
            pattern: "^\\d{5}-?\\d{3}$"
          }
        },
        {
          unidadeMatrizId:
            "00000000-0000-4000-8000-000000000001",
          nome: "Lanchonete Sul",
          tipo: "FRANQUIA",
          logradouro: "Avenida Central",
          numero: "100",
          bairro: "Centro",
          cidade: "Brasília",
          uf: "DF",
          cep: "70000-000"
        }
      ),

      responses: {
        "201": jsonResponse("Unidade cadastrada.", {
          id: "2c57e732-a38c-4d34-b12b-047e061e9985",
          nome: "Lanchonete Sul",
          tipo: "FRANQUIA",
          ativo: true
        }),
        "401": {
          $ref: "#/components/responses/UnauthorizedError"
        },
        "403": {
          $ref: "#/components/responses/ForbiddenError"
        },
        "409": {
          $ref: "#/components/responses/ConflictError"
        },
        "422": {
          $ref: "#/components/responses/ValidationError"
        }
      }
    }
  },

  "/unidades/{id}": {
    patch: {
      tags: ["Unidades"],
      summary: "Atualiza uma unidade",
      description:
        "Permitido para ADMIN ou GERENTE autorizado.",
      security: bearerSecurity,

      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          description: "UUID da unidade",
          schema: {
            type: "string",
            format: "uuid"
          }
        }
      ],

      requestBody: jsonBody(
        [],
        {
          unidadeMatrizId: {
            type: "string",
            format: "uuid",
            nullable: true
          },
          nome: {
            type: "string"
          },
          tipo: {
            type: "string",
            enum: ["MATRIZ", "FRANQUIA"]
          },
          logradouro: {
            type: "string"
          },
          numero: {
            type: "string"
          },
          bairro: {
            type: "string"
          },
          cidade: {
            type: "string"
          },
          uf: {
            type: "string"
          },
          cep: {
            type: "string"
          },
          ativo: {
            type: "boolean"
          }
        },
        {
          nome: "Lanchonete Sul - Unidade 1",
          ativo: true
        }
      ),

      responses: {
        "200": jsonResponse("Unidade atualizada.", {
          id: "2c57e732-a38c-4d34-b12b-047e061e9985",
          nome: "Lanchonete Sul - Unidade 1",
          tipo: "FRANQUIA",
          ativo: true
        }),
        "401": {
          $ref: "#/components/responses/UnauthorizedError"
        },
        "403": {
          $ref: "#/components/responses/ForbiddenError"
        },
        "404": {
          $ref: "#/components/responses/NotFoundError"
        },
        "409": {
          $ref: "#/components/responses/ConflictError"
        },
        "422": {
          $ref: "#/components/responses/ValidationError"
        }
      }
    }
  },

  "/produtos": {
    post: {
      tags: ["Produtos e cardápio"],
      summary: "Cadastra um produto",
      description:
        "Cria um produto global. Permitido somente para ADMIN.",
      security: bearerSecurity,

      requestBody: jsonBody(
        ["nome", "categoria"],
        {
          nome: {
            type: "string",
            minLength: 2,
            maxLength: 120
          },
          descricao: {
            type: "string",
            maxLength: 500,
            nullable: true
          },
          categoria: {
            type: "string",
            minLength: 2,
            maxLength: 60
          }
        },
        {
          nome: "X-Salada",
          descricao: "Sanduíche com carne, queijo e salada",
          categoria: "LANCHE"
        }
      ),

      responses: {
        "201": jsonResponse("Produto cadastrado.", {
          id: "90f4dd96-e10f-4a0b-a2aa-1b579fdb84fd",
          nome: "X-Salada",
          descricao: "Sanduíche com carne, queijo e salada",
          categoria: "LANCHE",
          ativo: true
        }),
        "401": {
          $ref: "#/components/responses/UnauthorizedError"
        },
        "403": {
          $ref: "#/components/responses/ForbiddenError"
        },
        "409": {
          $ref: "#/components/responses/ConflictError"
        },
        "422": {
          $ref: "#/components/responses/ValidationError"
        }
      }
    }
  },

  "/unidades/{unidadeId}/cardapio": {
    get: {
      tags: ["Produtos e cardápio"],
      summary: "Consulta o cardápio de uma unidade",
      description:
        "Rota pública. Retorna produtos disponíveis e preços da unidade.",

      parameters: [
        {
          name: "unidadeId",
          in: "path",
          required: true,
          description: "UUID da unidade",
          schema: {
            type: "string",
            format: "uuid"
          }
        },
        pageParameter,
        limitParameter
      ],

      responses: {
        "200": jsonResponse("Cardápio encontrado.", {
          items: [
            {
              produtoId:
                "90f4dd96-e10f-4a0b-a2aa-1b579fdb84fd",
              nome: "X-Salada",
              descricao:
                "Sanduíche com carne, queijo e salada",
              categoria: "LANCHE",
              preco: 21.9,
              disponivel: true
            }
          ],
          page: 1,
          limit: 10,
          total: 1
        }),
        "404": {
          $ref: "#/components/responses/NotFoundError"
        },
        "422": {
          $ref: "#/components/responses/ValidationError"
        }
      }
    }
  },

  "/unidades/{unidadeId}/cardapio/{produtoId}": {
    put: {
      tags: ["Produtos e cardápio"],
      summary: "Inclui ou atualiza um item do cardápio",
      description:
        "Define o preço e a disponibilidade do produto na unidade. Permitido para ADMIN ou GERENTE autorizado.",
      security: bearerSecurity,

      parameters: [
        {
          name: "unidadeId",
          in: "path",
          required: true,
          schema: {
            type: "stringstring",
            format: "uuid"
          }
        },
        {
          name: "produtoId",
          in: "path",
          required: true,
          schema: {
            type: "string",
            format: "uuid"
          }
        }
      ],

      requestBody: jsonBody(
        ["preco", "disponivel"],
        {
          preco: {
            type: "number",
            format: "double",
            minimum: 0.01
          },
          disponivel: {
            type: "boolean"
          }
        },
        {
          preco: 21.9,
          disponivel: true
        }
      ),

      responses: {
        "200": jsonResponse("Item do cardápio atualizado.", {
          id: "40c8f489-f175-403f-96d0-543b6a43b34b",
          unidadeId:
            "00000000-0000-4000-8000-000000000001",
          produtoId:
            "90f4dd96-e10f-4a0b-a2aa-1b579fdb84fd",
          preco: 21.9,
          disponivel: true
        }),
        "401": {
          $ref: "#/components/responses/UnauthorizedError"
        },
        "403": {
          $ref: "#/components/responses/ForbiddenError"
        },
        "404": {
          $ref: "#/components/responses/NotFoundError"
        },
        "422": {
          $ref: "#/components/responses/ValidationError"
        }
      }
    }
  },

  "/estoque": {
    get: {
      tags: ["Estoque"],
      summary: "Consulta o estoque de uma unidade",
      description:
        "Exige autenticação e respeita a unidade vinculada ao usuário.",
      security: bearerSecurity,

      parameters: [
        {
          name: "unidadeId",
          in: "query",
          required: true,
          description: "UUID da unidade",
          schema: {
            type: "string",
            format: "uuid"
          }
        },
        pageParameter,
        limitParameter
      ],

      responses: {
        "200": jsonResponse("Estoque encontrado.", {
          items: [
            {
              unidadeId:
                "00000000-0000-4000-8000-000000000001",
              produtoId:
                "90f4dd96-e10f-4a0b-a2aa-1b579fdb84fd",
              produtoNome: "X-Salada",
              quantidadeDisponivel: 23,
              quantidadeReservada: 0
            }
          ],
          page: 1,
          limit: 10,
          total: 1
        }),
        "401": {
          $ref: "#/components/responses/UnauthorizedError"
        },
        "403": {
          $ref: "#/components/responses/ForbiddenError"
        },
        "422": {
          $ref: "#/components/responses/ValidationError"
        }
      }
    }
  },

  "/estoque/movimentacoes": {
    post: {
      tags: ["Estoque"],
      summary: "Registra uma movimentação manual",
      description:
        "Aceita ENTRADA ou SAIDA. Permitido para ADMIN ou GERENTE autorizado.",
      security: bearerSecurity,

      requestBody: jsonBody(
        [
          "unidadeId",
          "produtoId",
          "tipo",
          "quantidade",
          "motivo"
        ],
        {
          unidadeId: {
            type: "string",
            format: "uuid"
          },
          produtoId: {
            type: "string",
            format: "uuid"
          },
          tipo: {
            type: "string",
            enum: ["ENTRADA", "SAIDA"]
          },
          quantidade: {
            type: "integer",
            minimum: 1
          },
          motivo: {
            type: "string",
            minLength: 3,
            maxLength: 255
          }
        },
        {
          unidadeId:
            "00000000-0000-4000-8000-000000000001",
          produtoId:
            "90f4dd96-e10f-4a0b-a2aa-1b579fdb84fd",
          tipo: "ENTRADA",
          quantidade: 10,
          motivo: "Reposição semanal"
        }
      ),

      responses: {
        "201": jsonResponse("Movimentação registrada.", {
          id: "b6410597-95fc-48db-9754-0dc24941c9c5",
          tipo: "ENTRADA",
          quantidade: 10,
          saldoAnterior: 23,
          saldoPosterior: 33,
          motivo: "Reposição semanal"
        }),
        "401": {
          $ref: "#/components/responses/UnauthorizedError"
        },
        "403": {
          $ref: "#/components/responses/ForbiddenError"
        },
        "404": {
          $ref: "#/components/responses/NotFoundError"
        },
        "409": {
          $ref: "#/components/responses/ConflictError"
        },
        "422": {
          $ref: "#/components/responses/ValidationError"
        }
      }
    }
  }
};

export { openApiPathsPartOne };