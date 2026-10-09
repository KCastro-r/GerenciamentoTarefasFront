// a API não devolve o dado puro, devolve este envelope.

export interface ApiResponse<T> {
  sucesso: boolean;
  mensagem: string;
  dados: T | null;
}