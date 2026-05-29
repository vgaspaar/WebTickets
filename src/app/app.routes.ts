import { Routes } from '@angular/router';
import { Totem } from '../pages/totem/totem';
import { Atendente } from '../pages/atendente/atendente';
import { Painel } from '../pages/painel/painel';
import { Relatorio } from '../pages/relatorio/relatorio';

export const routes: Routes = [
  { path: '', redirectTo: 'totem', pathMatch: 'full' },
  { path: 'totem', component: Totem },
  { path: 'atendente', component: Atendente },
  { path: 'painel', component: Painel },
  { path: 'relatorio', component: Relatorio }
];