import { Component, OnInit, AfterViewInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common'; // Importa CommonModule
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
  imports: [
    FormsModule,
    HttpClientModule,
    RouterModule,
    CommonModule // Asegúrate de importar CommonModule
  ],
})
export class RegisterComponent implements OnInit {
  name: string = '';
  email: string = '';
  password: string = '';
  message: string = '';
  messageClass: string = '';

  constructor(private authService: AuthService) { }

  ngOnInit(): void {
    this.initializeGraphAnimation();
  }

  initializeGraphAnimation(): void {
    const canvas = document.getElementById('graphCanvas') as HTMLCanvasElement | null;

    if (!canvas) {
      console.error('Canvas element not found');
      return;
    }

    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D | null;

    if (!ctx) {
      console.error('Canvas context not found');
      return;
    }

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    let nodes: Array<any> = [];
    let edges: Array<any> = [];
    const nodeCount = 100;
    const maxDistance = 120;
    const colors = ['#FF5733', '#33FF57', '#3357FF', '#FF33A1', '#A133FF', '#FFBD33'];

    const createNodes = () => {
      createTextNodes('GeekBank', canvas.width / 2 - 200, 100);

      for (let i = 0; i < nodeCount; i++) {
        const centerX = Math.random() * canvas.width;
        const centerY = Math.random() * canvas.height;
        const angle = Math.random() * Math.PI * 2;
        const radius = Math.random() * 100 + 50;
        nodes.push({
          centerX: centerX,
          centerY: centerY,
          angle: angle,
          distance: radius,
          radius: Math.random() * 3 + 2,
          color: colors[Math.floor(Math.random() * colors.length)],
          rotationSpeed: (Math.random() - 0.5) * 0.02,
        });
      }
    }

    const createTextNodes = (text: string, startX: number, startY: number) => {
      const fontSize = 80;
      ctx.font = `${fontSize}px Arial`;
      ctx.textAlign = 'center';
      ctx.fillStyle = '#ffffff';

      ctx.fillText(text, startX, startY);
      const textWidth = ctx.measureText(text).width;
      const imageData = ctx.getImageData(startX - textWidth / 2, startY - fontSize, textWidth, fontSize * 1.2).data;

      for (let y = 0; y < fontSize * 1.2; y++) {
        for (let x = 0; x < textWidth; x++) {
          const alphaIndex = (y * textWidth + x) * 4 + 3;
          if (imageData[alphaIndex] > 128) {
            const angle = Math.random() * Math.PI * 2;
            const radius = Math.random() * 5 + 2;
            nodes.push({
              centerX: startX + x - textWidth / 2,
              centerY: startY + y - fontSize,
              angle: angle,
              distance: radius,
              radius: 2,
              color: colors[Math.floor(Math.random() * colors.length)],
              rotationSpeed: (Math.random() - 0.5) * 0.02,
            });
          }
        }
      }
    }

    const connectNodes = () => {
      edges = [];
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          let distance = Math.sqrt(Math.pow(nodes[i].x - nodes[j].x, 2) + Math.pow(nodes[i].y - nodes[j].y, 2));
          if (distance < maxDistance) {
            edges.push({
              node1: nodes[i],
              node2: nodes[j],
              color: colors[Math.floor(Math.random() * colors.length)]
            });
          }
        }
      }
    }

    const updateNodes = () => {
      nodes.forEach(node => {
        node.angle += node.rotationSpeed;
        node.x = node.centerX + Math.cos(node.angle) * node.distance;
        node.y = node.centerY + Math.sin(node.angle) * node.distance;
      });
    }

    const drawGraph = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Aplica el desenfoque gaussiano
      ctx.filter = 'blur(2.5px)';

      edges.forEach(edge => {
        ctx.strokeStyle = edge.color;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(edge.node1.x, edge.node1.y);
        ctx.lineTo(edge.node2.x, edge.node2.y);
        ctx.stroke();
      });

      nodes.forEach(node => {
        ctx.fillStyle = node.color;
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, 2 * Math.PI);
        ctx.fill();
      });

      // Restablecer el filtro para otras operaciones que no requieren desenfoque
      ctx.filter = 'none';
    }

    const animate = () => {
      updateNodes();
      connectNodes();
      drawGraph();
      requestAnimationFrame(animate);
    }

    createNodes();
    connectNodes();
    animate();

    window.addEventListener('resize', () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      nodes = [];
      createNodes();
      connectNodes();
    });
  }


  onSubmit() {
    this.authService.register(this.email, this.password, this.name).subscribe(
      response => {
        if (response.status === 200) {
          this.message = 'Registration successful! \n Please check your email to activate your account.';
          this.messageClass = 'success-message';
        } else {
          this.message = 'Registration failed. Please try again.';
          this.messageClass = 'error-message';
        }
      },
      error => {
        this.message = 'Registration failed. Please try again.';
        this.messageClass = 'error-message';
      }
    );
  }
}
