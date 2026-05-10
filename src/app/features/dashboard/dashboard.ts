import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { DashboardService } from '../../core/services/dashboard.service';
import { NgClass } from '@angular/common';
import { DashboardData, InsumoCritico } from '../../core/models/dashboard';
import { Router } from '@angular/router';
import { DataTable } from '../../shared/data-table/data-table';
import { TableColumn } from '../../core/models/data-table';

@Component({
  selector: 'app-dashboard',
  imports: [NgClass, DataTable],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit{
  private dashboardService = inject(DashboardService);
  private router = inject(Router);

  columns: TableColumn[] = [
    { key: 'insumo', header: 'Insumo', type: 'custom' },
    { key: 'categoria', header: 'Categoria', type: 'custom' },
    { key: 'estoque_atual', header: 'Estoque Atual', type: 'custom' },
    { key: 'estoque_minimo', header: 'Estoque Mínimo', type: 'custom' },
    { key: 'status', header: 'Status Crítico', type: 'custom' },
    { key: 'acoes', header: 'Ações', type: 'custom', align: 'right' }
  ];

  dashboardData = signal<DashboardData | null>(null);

  currentPage = signal<number>(1);
  itemsPerPage = signal<number>(5);

  totalItems = computed(() => this.dashboardData()?.insumosCriticos?.length || 0);

  paginatedInsumos = computed(() => {
    const insumos = this.dashboardData()?.insumosCriticos || [];
    const start = (this.currentPage() - 1) * this.itemsPerPage();
    const end = start + this.itemsPerPage();
    return insumos.slice(start, end);
  });

  getStatusClass(status: string): string {
    const map: { [key: string]: string } = {
      'critico': 'bg-error text-error',
      'atencao': 'bg-warning text-warning',
      'limite_proximo': 'bg-info text-info',
      'estavel': 'bg-success text-success'
    };
    return map[status] || 'bg-tertiary text-tertiary';
  }

  getLabel(insumo: InsumoCritico): string {  
    const labels: { [key: string]: string } = {
      'critico': 'Crítico',
      'atencao': 'Atenção',
      'limite_proximo': 'Nível Alto',
      'estavel': 'Estável'
    };
    
    const statusKey = insumo.status as string; 
    return `${labels[statusKey] || 'Estoque'}: ${insumo.percentual.toString()} %`;
  }

  ngOnInit(): void {
    this.dashboardService.getDashboardData().subscribe({
      next: (dados) => {
        this.dashboardData.set(dados);
        this.currentPage.set(1);
      },
      error: (err) => {
        console.error('Erro ao carregar dados do dashboard', err);
      }
    });
  }

  onPageChange(page: number | string) {
    if (typeof page === 'number') {
      this.currentPage.set(page);
    }
  }

  onTableAction(action: string, insumo: InsumoCritico): void {
    if (action === 'search') {
      this.router.navigate(['/app/insumos', insumo.id]);
    }
  }
}

