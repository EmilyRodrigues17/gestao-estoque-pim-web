import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { InsumoService } from '../../../core/services/insumo.service';
import { MovimentacaoService } from '../../../core/services/movimentacao.service';
import { AuthService } from '../../../core/auth/auth.service';
import { Insumo } from '../../../core/models/insumo';
import { CreateMovimentacao } from '../../../core/models/movimentacao';

@Component({
  selector: 'app-nova-movimentacao',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './nova-movimentacao.html',
  styleUrl: './nova-movimentacao.css',
})
export class NovaMovimentacao implements OnInit {
  private insumoService = inject(InsumoService);
  private movimentacaoService = inject(MovimentacaoService);
  private authService = inject(AuthService);

  private router = inject(Router);

  // ---
  form = new FormGroup({
    tipo: new FormControl('entrada', [Validators.required]),
    motivo: new FormControl('compra', [Validators.required]),
    quantidade: new FormControl<number | null>(null, [Validators.required, Validators.min(0.01)]),
    linha_destino: new FormControl(''),
    observacao: new FormControl(''),
  });

  // ---
  insumos = signal<Insumo[]>([]);
  searchTerm = signal('');
  selectedInsumo = signal<Insumo | null>(null);

  loading = signal(false);
  successMessage = signal<string | null>(null);
  error = signal<string | null>(null);

  dataAtualFormatada = (() => {
    const data = new Date();
    const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    return `${data.getDate().toString().padStart(2, '0')} ${meses[data.getMonth()]}, ${data.getFullYear()}`;
  })();

  quantidade = signal(0);
  tipo = signal('entrada');
  motivo = signal('compra');

  estoqueAtual = computed(() => Number(this.selectedInsumo()?.estoque_atual) || 0);
  
  saldoPrevisto = computed(() => {
    const quantidade = this.quantidade() || 0;
    if (this.tipo() === 'entrada') {
      return this.estoqueAtual() + quantidade;
    }
    return this.estoqueAtual() - quantidade;
  });

  abaixoMinimo = computed(() => {
    const min = this.selectedInsumo()?.estoque_minimo || 0;
    return !!this.selectedInsumo() && this.saldoPrevisto() < min;
  });

  acimaMaximo = computed(() => {
    const max = this.selectedInsumo()?.estoque_maximo;

    if (max === null || max === undefined) return false;
    return !!this.selectedInsumo() && this.saldoPrevisto() > max;
  });

  filteredInsumos = computed(() => {
    const term = this.searchTerm().toLowerCase();
    return this.insumos().filter(insumo => 
      insumo.ativo && 
      (insumo.nome.toLowerCase().includes(term) || insumo.codigo.toLowerCase().includes(term))
    );
  });

  ngOnInit() {
    this.carregarInsumos();

    this.form.get('quantidade')?.valueChanges.subscribe(valor => {
      this.quantidade.set(Number(valor) || 0);
    });

    this.form.get('tipo')?.valueChanges.subscribe(valor => {
      this.tipo.set(valor || '');
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

  carregarInsumos() {
    this.insumoService.findAll().subscribe({
      next: (data) => this.insumos.set(data),
      error: (err) => {
        console.error('Erro ao carregar insumos', err);
        this.error.set('Falha ao carregar a lista de insumos.');
      }
    });
  }

  onSearchTermChange(event: Event) {
    const target = event.target as HTMLInputElement;
    this.searchTerm.set(target.value);
    
    if (this.selectedInsumo() && target.value !== this.selectedInsumo()?.nome) {
      this.selectedInsumo.set(null);
    }
  }

  selectInsumo(insumo: Insumo) {
    this.selectedInsumo.set(insumo);
    this.searchTerm.set(insumo.nome);
    this.error.set('');
  }

  clearSelection() {
    this.selectedInsumo.set(null);
    this.searchTerm.set('');
    this.error.set('');
    
    const input = document.getElementById('insumo-search') as HTMLInputElement;
    if (input) {
      input.focus();
    }
  }

  onSubmit() {
    this.error.set('');

    if (!this.selectedInsumo()) {
      this.error.set('Por favor, selecione um insumo.');
      return;
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    if (this.acimaMaximo()) {
      this.error.set('Erro: A operação excede o estoque máximo permitido para este insumo.');
      return;
    }

    const userNome = this.authService.usuario()?.nome;
    if (!userNome) {
       this.error.set('Erro: Usuário não autenticado.');
       return;
    }

    this.loading.set(true);

    const dados = this.form.getRawValue();

    const payload: CreateMovimentacao = {
      insumo_id: this.selectedInsumo()!.id,
      tipo: dados.tipo!,
      motivo: dados.motivo!,
      quantidade: Number(dados.quantidade),
      linha_destino: dados.linha_destino || null,
      observacao: dados.observacao || null,
      registrado_por: userNome
    };

    this.movimentacaoService.create(payload).subscribe({
      next: () => {
        this.successMessage.set('Movimentação registrada com sucesso!');
        this.form.markAsPristine();
        this.loading.set(false);
        this.router.navigate(['/app/movimentacoes']);
      },
      error: (err) => {
        if (err.error?.message) {
          this.error.set(err.error.message);
        } else {
          this.error.set('Erro ao registrar movimentação. Tente novamente.');
        }
        this.loading.set(false);
      }
    });
  }
}
