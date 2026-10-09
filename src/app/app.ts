import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { TarefaService } from './services/tarefa';
import { UsuarioService } from './services/usuario';
import { Tarefa } from './models/tarefa';
import { Usuario } from './models/usuario';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class App implements OnInit {
  abaAtiva: 'tarefas' | 'cadastro' = 'cadastro';
  usuarioLogado: Usuario | null = null;
  tarefas: Tarefa[] = [];
  novaTarefa: Tarefa = this.resetFormTarefa();
  editandoTarefa = false;
  novoUsuario: Usuario = { nome: '', email: '', senha: '' };
  mensagemErro = '';
  mensagemSucesso = '';
  temaEscuro = false;

  constructor(
    private tarefaService: TarefaService,
    private usuarioService: UsuarioService
  ) {}

ngOnInit(): void {
    const salvo = localStorage.getItem('usuarioLogado');
    if (salvo) {
      this.iniciarSessao(JSON.parse(salvo) as Usuario);
    }

    // Isola o botão de pânico a nível de navegador puro
    setTimeout(() => {
      const btn = document.getElementById('btnPanico');
      
      // Ajuste do caminho para o padrão de assets servidos pelo build do Angular
      const audio = new Audio('panico.mp3');

      if (btn) {
        btn.addEventListener('click', (e) => {
          e.stopPropagation(); // Mata o evento para que não suba para o Angular
          e.preventDefault();  // Impede qualquer comportamento padrão
          
          if (audio.paused) {
            audio.play().catch(err => console.log('Erro ao tocar áudio:', err));
          } else {
            audio.pause();
            audio.currentTime = 0;
          }
        });
      }
    }, 500);
  }
  
  alternarTema(): void {
    this.temaEscuro = !this.temaEscuro;
  }



  // --- MÉTODOS DE USUÁRIA ---
  cadastrarUsuaria(): void {
    if (!this.novoUsuario.nome || !this.novoUsuario.email || !this.novoUsuario.senha) {
      this.mensagemErro = 'Por favor, preencha todos os campos do cadastro.';
      return;
    }
    if (this.novoUsuario.senha.length < 6) {
      this.mensagemErro = 'A senha deve ter pelo menos 6 caracteres.';
      return;
    }

    this.usuarioService.cadastrar(this.novoUsuario).subscribe({
      next: (resposta) => {
        this.novoUsuario = { nome: '', email: '', senha: '' };
        if (resposta.dados) this.iniciarSessao(resposta.dados);
        this.exibirFeedback(resposta.mensagem || 'Usuária cadastrada com sucesso!');
      },
      error: (erro) => this.tratarErro(erro, 'Falha ao cadastrar usuária na API.')
    });
  }

  private iniciarSessao(usuario: Usuario): void {
    this.usuarioLogado = usuario;
    localStorage.setItem('usuarioLogado', JSON.stringify(usuario));
    this.abaAtiva = 'tarefas';
    this.limparFormTarefa(); 
    this.carregarTarefas();
  }

  // --- MÉTODOS DE TAREFAS ---
  carregarTarefas(): void {
    if (!this.usuarioLogado?.id) return;

    this.tarefaService.getTarefasPorUsuario(this.usuarioLogado.id).subscribe({
      next: (resposta) => {
        this.tarefas = resposta.dados ?? [];
        this.mensagemErro = '';
      },
      error: (erro) => this.tratarErro(erro, 'Não foi possível buscar as tarefas. Verifique se o Back-end .NET está ligado.')
    });
  }

  salvarTarefa(): void {
    if (!this.novaTarefa.titulo.trim()) {
      this.mensagemErro = 'O título da tarefa é obrigatório.';
      return;
    }
    if (!this.novaTarefa.dataVencimento) {
      this.mensagemErro = 'A data de vencimento é obrigatória.';
      return;
    }

    if (this.editandoTarefa && this.novaTarefa.id) {
      this.tarefaService.atualizarTarefa(this.novaTarefa.id, this.novaTarefa).subscribe({
        next: (resposta) => {
          this.exibirFeedback(resposta.mensagem || 'Tarefa atualizada com sucesso!');
          this.carregarTarefas();
          this.limparFormTarefa();
        },
        error: (erro) => this.tratarErro(erro, 'Erro ao atualizar tarefa.')
      });
    } else {
      this.tarefaService.criarTarefa(this.novaTarefa).subscribe({
        next: (resposta) => {
          this.exibirFeedback(resposta.mensagem || 'Tarefa adicionada com sucesso!');
          this.carregarTarefas();
          this.limparFormTarefa();
        },
        error: (erro) => this.tratarErro(erro, 'Erro ao criar tarefa.')
      });
    }
  }

  editarTarefa(tarefa: Tarefa): void {
    this.editandoTarefa = true;
    this.novaTarefa = { ...tarefa, dataVencimento: tarefa.dataVencimento.substring(0, 10) };
  }

  concluirTarefa(tarefa: Tarefa): void {
    if (!tarefa.id) return;
    this.tarefaService.concluirTarefa(tarefa.id).subscribe({
      next: (resposta) => {
        this.exibirFeedback(resposta.mensagem || 'Tarefa marcada como concluída!');
        this.carregarTarefas();
      },
      error: (erro) => this.tratarErro(erro, 'Erro ao concluir a tarefa.')
    });
  }

  excluirTarefa(id?: number): void {
    if (!id) return;
    if (confirm('Tem certeza que deseja excluir esta tarefa?')) {
      this.tarefaService.excluirTarefa(id).subscribe({
        next: (resposta) => {
          this.exibirFeedback(resposta.mensagem || 'Tarefa removida com sucesso!');
          this.carregarTarefas();
        },
        error: (erro) => this.tratarErro(erro, 'Erro ao deletar tarefa.')
      });
    }
  }

  limparFormTarefa(): void {
    this.novaTarefa = this.resetFormTarefa();
    this.editandoTarefa = false;
  }

  private resetFormTarefa(): Tarefa {
    return {
      titulo: '',
      descricao: '',
      dataVencimento: '',
      concluida: false,
      usuarioId: this.usuarioLogado?.id ?? 0
    };
  }

  // --- FEEDBACK ---
  exibirFeedback(msg: string): void {
    this.mensagemSucesso = msg;
    this.mensagemErro = '';
    setTimeout(() => this.mensagemSucesso = '', 3500);
  }

  private tratarErro(erro: HttpErrorResponse, padrao: string): void {
    this.mensagemSucesso = '';
    if (erro.status === 0) {
      this.mensagemErro = 'Não foi possível conectar com a API. Verifique se o back-end .NET está em execução.';
    } else if (erro.error?.mensagem) {
      this.mensagemErro = erro.error.mensagem;
    } else if (erro.error?.errors) {
      this.mensagemErro = (Object.values(erro.error.errors) as string[][]).flat().join(' ');
    } else {
      this.mensagemErro = padrao;
    }
  }
}