export const STATUS_FILME = { EM_CARTAZ: 0, EM_BREVE: 1, INDISPONIVEL: 2 } as const;
export const STATUS_SESSAO = { CANCELADO: 0, DISPONIVEL: 1, FINALIZADO: 2 } as const;

export type Movie = {
  id: number;
  titulo: string;
  sinopse: string;
  duracao: number;
  classificacao: number;
  dataLancamento: string;
  posterUrl: string;
  status: number;
};

export type Category = { id: number; nome: string };
export type MovieCategory = { idFilme: number; idCategoria: number };
export type Session = {
  idSessao: number;
  idFilme: number;
  idSala: number;
  nomeSala: string;
  dataHora: string;
  preco: number;
  status: number;
  ingressosDisponiveis: number;
};
