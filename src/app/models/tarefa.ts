export interface Tarefa {
  id?: number;
  titulo: string;
  descricao: string;
  dataVencimento: string;
  concluida?: boolean;
  usuarioId: number;
}