import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { UsuarioService } from './usuario'; // <-- Ajustado para apontar para a classe do serviço

describe('UsuarioService', () => {
  let service: UsuarioService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        UsuarioService,
        provideHttpClient() // <-- Obrigatório para o serviço não quebrar ao tentar usar o HttpClient
      ]
    });
    service = TestBed.inject(UsuarioService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
