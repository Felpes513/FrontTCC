// src/app/features/orientador/relatorio-form/relatorio-form.component.ts
import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';

import { RelatorioService } from '@services/relatorio.service';
import {
  ConfirmarRelatorioMensalDTO,
  RelatorioMensal,
} from '@interfaces/relatorio';

@Component({
  standalone: true,
  selector: 'app-relatorio-form',
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './relatorio-form.component.html',
  styleUrls: ['./relatorio-form.component.css'],
})
export class RelatorioFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private relatorioService = inject(RelatorioService);

  projetoId!: number;
  salvando = signal(false);
  relatorioEnviadoDoMes = signal<RelatorioMensal | null>(null);

  // quando true, tela fica somente leitura (usado pela Secretaria)
  readOnly = false;

  form = this.fb.group({
    referenciaMes: ['', [Validators.required]], // YYYY-MM
    ok: [true],
    resumo: ['', [Validators.required, Validators.minLength(10)]],
    atividades: [''],
    bloqueios: [''],
    proximosPassos: [''],
    horas: [null as number | null],
  });

  dataBr(iso?: string): string {
    if (!iso) return '—';
    const d = new Date(iso);
    return `${d.toLocaleDateString()} ${d.toLocaleTimeString()}`;
  }

  ngOnInit(): void {
    this.projetoId = Number(this.route.snapshot.paramMap.get('projetoId'));

    // query params (vindo da Secretaria)
    const qp = this.route.snapshot.queryParamMap;
    this.readOnly = qp.has('readonly');
    const mesQP = qp.get('mes');

    if (mesQP) {
      this.form.patchValue({ referenciaMes: mesQP }, { emitEvent: false });
      this.verificarSeJaEnviadoNoMes(mesQP);
    } else if (!this.form.value.referenciaMes) {
      const atual = this.toYYYYMM(new Date());
      this.form.patchValue({ referenciaMes: atual }, { emitEvent: false });
      this.verificarSeJaEnviadoNoMes(atual);
    }

    if (this.readOnly) {
      this.form.disable({ emitEvent: false });
    }

    this.form.get('referenciaMes')!.valueChanges.subscribe((mes) => {
      if (mes) this.verificarSeJaEnviadoNoMes(mes);
    });
  }

  private toYYYYMM(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    return `${y}-${m}`;
  }

  // >>> Hidratador do form com base no relatório encontrado
  private hidratarFormulario(r: RelatorioMensal | null) {
    if (!r) {
      this.form.patchValue(
        { resumo: '', atividades: '', bloqueios: '', proximosPassos: '', horas: null, ok: true },
        { emitEvent: false }
      );
      return;
    }

    const parsed = this.parseObservacao(r.observacao || '');
    this.form.patchValue(
      {
        ok: !!r.ok,
        resumo: parsed.resumo ?? '',
        atividades: parsed.atividades ?? '',
        bloqueios: parsed.bloqueios ?? '',
        proximosPassos: parsed.proximosPassos ?? '',
        horas: parsed.horas ?? null,
      },
      { emitEvent: false }
    );
  }

  // >>> Parser da observação salva no banco
  private parseObservacao(texto: string): {
    resumo?: string;
    atividades?: string;
    bloqueios?: string;
    proximosPassos?: string;
    horas?: number | null;
  } {
    const out: any = {};
    const get = (re: RegExp) => {
      const m = re.exec(texto);
      return m ? m[1].trim() : undefined;
    };

    out.resumo = get(/Resumo:\s*([\s\S]*?)(?=\n(?:Atividades:|Bloqueios:|Próximos passos:|Horas no mês:)|$)/i);
    out.atividades = get(/Atividades:\s*([\s\S]*?)(?=\n(?:Resumo:|Bloqueios:|Próximos passos:|Horas no mês:)|$)/i);
    out.bloqueios = get(/Bloqueios:\s*([\s\S]*?)(?=\n(?:Resumo:|Atividades:|Próximos passos:|Horas no mês:)|$)/i);
    out.proximosPassos = get(/Próximos passos:\s*([\s\S]*?)(?=\n(?:Resumo:|Atividades:|Bloqueios:|Horas no mês:)|$)/i);

    const horasStr = get(/Horas no mês:\s*([0-9]+)/i);
    out.horas = horasStr ? Number(horasStr) : null;

    return out;
  }

  // ajusta a fonte conforme o modo (orientador x secretaria readonly)
  private verificarSeJaEnviadoNoMes(mes: string) {
    const fonte$ = this.readOnly
      ? this.relatorioService.listarRecebidosSecretaria(mes)
      : this.relatorioService.listarDoMes(mes);

    fonte$.subscribe({
      next: (lista) => {
        const doProjeto =
          (lista || []).find((r) => r.projetoId === this.projetoId) || null;
        this.relatorioEnviadoDoMes.set(doProjeto);
        this.hidratarFormulario(doProjeto); // <<< preenche o formulário
      },
      error: () => {
        this.relatorioEnviadoDoMes.set(null);
        this.hidratarFormulario(null);
      },
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
    if (this.readOnly) return; // bloqueia no modo somente leitura
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const dto: ConfirmarRelatorioMensalDTO = {
      mes: this.form.value.referenciaMes!, // 'YYYY-MM'
      ok: !!this.form.value.ok,
      observacao: this.montarObservacao(),
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
      },
    });
  }
}
