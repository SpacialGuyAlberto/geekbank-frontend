document.addEventListener('DOMContentLoaded', function () {
  const canvas = document.getElementById('graphCanvas');
  const ctx = canvas.getContext('2d');

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  let nodes = [];
  let edges = [];
  const nodeCount = 50;
  const maxDistance = 150;
  const colors = ['#FF5733', '#33FF57', '#3357FF', '#FF33A1', '#A133FF', '#FFBD33'];

  function createNodes() {
    // Crear nodos en la parte superior que formen la palabra "GeekBank"
    createTextNodes('GeekBank', canvas.width / 2 - 200, 100);

    // Crear nodos aleatorios adicionales
    for (let i = 0; i < nodeCount; i++) {
      const centerX = Math.random() * canvas.width;
      const centerY = Math.random() * canvas.height;
      const angle = Math.random() * Math.PI * 2; // Angle in radians
      const radius = Math.random() * 100 + 50; // Distance from center
      nodes.push({
        centerX: centerX,
        centerY: centerY,
        angle: angle,
        distance: radius,
        radius: Math.random() * 3 + 2,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotationSpeed: (Math.random() - 0.5) * 0.02, // Random speed of rotation
      });
    }
  }

  function createTextNodes(text, startX, startY) {
    const fontSize = 80;
    ctx.font = `${fontSize}px Arial`;
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffffff';

    // Obtener las coordenadas de los puntos que forman la palabra
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

  function connectNodes() {
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

  function updateNodes() {
    nodes.forEach(node => {
      node.angle += node.rotationSpeed;
      node.x = node.centerX + Math.cos(node.angle) * node.distance;
      node.y = node.centerY + Math.sin(node.angle) * node.distance;
    });
  }

  function drawGraph() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw edges
    edges.forEach(edge => {
      ctx.strokeStyle = edge.color;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(edge.node1.x, edge.node1.y);
      ctx.lineTo(edge.node2.x, edge.node2.y);
      ctx.stroke();
    });

    // Draw nodes
    nodes.forEach(node => {
      ctx.fillStyle = node.color;
      ctx.beginPath();
      ctx.arc(node.x, node.y, node.radius, 0, 2 * Math.PI);
      ctx.fill();
    });
  }

  function animate() {
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
});
