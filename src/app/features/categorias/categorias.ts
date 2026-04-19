import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DataTable } from '../../shared/data-table/data-table';
import { PaginationInfo, TableColumn } from '../../core/models/data-table';
import { CategoriaService } from '../../core/services/categoria.service';
import { Categoria } from '../../core/models/categoria';

@Component({
  selector: 'app-categorias',
  imports: [DataTable, FormsModule],
  templateUrl: './categorias.html',
  styleUrl: './categorias.css',
})
export class Categorias implements OnInit {
  private categoriaService = inject(CategoriaService);

  // Configuração das colunas da tabela exibida
  columns: TableColumn[] = [
    { key: 'nome',              header: 'Nome' },
    { key: 'descricao',         header: 'Descrição' },
    { key: 'insumosVinculados', header: 'Insumos Vinculados', type: 'badge' },
  ];

  categorias = signal<Categoria[]>([]);

  pagination = signal<PaginationInfo>({
    currentPage: 1,
    totalItems: 0,
    itemsPerPage: 5,
  });

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
        this.pagination.update(p => ({
          ...p,
          totalItems: categorias.length,
        }));
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

  onPageChange(page: number): void {
    this.pagination.update(p => ({ ...p, currentPage: page }));
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
