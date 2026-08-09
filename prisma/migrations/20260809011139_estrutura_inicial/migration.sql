-- CreateEnum
CREATE TYPE "TipoUnidade" AS ENUM ('MATRIZ', 'FRANQUIA');

-- CreateEnum
CREATE TYPE "PerfilUsuario" AS ENUM ('ADMIN', 'GERENTE', 'ATENDENTE', 'COZINHA', 'CLIENTE');

-- CreateEnum
CREATE TYPE "CanalPedido" AS ENUM ('APP', 'WEB', 'TOTEM');

-- CreateEnum
CREATE TYPE "StatusPedido" AS ENUM ('AGUARDANDO_PAGAMENTO', 'PAGAMENTO_APROVADO', 'EM_PREPARO', 'PRONTO', 'ENTREGUE', 'CANCELADO');

-- CreateEnum
CREATE TYPE "TipoMovimentacaoEstoque" AS ENUM ('ENTRADA', 'RESERVA', 'SAIDA', 'ESTORNO', 'AJUSTE');

-- CreateEnum
CREATE TYPE "StatusPagamento" AS ENUM ('PENDENTE', 'APROVADO', 'RECUSADO', 'CANCELADO');

-- CreateEnum
CREATE TYPE "TipoDesconto" AS ENUM ('PERCENTUAL', 'VALOR_FIXO');

-- CreateEnum
CREATE TYPE "TipoMovimentacaoPontos" AS ENUM ('CREDITO', 'RESGATE', 'ESTORNO', 'AJUSTE');

