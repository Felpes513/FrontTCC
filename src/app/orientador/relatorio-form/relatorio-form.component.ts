import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import {
  RelatorioService,
  ConfirmarRelatorioMensalDTO,
  RelatorioMensalOut
} from '@services/relatorio.service';

@Component({
  standalone: true,
  selector: 'app-relatorio-form',
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './relatorio-form.component.html',
  styleUrls: ['./relatorio-form.component.css']
})
export class RelatorioFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private relatorioService = inject(RelatorioService);

  projetoId!: number;
  salvando = signal(false);
  relatorioEnviadoDoMes = signal<RelatorioMensalOut | null>(null);

  form = this.fb.group({
    referenciaMes: ['', [Validators.required]], // YYYY-MM
    ok: [true, []],                              // confirmação
    resumo: ['', [Validators.required, Validators.minLength(10)]],
    atividades: [''],
    bloqueios: [''],
    proximosPassos: [''],
    horas: [null]
  });

  ngOnInit(): void {
    this.projetoId = Number(this.route.snapshot.paramMap.get('projetoId'));

    // quando muda o mês, revalida se já existe relatório enviado
    this.form.get('referenciaMes')!.valueChanges.subscribe(mes => {
      if (mes) this.verificarSeJaEnviadoNoMes(mes);
    });
  }

  private verificarSeJaEnviadoNoMes(mes: string) {
    this.relatorioService.listarDoMes(mes).subscribe({
      next: (lista) => {
        const doProjeto = (lista || []).find(r => r.projeto_id === this.projetoId) || null;
        this.relatorioEnviadoDoMes.set(doProjeto || null);
      },
      error: () => this.relatorioEnviadoDoMes.set(null),
    });
  }

  private montarObservacao(): string {
    const v = this.form.value;
    const linhas: string[] = [];

    if (v.resumo) linhas.push(`Resumo: ${v.resumo}`);
    if (v.atividades) linhas.push(`Atividades: ${v.atividades}`);
    if (v.bloqueios) linhas.push(`Bloqueios: ${v.bloqueios}`);
    if (v.proximosPassos) linhas.push(`Próximos passos: ${v.proximosPassos}`);
    if (v.horas != null) linhas.push(`Horas no mês: ${v.horas}`);

    return linhas.join('\n');
  }

  salvar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const dto: ConfirmarRelatorioMensalDTO = {
      mes: this.form.value.referenciaMes!,      // 'YYYY-MM'
      ok: !!this.form.value.ok,
      observacao: this.montarObservacao()
    };

    this.salvando.set(true);
    this.relatorioService.confirmar(this.projetoId, dto).subscribe({
      next: (res) => {
        this.salvando.set(false);
        alert(res?.mensagem || 'Relatório confirmado.');
        this.verificarSeJaEnviadoNoMes(dto.mes);
      },
      error: () => {
        this.salvando.set(false);
        alert('Erro ao confirmar relatório.');
      }
    });
  }
}
