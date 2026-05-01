import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NovaMovimentacao } from './nova-movimentacao';

describe('NovaMovimentacao', () => {
  let component: NovaMovimentacao;
  let fixture: ComponentFixture<NovaMovimentacao>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NovaMovimentacao],
    }).compileComponents();

    fixture = TestBed.createComponent(NovaMovimentacao);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
