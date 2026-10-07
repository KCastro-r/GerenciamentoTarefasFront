import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TarefaService } from './tarefa'; // Mudamos aqui para importar o Serviço correto

describe('TarefaService', () => {
  let service: TarefaService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        TarefaService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });
    service = TestBed.inject(TarefaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
