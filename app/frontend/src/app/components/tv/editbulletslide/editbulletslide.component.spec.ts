import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditbulletslideComponent } from './editbulletslide.component';

describe('EditbulletslideComponent', () => {
  let component: EditbulletslideComponent;
  let fixture: ComponentFixture<EditbulletslideComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditbulletslideComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditbulletslideComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
