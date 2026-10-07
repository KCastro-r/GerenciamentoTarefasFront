import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TarefaService } from '../services/tarefa';
import { Tarefa } from '../models/tarefa';

@Component({
  selector: 'app-tarefas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './tarefas.html'
})
export class TarefasComponent implements OnInit {
  tarefas: Tarefa[] = [];
  usuarioLogadoId = 1;

  novaTarefa: Tarefa = this.resetForm();
  editandoTarefa = false;
  mensagemErro = '';
  mensagemSucesso = '';

  constructor(private tarefaService: TarefaService) {}

  ngOnInit(): void {
    this.carregarTarefas();
  }

  carregarTarefas(): void {
    this.tarefaService.getTarefasPorUsuario(this.usuarioLogadoId).subscribe({
      next: (dados) => this.tarefas = dados,
      error: () => this.mensagemErro = 'Não foi possível buscar as tarefas da API.'
    });
  }

  salvarTarefa(): void {
    if (!this.novaTarefa.titulo.trim()) return;

    if (this.editandoTarefa && this.novaTarefa.id) {
      this.tarefaService.atualizarTarefa(this.novaTarefa.id, this.novaTarefa).subscribe({
        next: () => {
          this.exibirFeedback('Tarefa atualizada com sucesso!');
          this.carregarTarefas();
          this.limparFormTarefa();
        },
        error: () => this.mensagemErro = 'Erro ao atualizar tarefa.'
      });
    } else {
      this.tarefaService.criarTarefa(this.novaTarefa).subscribe({
        next: () => {
          this.exibirFeedback('Tarefa adicionada com sucesso!');
          this.carregarTarefas();
          this.limparFormTarefa();
        },
        error: () => this.mensagemErro = 'Erro ao criar tarefa.'
      });
    }
  }

  editarTarefa(tarefa: Tarefa): void {
    this.editandoTarefa = true;
    this.novaTarefa = { ...tarefa };
  }

  alternarConclusao(tarefa: Tarefa): void {
    if (!tarefa.id) return;
    tarefa.status = tarefa.status === 'Concluída' ? 'Pendente' : 'Concluída';

    this.tarefaService.atualizarTarefa(tarefa.id, tarefa).subscribe({
      next: () => {
        this.exibirFeedback(`Tarefa marcada como ${tarefa.status.toLowerCase()}!`);
        this.carregarTarefas();
      },
      error: () => this.mensagemErro = 'Erro ao alterar status.'
    });
  }

  excluirTarefa(id?: number): void {
    if (!id) return;
    if (confirm('Deseja realmente deletar esta tarefa?')) {
      this.tarefaService.excluirTarefa(id).subscribe({
        next: () => {
          this.exibirFeedback('Tarefa excluída com sucesso!');
          this.carregarTarefas();
        },
        error: () => this.mensagemErro = 'Erro ao excluir tarefa.'
      });
    }
  }

  exibirFeedback(msg: string) {
    this.mensagemSucesso = msg;
    setTimeout(() => this.mensagemSucesso = '', 3000);
  }

  limparFormTarefa(): void {
    this.novaTarefa = this.resetForm();
    this.editandoTarefa = false;
  }

  private resetForm(): Tarefa {
    return { titulo: '', descricao: '', dataVencimento: '', status: 'Pendente', usuarioId: this.usuarioLogadoId };
  }
}
