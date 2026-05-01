import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import type {
  LoginRequest,
  LoginResponse,
  RefreshResponse,
  TrocarSenhaRequest,
  UsuarioAuth,
} from '../models/auth';

const REFRESH_TOKEN_KEY = 'refreshToken';

interface AuthState {
  usuario: UsuarioAuth | null;
  accessToken: string | null;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private baseUrl = `${environment.apiUrl}`;

  private state = signal<AuthState>({ usuario: null, accessToken: null });


  readonly usuario = computed(() => this.state().usuario);
  readonly logado = computed(() => !!this.state().accessToken);
  readonly nomeUsuario = computed(() => this.state().usuario?.nome ?? '');
  readonly perfilUsuario = computed(() => this.state().usuario?.perfil_acesso ?? '');
  readonly accessToken = computed(() => this.state().accessToken);


  getAccessToken(): string | null {
    return this.state().accessToken;
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  }

  hasSavedRefreshToken(): boolean {
    return !!localStorage.getItem(REFRESH_TOKEN_KEY);
  }


  clearSession(): void {
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    this.state.set({ usuario: null, accessToken: null });
  }


  login(dados: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.baseUrl}/login`, dados).pipe(
      tap((res) => {
        localStorage.setItem(REFRESH_TOKEN_KEY, res.refreshToken);

        this.state.set({ usuario: res.usuario, accessToken: res.accessToken });
      })
    );
  }

  refresh(): Observable<RefreshResponse> {
    const refreshToken = this.getRefreshToken() ?? '';
    return this.http
      .post<RefreshResponse>(`${this.baseUrl}/refresh`, { refreshToken })
      .pipe(
        tap((res) => {
          localStorage.setItem(REFRESH_TOKEN_KEY, res.refreshToken);
          this.state.set({ usuario: res.usuario, accessToken: res.accessToken });
        })
      );
  }

  logout(): void {
    const refreshToken = this.getRefreshToken();
    const accessToken = this.getAccessToken();

    if (refreshToken && accessToken) {
      this.http
        .post(`${this.baseUrl}/logout`, { refreshToken })
        .subscribe({ error: () => {} });
    }

    this.clearSession();
    this.router.navigate(['/login']);
  }

  trocarSenha(dados: TrocarSenhaRequest): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(
      `${this.baseUrl}/trocar-senha`,
      dados
    );
  }
}
