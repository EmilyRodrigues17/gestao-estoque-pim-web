import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { InsumoService } from '../../../core/services/insumo.service';
import { ActivatedRoute } from '@angular/router';
import { Insumo } from '../../../core/models/insumo';
import { MovimentacaoService } from '../../../core/services/movimentacao.service';
import { DataTable } from '../../../shared/data-table/data-table';
import { TableColumn } from '../../../core/models/data-table';
import { CreateMovimentacao, Movimentacao } from '../../../core/models/movimentacao';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../core/auth/auth.service';
import { PerfilAcesso } from '../../../core/models/perfil-acesso';
import { DatePipe } from '@angular/common';
import { MovimentacoesChart } from '../../../shared/movimentacoes-chart/movimentacoes-chart';



@Component({
  selector: 'app-insumo-details',
  imports: [DataTable, ReactiveFormsModule, DatePipe, MovimentacoesChart],
  templateUrl: './insumo-details.html',
  styleUrl: './insumo-details.css',
})
export class InsumoDetails implements OnInit {
  private insumoService = inject(InsumoService);
  private MovimentacaoService = inject(MovimentacaoService);
  private authService = inject(AuthService);

  private route = inject(ActivatedRoute);

  protected readonly isGestor = computed(() => this.authService.perfilUsuario() === PerfilAcesso.GESTOR);

  columns: TableColumn[] = [
      { key: 'timestamp', header: 'Data e Hora', type: 'custom' },
      { key: 'tipo', header: 'Tipo', type: 'custom' },
      { key: 'motivo', header: 'Motivo' },
      { key: 'quantidade', header: 'Quantidade', type: 'custom'},
      { key: 'saldo_apos', header: 'Saldo Apos', type: 'custom'},
      { key: 'linha_destino', header: 'Destino', type: 'custom'},
      { key: 'observacao', header: 'Observacao', type: 'custom'},
      { key: 'registrado_por', header: 'Responsavel', type: 'custom'}
  ];

  // ---
  insumo = signal<Insumo | null>(null);
  historicoMovimentacao = signal<Movimentacao[]>([]);

  error = signal<string | null>(null);
  successMessage = signal<string | null>(null);
  loading = signal(false);

  currentPage = signal<number>(1);
  itemsPerPage = signal<number>(5);
  
  totalItems = computed(() => this.historicoMovimentacao()?.length || 0);

  paginatedMovimentacoes = computed(() => {
    const movimentacoes = this.historicoMovimentacao() || [];
    const start = (this.currentPage() - 1) * this.itemsPerPage();
    const end = start + this.itemsPerPage();
    return movimentacoes.slice(start, end);
  });

  consumoMedioPorDia = computed(() => {
    const saidas = this.historicoMovimentacao().filter(mov => mov.tipo === 'saida');
    if (saidas.length === 0) return 0;

    const totalConsumido = saidas.reduce((acc, m) => acc + Number(m.quantidade), 0);

    const timestamps = this.historicoMovimentacao().map(m => new Date(m.timestamp).getTime());
    const maisAntiga = new Date(Math.min(...timestamps));
    const hoje = new Date();
    const diasAtividade = Math.max(1, Math.ceil((hoje.getTime() - maisAntiga.getTime()) / (1000 * 60 * 60 * 24)));

    return Math.round((totalConsumido / diasAtividade) * 100) / 100;
  });

  diasParaZerarEstoque = computed(() => {
    const media = this.consumoMedioPorDia();
    const saldo = Number(this.insumo()?.estoque_atual ?? 0);
    if (media === 0) return null;
    return Math.floor(saldo / media);
  });

  showModal = signal(false);

  quantidadeDigitada = signal<number>(0);
  tipoSelecionado = signal<string>('');

  // ----
  form = new FormGroup({
    tipo: new FormControl('', [Validators.required]),
    motivo: new FormControl('', [Validators.required]),
    quantidade: new FormControl<number | null>(null, [Validators.required, Validators.min(0.01)]),
    linha_destino: new FormControl(''),
    observacao: new FormControl(''),
  });

