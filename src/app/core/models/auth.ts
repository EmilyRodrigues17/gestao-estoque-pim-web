export interface LoginRequest {
  email: string;
  senha: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  trocarSenha: boolean;
  usuario: UsuarioAuth;
}

export interface UsuarioAuth {
  id: string;
  nome: string;
  email: string;
  perfil_acesso: 'adm' | 'gestor' | 'almoxarife';
}

export interface RefreshResponse {
  accessToken: string;
  refreshToken: string;
  usuario: UsuarioAuth;
}

export interface TrocarSenhaRequest {
  senhaAtual: string;
  novaSenha: string;
}