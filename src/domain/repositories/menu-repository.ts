import type { MenuItem } from "../entities/menu-item";

type SetMenuItemData = {
  unidadeId: string;
  produtoId: string;
  preco: number;
  disponivel: boolean;
};

type ListMenuResult = {
  items: MenuItem[];
  total: number;
};

interface MenuRepository {
  listAvailableByUnit(
    unidadeId: string,
    page: number,
    limit: number
  ): Promise<ListMenuResult>;

  upsert(data: SetMenuItemData): Promise<MenuItem>;
}

export type {
  ListMenuResult,
  MenuRepository,
  SetMenuItemData
};