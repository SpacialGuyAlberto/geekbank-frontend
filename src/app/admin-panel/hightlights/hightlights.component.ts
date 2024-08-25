import { Component } from '@angular/core';
import {ReactiveFormsModule} from "@angular/forms";

@Component({
  selector: 'app-hightlights',
  standalone: true,
  imports: [
    ReactiveFormsModule
  ],
  templateUrl: './hightlights.component.html',
  styleUrl: './hightlights.component.css'
})
export class HightlightsComponent {
  highlightForm: any;
  products: any;
  highlights: any;
  private _id: any;

  saveHighlight() {

  }

  removeHighlight(id: any) {
    this._id = id;

  }
}
