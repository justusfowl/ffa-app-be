import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GenmessageComponent } from './genmessage.component';

describe('GenmessageComponent', () => {
  let component: GenmessageComponent;
  let fixture: ComponentFixture<GenmessageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GenmessageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GenmessageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
