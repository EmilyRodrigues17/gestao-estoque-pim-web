import { PerfilAcesso } from './perfil-acesso';

export interface Usuario {
  id: string;
  nome: string;
  email: string;
  perfil_acesso: PerfilAcesso | string;
  ativo: boolean;
  trocar_senha: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateUsuarioDto {
  nome: string;
  email: string;
  senha?: string;
  perfil_acesso: string;
}

export interface UpdateUsuarioDto {
  nome?: string;
  email?: string;
  senha?: string;
  perfil_acesso?: string;
  ativo?: boolean;
}
