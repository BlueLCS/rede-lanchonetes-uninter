export interface Consent {
  id: string;
  usuarioId: string;
  finalidade: string;
  aceito: boolean;
  versaoTermo: string;
  ip: string | null;
  registradoEm: Date;
}