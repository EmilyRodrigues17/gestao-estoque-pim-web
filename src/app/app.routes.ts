import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: '',
        redirectTo: 'app/dashboard',
        pathMatch: 'full'
    },
    {
        path: 'app',
        loadComponent: () => import('./layout/main-layout/main-layout').then(m => m.MainLayout),
        children: [
            {
                path: 'dashboard',
                loadComponent: () => import('./features/dashboard/dashboard').then(m => m.Dashboard),
            },
            {
                path: 'insumos',
                loadComponent: () => import('./features/insumos/insumos').then(m => m.Insumos),
            },
            {
                path: 'movimentacoes',
                loadComponent: () => import('./features/movimentacoes/movimentacoes').then(m => m.Movimentacoes),
            },
            {
                path: 'categorias',
                loadComponent: () => import('./features/categorias/categorias').then(m => m.Categorias),
            }
        ]
    },
    {
        path: '**',
        redirectTo: 'dashboard'
    }
];
