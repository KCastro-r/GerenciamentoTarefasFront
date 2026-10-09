// removi o import "Service", que não era usado.
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Usuario } from '../models/usuario';
import { ApiResponse } from '../models/api-response';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {

  private apiUrl = 'http://localhost:5277/api/usuarios';

  constructor(private http: HttpClient) {}

  // a API devolve ApiResponse<Usuario>, com o id da usuária criada.
  cadastrar(usuario: Usuario): Observable<ApiResponse<Usuario>> {
    return this.http.post<ApiResponse<Usuario>>(this.apiUrl, usuario);
  }
}