-- CreateTable
CREATE TABLE "unidades" (
    "id" UUID NOT NULL,
    "unidade_matriz_id" UUID,
    "nome" VARCHAR(120) NOT NULL,
    "tipo" "TipoUnidade" NOT NULL,
    "logradouro" VARCHAR(150) NOT NULL,
    "numero" VARCHAR(20) NOT NULL,
    "bairro" VARCHAR(100) NOT NULL,
    "cidade" VARCHAR(100) NOT NULL,
    "uf" CHAR(2) NOT NULL,
    "cep" VARCHAR(9) NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criado_em" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "unidades_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usuarios" (
    "id" UUID NOT NULL,
    "unidade_id" UUID,
    "nome" VARCHAR(120) NOT NULL,
    "email" VARCHAR(150) NOT NULL,
    "senha_hash" VARCHAR(255) NOT NULL,
    "perfil" "PerfilUsuario" NOT NULL DEFAULT 'CLIENTE',
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criado_em" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessoes_refresh" (
    "id" UUID NOT NULL,
    "usuario_id" UUID NOT NULL,
    "token_hash" VARCHAR(255) NOT NULL,
    "expira_em" TIMESTAMPTZ(3) NOT NULL,
    "revogado_em" TIMESTAMPTZ(3),
    "criado_em" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sessoes_refresh_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "produtos" (
    "id" UUID NOT NULL,
    "nome" VARCHAR(120) NOT NULL,
    "descricao" VARCHAR(500),
    "categoria" VARCHAR(60) NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criado_em" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "produtos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "produtos_unidade" (
    "id" UUID NOT NULL,
    "unidade_id" UUID NOT NULL,
    "produto_id" UUID NOT NULL,
    "preco" DECIMAL(10,2) NOT NULL,
    "disponivel" BOOLEAN NOT NULL DEFAULT true,
    "criado_em" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "produtos_unidade_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "estoques" (
    "id" UUID NOT NULL,
    "unidade_id" UUID NOT NULL,
    "produto_id" UUID NOT NULL,
    "quantidade_disponivel" INTEGER NOT NULL DEFAULT 0,
    "quantidade_reservada" INTEGER NOT NULL DEFAULT 0,
    "criado_em" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "estoques_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "movimentacoes_estoque" (
    "id" UUID NOT NULL,
    "estoque_id" UUID NOT NULL,
    "pedido_id" UUID,
    "usuario_id" UUID,
    "tipo" "TipoMovimentacaoEstoque" NOT NULL,
    "quantidade" INTEGER NOT NULL,
    "saldo_anterior" INTEGER NOT NULL,
    "saldo_posterior" INTEGER NOT NULL,
    "motivo" VARCHAR(255),
    "criado_em" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "movimentacoes_estoque_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pedidos" (
    "id" UUID NOT NULL,
    "cliente_id" UUID NOT NULL,
    "unidade_id" UUID NOT NULL,
    "promocao_id" UUID,
    "canal_pedido" "CanalPedido" NOT NULL,
    "status" "StatusPedido" NOT NULL DEFAULT 'AGUARDANDO_PAGAMENTO',
    "forma_pagamento" VARCHAR(20) NOT NULL DEFAULT 'MOCK',
    "subtotal" DECIMAL(10,2) NOT NULL,
    "desconto" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "valor_total" DECIMAL(10,2) NOT NULL,
    "cancelado_em" TIMESTAMPTZ(3),
    "entregue_em" TIMESTAMPTZ(3),
    "criado_em" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "pedidos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "itens_pedido" (
    "id" UUID NOT NULL,
    "pedido_id" UUID NOT NULL,
    "produto_id" UUID NOT NULL,
    "quantidade" INTEGER NOT NULL,
    "preco_unitario" DECIMAL(10,2) NOT NULL,
    "subtotal" DECIMAL(10,2) NOT NULL,
    "criado_em" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "itens_pedido_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "historicos_status_pedido" (
    "id" UUID NOT NULL,
    "pedido_id" UUID NOT NULL,
    "usuario_id" UUID,
    "status_anterior" "StatusPedido",
    "status_novo" "StatusPedido" NOT NULL,
    "motivo" VARCHAR(255),
    "criado_em" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "historicos_status_pedido_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pagamentos" (
    "id" UUID NOT NULL,
    "pedido_id" UUID NOT NULL,
    "provedor" VARCHAR(30) NOT NULL DEFAULT 'MOCK',
    "status" "StatusPagamento" NOT NULL DEFAULT 'PENDENTE',
    "valor" DECIMAL(10,2) NOT NULL,
    "transacao_externa_id" VARCHAR(100),
    "payload_envio" JSONB NOT NULL,
    "payload_retorno" JSONB,
    "criado_em" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "pagamentos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "consentimentos_lgpd" (
    "id" UUID NOT NULL,
    "usuario_id" UUID NOT NULL,
    "finalidade" VARCHAR(100) NOT NULL,
    "aceito" BOOLEAN NOT NULL,
    "versao_termo" VARCHAR(20) NOT NULL,
    "ip" VARCHAR(45),
    "registrado_em" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "consentimentos_lgpd_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contas_fidelidade" (
    "id" UUID NOT NULL,
    "usuario_id" UUID NOT NULL,
    "saldo_pontos" INTEGER NOT NULL DEFAULT 0,
    "criado_em" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "contas_fidelidade_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "movimentacoes_pontos" (
    "id" UUID NOT NULL,
    "conta_id" UUID NOT NULL,
    "pedido_id" UUID,
    "tipo" "TipoMovimentacaoPontos" NOT NULL,
    "pontos" INTEGER NOT NULL,
    "saldo_anterior" INTEGER NOT NULL,
    "saldo_posterior" INTEGER NOT NULL,
    "descricao" VARCHAR(255),
    "criado_em" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "movimentacoes_pontos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "promocoes" (
    "id" UUID NOT NULL,
    "unidade_id" UUID,
    "nome" VARCHAR(120) NOT NULL,
    "descricao" VARCHAR(500),
    "tipo_desconto" "TipoDesconto" NOT NULL,
    "valor" DECIMAL(10,2) NOT NULL,
    "valor_minimo" DECIMAL(10,2),
    "data_inicio" TIMESTAMPTZ(3) NOT NULL,
    "data_fim" TIMESTAMPTZ(3) NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criado_em" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "promocoes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "logs_auditoria" (
    "id" UUID NOT NULL,
    "usuario_id" UUID,
    "request_id" VARCHAR(100),
    "acao" VARCHAR(100) NOT NULL,
    "entidade" VARCHAR(100) NOT NULL,
    "entidade_id" VARCHAR(100),
    "dados" JSONB,
    "ip" VARCHAR(45),
    "criado_em" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "logs_auditoria_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "unidades_unidade_matriz_id_idx" ON "unidades"("unidade_matriz_id");

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");

-- CreateIndex
CREATE INDEX "usuarios_unidade_id_idx" ON "usuarios"("unidade_id");

-- CreateIndex
CREATE INDEX "usuarios_perfil_idx" ON "usuarios"("perfil");

-- CreateIndex
CREATE UNIQUE INDEX "sessoes_refresh_token_hash_key" ON "sessoes_refresh"("token_hash");

-- CreateIndex
CREATE INDEX "sessoes_refresh_usuario_id_idx" ON "sessoes_refresh"("usuario_id");

-- CreateIndex
CREATE INDEX "sessoes_refresh_expira_em_idx" ON "sessoes_refresh"("expira_em");

-- CreateIndex
CREATE INDEX "produtos_nome_idx" ON "produtos"("nome");

-- CreateIndex
CREATE INDEX "produtos_categoria_idx" ON "produtos"("categoria");

-- CreateIndex
CREATE INDEX "produtos_unidade_produto_id_idx" ON "produtos_unidade"("produto_id");

-- CreateIndex
CREATE UNIQUE INDEX "produtos_unidade_unidade_id_produto_id_key" ON "produtos_unidade"("unidade_id", "produto_id");

-- CreateIndex
CREATE INDEX "estoques_produto_id_idx" ON "estoques"("produto_id");

-- CreateIndex
CREATE UNIQUE INDEX "estoques_unidade_id_produto_id_key" ON "estoques"("unidade_id", "produto_id");

-- CreateIndex
CREATE INDEX "movimentacoes_estoque_estoque_id_idx" ON "movimentacoes_estoque"("estoque_id");

-- CreateIndex
CREATE INDEX "movimentacoes_estoque_pedido_id_idx" ON "movimentacoes_estoque"("pedido_id");

-- CreateIndex
CREATE INDEX "movimentacoes_estoque_usuario_id_idx" ON "movimentacoes_estoque"("usuario_id");

-- CreateIndex
CREATE INDEX "movimentacoes_estoque_criado_em_idx" ON "movimentacoes_estoque"("criado_em");

-- CreateIndex
CREATE INDEX "pedidos_cliente_id_idx" ON "pedidos"("cliente_id");

-- CreateIndex
CREATE INDEX "pedidos_unidade_id_idx" ON "pedidos"("unidade_id");

-- CreateIndex
CREATE INDEX "pedidos_promocao_id_idx" ON "pedidos"("promocao_id");

-- CreateIndex
CREATE INDEX "pedidos_canal_pedido_idx" ON "pedidos"("canal_pedido");

-- CreateIndex
CREATE INDEX "pedidos_status_idx" ON "pedidos"("status");

-- CreateIndex
CREATE INDEX "pedidos_criado_em_idx" ON "pedidos"("criado_em");

-- CreateIndex
CREATE INDEX "itens_pedido_produto_id_idx" ON "itens_pedido"("produto_id");

-- CreateIndex
CREATE UNIQUE INDEX "itens_pedido_pedido_id_produto_id_key" ON "itens_pedido"("pedido_id", "produto_id");

-- CreateIndex
CREATE INDEX "historicos_status_pedido_pedido_id_idx" ON "historicos_status_pedido"("pedido_id");

-- CreateIndex
CREATE INDEX "historicos_status_pedido_usuario_id_idx" ON "historicos_status_pedido"("usuario_id");

-- CreateIndex
CREATE INDEX "historicos_status_pedido_criado_em_idx" ON "historicos_status_pedido"("criado_em");

-- CreateIndex
CREATE UNIQUE INDEX "pagamentos_pedido_id_key" ON "pagamentos"("pedido_id");

-- CreateIndex
CREATE INDEX "pagamentos_status_idx" ON "pagamentos"("status");

-- CreateIndex
CREATE INDEX "consentimentos_lgpd_usuario_id_finalidade_idx" ON "consentimentos_lgpd"("usuario_id", "finalidade");

-- CreateIndex
CREATE INDEX "consentimentos_lgpd_registrado_em_idx" ON "consentimentos_lgpd"("registrado_em");

-- CreateIndex
CREATE UNIQUE INDEX "contas_fidelidade_usuario_id_key" ON "contas_fidelidade"("usuario_id");

-- CreateIndex
CREATE INDEX "movimentacoes_pontos_conta_id_idx" ON "movimentacoes_pontos"("conta_id");

-- CreateIndex
CREATE INDEX "movimentacoes_pontos_pedido_id_idx" ON "movimentacoes_pontos"("pedido_id");

-- CreateIndex
CREATE INDEX "movimentacoes_pontos_criado_em_idx" ON "movimentacoes_pontos"("criado_em");

-- CreateIndex
CREATE INDEX "promocoes_unidade_id_idx" ON "promocoes"("unidade_id");

-- CreateIndex
CREATE INDEX "promocoes_data_inicio_data_fim_idx" ON "promocoes"("data_inicio", "data_fim");

-- CreateIndex
CREATE INDEX "logs_auditoria_usuario_id_idx" ON "logs_auditoria"("usuario_id");

-- CreateIndex
CREATE INDEX "logs_auditoria_request_id_idx" ON "logs_auditoria"("request_id");

-- CreateIndex
CREATE INDEX "logs_auditoria_entidade_entidade_id_idx" ON "logs_auditoria"("entidade", "entidade_id");

-- CreateIndex
CREATE INDEX "logs_auditoria_criado_em_idx" ON "logs_auditoria"("criado_em");

-- AddForeignKey
ALTER TABLE "unidades" ADD CONSTRAINT "unidades_unidade_matriz_id_fkey" FOREIGN KEY ("unidade_matriz_id") REFERENCES "unidades"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usuarios" ADD CONSTRAINT "usuarios_unidade_id_fkey" FOREIGN KEY ("unidade_id") REFERENCES "unidades"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessoes_refresh" ADD CONSTRAINT "sessoes_refresh_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "produtos_unidade" ADD CONSTRAINT "produtos_unidade_unidade_id_fkey" FOREIGN KEY ("unidade_id") REFERENCES "unidades"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "produtos_unidade" ADD CONSTRAINT "produtos_unidade_produto_id_fkey" FOREIGN KEY ("produto_id") REFERENCES "produtos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "estoques" ADD CONSTRAINT "estoques_unidade_id_fkey" FOREIGN KEY ("unidade_id") REFERENCES "unidades"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "estoques" ADD CONSTRAINT "estoques_produto_id_fkey" FOREIGN KEY ("produto_id") REFERENCES "produtos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movimentacoes_estoque" ADD CONSTRAINT "movimentacoes_estoque_estoque_id_fkey" FOREIGN KEY ("estoque_id") REFERENCES "estoques"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movimentacoes_estoque" ADD CONSTRAINT "movimentacoes_estoque_pedido_id_fkey" FOREIGN KEY ("pedido_id") REFERENCES "pedidos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movimentacoes_estoque" ADD CONSTRAINT "movimentacoes_estoque_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pedidos" ADD CONSTRAINT "pedidos_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pedidos" ADD CONSTRAINT "pedidos_unidade_id_fkey" FOREIGN KEY ("unidade_id") REFERENCES "unidades"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pedidos" ADD CONSTRAINT "pedidos_promocao_id_fkey" FOREIGN KEY ("promocao_id") REFERENCES "promocoes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "itens_pedido" ADD CONSTRAINT "itens_pedido_pedido_id_fkey" FOREIGN KEY ("pedido_id") REFERENCES "pedidos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "itens_pedido" ADD CONSTRAINT "itens_pedido_produto_id_fkey" FOREIGN KEY ("produto_id") REFERENCES "produtos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "historicos_status_pedido" ADD CONSTRAINT "historicos_status_pedido_pedido_id_fkey" FOREIGN KEY ("pedido_id") REFERENCES "pedidos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "historicos_status_pedido" ADD CONSTRAINT "historicos_status_pedido_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pagamentos" ADD CONSTRAINT "pagamentos_pedido_id_fkey" FOREIGN KEY ("pedido_id") REFERENCES "pedidos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consentimentos_lgpd" ADD CONSTRAINT "consentimentos_lgpd_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contas_fidelidade" ADD CONSTRAINT "contas_fidelidade_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movimentacoes_pontos" ADD CONSTRAINT "movimentacoes_pontos_conta_id_fkey" FOREIGN KEY ("conta_id") REFERENCES "contas_fidelidade"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movimentacoes_pontos" ADD CONSTRAINT "movimentacoes_pontos_pedido_id_fkey" FOREIGN KEY ("pedido_id") REFERENCES "pedidos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "promocoes" ADD CONSTRAINT "promocoes_unidade_id_fkey" FOREIGN KEY ("unidade_id") REFERENCES "unidades"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "logs_auditoria" ADD CONSTRAINT "logs_auditoria_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;
