import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditquoteComponent } from './editquote.component';

describe('EditquoteComponent', () => {
  let component: EditquoteComponent;
  let fixture: ComponentFixture<EditquoteComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditquoteComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditquoteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
