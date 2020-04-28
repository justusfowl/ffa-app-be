import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditclockComponent } from './editclock.component';

describe('EditclockComponent', () => {
  let component: EditclockComponent;
  let fixture: ComponentFixture<EditclockComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditclockComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditclockComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
