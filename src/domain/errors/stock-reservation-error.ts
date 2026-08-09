class StockReservationError extends Error {
  constructor(readonly produtoId: string) {
    super("Estoque insuficiente para reservar o produto.");
    this.name = "StockReservationError";
  }
}

export { StockReservationError };