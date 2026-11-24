import { TestBed } from '@angular/core/testing';
import { TreinoData } from './treino-data';

describe('TreinoData', () => {
  let service: TreinoData;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TreinoData);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
