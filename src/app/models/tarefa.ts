export interface Tarefa {
  id?: number;
  titulo: string;
  descricao: string;
  dataVencimento: string;
  status: string;     //Pendente ou Concluída
  usuarioId: number;
}
