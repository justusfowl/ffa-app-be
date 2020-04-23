import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TVHomeComponent } from './tvhome.component';

describe('TVHomeComponent', () => {
  let component: TVHomeComponent;
  let fixture: ComponentFixture<TVHomeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TVHomeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TVHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
