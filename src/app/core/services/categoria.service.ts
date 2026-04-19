import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Categoria, CreateCategoria, UpdateCategoria } from '../models/categoria';

@Injectable({
  providedIn: 'root'
})
export class CategoriaService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/categorias`;

  findAll(): Observable<Categoria[]> {
    return this.http.get<Categoria[]>(this.baseUrl);
  }

  findById(id: string): Observable<Categoria> {
    return this.http.get<Categoria>(`${this.baseUrl}/${id}`);
  }

  create(data: CreateCategoria): Observable<Categoria> {
    return this.http.post<Categoria>(this.baseUrl, data);
  }

  update(id: string, data: UpdateCategoria): Observable<Categoria> {
    return this.http.put<Categoria>(`${this.baseUrl}/${id}`, data);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
