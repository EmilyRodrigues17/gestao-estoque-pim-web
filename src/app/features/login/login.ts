import { Component, inject, signal } from '@angular/core';
import { AuthService } from '../../core/auth/auth.service';
import { Router } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { LoginRequest } from '../../core/models/auth';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  private authService = inject(AuthService);
  private router = inject(Router);
  
  error = signal<string | null>(null);
  loading = signal(false);

  form = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    senha: new FormControl('', [Validators.required, Validators.minLength(6)]),
  })


  onSubmit(): void {
    if (this.form.invalid) return;
    
    this.loading.set(true);
    this.error.set(null);

    const dados = this.form.getRawValue();
    this.authService.login(dados as LoginRequest).subscribe({
      next: (res) => {
        this.loading.set(false);
        if (res.trocarSenha) {
          this.router.navigate(['/trocar-senha']);
        } else {
          this.router.navigate(['/app/dashboard']);
        }
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err.error?.message ?? 'Erro ao fazer login');
      },
    });
  }
}
