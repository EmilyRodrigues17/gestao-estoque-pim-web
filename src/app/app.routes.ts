import { Routes } from '@angular/router';
import { unsavedChangesGuard } from './core/guards/unsaved-changes-guard';
import { authGuard } from './core/auth/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
    {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full'
    },
    {
        path: 'login',
        loadComponent: () => import('./features/login/login').then(m => m.Login),
    },
    {
        path: 'trocar-senha',
        loadComponent: () => import('./features/trocar-senha/trocar-senha').then(m => m.TrocarSenha),
        canActivate: [authGuard],
    },
    {
        path: 'app',
        loadComponent: () => import('./layout/main-layout/main-layout').then(m => m.MainLayout),
        canActivate: [authGuard],
        children: [
            {
                path: 'dashboard',
                loadComponent: () => import('./features/dashboard/dashboard').then(m => m.Dashboard),
            },
            {
                path: 'insumos',
                loadComponent: () => import('./features/insumos/insumos').then(m => m.Insumos),
                canDeactivate: [unsavedChangesGuard]
            },
            {
                path: 'insumos/:id',
                loadComponent: () => import('./features/insumos/insumo-details/insumo-details').then(m => m.InsumoDetails),
            },
            {
                path: 'movimentacoes',
                loadComponent: () => import('./features/movimentacoes/movimentacoes').then(m => m.Movimentacoes),
            },
            {
                path: 'movimentacoes/nova',
                loadComponent: () => import('./features/movimentacoes/nova-movimentacao/nova-movimentacao').then(m => m.NovaMovimentacao),
                canActivate: [roleGuard],
                data: { roles: ['almoxarife'] },
            },
            {
                path: 'categorias',
                loadComponent: () => import('./features/categorias/categorias').then(m => m.Categorias),
                canActivate: [roleGuard],
                data: { roles: ['almoxarife'] },
            },
            {
                path: 'usuarios',
                loadComponent: () => import('./features/usuarios/usuarios').then(m => m.Usuarios),
                canActivate: [roleGuard],
                data: { roles: ['adm'] },
            }
        ]
    },
    {
        path: '**',
        redirectTo: 'login'
    }
];
