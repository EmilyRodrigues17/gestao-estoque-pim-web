import { Component, computed, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-navbar',
  imports: [RouterModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar {
  protected readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  private readonly currentUrl = signal(this.router.url);

  private static readonly ROUTE_TITLES: Record<string, string> = {
    '/app/dashboard': 'Dashboard de Alertas',
    '/app/categorias': 'Gestão de Categorias',
  };

  private static readonly HIDDEN_ROUTES: string[] = [
    '/app/insumos',
    '/app/movimentacoes',
  ];


  protected readonly pageTitle = computed(() => {
    const url = this.currentUrl();

    if (Navbar.HIDDEN_ROUTES.some(route => url === route || url.startsWith(route + '?'))) {
      return '';
    }

    for (const [route, title] of Object.entries(Navbar.ROUTE_TITLES)) {
      if (url === route || url.startsWith(route + '?')) {
        return title;
      }
    }

    return '';
  });

  protected readonly showBackButton = computed(() => {
    const url = this.currentUrl();
    return url.startsWith('/app/movimentacoes/nova');
  });

  constructor() {
    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe(event => this.currentUrl.set(event.urlAfterRedirects));
  }
}
