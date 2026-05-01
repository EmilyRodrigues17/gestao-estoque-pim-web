export interface Movimentacao {
    id: string;
    tipo: string;
    motivo: string;
    quantidade: number;
    saldo_apos: number;
    linha_destino: string | null;
    observacao: string | null;
    registrado_por: string;
    timestamp: string;
    insumo_id: string;
    insumo: { nome: string; codigo: string};
}

export interface CreateMovimentacao {
    tipo: string;
    motivo: string;
    quantidade: number;
    linha_destino: string | null;
    observacao: string | null;
    registrado_por: string;
    insumo_id: string;
}