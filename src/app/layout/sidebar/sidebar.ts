import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/auth/auth.service';
import { UsuarioService } from '../../core/services/usuario.service';
import { PerfilAcesso } from '../../core/models/perfil-acesso';

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, RouterLinkActive, FormsModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class Sidebar {
  protected authService = inject(AuthService);
  private usuarioService = inject(UsuarioService);
  protected readonly isGestor = computed(() => this.authService.perfilUsuario() === PerfilAcesso.GESTOR);
  protected readonly isAdm = computed(() => this.authService.perfilUsuario() === PerfilAcesso.ADM);

  showProfileModal = signal(false);
  profileNome = signal('');
  profileSenha = signal('');
  loadingProfile = signal(false);
  profileSuccess = signal<string | null>(null);
  profileError = signal<string | null>(null);

  openProfileModal(): void {
    this.profileNome.set(this.authService.nomeUsuario());
    this.profileSenha.set('');
    this.profileError.set(null);
    this.profileSuccess.set(null);
    this.showProfileModal.set(true);
  }

  closeProfileModal(): void {
    this.showProfileModal.set(false);
  }

  saveProfile(): void {
    if (!this.profileNome().trim()) {
      this.profileError.set('O nome é obrigatório.');
      return;
    }

    const userId = this.authService.usuario()?.id;
    if (!userId) return;

    this.loadingProfile.set(true);
    this.profileError.set(null);
    this.profileSuccess.set(null);

    const dto: any = { nome: this.profileNome().trim() };
    if (this.profileSenha()) {
      dto.senha = this.profileSenha();
    }

    this.usuarioService.update(userId, dto).subscribe({
      next: () => {
        this.profileSuccess.set('Perfil atualizado com sucesso!');
        this.authService.refresh().subscribe({
          next: () => this.loadingProfile.set(false),
          error: () => this.loadingProfile.set(false)
        });
        setTimeout(() => this.closeProfileModal(), 2000);
      },
      error: (err) => {
        this.profileError.set(err.error?.message || 'Erro ao atualizar perfil.');
        this.loadingProfile.set(false);
      }
    });
  }

  onSair(): void {
    this.authService.logout();
  }
}
