
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { DataTable } from '../../shared/data-table/data-table';
import { MovimentacaoService } from '../../core/services/movimentacao.service';
import { TableColumn } from '../../core/models/data-table';
import { Movimentacao } from '../../core/models/movimentacao';
import { FormsModule } from '@angular/forms';
import { InsumoService } from '../../core/services/insumo.service';
import { Insumo } from '../../core/models/insumo';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { PerfilAcesso } from '../../core/models/perfil-acesso';



@Component({
  selector: 'app-movimentacoes',
  imports: [FormsModule, DataTable],
  templateUrl: './movimentacoes.html',
  styleUrl: './movimentacoes.css',
})
export class Movimentacoes implements OnInit {
  private movimentacaoService = inject(MovimentacaoService);
  private insumoService = inject(InsumoService);
  private authService = inject(AuthService);

  protected readonly isGestor = computed(() => this.authService.perfilUsuario() === PerfilAcesso.GESTOR);

  private router = inject(Router)

  columns: TableColumn[] = [
    { key: 'timestamp', header: 'Data e Hora' },
    { key: 'insumo', header: 'Insumo', type: 'custom' },
    { key: 'tipo', header: 'Tipo', type: 'custom' },
    { key: 'motivo', header: 'Motivo' },
    { key: 'quantidade', header: 'Quantidade', type: 'custom' },
    { key: 'saldo_apos', header: 'Saldo Apos', type: 'custom' },
    { key: 'linha_destino', header: 'Destino', type: 'custom' },
    { key: 'registrado_por', header: 'Responsavel', type: 'custom' }
  ];

  // ---
  historicoMovimentacao = signal<Movimentacao[]>([]);
  insumos = signal<Insumo[]>([]);
  
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

  // --
  filtroTipo = '';
  filtroInsumoId = '';
  filtroMotivo = '';
  filtroDataInicio = '';
  filtroDataFim = '';

  ngOnInit(): void {
    this.carregarHistoricoMovimentacao();
    this.carregarInsumos();
  }

  carregarHistoricoMovimentacao(): void {
    const filtros: { tipo?: string, insumo_id?: string, motivo?: string, dataInicio?: string, dataFim?: string } = {};
    if (this.filtroTipo) filtros.tipo = this.filtroTipo;
    if (this.filtroInsumoId) filtros.insumo_id = this.filtroInsumoId;
    if (this.filtroMotivo) filtros.motivo = this.filtroMotivo;
    if (this.filtroDataInicio) filtros.dataInicio = this.filtroDataInicio;
    if (this.filtroDataFim) filtros.dataFim = this.filtroDataFim;

    this.movimentacaoService.findAll(filtros).subscribe({
      next: (movimentacoes) => {
        const movimentacoesEditadas = movimentacoes.map((mov) => {
          const d = new Date(mov.timestamp);
          const ts = `${d.getDate().toString().padStart(2,'0')}/${(d.getMonth()+1).toString().padStart(2,'0')}/${d.getFullYear()} ${d.getHours().toString().padStart(2,'0')}:${d.getMinutes().toString().padStart(2,'0')}`;
          return {
            ...mov,
            tipo: mov.tipo === 'entrada' ? '+Entrada' : '-Saída',
            motivo: mov.motivo.charAt(0).toUpperCase() + mov.motivo.slice(1),
            timestamp: ts,
          };
        });
        this.historicoMovimentacao.set(movimentacoesEditadas)
        this.currentPage.set(1);
      },
      error: (err) => {
        if (err.status === 404){
          console.log('Erro ao carregar historico de movimentacao: ', err)
          this.historicoMovimentacao.set([]);
          this.loading.set(false);
          return
        }
        console.log('Erro ao carregar historico de movimentacao: ', err)
      }
    })
  }

  carregarInsumos(): void {
    this.insumoService.findAll().subscribe({
      next: (insumos) => {
        this.insumos.set(insumos)
      },
      error: (err) => {
        console.log('Erro ao carregar insumos: ',err)
      }
    })
  }

  onFiltroTipoChange(): void {
    this.carregarHistoricoMovimentacao();
  }

  onPageChange(page: number | string) {
    if (typeof page === 'number') {
      this.currentPage.set(page);
    }
  }

  onOpenCreate(): void {
    this.router.navigate(['/app/movimentacoes/nova']);
  }
}
