import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ConfigService } from '@services/config.service';
import { MatTabsModule } from '@angular/material/tabs';

@Component({
  selector: 'app-configuracoes',
  standalone: true,
  imports: [CommonModule, FormsModule, MatTabsModule],
  templateUrl: './configuracoes.component.html',
  styleUrls: ['./configuracoes.component.css'],
})
export class ConfiguracoesComponent implements OnInit {
  // Campus
  campus: any[] = [];
  novoCampus = '';

  // Cursos
  cursos: any[] = [];
  novoCurso = '';

  // Bolsas
  bolsas: any[] = [];
  novaBolsa = '';

  // Reset senha
  emailReset = '';
  mensagemReset = '';

  constructor(private configService: ConfigService) {}

  ngOnInit(): void {
    this.carregarCampus();
    this.carregarCursos();
    this.carregarBolsas();
  }

  // ---- Campus ----
  carregarCampus() {
    this.configService.listarCampus().subscribe((res) => (this.campus = res.campus));
  }

  cadastrarCampus() {
    if (!this.novoCampus.trim()) return;
    this.configService.criarCampus({ campus: this.novoCampus }).subscribe(() => {
      this.novoCampus = '';
      this.carregarCampus();
    });
  }

  // ---- Cursos ----
  carregarCursos() {
    this.configService.listarCursos().subscribe((res) => (this.cursos = res.cursos));
  }

  cadastrarCurso() {
    if (!this.novoCurso.trim()) return;
    this.configService.criarCurso({ nome: this.novoCurso }).subscribe(() => {
      this.novoCurso = '';
      this.carregarCursos();
    });
  }

  // ---- Bolsas ----
  carregarBolsas() {
    this.configService.listarBolsas().subscribe((res) => (this.bolsas = res.bolsas));
  }

  cadastrarBolsa() {
    if (!this.novaBolsa.trim()) return;
    this.configService.criarBolsa({ bolsa: this.novaBolsa }).subscribe(() => {
      this.novaBolsa = '';
      this.carregarBolsas();
    });
  }

  // ---- Reset Senha ----
  resetarSenha() {
    if (!this.emailReset.trim()) return;
    this.configService.forgotPassword(this.emailReset).subscribe((res) => {
      this.mensagemReset = res.message;
      this.emailReset = '';
    });
  }
}
