import { Component } from '@angular/core';
import {NgIf} from "@angular/common";
import { Location } from '@angular/common';

@Component({
  selector: 'app-result',
  standalone: true,
  imports: [
    NgIf
  ],
  templateUrl: './result.component.html',
  styleUrl: './result.component.css'
})
export class ResultComponent {
  data: any;
  constructor(private location: Location) {
    this.data = (this.location.getState() as any) || {};
  }
}
