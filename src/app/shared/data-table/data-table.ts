import { Component, computed, contentChild, input, output, TemplateRef } from '@angular/core';
import { TableAction, TableColumn } from '../../core/models/data-table';
import { NgClass, NgTemplateOutlet } from '@angular/common';

@Component({
  selector: 'app-data-table',
  imports: [NgClass, NgTemplateOutlet],
  templateUrl: './data-table.html',
  styleUrl: './data-table.css',
})
export class DataTable {
  title = input<string>();

  badgeText = input<string>('');

  itemName = input<string>('itens');
  emptyMessage = input<string>('Nenhum registro encontrado.');

  columns = input.required<TableColumn[]>();

  /* Array de dados já paginados para exibir na tabela*/
  data = input.required<any[]>();

  /* Inputs de Paginação Diretos */
  currentPage = input<number>(1);
  itemsPerPage = input<number>(5);
  totalItems = input.required<number>();

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
  
  rowClassFn = input<(item: any) => string>();

  /* calculando paginação e ranges */
  totalPages = computed(() => Math.max(1, Math.ceil(this.totalItems() / this.itemsPerPage())));

  startIndex = computed(() => (this.currentPage() - 1) * this.itemsPerPage());
  endIndex = computed(() => Math.min(this.startIndex() + this.itemsPerPage(), this.totalItems()));

  pages = computed(() => {
    const total = this.totalPages();
    const current = this.currentPage();
    const delta = 1;

    if (total <= 5) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }

    const pagesArr: (number | string)[] = [];
    pagesArr.push(1);

    if (current - delta > 2) {
      pagesArr.push('...');
    }

    for (let i = Math.max(2, current - delta); i <= Math.min(total - 1, current + delta); i++) {
      pagesArr.push(i);
    }

    if (current + delta < total - 1) {
      pagesArr.push('...');
    }

    if (total > 1) {
      pagesArr.push(total);
    }

    return pagesArr;
  });

  onPageChange(page: number | string): void {
    if (typeof page === 'number' && page >= 1 && page <= this.totalPages()){
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
