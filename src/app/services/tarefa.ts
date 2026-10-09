import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Tarefa } from '../models/tarefa';
import { ApiResponse } from '../models/api-response';

@Injectable({
  providedIn: 'root'
})
export class TarefaService {
 
  private apiUrl = 'http://localhost:5277/api/tarefas';

  constructor(private http: HttpClient) {}

  // os métodos agora tipam a resposta como ApiResponse<...>.
  getTarefasPorUsuario(usuarioId: number): Observable<ApiResponse<Tarefa[]>> {
    return this.http.get<ApiResponse<Tarefa[]>>(`${this.apiUrl}/usuario/${usuarioId}`);
  }

  criarTarefa(tarefa: Tarefa): Observable<ApiResponse<Tarefa>> {
    return this.http.post<ApiResponse<Tarefa>>(this.apiUrl, tarefa);
  }

  atualizarTarefa(id: number, tarefa: Tarefa): Observable<ApiResponse<string>> {
    return this.http.put<ApiResponse<string>>(`${this.apiUrl}/${id}`, tarefa);
  }

  // método novo.
  
  concluirTarefa(id: number): Observable<ApiResponse<string>> {
    return this.http.patch<ApiResponse<string>>(`${this.apiUrl}/${id}/concluir`, {});
  }

  excluirTarefa(id: number): Observable<ApiResponse<string>> {
    return this.http.delete<ApiResponse<string>>(`${this.apiUrl}/${id}`);
  }
}