import { Component, computed, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AuthService } from '../../core/auth/auth.service';

type RouteHistory = {url: string, title: string};

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

  private readonly previousUrl = signal<RouteHistory | null>(null);

  private static readonly ROUTE_TITLES: Record<string, string> = {
    '/app/dashboard': 'Dashboard de Alertas',
    '/app/categorias': 'Gestão de Categorias',
    '/app/insumos': 'Catálogo de Insumos',
    '/app/movimentacoes': 'Histórico de Movimentações',
    '/app/usuarios': 'Gestão de Usuários'
  };


  protected readonly pageTitle = computed(() => {
    const url = this.currentUrl();

    for (const [route, title] of Object.entries(Navbar.ROUTE_TITLES)) {
      if (url === route || url.startsWith(route + '?')) {
        return title;
      }
    }

    return '';
  });

  private getTitleFromUrl(url: string): string {
    for (const [route, title] of Object.entries(Navbar.ROUTE_TITLES)) {
      if (url === route || url.startsWith(route + '?')) {
        return title;
      }
    }
    return 'Página Anterior';
  }

  protected readonly showBackButton = computed(() => {
    const url = this.currentUrl();
    return url.startsWith('/app/movimentacoes/nova') || /^\/app\/insumos\/[^/]+$/.test(url);
  });

  constructor() {
    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe(event => {
        const prevUrl = this.currentUrl();
        this.previousUrl.set({url: prevUrl, title: this.getTitleFromUrl(prevUrl)});
        this.currentUrl.set(event.urlAfterRedirects)
      });
  }

  protected readonly backButtonText = computed(() => {
    const prev = this.previousUrl();
    return prev ? `Voltar para ${prev.title}` : 'Voltar';
  });

  protected goBack(): void {
    const urlPrev = this.previousUrl();
    if (urlPrev){
      this.router.navigateByUrl(urlPrev.url);
    } else {
      this.router.navigate(['/app/dashboard'])
    }
  }
}
