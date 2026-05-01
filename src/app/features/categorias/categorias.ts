import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DataTable } from '../../shared/data-table/data-table';
import { TableColumn } from '../../core/models/data-table';
import { CategoriaService } from '../../core/services/categoria.service';
import { Categoria } from '../../core/models/categoria';

@Component({
  selector: 'app-categorias',
  imports: [FormsModule, DataTable],
  templateUrl: './categorias.html',
  styleUrl: './categorias.css',
})
export class Categorias implements OnInit {
  private categoriaService = inject(CategoriaService);


  categorias = signal<Categoria[]>([]);

  currentPage = signal<number>(1);
  itemsPerPage = signal<number>(5);
  
  totalItems = computed(() => this.categorias()?.length || 0);

  paginatedCategorias = computed(() => {
    const data = this.categorias() || [];
    const start = (this.currentPage() - 1) * this.itemsPerPage();
    const end = start + this.itemsPerPage();
    return data.slice(start, end);
  });

  columns: TableColumn[] = [
    { key: 'nome', header: 'Nome' },
    { key: 'descricao', header: 'Descrição' },
    { key: 'insumosVinculados', header: 'Insumos Vinculados', type: 'custom' },
    { key: 'acoes', header: 'Ações', type: 'custom', align: 'right' }
  ];

  editId = signal<string | null>(null);
  nome = signal('');
  descricao = signal('');

  loading = signal(false);
  error = signal<string | null>(null);
  successMessage = signal<string | null>(null);

  deleteTarget = signal<Categoria | null>(null);

  ngOnInit(): void {
    this.carregarCategorias();
  }

  carregarCategorias(): void {
    this.loading.set(true);
    this.categoriaService.findAll().subscribe({
      next: (categorias) => {
        this.categorias.set(categorias);
        this.currentPage.set(1);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Erro ao carregar listagem de categorias.');
        this.loading.set(false);
        console.error('Erro ao carregar listagem de categorias:', err);
      },
    });
  }

  onEdit(categoria: any): void {
    this.editId.set(categoria.id);
    this.nome.set(categoria.nome);
    this.descricao.set(categoria.descricao || '');
    this.limparMensagens();
  }

  onCancelEdit(): void {
    this.editId.set(null);
    this.nome.set('');
    this.descricao.set('');
  }

  onSubmit(): void {
    if (!this.nome().trim()) {
      this.error.set('O nome da categoria é obrigatório.');
      return;
    }

    this.loading.set(true);
    this.limparMensagens();

    const dto = {
      nome: this.nome().trim(),
      descricao: this.descricao().trim() || null,
    };

    if (this.editId()) {
      this.categoriaService.update(this.editId()!,dto)
        .subscribe({
        next: () => {
          this.successMessage.set('Categoria atualizada com sucesso!');
          this.onCancelEdit();
          this.carregarCategorias();
        },
        error: (err) => {
          this.tratarErro(err, 'atualizar');
          this.loading.set(false);
        },
      });
    } else {
      this.categoriaService.create(dto)
        .subscribe({
        next: () => {
          this.successMessage.set('Categoria criada com sucesso!');
          this.onCancelEdit();
          this.carregarCategorias();
        },
        error: (err) => {
          this.tratarErro(err, 'criar');
          this.loading.set(false);
        },
      });
    }
  }

  onDelete(categoria: any): void {
    this.deleteTarget.set(categoria);
    this.limparMensagens();
  }

  onCancelDelete(): void {
    this.deleteTarget.set(null);
  }

  onConfirmDelete(): void {
    const categoria = this.deleteTarget();
    if (!categoria) return;

    this.loading.set(true);
    this.limparMensagens();
    this.deleteTarget.set(null);

    this.categoriaService.delete(categoria.id).subscribe({
      next: () => {
        this.successMessage.set(`Categoria "${categoria.nome}" excluída com sucesso!`);
        this.carregarCategorias();
      },
      error: (err) => {
        this.tratarErro(err, 'excluir');
        this.loading.set(false);
      },
    });
  }

  onPageChange(page: number | string) {
    if (typeof page === 'number') {
      this.currentPage.set(page);
    }
  }

  /** Tratamento de erros da API */
  private tratarErro(err: any, acao: string): void {
    if (err.error?.message) {
      this.error.set(err.error.message);
    } else {
      this.error.set(`Erro ao ${acao} categoria. Tente novamente.`);
    }
    console.error(`Erro ao ${acao} categoria:`, err);
  }

  private limparMensagens(): void {
    this.error.set(null);
    this.successMessage.set(null);
  }
}
