import { Component, inject, signal } from '@angular/core';
import { AuthService } from '../../core/auth/auth.service';
import { Router } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TrocarSenhaRequest } from '../../core/models/auth';

@Component({
  selector: 'app-trocar-senha',
  imports: [ReactiveFormsModule],
  templateUrl: './trocar-senha.html',
  styleUrl: './trocar-senha.css',
})
export class TrocarSenha {
  private authService = inject(AuthService);
  private router = inject(Router);

  error = signal<string | null>(null);
  sucesso = signal(false);
  loading = signal(false);

  form = new FormGroup({
    senhaAtual: new FormControl('', [Validators.required, Validators.minLength(6)]),
    novaSenha: new FormControl('', [Validators.required, Validators.minLength(6)]),
    confirmarSenha: new FormControl('', [Validators.required]),
  })

  onSubmit(): void {
    if (this.form.invalid) return;

    const { senhaAtual, novaSenha, confirmarSenha } = this.form.getRawValue();
    if (novaSenha !== confirmarSenha) {
      this.error.set('As senhas não coincidem');
      return;
    }
    this.loading.set(true);
    this.error.set(null);

    const dadosSenhasRequest = {
      senhaAtual, novaSenha
    } as TrocarSenhaRequest

    this.authService.trocarSenha(dadosSenhasRequest).subscribe({
      next: () => {
        this.loading.set(false);
        this.sucesso.set(true);
        setTimeout(() => this.router.navigate(['/app/dashboard']), 2000);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err.error?.message ?? 'Erro ao trocar senha');
      },
    });
  }
}
