export interface InsumoCritico {
    id: string;
    nome: string;
    codigo: string;
    categoria: string;
    estoque_atual: number;
    estoque_minimo: number;
    estoque_maximo: number;
    percentual: number;
    status: string
}

export interface DashboardData {
    totalInsumosAbaixoMinimo: number;
    totalInsumosZerados: number;
    movimentacoesHoje: number;
    totalUnidadesEstoque: number;
    insumosCriticos: InsumoCritico[];
}
 