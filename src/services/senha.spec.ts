import { TestBed } from '@angular/core/testing';

import { Senha } from './senha';

describe('Senha', () => {
  let service: Senha;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Senha);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
