import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditmediaComponent } from './editmedia.component';

describe('EditmediaComponent', () => {
  let component: EditmediaComponent;
  let fixture: ComponentFixture<EditmediaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditmediaComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditmediaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
