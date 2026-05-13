import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnChanges,
  OnDestroy,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import {
  BarController,
  BarElement,
  CategoryScale,
  Chart,
  Legend,
  LinearScale,
  Tooltip,
} from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { Movimentacao } from '../../core/models/movimentacao';

Chart.register(BarController, BarElement, CategoryScale, LinearScale, Tooltip, Legend, ChartDataLabels);

const COR_ENTRADA_BG = '#dae2ff';
const COR_ENTRADA_TEXTO = '#0051c3';
const COR_SAIDA_BG = '#ffdcc7';
const COR_SAIDA_TEXTO = '#6a3100';

@Component({
  selector: 'app-movimentacoes-chart',
  imports: [],
  templateUrl: './movimentacoes-chart.html',
  styleUrl: './movimentacoes-chart.css',
})
export class MovimentacoesChart implements AfterViewInit, OnChanges, OnDestroy {
  @Input({ required: true }) movimentacoes: Movimentacao[] = [];
  @Input() loading = false;

  @ViewChild('movimentacoesChart') chartCanvas?: ElementRef<HTMLCanvasElement>;

  private chart?: Chart<'bar'>;
  private viewReady = false;

  ngAfterViewInit(): void {
    this.viewReady = true;
    this.renderChart();
  }

  ngOnChanges(_changes: SimpleChanges): void {
    this.renderChart();
  }

  ngOnDestroy(): void {
    this.chart?.destroy();
  }

  private calcularDados(): { labels: string[]; entradas: number[]; saidas: number[] } {
    const hoje = new Date();
    const meses: { label: string; ano: number; mes: number }[] = [];

    for (let i = 5; i >= 0; i--) {
      const d = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1);
      meses.push({
        label: d.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' }),
        ano: d.getFullYear(),
        mes: d.getMonth(),
      });
    }

    const entradas = meses.map((m) =>
      this.movimentacoes
        .filter((mov) => {
          const t = new Date(mov.timestamp);
          return mov.tipo === 'entrada' && t.getFullYear() === m.ano && t.getMonth() === m.mes;
        })
        .reduce((acc, mov) => acc + Number(mov.quantidade), 0)
    );

    const saidas = meses.map((m) =>
      this.movimentacoes
        .filter((mov) => {
          const t = new Date(mov.timestamp);
          return mov.tipo === 'saida' && t.getFullYear() === m.ano && t.getMonth() === m.mes;
        })
        .reduce((acc, mov) => acc + Number(mov.quantidade), 0)
    );

    return { labels: meses.map((m) => m.label), entradas, saidas };
  }

  private renderChart(): void {
    if (!this.viewReady || this.loading) return;

    queueMicrotask(() => {
      const canvas = this.chartCanvas?.nativeElement;
      if (!canvas) return;

      this.chart?.destroy();

      const { labels, entradas, saidas } = this.calcularDados();

      this.chart = new Chart(canvas, {
        type: 'bar',
        data: {
          labels,
          datasets: [
            {
              label: 'Entradas',
              data: entradas,
              backgroundColor: COR_ENTRADA_BG,
              borderColor: COR_ENTRADA_TEXTO,
              borderWidth: 1.5,
              borderRadius: 6,
            },
            {
              label: 'Saídas',
              data: saidas,
              backgroundColor: COR_SAIDA_BG,
              borderColor: COR_SAIDA_TEXTO,
              borderWidth: 1.5,
              borderRadius: 6,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          layout: { padding: { top: 20 } },
          plugins: {
            legend: {
              display: true,
              position: 'top',
              labels: {
                boxWidth: 12,
                boxHeight: 12,
                borderRadius: 4,
                useBorderRadius: true,
                font: { size: 11, weight: 'bold' },
                color: '#434653',
              },
            },
            tooltip: { enabled: false },
            
            datalabels: {
              anchor: 'end',
              align: 'end',
              offset: 2,
              font: { size: 10, weight: 'bold' },
              formatter: (value: number) => (value === 0 ? '' : value),
              color: (ctx) =>
                ctx.datasetIndex === 0 ? COR_ENTRADA_TEXTO : COR_SAIDA_TEXTO,
            },
          },
          scales: {
            x: {
              grid: { display: false },
              ticks: { font: { size: 11 }, color: '#434653' },
            },
            y: {
              beginAtZero: true,
              ticks: { precision: 0, font: { size: 11 }, color: '#434653' },
              grid: { color: 'rgba(0,0,0,0.05)' },
            },
          },
        },
      });
    });
  }
}
