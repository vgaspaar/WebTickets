import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class SenhaService {
  private api = 'http://localhost:3000/api/senhas';

  constructor(private http: HttpClient) {}

  emitirSenha(tipo: string) {
    return this.http.post(`${this.api}/emitir`, { tipo });
  }

  chamarProxima(guiche: number) {
    return this.http.post(`${this.api}/chamar`, { guiche });
  }

  finalizarAtendimento(guiche: number) {
    return this.http.post(`${this.api}/finalizar`, { guiche });
  }

  getPainel() {
    return this.http.get(`${this.api}/painel`);
  }
}