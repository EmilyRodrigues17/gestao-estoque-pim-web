import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { DataTable } from '../../shared/data-table/data-table';
import { PaginationInfo, TableAction, TableColumn } from '../../core/models/data-table';
import { InsumoService } from '../../core/services/insumo.service';
import { CategoriaService } from '../../core/services/categoria.service';
import { CreateInsumo, Insumo } from '../../core/models/insumo';
import { Categoria } from '../../core/models/categoria';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { HasUnsavedChanges } from '../../core/guards/unsaved-changes-guard';

@Component({
  selector: 'app-insumos',
  imports: [DataTable, ReactiveFormsModule, FormsModule],
  templateUrl: './insumos.html',
  styleUrl: './insumos.css',
})
export class Insumos implements OnInit, HasUnsavedChanges{
  private insumoService = inject(InsumoService);
  private categoriaService = inject(CategoriaService); 

  // Config da tabela
  columns: TableColumn[] = [
      { key: 'codigo', header: 'Código' },
      { key: 'nome', header: 'Nome do Insumo' },
      { key: 'categoria.nome', header: 'Categoria' },
      { key: 'unidade_medida', header: 'Unidade'},
      { key: 'estoque_atual', header: 'Estoque Atual'},
      { key: 'status_estoque', header: 'Status Estoque', 
        type: 'badge', 
        badgeColors: {
          'Critico': 'bg-red-100 text-red-800',
          'Normal':  'bg-green-100 text-green-800',
          'Excesso': 'bg-blue-100 text-blue-800',
        }
    }
  ];

  insumosActions: TableAction[] = [
    { icon: 'visibility', label: 'Visualizar', event: 'view', color: 'hover:text-secondary hover:bg-secondary/5'},
    { icon: 'edit', label: 'Editar', event: 'edit', color: 'hover:text-primary hover:bg-primary/5'},
  ]

  // ---
  insumos = signal<Insumo[]>([]);
  categorias = signal<Categoria[]>([]);

  loading = signal(false);
  error = signal<string | null>(null);
  visibleErrorForm = signal(false)
  successMessage = signal<string | null>(null);

  pagination = signal<PaginationInfo>({
    currentPage: 1,
    totalItems: 0,
    itemsPerPage: 5,
  });

  // ---
  showModal = signal(false);
  editId = signal<string | null>(null);

  // ---
  filtroAtivo = signal(false);
  filtroBusca = signal('');
  filtroCategoria = signal('');
  filtroStatus = signal('');

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

  // Add string status em insumos
  insumosComStatus = computed(() => {
    return this.insumos().map(insumo => ({
      ...insumo,
      status_estoque: this.transformarStatus(insumo)
    }));
  })

  // -----
  ngOnInit(): void {
    this.carregarInsumos();
    this.carregarCategorias();
  }

  // -----
  carregarFiltrosInsumos(): void {
    this.loading.set(true);

    const filtros = {
      nome: this.filtroBusca().toLocaleLowerCase().trim(),
      codigo: this.filtroBusca().trim(),
      categoriaId: this.filtroCategoria(),
      statusEstoque: this.filtroStatus(),
    }

    this.insumoService.findAll(filtros).subscribe({
      next: (insumos) => {
        this.limparMensagens();
        this.insumos.set(insumos);
        this.pagination.update(p => ({ ...p, totalItems: insumos.length}));
        this.loading.set(false);
      },
      error: (err) => {
        if (err.status === 404){
          this.insumos.set([]);
          this.loading.set(false)
          return
        }
        this.error.set('Erro ao carregar insumos.');
        this.loading.set(false);
        console.log('Erro ao carregar insumos: ', err);
      }
    })
  }

  // ----
  carregarInsumos(): void {
    this.loading.set(true);
    this.insumoService.findAll().subscribe({
      next: (insumos) => {
        this.insumos.set(insumos);
        this.pagination.update(p => ({ ...p, totalItems: insumos.length}));
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Erro ao carregar listagem de insumos.');
        this.loading.set(false);
        console.log('Erro ao carregar listagem de insumos: ', err);
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
    console.log(insumo)
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

  private transformarStatus(insumo: Insumo): string {
    if (insumo.status_estoque === 'critico') return 'Critico';
    if (insumo.status_estoque === 'excesso') return 'Excesso';
    return 'Normal';
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

  

  onAction(event: { event: string, item: any}): void {
    switch (event.event) {
      case 'view':
        console.log('ir para a pagina de visualizar o insumo')
        break;
      case 'edit':
        this.onOpenEdit(event.item)
        console.log('abrir forms de edicao de insumo', event.item)
        break;
    }
  }

  
  onPageChange(page: number): void {
    this.pagination.update(p => ({ ...p, currentPage: page }));
    console.log('Ir para página:', page);
  }

}
