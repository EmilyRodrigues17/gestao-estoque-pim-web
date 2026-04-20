export interface Insumo {
    id: string;
    codigo: string;
    nome: string;
    descricao: string;
    unidade_medida: string;
    estoque_atual: number;
    estoque_minimo: number;
    estoque_maximo: number | null;
    localizacao: string;
    ativo: boolean;
    status_estoque: string;
    categoria_id: string;
    categoria: { nome: string };
    created_at: string;
    updated_at: string;
}

export interface CreateInsumo {
    codigo: string;
    nome: string;
    descricao: string | null;
    unidade_medida: string;
    estoque_minimo: number;
    estoque_maximo: number | null;
    localizacao: string;
    categoria_id: string;
}

export interface UpdateInsumo {
    codigo?: string;
    nome?: string;
    descricao?: string | null;
    unidade_medida?: string;
    estoque_minimo?: number;
    estoque_maximo?: number | null;
    localizacao?: string;
    categoria_id?: string;
}