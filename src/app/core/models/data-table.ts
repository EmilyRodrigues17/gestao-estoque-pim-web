/* Configuracao de uma coluna da tabela - Componente reutilizavel */

export interface TableColumn {
    key: string;
    header: string;
    align?: 'left' | 'right';
    type?: 'text' | 'badge';
    badgeColors?: { [valor: string] : string };
}

export interface PaginationInfo {
    currentPage: number;
    totalItems: number;
    itemsPerPage: number;
}

export interface TableAction {
    icon: string;
    label: string;
    event: string;
    color?: string;
}