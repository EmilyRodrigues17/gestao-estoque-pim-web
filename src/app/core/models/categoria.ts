export interface Categoria {
  id: string;
  nome: string;
  descricao: string | null;
  insumosVinculados: number;
  created_at: string;
  updated_at: string;
}

export interface CreateCategoria {
  nome: string;
  descricao: string | null;
}

export interface UpdateCategoria {
  nome?: string;
  descricao?: string | null;
}
