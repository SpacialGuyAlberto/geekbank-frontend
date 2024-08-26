import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class BackgroundAnimationService {

  constructor() { }
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
    const nodeCount = 1;
    const maxDistance = 1;
    const colors = ['#FF5733', '#33FF57', '#3357FF', '#FF33A1', '#A133FF', '#FFBD33'];

    const createNodes = () => {

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
}
