import { HttpClient, HttpParams } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { environment } from "../../../environments/environment";
import { Observable } from "rxjs";
import { CreateInsumo, Insumo, UpdateInsumo } from "../models/insumo";

@Injectable({
    providedIn: 'root'
})
export class InsumoService {
    private http = inject(HttpClient);
    private baseUrl = `${environment.apiUrl}/insumos`;

    findAll(filtros?: { nome?: string; codigo?: string; categoriaId?: string, statusEstoque?: string }): Observable<Insumo[]> {
        let params = new HttpParams();
        if (filtros?.nome) {
            params = params.set('nome', filtros.nome);
        }
        if (filtros?.codigo) {
            params = params.set('codigo', filtros.codigo);
        }
        if (filtros?.categoriaId) {
            params = params.set('categoriaId', filtros.categoriaId);
        }
        if (filtros?.statusEstoque) {
            params = params.set('statusEstoque', filtros.statusEstoque);
        }

        return this.http.get<Insumo[]>(this.baseUrl, { params });
    }

    findById(id: string): Observable<Insumo> {
        return this.http.get<Insumo>(`${this.baseUrl}/${id}`);
    }

    create(data: CreateInsumo): Observable<Insumo> {
        return this.http.post<Insumo>(this.baseUrl, data);
    }

    update(id: string, data: UpdateInsumo): Observable<Insumo> {
        return this.http.put<Insumo>(`${this.baseUrl}/${id}`, data);
    }

    delete(id: string): Observable<void> {
        return this.http.delete<void>(`${this.baseUrl}/${id}`);
    }

}