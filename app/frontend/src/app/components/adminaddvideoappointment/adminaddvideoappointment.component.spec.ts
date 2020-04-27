import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminaddvideoappointmentComponent } from './adminaddvideoappointment.component';

describe('AdminaddvideoappointmentComponent', () => {
  let component: AdminaddvideoappointmentComponent;
  let fixture: ComponentFixture<AdminaddvideoappointmentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AdminaddvideoappointmentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminaddvideoappointmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
