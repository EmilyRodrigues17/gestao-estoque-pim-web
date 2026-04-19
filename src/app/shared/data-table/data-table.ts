import { Component, computed, contentChild, input, output, TemplateRef } from '@angular/core';
import { PaginationInfo, TableAction, TableColumn } from '../../core/models/data-table';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-data-table',
  imports: [NgClass],
  templateUrl: './data-table.html',
  styleUrl: './data-table.css',
})
export class DataTable {
  title = input.required<string>();

  badgeText = input<string>('');

  itemName = input<string>('itens');

  columns = input.required<TableColumn[]>();

  /* Array de dados para exibir na tabela*/
  data = input.required<any[]>();

  pagination = input.required<PaginationInfo>();

  /* Ações das tabelas */
  showActions = input<boolean>(true);

  actions = input<TableAction[]>([
    { icon: 'edit', label: 'Editar', event: 'edit', color: 'hover:text-primary hover:bg-primary/5' },
    { icon: 'delete', label: 'Excluir', event: 'delete', color: 'hover:text-error hover:bg-error/5' },
  ]);

  action = output<{ event: string; item: any }>();

  edit = output<any>();
  delete = output<any>();

  pageChange = output<number>();

  cellTemplate = contentChild<TemplateRef<any>>('cellTemplate');

  /* calculando total de paginas */
  totalPages = computed(() => {
    const pag = this.pagination();
    return Math.ceil(pag.totalItems / pag.itemsPerPage);
  });

  pages = computed(() => {
    const total = this.totalPages();
    const current = this.pagination().currentPage;

    if (total <= 5) {
      return Array.from({ length: total }, (_, p) => p + 1);
    }

    // se tem mais de 5, comeca a mostrar pagina com ...
    const pages: number[] = [];
    const groupSize = 3;

    const groupStart = Math.floor((current - 1) / groupSize) * groupSize + 1;
    const groupEnd = Math.min(groupStart + groupSize - 1, total);

    for (let i = groupStart; i <= groupEnd; i++) {
      pages.push(i);
    }

    if (groupEnd < total) {
      pages.push(-1);    // usado para reticências
      pages.push(total); // última página
    }

    return pages;
  });

  displayRange = computed(() => {
    const pag = this.pagination();
    const start = (pag.currentPage - 1) * pag.itemsPerPage + 1;
    const end = Math.min(pag.currentPage * pag.itemsPerPage, pag.totalItems);
    return { start, end };
  });

  onPageChange(page: number): void {
    if (page >= 1 && page <= this.totalPages()){
      this.pageChange.emit(page);
    }
  }

  onAction(actionEvent: string, item: any): void {
    this.action.emit({ event: actionEvent, item});

    if (actionEvent === 'edit') this.edit.emit(item);
    if (actionEvent === 'delete') this.delete.emit(item);
  }

  getCellValue(item: any, key: string): any {
    return key.split('.').reduce((obj, k) => obj?.[k], item);
  }

  getBadgeClass(item: any, col: TableColumn): string {
    const value = this.getCellValue(item, col.key);

    if (col.badgeColors && col.badgeColors[value]) {
      return col.badgeColors[value];
    }

    if (value > 0){
      return 'bg-primary-fixed text-on-primary-fixed';
    }

    return 'bg-tertiary-fixed text-on-tertiary-fixed';
  }

}
