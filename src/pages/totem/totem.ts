import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SenhaService } from '../../services/senha';

@Component({
  selector: 'app-totem',
  imports: [CommonModule],
  templateUrl: './totem.html',
  styleUrl: './totem.css'
})
export class Totem implements OnInit {
  senhaEmitida: any = null;
  erro: string = '';
  carregando: boolean = true;

  constructor(
    private senhaService: SenhaService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    console.log('INIT CHAMADO');
    this.carregando = false;
    this.senhaEmitida = null;
    this.erro = '';
    this.cdr.detectChanges();
    console.log('carregando depois do init:', this.carregando);
  }

  emitir(tipo: string) {
    if (this.carregando) return;
    this.carregando = true;
    this.erro = '';
    this.senhaEmitida = null;

    this.senhaService.emitirSenha(tipo).subscribe({
      next: (res: any) => {
        this.senhaEmitida = res;
        this.carregando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.erro = err.error?.erro || 'Erro ao emitir senha';
        this.carregando = false;
        this.cdr.detectChanges();
      }
    });
  }

  nova() {
    this.senhaEmitida = null;
    this.erro = '';
    this.carregando = false;
    this.cdr.detectChanges();
  }
}