import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { TableColumn } from '../../core/models/data-table';
import { InsumoService } from '../../core/services/insumo.service';
import { CategoriaService } from '../../core/services/categoria.service';
import { CreateInsumo, Insumo } from '../../core/models/insumo';
import { Categoria } from '../../core/models/categoria';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { HasUnsavedChanges } from '../../core/guards/unsaved-changes-guard';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { PerfilAcesso } from '../../core/models/perfil-acesso';
import { NgClass } from '@angular/common';
import { DataTable } from '../../shared/data-table/data-table';

@Component({
  selector: 'app-insumos',
  imports: [ReactiveFormsModule, FormsModule, NgClass, DataTable],
  templateUrl: './insumos.html',
  styleUrl: './insumos.css',
})
export class Insumos implements OnInit, HasUnsavedChanges{
  private insumoService = inject(InsumoService);
  private categoriaService = inject(CategoriaService);
  private authService = inject(AuthService);
  
  private router = inject(Router);

  protected readonly isGestor = computed(() => this.authService.perfilUsuario() === PerfilAcesso.GESTOR);

  // ---
  insumos = signal<Insumo[]>([]);
  categorias = signal<Categoria[]>([]);

  loading = signal(false);
  error = signal<string | null>(null);
  visibleErrorForm = signal(false)
  successMessage = signal<string | null>(null);

  currentPage = signal<number>(1);
  itemsPerPage = signal<number>(5);

  totalItems = computed(() => this.insumos()?.length || 0);

  paginatedInsumos = computed(() => {
    const insumos = this.insumos() || [];
    const start = (this.currentPage() - 1) * this.itemsPerPage();
    const end = start + this.itemsPerPage();
    return insumos.slice(start, end);
  });

  columns: TableColumn[] = [
    { key: 'insumo', header: 'Insumo', type: 'custom' },
    { key: 'categoria', header: 'Categoria', type: 'custom' },
    { key: 'estoque_atual', header: 'Estoque Atual', type: 'custom' },
    { key: 'estoque_minimo', header: 'Estoque Mínimo' },
    { key: 'estoque_maximo', header: 'Estoque Máximo' },
    { key: 'status_estoque', header: 'Status Estoque', type: 'custom' },
    { key: 'acoes', header: 'Ações', type: 'custom' }
  ];
  // ---
  showModal = signal(false);
  editId = signal<string | null>(null);

  // ---
  filtroAtivo = '';
  filtroBusca = '';
  filtroCategoria ='';
  filtroStatus = '';

  getStatusClass(status: string): string {
    const map: { [key: string]: string } = {
      'critico': 'bg-error text-error',
      'atencao': 'bg-warning text-warning',
      'limite_proximo': 'bg-info text-info',
      'estavel': 'bg-success text-success'
    };
    return map[status] || 'bg-tertiary text-tertiary';
  }

  getLabel(insumo: any): string {  
      const labels: { [key: string]: string } = {
        'critico': 'Crítico',
        'atencao': 'Atenção',
        'limite_proximo': 'Nível Alto',
        'estavel': 'Estável'
      };
      
      return `${labels[insumo.status_estoque] || 'Estoque'}: ${insumo.percentual} %`;
  }

  // Formulario
  form = new FormGroup({
    codigo: new FormControl('', [Validators.required, Validators.maxLength(100)]),
    nome: new FormControl('', [Validators.required, Validators.maxLength(100)]),
    descricao: new FormControl('', null),
    categoria_id: new FormControl('', [Validators.required]),
    unidade_medida: new FormControl('', [Validators.required]),
    estoque_minimo: new FormControl(0, [Validators.required, Validators.min(1)]),
    estoque_maximo: new FormControl(0, null),
    localizacao: new FormControl('', null),
  })

  // -----
  ngOnInit(): void {
    this.carregarInsumos();
    this.carregarCategorias();
  }

  // ----
  carregarInsumos(): void {
    const filtros: { nome?: string, codigo?: string, categoriaId?: string, statusEstoque?: string } = {};

    if (this.filtroBusca) filtros.nome = this.filtroBusca.toLocaleLowerCase().trim();
    if (this.filtroBusca) filtros.codigo = this.filtroBusca.trim();
    if (this.filtroCategoria) filtros.categoriaId = this.filtroCategoria;
    if (this.filtroStatus) filtros.statusEstoque = this.filtroStatus;

    this.loading.set(true);

    this.insumoService.findAll(filtros).subscribe({
      next: (insumos) => {
        this.limparMensagens();

        const insumosEditados = insumos.map(insumo => {
          const atual = Number(insumo.estoque_atual);
          const min = Number(insumo.estoque_minimo);
          const max = insumo.estoque_maximo ? Number(insumo.estoque_maximo) : null;
          const maxCalculo = max ?? (min + 200);

          const percentualBruto = maxCalculo > 0 ? (atual / maxCalculo) * 100 : 0;
          const percentual = Math.min(Math.round(percentualBruto), 100);

          const nomeCategoria = insumo.categoria.nome

          return {
            ...insumo,
            categoria: {nome: nomeCategoria},
            percentual
          }

        });

        this.insumos.set(insumosEditados);
        this.currentPage.set(1);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Erro ao carregar listagem de insumos.');
        this.loading.set(false);
      }
    })
  }

