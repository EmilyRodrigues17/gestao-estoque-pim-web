import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InsumoDetails } from './insumo-details';

describe('InsumoDetails', () => {
  let component: InsumoDetails;
  let fixture: ComponentFixture<InsumoDetails>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InsumoDetails],
    }).compileComponents();

    fixture = TestBed.createComponent(InsumoDetails);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
