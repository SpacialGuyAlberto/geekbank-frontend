const canvas = document.getElementById('starfield');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let stars = [];
let speed = 0.05;

function createStars() {
  for (let i = 0; i < 10; i++) {
    stars.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      z: Math.random() * canvas.width,
    });
  }
}

function moveStars() {
  for (let i = 0; i < stars.length; i++) {
    stars[i].z -= speed;
    if (stars[i].z <= 0) {
      stars[i].z = canvas.width;
    }
  }
}

function drawStars() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = 'white';

  for (let i = 0; i < stars.length; i++) {
    let k = 20.0 / stars[i].z;
    let x = stars[i].x * k + canvas.width / 2;
    let y = stars[i].y * k + canvas.height / 2;
    let size = (1 - stars[i].z / canvas.width) * 5;
    ctx.beginPath();
    ctx.arc(x, y, size, 0, 2 * Math.PI);
    ctx.fill();
  }
}

function animate() {
  moveStars();
  drawStars();
  requestAnimationFrame(animate);
}

createStars();
animate();

window.addEventListener('resize', () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  stars = [];
  createStars();
});