  // --- Calculos
  saldoPrevisto = computed(() => {
    const estoqueAtual = Number(this.insumo()?.estoque_atual) ?? 0;
    const quantidade = this.quantidadeDigitada();
    const tipo = this.tipoSelecionado();

    if (!tipo || !quantidade) return estoqueAtual;

    if (tipo === 'entrada') {
      return estoqueAtual + quantidade;
    } else {
      return estoqueAtual - quantidade;
    }
  })

  acimaMaximo = computed(() => {
    const max = Number(this.insumo()?.estoque_maximo) || 0;
    if (max === 0) return false;
    return this.saldoPrevisto() > max;
  });

  estoqueZerado = computed(() => {
    return this.saldoPrevisto() === 0 && this.quantidadeDigitada() > 0;
  });

  // ---
  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.carregarDetalheInsumo(id);
    this.carregarHistoricoMovimentacao(id);

    this.form.get('quantidade')?.valueChanges.subscribe(valor => {
      this.quantidadeDigitada.set(Number(valor) || 0);
    });

    this.form.get('tipo')?.valueChanges.subscribe(valor => {
      this.tipoSelecionado.set(valor || '');
    });

    this.form.get('motivo')?.valueChanges.subscribe(motivo => {
      const linhaDestino = this.form.get('linha_destino')!;
      const observacao = this.form.get('observacao')!;

      if (motivo === 'consumo'){
        linhaDestino.setValidators([Validators.required]);
      } else {
        linhaDestino.clearValidators();
      }
      linhaDestino.updateValueAndValidity();

      if (motivo === 'ajuste' || motivo === 'perda'){
        observacao.setValidators([Validators.required]);
      } else {
        observacao.clearValidators();
      }
      observacao.updateValueAndValidity();
    })


  }

  carregarDetalheInsumo(id: string): void {
    this.loading.set(true);

    this.insumoService.findById(id).subscribe({
      next: (insumo) => {
        this.insumo.set(insumo);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Erro ao carregar informacao de insumo')
      }
    })
  }

  carregarHistoricoMovimentacao(id: string): void {
    this.MovimentacaoService.findAll({insumo_id: id}).subscribe({
      next: (movimentacoes) => {
        this.historicoMovimentacao.set(movimentacoes)
      },
      error: (err) => {
        console.log('Erro ao carregar historico de movimentacao: ', err)
      }
    })
  }


  
  onPageChange(page: number | string) {
    if (typeof page === 'number') {
      this.currentPage.set(page);
    }
  }


  // --- Modal formulario
  onOpenCreate(): void {
    this.form.reset();
    this.showModal.set(true);
  }

  onCloseForm(): void {
    if (this.form.dirty) {
      const confirmar = confirm('Você tem alterações não salvas. Deseja sair mesmo assim?');
      if (!confirmar) return;
    }
    this.showModal.set(false);
    this.form.reset();
    this.error.set(null)
  }

  onSubmit(): void {
    if (this.form.invalid){
      this.form.markAllAsTouched();
      return;
    }
  
    this.loading.set(true);
    this.error.set(null);
  
    const dados = this.form.getRawValue();

    const userId = this.authService.usuario()?.id;
    if (!userId) {
       this.error.set('Erro: Usuário não autenticado.');
       return;
    }

    const payload: CreateMovimentacao = {
      insumo_id: this.insumo()!.id,
      tipo: dados.tipo!,
      motivo: dados.motivo!,
      quantidade: Number(dados.quantidade),
      linha_destino: dados.linha_destino || null,
      observacao: dados.observacao || null,
      registrado_por: userId,
    };

    this.MovimentacaoService.create(payload).subscribe({
      next: () => {
        this.successMessage.set('Movimentação registrada com sucesso!');
        this.form.markAsPristine();
        this.showModal.set(false);
        this.form.reset();
        this.loading.set(false);

        const id = this.route.snapshot.paramMap.get('id')!;
        this.carregarDetalheInsumo(id);
        this.carregarHistoricoMovimentacao(id);
      },
      error: (err) => {
        if (err.error?.message) {
          this.error.set(err.error.message);
        } else {
          this.error.set('Erro ao registrar movimentação. Tente novamente.');
        }
        this.loading.set(false);
      },
    })
    
  }

}