  carregarCategorias(): void {
    this.categoriaService.findAll().subscribe({
      next: (categorias) => {
        this.categorias.set(categorias)
      },
      error: (err) => {
        console.log('Erro ao carregar categorias: ', err)
      }
    })
  }

  // --- Modal Formulario
  onOpenCreate(): void {
    
    this.editId.set(null);
    this.form.reset();
    this.showModal.set(true);
    this.limparMensagens();
  }

  onOpenEdit(insumo: any): void {
    this.editId.set(insumo.id);

    this.form.patchValue({
      codigo: insumo.codigo,
      nome: insumo.nome,
      descricao: insumo.descricao,
      categoria_id: insumo.categoria_id,
      unidade_medida: insumo.unidade_medida,
      estoque_minimo: insumo.estoque_minimo,
      estoque_maximo: insumo.estoque_maximo,
      localizacao: insumo.localizacao,
    });
    this.showModal.set(true);
    this.limparMensagens();
  }

  onCloseForm(): void {
    if (this.form.dirty) {
      const confirmar = confirm('Você tem alterações não salvas. Deseja sair mesmo assim?');
      if (!confirmar) return;
    }
    this.showModal.set(false);
    this.editId.set(null);
    this.form.reset();
    this.error.set(null)
  }

  // -----
  onSubmit(): void {
    if (this.form.invalid){
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.limparMensagens();

    if (this.editId()){
      const dados: Record<string, any> = {};
      Object.keys(this.form.controls).forEach(key => {
        const control = this.form.get(key);
        if (control?.dirty) {
          dados[key] = control.value;
        }
      });

      delete dados['categoria_id'];

      this.insumoService.update(this.editId()!, dados).subscribe({
        next: () => {
          this.successMessage.set('Insumo atualizado com sucesso!');
          this.form.markAsPristine();
          this.onCloseForm();
          this.carregarInsumos();
        },
        error: (err) => {
          this.tratarErro(err, 'atualizar');
          this.loading.set(false);
        },
      });
    } else {
      const dados = this.form.getRawValue();
      this.insumoService.create(dados as CreateInsumo).subscribe({
        next: () => {
          this.successMessage.set('Insumo cadastrado com sucesso!');
          this.form.markAsPristine();
          this.onCloseForm();
          this.carregarInsumos();
        },
        error: (err) => {
          this.visibleErrorForm.set(true);
          this.tratarErro(err, 'cadastrar');
          this.loading.set(false);
        },
      })
    }
  }

  hasUnsavedChanges(): boolean {
    return this.form.dirty && this.showModal();
  }

  private limparMensagens(): void {
    this.error.set(null);
    this.successMessage.set(null);
  }
  
  private tratarErro(err: any, acao: string): void {
    if (err.error?.message) {
      this.error.set(err.error.message);
    } else {
      this.error.set(`Erro ao ${acao} insumo. Tente novamente.`);
    }
    console.error(`Erro ao ${acao} insumo:`, err);
  }

  
  onTableAction(event: string, insumo: any): void {
    switch (event) {
      case 'search':
        this.router.navigate(['/app/insumos', insumo.id]);
        break;
      case 'edit':
        if (this.isGestor()) return;
        this.onOpenEdit(insumo);
        break;
      case 'deactivate':
        if (this.isGestor()) return;
        if (confirm(`Deseja realmente desativar o insumo "${insumo.nome}"? Ele não estará mais disponível para novas movimentações.`)) {
          this.loading.set(true);
          this.insumoService.delete(insumo.id).subscribe({
            next: () => {
              this.successMessage.set('Insumo desativado com sucesso!');
              this.carregarInsumos();
            },
            error: (err) => {
              this.tratarErro(err, 'desativar');
              this.loading.set(false);
            }
          });
        }
        break;
      case 'reactivate':
        if (this.isGestor()) return;
        if (confirm(`Deseja realmente reativar o insumo "${insumo.nome}"?`)) {
          this.loading.set(true);
          this.insumoService.update(insumo.id, { ativo: true }).subscribe({
            next: () => {
              this.successMessage.set('Insumo reativado com sucesso!');
              this.carregarInsumos();
            },
            error: (err) => {
              this.tratarErro(err, 'reativar');
              this.loading.set(false);
            }
          });
        }
        break;
    }
  }

  onFiltroTipoChange(): void {
    this.carregarInsumos();
  }

  onPageChange(page: number | string) {
    if (typeof page === 'number') {
      this.currentPage.set(page);
    }
  }

}
