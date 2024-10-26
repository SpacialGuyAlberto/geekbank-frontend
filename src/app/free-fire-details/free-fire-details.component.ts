import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-free-fire-details',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './free-fire-details.component.html',
  styleUrls: ['./free-fire-details.component.css']
})
export class FreeFireDetailsComponent {
  @Input() giftCard: any = {
    product: 'Free Fire Diamantes',
    price: 19.99,
    expirationDate: new Date(),
    wished: false
  };
  userId: string = '';
  userEmail: string = '';
  selectedOption: string = '';
  coverImage: string = 'https://edge.rivalrycdn.com/cdn-cgi/image/q=100/https://images.prismic.io/rivalryglhf/Zo0YzB5LeNNTw7xf_FreeFireDiamonds.jpg?auto=format%2Ccompress&width=900';

  options = [
    { label: "100 Diamantes + Bono 10", value: "100+10" },
    { label: "310 Diamantes + Bono 31", value: "310+31" },
    { label: "520 Diamantes + Bono 52", value: "520+52" },
    { label: "1060 Diamantes + Bono 106", value: "1060+106" },
    { label: "2180 Diamantes + Bono 218", value: "2180+218" },
    { label: "5600 Diamantes + Bono 560", value: "5600+560" }
  ];

  ngAfterViewInit() {
    this.initializeGraphCanvas();
  }

  initializeGraphCanvas() {
    // Aquí puedes agregar el código para inicializar el canvas con el gráfico que desees
    const canvas = <HTMLCanvasElement>document.getElementById('graphCanvas');
    const ctx = canvas.getContext('2d');
    // Código para dibujar en el canvas...
  }
}
