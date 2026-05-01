import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DataTable } from '../../shared/data-table/data-table';
import { TableColumn } from '../../core/models/data-table';
import { UsuarioService } from '../../core/services/usuario.service';
import { AuthService } from '../../core/auth/auth.service';
import { Usuario, CreateUsuarioDto, UpdateUsuarioDto } from '../../core/models/usuario';
import { PerfilAcesso } from '../../core/models/perfil-acesso';

@Component({
  selector: 'app-usuarios',
  imports: [FormsModule, DataTable],
  templateUrl: './usuarios.html',
  styleUrl: './usuarios.css',
})
export class Usuarios implements OnInit {
  private usuarioService = inject(UsuarioService);
  protected authService = inject(AuthService);

  usuarios = signal<Usuario[]>([]);

  currentPage = signal<number>(1);
  itemsPerPage = signal<number>(5);
  
  totalItems = computed(() => this.usuarios()?.length || 0);

  paginatedUsuarios = computed(() => {
    const data = this.usuarios() || [];
    const start = (this.currentPage() - 1) * this.itemsPerPage();
    const end = start + this.itemsPerPage();
    return data.slice(start, end);
  });

  columns: TableColumn[] = [
    { key: 'nome', header: 'Nome' },
    { key: 'email', header: 'E-mail' },
    { key: 'perfil_acesso', header: 'Perfil', type: 'custom' },
    { key: 'ativo', header: 'Status', type: 'custom' },
    { key: 'acoes', header: 'Ações', type: 'custom', align: 'right' }
  ];

  editId = signal<string | null>(null);
  nome = signal('');
  email = signal('');
  senha = signal('');
  perfil_acesso = signal<string>(PerfilAcesso.ALMOXARIFE);
  ativo = signal<boolean>(true);

  loading = signal(false);
  error = signal<string | null>(null);
  successMessage = signal<string | null>(null);

  deleteTarget = signal<Usuario | null>(null);

  perfis = [
    { label: 'Administrador', value: PerfilAcesso.ADM },
    { label: 'Gestor', value: PerfilAcesso.GESTOR },
    { label: 'Almoxarife', value: PerfilAcesso.ALMOXARIFE },
  ];

  ngOnInit(): void {
    this.carregarUsuarios();
  }

  carregarUsuarios(): void {
    this.loading.set(true);
    this.usuarioService.findAll().subscribe({
      next: (usuarios) => {
        this.usuarios.set(usuarios);
        this.currentPage.set(1);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Erro ao carregar listagem de usuários.');
        this.loading.set(false);
        console.error('Erro ao carregar listagem de usuários:', err);
      },
    });
  }

  onEdit(usuario: Usuario): void {
    this.editId.set(usuario.id);
    this.nome.set(usuario.nome);
    this.email.set(usuario.email);
    this.perfil_acesso.set(usuario.perfil_acesso as string);
    this.ativo.set(usuario.ativo);
    this.senha.set('');
    this.limparMensagens();
  }

  onCancelEdit(): void {
    this.editId.set(null);
    this.nome.set('');
    this.email.set('');
    this.senha.set('');
    this.perfil_acesso.set(PerfilAcesso.ALMOXARIFE);
    this.ativo.set(true);
  }

  onSubmit(): void {
    if (!this.nome().trim() || !this.email().trim() || !this.perfil_acesso()) {
      this.error.set('Nome, e-mail e perfil são obrigatórios.');
      return;
    }

    this.loading.set(true);
    this.limparMensagens();

    if (this.editId()) {
      const dto: UpdateUsuarioDto = {
        nome: this.nome().trim(),
        email: this.email().trim(),
        perfil_acesso: this.perfil_acesso(),
        ativo: this.ativo()
      };
      if (this.senha()) {
        dto.senha = this.senha();
      }

      this.usuarioService.update(this.editId()!, dto).subscribe({
        next: () => {
          this.successMessage.set('Usuário atualizado com sucesso!');
          this.onCancelEdit();
          this.carregarUsuarios();
        },
        error: (err) => {
          this.tratarErro(err, 'atualizar');
          this.loading.set(false);
        },
      });
    } else {
      if (!this.senha()) {
        this.error.set('A senha é obrigatória para criar um novo usuário.');
        this.loading.set(false);
        return;
      }

      const dto: CreateUsuarioDto = {
        nome: this.nome().trim(),
        email: this.email().trim(),
        senha: this.senha(),
        perfil_acesso: this.perfil_acesso()
      };

      this.usuarioService.create(dto).subscribe({
        next: () => {
          this.successMessage.set('Usuário criado com sucesso!');
          this.onCancelEdit();
          this.carregarUsuarios();
        },
        error: (err) => {
          this.tratarErro(err, 'criar');
          this.loading.set(false);
        },
      });
    }
  }

  onDelete(usuario: Usuario): void {
    this.deleteTarget.set(usuario);
    this.limparMensagens();
  }

  onCancelDelete(): void {
    this.deleteTarget.set(null);
  }

  onConfirmDelete(): void {
    const usuario = this.deleteTarget();
    if (!usuario) return;

    this.loading.set(true);
    this.limparMensagens();
    this.deleteTarget.set(null);

    this.usuarioService.delete(usuario.id).subscribe({
      next: () => {
        this.successMessage.set(`Usuário "${usuario.nome}" excluído com sucesso!`);
        this.carregarUsuarios();
      },
      error: (err) => {
        this.tratarErro(err, 'excluir');
        this.loading.set(false);
      },
    });
  }

  onPageChange(page: number | string) {
    if (typeof page === 'number') {
      this.currentPage.set(page);
    }
  }

  getPerfilLabel(perfilValue: string): string {
    return this.perfis.find(p => p.value === perfilValue)?.label || perfilValue;
  }

  private tratarErro(err: any, acao: string): void {
    if (err.error?.message) {
      this.error.set(err.error.message);
    } else {
      this.error.set(`Erro ao ${acao} usuário. Tente novamente.`);
    }
    console.error(`Erro ao ${acao} usuário:`, err);
  }

  private limparMensagens(): void {
    this.error.set(null);
    this.successMessage.set(null);
  }
}
