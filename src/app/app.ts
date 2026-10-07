import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TarefaService } from './services/tarefa';
import { UsuarioService } from './services/usuario';
import { Tarefa } from './models/tarefa';
import { Usuario } from './models/usuario';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule], // Módulos necessários para ngIf, ngFor e formulários
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class App implements OnInit {
  // Controle de Abas
  abaAtiva: 'tarefas' | 'cadastro' = 'tarefas';

  // Estados de Tarefas
  tarefas: Tarefa[] = [];
  usuarioLogadoId = 1; // ID Padrão do Usuário Teste da API .NET do squad
  novaTarefa: Tarefa = this.resetFormTarefa();
  editandoTarefa = false;

  // Estados de Usuária
  novoUsuario: Usuario = { nome: '', email: '', senha: '' };

  // Feedbacks Visuais
  mensagemErro = '';
  mensagemSucesso = '';

  constructor(
    private tarefaService: TarefaService,
    private usuarioService: UsuarioService
  ) {}

  ngOnInit(): void {
    this.carregarTarefas();
  }

  // --- MÉTODOS DE TAREFAS ---
  carregarTarefas(): void {
    this.tarefaService.getTarefasPorUsuario(this.usuarioLogadoId).subscribe({
      next: (dados) => {
        this.tarefas = dados;
        this.mensagemErro = '';
      },
      error: () => this.mensagemErro = 'Não foi possível buscar as tarefas. Verifique se o Back-end .NET está ligado.'
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
      error: () => this.mensagemErro = 'Erro ao atualizar o status.'
    });
  }

  excluirTarefa(id?: number): void {
    if (!id) return;
    if (confirm('Tem certeza que deseja excluir esta tarefa?')) {
      this.tarefaService.excluirTarefa(id).subscribe({
        next: () => {
          this.exibirFeedback('Tarefa removida com sucesso!');
          this.carregarTarefas();
        },
        error: () => this.mensagemErro = 'Erro ao deletar tarefa.'
      });
    }
  }

  limparFormTarefa(): void {
    this.novaTarefa = this.resetFormTarefa();
    this.editandoTarefa = false;
  }

  private resetFormTarefa(): Tarefa {
    return { titulo: '', descricao: '', dataVencimento: '', status: 'Pendente', usuarioId: this.usuarioLogadoId };
  }

  // --- MÉTODOS DE USUÁRIA ---
  cadastrarUsuaria(): void {
    if (!this.novoUsuario.nome || !this.novoUsuario.email || !this.novoUsuario.senha) {
      this.mensagemErro = 'Por favor, preencha todos os campos do cadastro.';
      return;
    }

    this.usuarioService.cadastrar(this.novoUsuario).subscribe({
      next: () => {
        this.exibirFeedback('Usuária cadastrada com sucesso!');
        this.novoUsuario = { nome: '', email: '', senha: '' };
        this.abaAtiva = 'tarefas';
      },
      error: () => this.mensagemErro = 'Falha ao cadastrar usuária na API.'
    });
  }

  // --- FEEDBACK ---
  exibirFeedback(msg: string): void {
    this.mensagemSucesso = msg;
    this.mensagemErro = '';
    setTimeout(() => this.mensagemSucesso = '', 3500);
  }
}
