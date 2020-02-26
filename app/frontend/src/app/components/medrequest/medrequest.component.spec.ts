import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MedrequestComponent } from './medrequest.component';

describe('MedrequestComponent', () => {
  let component: MedrequestComponent;
  let fixture: ComponentFixture<MedrequestComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MedrequestComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MedrequestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
