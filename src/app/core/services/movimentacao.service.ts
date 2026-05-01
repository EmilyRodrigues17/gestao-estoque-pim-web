import { HttpClient, HttpParams } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { environment } from "../../../environments/environment";
import { CreateMovimentacao, Movimentacao } from "../models/movimentacao";
import { Observable } from "rxjs";

@Injectable({
    providedIn: 'root'
})
export class MovimentacaoService {
    private http = inject(HttpClient);
    private baseUrl = `${environment.apiUrl}/movimentacoes`;

    findAll(filtros?: { insumo_id?: string; tipo?: string; motivo?: string, dataInicio?: string, dataFim?: string }): Observable<Movimentacao[]> {
        let params = new HttpParams();
        if (filtros?.insumo_id) {
            params = params.set('insumo_id', filtros.insumo_id);
        }
        if (filtros?.tipo) {
            params = params.set('tipo', filtros.tipo);
        }
        if (filtros?.motivo) {
            params = params.set('motivo', filtros.motivo);
        }
        if (filtros?.dataInicio) {
            params = params.set('dataInicio', filtros.dataInicio);
        }
        if (filtros?.dataFim) {
            params = params.set('dataFim', filtros.dataFim);
        }

        return this.http.get<Movimentacao[]>(this.baseUrl, { params });
    }

    findById(id: string): Observable<Movimentacao> {
        return this.http.get<Movimentacao>(`${this.baseUrl}/${id}`);
    }

    create(data: CreateMovimentacao): Observable<Movimentacao> {
        return this.http.post<Movimentacao>(this.baseUrl, data);
    }
}