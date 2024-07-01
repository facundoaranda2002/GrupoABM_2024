import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CarritoComprasPage } from './carrito-compras.page';

describe('CarritoComprasPage', () => {
  let component: CarritoComprasPage;
  let fixture: ComponentFixture<CarritoComprasPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(CarritoComprasPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
