import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TeleSlotComponent } from './tele-slot.component';

describe('TeleSlotComponent', () => {
  let component: TeleSlotComponent;
  let fixture: ComponentFixture<TeleSlotComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TeleSlotComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TeleSlotComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
