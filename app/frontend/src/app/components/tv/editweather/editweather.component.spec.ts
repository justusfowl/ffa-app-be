import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditweatherComponent } from './editweather.component';

describe('EditweatherComponent', () => {
  let component: EditweatherComponent;
  let fixture: ComponentFixture<EditweatherComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditweatherComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditweatherComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
