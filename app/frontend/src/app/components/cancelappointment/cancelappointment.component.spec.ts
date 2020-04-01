import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CancelappointmentComponent } from './cancelappointment.component';

describe('CancelappointmentComponent', () => {
  let component: CancelappointmentComponent;
  let fixture: ComponentFixture<CancelappointmentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CancelappointmentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CancelappointmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
