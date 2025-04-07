<template>
    <div>
      <div>
        <canvas id="Floor1" :width="canvasWidth" :height="canvasHeight"></canvas>
        <div
          id="infoBox"
          :style="{
            position: 'absolute',
            display: infoBoxVisible? 'block' : 'none',
            backgroundColor: 'white',
            border: '1px solid black',
            padding: '5px'
          }"
        ></div>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    data() {
      return {
        canvasWidth: 800,
        canvasHeight: 600,
        infoBoxVisible: false,
        gridSize: 20,
        blockX: 0,
        blockY: 0,
        shops: [
          { x: 5, y: 5, width: 2, height: 2, info: '这是一家服装店' },
          { x: 7, y: 2, width: 1, height: 3, info: '这是一家咖啡店' }
        ],
        obstacles: [
          { x: 3, y: 4 },
          { x: 6, y: 6 }
        ],
        treeImage: new Image()
      };
    },
    mounted() {
      const canvas = document.getElementById('Floor1');
      const ctx = canvas.getContext('2d');
      const infoBox = document.getElementById('infoBox');
  
      this.treeImage.src = require('./Resources/tree.png');
      this.treeImage.onerror = () => {
        console.error('树的图片加载失败');
      };
  
      const rows = this.canvasHeight / this.gridSize;
      const cols = this.canvasWidth / this.gridSize;
  
      const drawGrid = () => {
        ctx.strokeStyle = 'gray';
        ctx.lineWidth = 1;
  
        for (let i = 0; i <= rows; i++) {
          ctx.beginPath();
          ctx.moveTo(0, i * this.gridSize);
          ctx.lineTo(this.canvasWidth, i * this.gridSize);
          ctx.stroke();
        }
  
        for (let i = 0; i <= cols; i++) {
          ctx.beginPath();
          ctx.moveTo(i * this.gridSize, 0);
          ctx.lineTo(i * this.gridSize, this.canvasHeight);
          ctx.stroke();
        }
      };
  
      const drawGameElements = () => {
        const x = this.blockX * this.gridSize;
        const y = this.blockY * this.gridSize;
        ctx.fillStyle ='red';
        ctx.fillRect(x, y, this.gridSize, this.gridSize);
      };
  
      const drawShops = () => {
        ctx.fillStyle = 'blue';
        this.shops.forEach(shop => {
          const x = shop.x * this.gridSize;
          const y = shop.y * this.gridSize;
          const w = shop.width * this.gridSize;
          const h = shop.height * this.gridSize;
          ctx.fillRect(x, y, w, h);
        });
      };
  
      const drawObstacles = () => {
        this.obstacles.forEach(obstacle => {
          const x = obstacle.x * this.gridSize;
          const y = obstacle.y * this.gridSize;
          if (this.treeImage.complete) {
            ctx.drawImage(this.treeImage, x, y, this.gridSize, this.gridSize);
          } else {
            this.treeImage.onload = () => {
              ctx.drawImage(this.treeImage, x, y, this.gridSize, this.gridSize);
            };
          }
        });
      };
  
      const isCollision = (x, y) => {
        return this.obstacles.some(obstacle => obstacle.x === x && obstacle.y === y);
      };
  
      const handleKeyPress = (event) => {
        let newX = this.blockX;
        let newY = this.blockY;
  
        switch (event.key) {
          case 'ArrowUp':
            newY--;
            break;
          case 'ArrowDown':
            newY++;
            break;
          case 'ArrowLeft':
            newX--;
            break;
          case 'ArrowRight':
            newX++;
            break;
        }
  
        if (newX >= 0 && newX < cols && newY >= 0 && newY < rows &&!isCollision(newX, newY)) {
          this.blockX = newX;
          this.blockY = newY;
        }
      };
  
      const handleMouseMove = (event) => {
        const rect = canvas.getBoundingClientRect();
        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;
  
        const col = Math.floor(mouseX / this.gridSize);
        const row = Math.floor(mouseY / this.gridSize);
  
        const shop = this.shops.find(s => {
          return (
            col >= s.x &&
            col < s.x + s.width &&
            row >= s.y &&
            row < s.y + s.height
          );
        });
        if (shop) {
          this.infoBoxVisible = true;
          infoBox.style.left = event.clientX + 'px';
          infoBox.style.top = event.clientY + 'px';
          infoBox.textContent = shop.info;
        } else {
          this.infoBoxVisible = false;
        }
      };
  
      const handleMouseClick = (event) => {
        const rect = canvas.getBoundingClientRect();
        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;
  
        const col = Math.floor(mouseX / this.gridSize);
        const row = Math.floor(mouseY / this.gridSize);
  
        const shop = this.shops.find(s => {
          return (
            col >= s.x &&
            col < s.x + s.width &&
            row >= s.y &&
            row < s.y + s.height
          );
        });
        if (shop) {
          alert(shop.info);
        }
      };
  
      const draw = () => {
        ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
        drawGrid();
        drawShops();
        drawObstacles();
        drawGameElements();
        requestAnimationFrame(draw);
      };
  
      window.addEventListener('keydown', handleKeyPress);
      canvas.addEventListener('mousemove', handleMouseMove);
      canvas.addEventListener('click', handleMouseClick);
  
      draw();
  
      this.$once('hook:beforeDestroy', () => {
        window.removeEventListener('keydown', handleKeyPress);
        canvas.removeEventListener('mousemove', handleMouseMove);
        canvas.removeEventListener('click', handleMouseClick);
      });
    }
  };
  </script>
  
  <style scoped>
  canvas {
    border: 1px solid black;
    display: block;
    margin: 0 auto;
  }
  </style>